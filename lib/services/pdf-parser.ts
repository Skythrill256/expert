import pdf from "pdf-parse";

export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    const data = await pdf(pdfBuffer);
    return data.text;
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

export function validatePDFFile(file: File): boolean {
  return file.type === "application/pdf" && file.size > 0 && file.size < 10 * 1024 * 1024; // Max 10MB
}
