import { NextResponse } from "next/server";
import { existsSync, readFileSync, writeFileSync, createWriteStream, unlink } from "fs";
import path from "path";
import { promisify } from "util";
import { exec } from "child_process";
import archiver from "archiver";

const execShell = promisify(exec);
const unlinkAsync = promisify(unlink);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fqdn, san = [] } = body;

    if (!fqdn || !Array.isArray(san)) {
      return NextResponse.json({ error: "FQDN and SAN array are required" }, { status: 400 });
    }

    const certsDir = path.resolve(process.cwd(), "public/certs", fqdn);
    const keyPath = path.join(certsDir, `${fqdn}.key`);
    const configPath = path.join(certsDir, "openssl-temp.cnf");

    if (!existsSync(certsDir) || !existsSync(keyPath) || !existsSync(configPath)) {
      return NextResponse.json({ error: "Required files/folder not found for FQDN" }, { status: 400 });
    }

    let configContent = readFileSync(configPath, "utf-8");

    const altNamesMatch = configContent.match(/\[ alt_names \][\s\S]*?(?=\n\[|$)/);
    const existingSANs: string[] = [];

    if (altNamesMatch) {
      const lines = altNamesMatch[0].split("\n").slice(1);
      for (const line of lines) {
        const match = line.match(/DNS\.\d+\s*=\s*(.+)/);
        if (match) existingSANs.push(match[1].trim());
      }
    }

    const mergedSANs = Array.from(new Set([...existingSANs, ...san]));

    const sanBlock = mergedSANs.map((dns, i) => `DNS.${i + 1} = ${dns}`).join("\n");

    const cleanedConfig = configContent.replace(/\[ alt_names \][\s\S]*?(?=\n\[|$)/, "").trim();
    const updatedConfig = `${cleanedConfig}

[ alt_names ]
${sanBlock}
`;

    writeFileSync(configPath, updatedConfig, "utf-8");

    const csrPath = path.join(certsDir, `${fqdn}.csr`);
    const subj = `/C=IN/ST=Maharashtra/L=Navi-Mumbai/O=RIL/OU=SAP BASIS/CN=${fqdn}`;

    await execShell(
      `openssl req -config "${configPath}" -key "${keyPath}" -new -out "${csrPath}" -subj "${subj}"`,
      { cwd: certsDir }
    );

    const zipPath = path.join(path.resolve(process.cwd(), "public/certs"), `${fqdn}-updated.zip`);
    await zipDirectory(certsDir, zipPath);

    // 🔥 Delete the zip after 1 hour
    setTimeout(async () => {
      try {
        if (existsSync(zipPath)) {
          await unlinkAsync(zipPath);
          console.log(`Deleted zip: ${zipPath}`);
        }
      } catch (err) {
        console.error(`Failed to delete zip: ${zipPath}`, err);
      }
    }, 60 * 60 * 1000); // 1 hour in milliseconds

    return NextResponse.json({
      message: "CSR updated successfully",
      zip: `/certs/${fqdn}-updated.zip`,
    });

  } catch (err: any) {
    console.error("Error updating CSR:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

async function zipDirectory(source: string, out: string): Promise<boolean> {
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
