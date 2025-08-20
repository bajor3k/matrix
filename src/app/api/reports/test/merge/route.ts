
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
    const proc3 = spawn("python3", args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    proc3.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    proc3.on("error", (err) => {
      // If `python3` is not found, try `python`
      if ((err as any).code === 'ENOENT') {
        console.warn("`python3` not found, falling back to `python`.");
        const proc = spawn("python", args, { stdio: ["ignore", "pipe", "pipe"] });
        let fallbackStderr = "";
        proc.stderr.on('data', (data) => {
            fallbackStderr += data.toString();
        });
        proc.on("error", reject);
        proc.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Python script exited with code ${code}. Error: ${fallbackStderr}`));
            }
        });
      } else {
        reject(err);
      }
    });

    proc3.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Python3 script exited with code ${code}. Error: ${stderr}`));
      }
    });
  });
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const format = url.searchParams.get("format") || "xlsx";

    const form = await req.formData();
    const test1 = form.get("fileA") as File | null; // Corresponds to TEST_1
    const test2 = form.get("fileB") as File | null; // Corresponds to TEST_2
    const test3 = form.get("fileC") as File | null; // Corresponds to TEST_3

    if (!test1 || !test2 || !test3) {
      return new Response("Missing one or more required files.", { status: 400 });
    }

    const tempDir = tmpdir();
    const in1 = join(tempDir, `test1_${Date.now()}.xlsx`);
    const in2 = join(tempDir, `test2_${Date.now()}.xlsx`);
    const in3 = join(tempDir, `test3_${Date.now()}.xlsx`);
    const out = join(tempDir, `test_merged_${Date.now()}.xlsx`);

    await writeFile(in1, Buffer.from(await test1.arrayBuffer()));
    await writeFile(in2, Buffer.from(await test2.arrayBuffer()));
    await writeFile(in3, Buffer.from(await test3.arrayBuffer()));

    await runPython([ "scripts/merge_test_report.py", in1, in2, in3, out ]);

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
          "Content-Disposition": 'attachment; filename="test_report_merged.xlsx"',
          "Cache-Control": "no-store",
        },
      });
    }
  } catch (e: any) {
    console.error("Error in /api/reports/test/merge:", e);
    return new Response(e?.message || "Failed to merge files.", { status: 500 });
  }
}
