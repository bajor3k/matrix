// src/app/api/reports/3m-cash/merge/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs/promises";
import os from "os";
import path from "path";
import xlsx from "xlsx";
import { promisify } from "util";

const execPromise = promisify(exec);

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

  // Map uploaded files to the names expected by the script
  // fileA -> pycash1, fileB -> pycash2, fileC -> pypi
  const inPath1 = path.join(tmpDir, "pycash1.xlsx");
  const inPath2 = path.join(tmpDir, "pycash2.xlsx");
  const inPath3 = path.join(tmpDir, "pypi.xlsx"); // Assuming PYFEE maps to PYPI
  const outPath = path.join(tmpDir, "output.xlsx");

  try {
    await fs.writeFile(inPath1, Buffer.from(await fileA.arrayBuffer()));
    await fs.writeFile(inPath2, Buffer.from(await fileB.arrayBuffer()));
    await fs.writeFile(inPath3, Buffer.from(await fileC.arrayBuffer()));

    const scriptPath = path.resolve(process.cwd(), "scripts/merge_3m_cash.py");
    
    const command = `python3 ${scriptPath} "${inPath1}" "${inPath2}" "${inPath3}" "${outPath}"`;
    
    await execPromise(command);

    const format = req.nextUrl.searchParams.get("format") || "json";
    
    if (format === 'xlsx') {
      const xlsxBuffer = await fs.readFile(outPath);
      return new NextResponse(xlsxBuffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": "attachment; filename=merged_report.xlsx",
        },
      });
    } else { // default to json
      const workbook = xlsx.readFile(outPath);
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        throw new Error("No sheets found in the output Excel file.");
      }
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(worksheet);
      return NextResponse.json(jsonData);
    }

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during script execution.";
    return NextResponse.json({ error: "Failed to run merge script", details: errorMessage }, { status: 500 });
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(err => console.error(`Failed to cleanup temp dir: ${tmpDir}`, err));
  }
}
