
import { writeFile, readFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { spawn } from "child_process";
import * as xlsx from "xlsx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function runPython(args: string[]) {
  return new Promise<void>((resolve, reject) => {
    // First, try to execute with `python3`
    const proc3 = spawn("python3", args, { stdio: ["ignore", "inherit", "inherit"] });
    proc3.on("error", (err) => {
      // If `python3` is not found, try `python`
      if ((err as any).code === 'ENOENT') {
        console.warn("`python3` not found, falling back to `python`.");
        const proc = spawn("python", args, { stdio: ["ignore", "inherit", "inherit"] });
        proc.on("error", reject);
        proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`Python script exited with code ${code}`))));
      } else {
        reject(err);
      }
    });
    proc3.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        // If it fails for a reason other than not being found, reject
        reject(new Error(`Python3 script exited with code ${code}`));
      }
    });
  });
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const format = url.searchParams.get("format") || "xlsx";

    const form = await req.formData();
    const pycash1 = form.get("pycash_1") as File | null; // This now corresponds to PYFEE
    const pycash2 = form.get("pycash_2") as File | null;
    const pypi = form.get("pypi") as File | null;
    if (!pycash1 || !pycash2 || !pypi) {
      return new Response("Missing one or more required files.", { status: 400 });
    }

    const tempDir = tmpdir();
    const in1 = join(tempDir, `pyfee_${Date.now()}.xlsx`); // Updated filename for clarity
    const in2 = join(tempDir, `pycash2_${Date.now()}.xlsx`);
    const in3 = join(tempDir, `pypi_${Date.now()}.xlsx`);
    const out = join(tempDir, `3m_cash_merged_${Date.now()}.xlsx`);

    await writeFile(in1, Buffer.from(await pycash1.arrayBuffer()));
    await writeFile(in2, Buffer.from(await pycash2.arrayBuffer()));
    await writeFile(in3, Buffer.from(await pypi.arrayBuffer()));

    await runPython([ "scripts/merge_3m_cash.py", in1, in2, in3, out ]);

    const buf = await readFile(out);

    if (format === "json") {
      const workbook = xlsx.read(buf, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = xlsx.utils.sheet_to_json(worksheet);
      return new Response(JSON.stringify(json), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else { // Defaults to "xlsx"
      return new Response(buf, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="3m_cash_merged.xlsx"',
          "Cache-Control": "no-store",
        },
      });
    }
  } catch (e: any) {
    console.error("Error in /api/reports/3m-cash/merge:", e);
    return new Response(e?.message || "Failed to merge files.", { status: 500 });
  }
}
