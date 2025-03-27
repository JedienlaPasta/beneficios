import { spawn } from "child_process";

export async function compressPdfBuffer(inputBuffer: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const gs = spawn("gswin64c", [
      "-sDEVICE=pdfwrite",
      "-dCompatibilityLevel=1.4",
      "-dPDFSETTINGS=/ebook",
      "-dDetectDuplicateImages=true",
      "-dNOPAUSE",
      "-dQUIET",
      "-dBATCH",
      "-sOutputFile=-",
      "-",
    ]);

    const chunks: Buffer[] = [];
    gs.stdout.on("data", (chunk) => chunks.push(chunk));

    gs.on("close", (code) => {
      if (code === 0) {
        resolve(Buffer.concat(chunks));
      } else {
        reject(new Error(`Ghostscript failed with code ${code}`));
      }
    });

    gs.stdin.write(inputBuffer);
    gs.stdin.end();
  });
}
