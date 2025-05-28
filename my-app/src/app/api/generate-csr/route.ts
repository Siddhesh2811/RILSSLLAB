import { NextResponse } from "next/server";
import { exec } from "child_process";
import { mkdirSync, existsSync, readFileSync, createWriteStream, writeFileSync } from "fs";
import path from "path";
import { promisify } from "util";
import archiver from "archiver";

const execShell = promisify(exec);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fqdn, san = [] } = body;
    const sans = Array.isArray(san) ? san : [];

    if (!fqdn) {
      return NextResponse.json({ error: "Missing FQDN" }, { status: 400 });
    }

    const certsBase = path.resolve(process.cwd(), "public/certs");
    const fqdnDir = path.join(certsBase, fqdn);

    if (!existsSync(fqdnDir)) {
      mkdirSync(fqdnDir, { recursive: true });
    }

    const templateConfigPath = path.resolve(process.cwd(), "public/certs/template/openssl-san.cnf");
    const tempConfigPath = path.join(fqdnDir, "openssl-temp.cnf");

    // Read template config
    let configContent = readFileSync(templateConfigPath, "utf-8");

    // Remove any existing [ alt_names ] section
    configContent = configContent.replace(/\[ alt_names \][\s\S]*?(?=\n\[|$)/g, "");

    // Prepare SAN entries
    let sanConfig = "";
    if (sans.length > 0) {
      sanConfig = sans.map((domain, i) => `DNS.${i + 1} = ${domain}`).join("\n");
    } else {
      sanConfig = `DNS.1 = ${fqdn}`;
    }

    // Append SAN section
    configContent += `

[ alt_names ]
${sanConfig}
`;

    // Write temp config file
    writeFileSync(tempConfigPath, configContent, "utf-8");

    // Filenames for CSR and keys
    const csrFile = `${fqdn}.csr`;
    const keyFile = `${fqdn}.key`;
    const tempKeyFile = `privkey.pem`;

    // Subject
    const subj = `/C=IN/ST=Maharashtra/L=Navi-Mumbai/O=RIL/OU=SAP BASIS/CN=${fqdn}`;

    // Generate CSR and private key
    await execShell(
      `openssl req -config "${tempConfigPath}" -newkey rsa:2048 -sha256 -nodes -keyout "${tempKeyFile}" -new -out "${csrFile}" -subj "${subj}"`,
      { cwd: fqdnDir }
    );

    // Extract unencrypted private key
    await execShell(`openssl rsa -in "${tempKeyFile}" -out "${keyFile}"`, {
      cwd: fqdnDir,
    });

    // Zip everything
    const zipFilePath = path.join(certsBase, `${fqdn}.zip`);
    await zipDirectory(fqdnDir, zipFilePath);

    // Read and return CSR
    const csr = readFileSync(path.join(fqdnDir, csrFile), "utf-8");

    return NextResponse.json({
      csr,
      zip: `/certs/${fqdn}.zip`,
    });

  } catch (err: any) {
    console.error("Error generating CSR:", err);
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}

async function zipDirectory(source: string, out: string) {
  const archive = archiver("zip", { zlib: { level: 9 } });
  const stream = createWriteStream(out);

  return new Promise((resolve, reject) => {
    archive
      .directory(source, false)
      .on("error", err => reject(err))
      .pipe(stream);

    stream.on("close", () => resolve(true));
    archive.finalize();
  });
}
