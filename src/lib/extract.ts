/**
 * Browser document extraction for PDF, DOCX, and plain text.
 * All heavy parsers are dynamically imported so they only load when needed.
 */

export async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".pdf")) {
    return extractPdf(file);
  }
  if (name.endsWith(".docx")) {
    return extractDocx(file);
  }
  if (name.endsWith(".doc")) {
    // Legacy .doc — best-effort, mammoth doesn't support it; fall back to placeholder.
    return `[Legacy .doc file: ${file.name}. Save as .docx for full extraction.]`;
  }
  if (
    file.type.startsWith("text/") ||
    /\.(md|txt|json|csv|rtf|html|xml|yaml|yml)$/i.test(name)
  ) {
    return file.text();
  }
  return `[Uploaded: ${file.name} (${file.type || "binary"}) — preview unavailable.]`;
}

async function extractDocx(file: File): Promise<string> {
  const mammoth = await import("mammoth/mammoth.browser");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim() || `[Empty DOCX: ${file.name}]`;
}

async function extractPdf(file: File): Promise<string> {
  const pdfjs: any = await import("pdfjs-dist/build/pdf.mjs");
  // Use the bundled worker via Vite ?url import.
  const workerSrc = (await import("pdfjs-dist/build/pdf.worker.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

  const data = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data }).promise;
  const out: string[] = [];
  const max = Math.min(pdf.numPages, 200);
  for (let i = 1; i <= max; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((it: any) => it.str ?? "").join(" ");
    out.push(strings);
  }
  return out.join("\n\n").trim() || `[No text in PDF: ${file.name}]`;
}
