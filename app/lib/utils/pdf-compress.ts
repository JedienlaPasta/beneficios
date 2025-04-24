import { spawn } from "child_process";

export async function compressPdfBuffer(inputBuffer: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const gsCommand = "gs";
    const gs = spawn(gsCommand, [
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

    gs.stderr.on("data", (data) => {
      console.error(`Ghostscript stderr: ${data}`);
    });

    gs.on("error", (err: NodeJS.ErrnoException) => {
      // Use NodeJS.ErrnoException for better type hinting
      if (err.code === "ENOENT") {
        console.error(
          `Ghostscript command not found: ${gsCommand}. Ensure Ghostscript is installed and in the PATH.`,
        );
        reject(
          new Error(
            `Ghostscript command '${gsCommand}' not found. Please install Ghostscript.`,
          ),
        );
      } else {
        console.error(`Failed to start Ghostscript process: ${err.message}`);
        reject(err);
      }
    });

    gs.on("close", (code) => {
      if (code === 0) {
        resolve(Buffer.concat(chunks));
      } else {
        console.error(`Ghostscript process exited with code ${code}`);
        reject(new Error(`Ghostscript failed with code ${code}`));
      }
    });

    gs.stdin.write(inputBuffer);
    gs.stdin.end();
  });
}
