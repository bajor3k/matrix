
import { NextRequest, NextResponse } from "next/server";
import * as xlsx from "xlsx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Helper function to read file buffer and parse to JSON
const getJsonFromXlsx = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const workbook = xlsx.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(worksheet);
};

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const format = url.searchParams.get("format") || "xlsx";

    const form = await req.formData();
    const fileA = form.get("fileA") as File | null;
    const fileB = form.get("fileB") as File | null;
    const fileC = form.get("fileC") as File | null;

    if (!fileA || !fileB || !fileC) {
      return NextResponse.json(
        { error: "Missing one or more required files." },
        { status: 400 }
      );
    }

    // Read all files and convert to JSON
    const dataA = (await getJsonFromXlsx(fileA)) as any[];
    const dataB = (await getJsonFromXlsx(fileB)) as any[];
    const dataC = (await getJsonFromXlsx(fileC)) as any[];
    
    // Create maps for efficient merging
    const mapA = new Map(dataA.map(row => [`${row.IP}-${row["Account Number"]}`, row]));
    const mapB = new Map(dataB.map(row => [`${row.IP}-${row["Account Number"]}`, row]));
    const mapC = new Map(dataC.map(row => [`${row.IP}-${row["Account Number"]}`, row]));

    // Get all unique keys
    const allKeys = new Set([...mapA.keys(), ...mapB.keys(), ...mapC.keys()]);
    
    const mergedData = Array.from(allKeys).map(key => {
        const [ip, accountNumber] = key.split('-');
        const rowA = mapA.get(key) || {};
        const rowB = mapB.get(key) || {};
        const rowC = mapC.get(key) || {};
        
        return {
            "IP": ip,
            "Account Number": accountNumber,
            "Value": rowA["Value"] || null,
            "Advisory Fees": rowC["Advisory Fees"] || null,
            "Cash": rowB["Cash"] || null
        };
    });

    if (format === "json") {
      return NextResponse.json(mergedData);
    } else { // Default to "xlsx"
      const newWorksheet = xlsx.utils.json_to_sheet(mergedData);
      const newWorkbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(newWorkbook, newWorksheet, "Merged_Test_Report");
      const buf = xlsx.write(newWorkbook, { type: "buffer", bookType: "xlsx" });

      return new NextResponse(buf, {
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
    return NextResponse.json(
      { error: e?.message || "Failed to merge files." },
      { status: 500 }
    );
  }
}
