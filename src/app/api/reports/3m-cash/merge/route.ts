// src/app/api/reports/3m-cash/merge/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs/promises";
import os from "os";
import path from "path";
import xlsx from "xlsx";

export const runtime = "nodejs";

function run(cmd: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const p = spawn(cmd, args, {
      stdio: "inherit",
      shell: process.platform === "win32" && cmd === "py", // allow "py -3" on Windows
    });
    p.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`exit ${code}`))));
    p.on("error", reject);
  });
}

async function runPython(script: string, args: string[]) {
  const candidates = [
    process.env.PYTHON,              // allow .env.local: PYTHON=...
    "python3",
    "python",
    "py",                            // Windows launcher (will default to latest)
  ].filter(Boolean) as string[];

  let lastErr: unknown;
  for (const c of candidates) {
    try {
      // try "py -3" explicitly if using Windows launcher
      const fullArgs = c === "py" ? ["-3", script, ...args] : [script, ...args];
      await run(c, fullArgs);
      return;
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error(`No Python interpreter found. Tried: ${candidates.join(", ")}. Last error: ${String(lastErr)}`);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const fileA = formData.get("fileA") as File | null;
  const fileB = formData.get("fileB") as File | null;
  const fileC = formData.get("fileC") as File | null;

  if (!fileA || !fileB || !fileC) {
    return NextResponse.json({ error: "Missing required files" }, { status: 400 });
  }

  const tmpDir = path.join(os.tmpdir(), `report-${Date.now()}`);
  await fs.mkdir(tmpDir, { recursive: true });

  const in1 = path.join(tmpDir, "pycash1.xlsx");
  const in2 = path.join(tmpDir, "pycash2.xlsx");
  const in3 = path.join(tmpDir, "pypi.xlsx");
  const out = path.join(tmpDir, "output.xlsx");

  try {
    await fs.writeFile(in1, Buffer.from(await fileA.arrayBuffer()));
    await fs.writeFile(in2, Buffer.from(await fileB.arrayBuffer()));
    await fs.writeFile(in3, Buffer.from(await fileC.arrayBuffer()));

    const script = path.resolve(process.cwd(), "scripts/merge_3m_cash.py");
    await runPython(script, [in1, in2, in3, out]);

    const format = req.nextUrl.searchParams.get("format") || "json";

    if (format === 'xlsx') {
      const buf = await fs.readFile(out);
      return new NextResponse(buf, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": "attachment; filename=merged_report.xlsx",
          "Cache-Control": "no-store",
        },
      });
    }

    const wb = xlsx.readFile(out);
    const sheet = wb.SheetNames[0];
    if (!sheet) {
        throw new Error("No sheets found in the output Excel file.");
    }
    const data = xlsx.utils.sheet_to_json(wb.Sheets[sheet]);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to run merge script", details: String(error?.message || error) },
      { status: 500 }
    );
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}
