"use client";

import { useMemo, useRef, useState } from "react";
import { storage, db, auth } from "@/lib/firebase/config";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

type StatementType = "monthly" | "quarterly" | "annual";

export default function UploadCard({ fixedType }: { fixedType?: StatementType }) {
  const { toast } = useToast();
  const [clientName, setClientName] = useState("");
  const [stmtType, setStmtType] = useState<StatementType>(fixedType ?? "monthly");
  const [month, setMonth] = useState("");        // YYYY-MM
  const [quarter, setQuarter] = useState("Q1");  // Q1..Q4
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Unified period string for metadata and naming
  const periodString = useMemo(() => {
    if (stmtType === "monthly") return month;             // "2025-01"
    if (stmtType === "quarterly") return `${year}-${quarter}`; // "2025-Q1"
    return year;                                          // "2025"
  }, [stmtType, month, quarter, year]);

  const resetForm = () => {
    setClientName("");
    if (!fixedType) {
      setStmtType("monthly");
    }
    setMonth("");
    setQuarter("Q1");
    setYear(new Date().getFullYear().toString());
    setFile(null);
    setProgress(0);
    setIsUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  function onFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") {
      toast({ title: "Invalid File Type", description: "Only PDF files are allowed.", variant: "destructive" });
      e.target.value = "";
      return;
    }
    setFile(f);
  }

  async function onUpload() {
    if (!clientName.trim()) {
        toast({ title: "Client Name is required.", variant: "destructive" });
        return;
    }
    if (!periodString) {
        toast({ title: "A valid period is required.", variant: "destructive" });
        return;
    }
    if (!file) {
        toast({ title: "A PDF file must be selected.", variant: "destructive" });
        return;
    }

    const user = auth.currentUser;
    if (!user) {
        toast({ title: "Authentication required.", description: "Please sign in to upload files.", variant: "destructive" });
        return;
    }

    setIsUploading(true);
    
    // Storage path example: statements/{clientName-safe}/{stmtType}/{period}/original.pdf
    const safeClient = clientName.trim().replace(/[^\w\- ]+/g, "").replace(/\s+/g, "-");
    const path = `statements/${safeClient}/${stmtType}/${periodString}/original.pdf`;

    const metadata = {
      customMetadata: {
        clientName: clientName.trim(),
        statementType: stmtType,
        period: periodString,
        uploadedBy: user.uid,
        source: "ui",
      },
      contentType: "application/pdf",
    };

    const task = uploadBytesResumable(ref(storage, path), file, metadata);
    task.on(
      "state_changed",
      (snap) => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      (err) => { 
        console.error(err); 
        toast({ title: "Upload failed.", description: err.message, variant: "destructive" });
        setIsUploading(false);
      },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        await addDoc(collection(db, "statements"), {
          clientName: clientName.trim(),
          statementType: stmtType,
          period: periodString,
          filePath: path,
          downloadURL: url,
          status: "queued", // backend will process → parsed → scripted → rendered
          createdAt: serverTimestamp(),
          uploadedBy: user.uid,
        });
        toast({ title: "Upload Successful!", description: "Processing will start automatically." });
        resetForm();
      }
    );
  }

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-[#0c0c0c] p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground">Generate AI Video Summary</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Upload a client statement (PDF) to automatically generate a personalized video summary.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Client Name */}
        <div className="flex flex-col">
          <label className="text-sm text-muted-foreground mb-1">Client Name</label>
          <input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="e.g. Josh & Taylor Smith"
            className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/20 text-foreground"
          />
        </div>

        {/* Statement Type */}
        {!fixedType && (
          <div className="flex flex-col">
            <label className="text-sm text-muted-foreground mb-1">Statement Type</label>
            <select
              value={stmtType}
              onChange={(e) => setStmtType(e.target.value as StatementType)}
              className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/20 text-foreground appearance-none"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
        )}

        {/* Period (switches by type) */}
        <div className="flex flex-col">
          <label className="text-sm text-muted-foreground mb-1">Period</label>

          {stmtType === "monthly" && (
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/20 text-foreground"
            />
          )}

          {stmtType === "quarterly" && (
            <div className="grid grid-cols-2 gap-2">
              <select
                value={quarter}
                onChange={(e) => setQuarter(e.target.value)}
                className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/20 text-foreground appearance-none"
              >
                <option value="Q1">Q1</option>
                <option value="Q2">Q2</option>
                <option value="Q3">Q3</option>
                <option value="Q4">Q4</option>
              </select>
              <input
                type="number"
                min="2000"
                max="2100"
                placeholder="Year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/20 text-foreground"
              />
            </div>
          )}

          {stmtType === "annual" && (
            <input
              type="number"
              min="2000"
              max="2100"
              placeholder="Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/20 text-foreground"
            />
          )}
        </div>
      </div>

      {/* PDF Picker */}
      <div className="mb-4">
        <label className="text-sm text-muted-foreground mb-1 block">PDF Statement</label>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          onChange={onFilePick}
          className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-muted-foreground file:text-foreground file:bg-transparent file:border-0 file:p-0 w-full"
        />
      </div>

      {file && <div className="text-sm text-muted-foreground mb-3">Selected: {file.name}</div>}

      {progress > 0 && (
        <div className="w-full h-2 bg-black/40 rounded mb-4 overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onUpload}
          disabled={isUploading}
          className="rounded-xl px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isUploading ? "Uploading..." : "Upload & Generate"}
        </button>
        <button
          onClick={resetForm}
          disabled={isUploading}
          className="rounded-xl px-4 py-2 text-sm border border-white/10 hover:bg-white/5 text-foreground disabled:opacity-50"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
