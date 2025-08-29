import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

export const runtime = "nodejs"; // ensure Node runtime if you use Edge elsewhere

export async function POST(req: Request) {
  try {
    const fd = await req.formData();
    const f1 = fd.get("report1") as File | null;
    const f2 = fd.get("report2") as File | null;
    const f3 = fd.get("report3") as File | null;

    if (!f1 || !f2 || !f3) {
      return NextResponse.json({ error: "3 files required" }, { status: 400 });
    }

    // Save to tmp
    const save = async (f: File, name: string) => {
      const ab = await f.arrayBuffer();
      const p = path.join("/tmp", name);
      await fs.writeFile(p, Buffer.from(ab));
      return p;
    };

    const p1 = await save(f1, "report1.xlsx");
    const p2 = await save(f2, "report2.xlsx");
    const p3 = await save(f3, "report3.xlsx");

    // Spawn your Python script
    const pythonPath = process.env.PYTHON_PATH || "python3";
    const script = process.env.TEST_REPORT_SCRIPT || path.join(process.cwd(), "scripts", "test_report.py");

    const args = [script, "--report1", p1, "--report2", p2, "--report3", p3];

    const out = await new Promise<{ code: number; stdout: string; stderr: string }>((resolve) => {
      const child = spawn(pythonPath, args, { stdio: ["ignore", "pipe", "pipe"] });
      let stdout = "";
      let stderr = "";
      child.stdout.on("data", (d) => (stdout += d.toString()));
      child.stderr.on("data", (d) => (stderr += d.toString()));
      child.on("close", (code) => resolve({ code: code ?? 0, stdout, stderr }));
    });

    if (out.code !== 0) {
      return NextResponse.json({ error: out.stderr || "Python failed" }, { status: 500 });
    }

    // If your script writes an output file or JSON, parse/return it here
    // For demo: return stdout as JSON {message: ...}
    return NextResponse.json({ message: "Report completed", stdout: out.stdout });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unexpected error" }, { status: 500 });
  }
}
