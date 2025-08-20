
import { writeFile, readFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { spawn } from "child_process";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function runPython(args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const proc = spawn("python3", args, { stdio: ["ignore", "inherit", "inherit"] });
    proc.on("error", reject);
    proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`Python exited ${code}`))));
  });
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const pycash1 = form.get("pycash_1") as File | null;
    const pycash2 = form.get("pycash_2") as File | null;
    const pypi = form.get("pypi") as File | null;
    if (!pycash1 || !pycash2 || !pypi) {
      return new Response("Missing one or more required files.", { status: 400 });
    }

    // Write temp inputs
    const tempDir = tmpdir();
    const in1 = join(tempDir, `pycash1_${Date.now()}.xlsx`);
    const in2 = join(tempDir, `pycash2_${Date.now()}.xlsx`);
    const in3 = join(tempDir, `pypi_${Date.now()}.xlsx`);
    const out = join(tempDir, `3m_cash_merged_${Date.now()}.xlsx`);

    await writeFile(in1, Buffer.from(await pycash1.arrayBuffer()));
    await writeFile(in2, Buffer.from(await pycash2.arrayBuffer()));
    await writeFile(in3, Buffer.from(await pypi.arrayBuffer()));

    // Call Python script
    // Ensure the script path is correct relative to the project root
    await runPython([ "scripts/merge_3m_cash.py", in1, in2, in3, out ]);

    const buf = await readFile(out);
    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="3m_cash_merged.xlsx"',
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    console.error("Error in /api/reports/3m-cash/merge:", e);
    return new Response(e?.message || "Failed to merge files.", { status: 500 });
  }
}
