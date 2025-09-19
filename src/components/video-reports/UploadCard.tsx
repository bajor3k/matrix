"use client";

import { useState, useRef } from "react";
import { storage, db, auth } from "@/lib/firebase/config";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function UploadCard() {
  const { toast } = useToast();
  const [clientId, setClientId] = useState("");
  const [period, setPeriod] = useState(""); // YYYY-MM (from <input type="month">)
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

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
  
  const resetForm = () => {
    setClientId("");
    setPeriod("");
    setFile(null);
    setProgress(0);
    setIsUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  async function onUpload() {
    if (!clientId.trim()) {
        toast({ title: "Client ID is required.", variant: "destructive" });
        return;
    }
    if (!period) {
        toast({ title: "Period is required.", variant: "destructive" });
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
    const yyyyMm = period;
    const path = `statements/${clientId}/${yyyyMm}/original.pdf`;
    const storageRef = ref(storage, path);

    const metadata = {
      customMetadata: {
        clientId,
        period: yyyyMm,
        uploadedBy: user?.uid || "anon",
        source: "ui",
      },
      contentType: "application/pdf",
    };

    const task = uploadBytesResumable(storageRef, file, metadata);
    task.on("state_changed", (snap) => {
      setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
    }, (err) => {
      console.error(err);
      toast({ title: "Upload Failed", description: err.message, variant: "destructive"});
      setIsUploading(false);
      setProgress(0);
    }, async () => {
      const url = await getDownloadURL(task.snapshot.ref);
      await addDoc(collection(db, "statements"), {
        clientId,
        period: yyyyMm,
        filePath: path,
        downloadURL: url,
        status: "queued",
        createdAt: serverTimestamp(),
        uploadedBy: user.uid,
      });
      resetForm();
      toast({ title: "Upload Successful", description: "Processing will start automatically." });
    });
  }

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-[#0c0c0c] p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4 text-foreground">Upload Statement (PDF)</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex flex-col">
          <label className="text-sm text-muted-foreground mb-1">Client ID</label>
          <input
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="e.g. HH-1023"
            className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/20 text-foreground"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-muted-foreground mb-1">Period</label>
          <input
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/20 text-foreground"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-muted-foreground mb-1">PDF</label>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            onChange={onFilePick}
            className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-muted-foreground file:text-foreground file:bg-transparent file:border-0 file:p-0"
          />
        </div>
      </div>

      {file && (
        <div className="text-sm text-muted-foreground mb-3">Selected: {file.name}</div>
      )}

      {progress > 0 && (
        <div className="w-full h-2 bg-black/40 rounded mb-4 overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onUpload}
          disabled={isUploading}
          className="rounded-xl px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
        <button
          onClick={resetForm}
          disabled={isUploading}
          className="rounded-xl px-4 py-2 text-sm border border-white/10 text-foreground hover:bg-white/5 disabled:opacity-50"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
