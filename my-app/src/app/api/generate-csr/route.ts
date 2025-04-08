import { NextResponse } from "next/server";
import { exec } from "child_process";
import { mkdirSync, existsSync, readFileSync, createWriteStream } from "fs";
import path from "path";
import { promisify } from "util";
import archiver from "archiver";

const execShell = promisify(exec);

export async function POST(req: Request) {
  const body = await req.json();
  const { fqdn } = body;

  if (!fqdn) {
    return NextResponse.json({ error: "Missing FQDN" }, { status: 400 });
  }

  try {
    const certsBase = path.resolve(process.cwd(), "public/certs");
    const fqdnDir = path.join(certsBase, fqdn);

    if (!existsSync(fqdnDir)) {
      mkdirSync(fqdnDir, { recursive: true });
    }

    const opensslConfigPath = path.resolve(
      process.cwd(),
      "public/certs/template/openssl.cnf"
    );
    

    const csrFile = `${fqdn}.csr`;
    const keyFile = `${fqdn}.key`;
    const tempKey = `privkey.pem`;
    const subj = `/C=IN/ST=Maharashtra/L=Navi-Mumbai/O=RIL/OU=SAP BASIS/CN=${fqdn}`;

    // Generate key and CSR
    await execShell(
      `openssl req -config "${opensslConfigPath}" -newkey rsa:2048 -sha256 -nodes -keyout "${tempKey}" -new -out "${csrFile}" -subj "${subj}"`,
      { cwd: fqdnDir }
    );

    // Extract private key
    await execShell(`openssl rsa -in "${tempKey}" -out "${keyFile}"`, {
      cwd: fqdnDir,
    });

    // Zip the folder
    const zipFilePath = path.join(certsBase, `${fqdn}.zip`);
    await zipDirectory(fqdnDir, zipFilePath);

    const csr = readFileSync(path.join(fqdnDir, csrFile), "utf-8");

    return NextResponse.json({
      csr,
      zip: `/certs/${fqdn}.zip` // Optional: you can expose this with a static route
    });

  } catch (err: any) {
    console.error("OpenSSL error or zip failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Utility to zip a directory
async function zipDirectory(source: string, out: string) {
  const archive = archiver("zip", { zlib: { level: 9 } });
  const stream = createWriteStream(out);

  return new Promise((resolve, reject) => {
    archive
      .directory(source, false)
      .on("error", (err) => reject(err))
      .pipe(stream);

    stream.on("close", () => resolve(true));
    archive.finalize();
  });
}
