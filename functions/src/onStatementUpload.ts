import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

export const onStatementUpload = functions.storage.object().onFinalize(async (obj) => {
  // guard: only PDFs named original.pdf under statements/
  const name = obj.name || "";
  const contentType = obj.contentType || "";
  if (!name.startsWith("statements/")) return;
  if (!name.endsWith("/original.pdf")) return;
  if (!contentType.includes("pdf")) return;

  const meta = (obj.metadata || {}) as Record<string, string>;

  const clientName = meta.clientName ?? "Unknown Client";
  const statementType = meta.statementType as "monthly" | "quarterly" | "annual" | undefined;
  const period = meta.period ?? "";
  const uploadedBy = meta.uploadedBy ?? "anon";
  const source = meta.source ?? "ui";

  // create a job doc
  const job = {
    status: "queued",                         // queued → parsing → kpis → scripting → rendering → complete/failed
    filePath: name,                           // gs:// bucket path
    bucket: obj.bucket,
    clientName,
    statementType: statementType ?? "monthly",
    period,
    uploadedBy,
    source,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    // placeholders the pipeline will fill in later:
    parseResultPath: null as string | null,
    kpis: null as any,
    scenes: null as any,
    outputVideoPath: null as string | null,
    error: null as string | null,
  };

  await db.collection("renderJobs").add(job);

  // also upsert a lightweight status back on the statements doc if one exists
  const statements = await db.collection("statements")
    .where("filePath", "==", name).limit(1).get();
  if (!statements.empty) {
    const docRef = statements.docs[0].ref;
    await docRef.update({
      status: "queued",
      jobLinkedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
});
