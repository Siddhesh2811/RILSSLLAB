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

    console.log("Received body from frontend:", body);

    if (!fqdn) {
      return NextResponse.json({ error: "Missing FQDN" }, { status: 400 });
    }

    const certsBase = path.resolve(process.cwd(), "public/certs");
    const fqdnDir = path.join(certsBase, fqdn);

    if (!existsSync(fqdnDir)) {
      mkdirSync(fqdnDir, { recursive: true });
    }

    const templateConfigPath = path.resolve(process.cwd(), "public/certs/template/openssl.cnf");
    const templateSANConfigPath = path.resolve(process.cwd(), "public/certs/template/openssl-san.cnf");

    let configToUse = templateConfigPath;

    // If SANs are provided, dynamically create a temp config file
    if (Array.isArray(san) && san.length > 0) {
      let configContent = readFileSync(templateSANConfigPath, "utf-8");

      // Remove any existing [ alt_names ] section
      configContent = configContent.replace(/\[ alt_names \][\s\S]*?(?=\n\[|$)/, "");

      const sanConfig = san.map((dns, i) => `DNS.${i + 1} = ${dns}`).join("\n");

      configContent += `

[ alt_names ]
${sanConfig}
`;

      const tempConfigPath = path.join(fqdnDir, "openssl-temp.cnf");
      writeFileSync(tempConfigPath, configContent, "utf-8");
      configToUse = tempConfigPath;
    }

    const csrFile = `${fqdn}.csr`;
    const keyFile = `${fqdn}.key`;
    const tempKeyFile = `privkey.pem`;

    const subj = `/C=IN/ST=Maharashtra/L=Navi-Mumbai/O=RIL/OU=SAP BASIS/CN=${fqdn}`;

    await execShell(
      `openssl req -config "${configToUse}" -newkey rsa:2048 -sha256 -nodes -keyout "${tempKeyFile}" -new -out "${csrFile}" -subj "${subj}"`,
      { cwd: fqdnDir }
    );

    await execShell(`openssl rsa -in "${tempKeyFile}" -out "${keyFile}"`, {
      cwd: fqdnDir,
    });

    const zipFilePath = path.join(certsBase, `${fqdn}.zip`);
    await zipDirectory(fqdnDir, zipFilePath);

    const csr = readFileSync(path.join(fqdnDir, csrFile), "utf-8");

    return NextResponse.json({
      csr,
      zip: `/certs/${fqdn}.zip`
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
      .on("error", (err) => reject(err))
      .pipe(stream);

    stream.on("close", () => resolve(true));
    archive.finalize();
  });
}
