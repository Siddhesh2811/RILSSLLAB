import { NextResponse } from "next/server";
import { exec } from "child_process";
import {
  existsSync,
  writeFileSync,
} from "fs";
import path from "path";
import { promisify } from "util";

const execShell = promisify(exec);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const fqdn = formData.get("name_9140475896")?.toString();
    const passphrase = formData.get("name_6765001998")?.toString();
    const crtFile = formData.get("crtfile") as File | null;

    if (!fqdn || !passphrase || !crtFile) {
      return NextResponse.json(
        { error: "Missing FQDN, passphrase or .crt file" },
        { status: 400 }
      );
    }

    const certsBase = path.resolve(process.cwd(), "public/certs");
    const fqdnDir = path.join(certsBase, fqdn);

    if (!existsSync(fqdnDir)) {
      return NextResponse.json(
        { error: "FQDN directory does not exist." },
        { status: 400 }
      );
    }

    const keyFile = path.join(fqdnDir, `${fqdn}.key`);
    if (!existsSync(keyFile)) {
      return NextResponse.json(
        { error: "Private key (.key) file missing in FQDN directory." },
        { status: 400 }
      );
    }

    // Save uploaded .crt file into fqdn directory
    const crtFilePath = path.join(fqdnDir, `${fqdn}.crt`);
    const crtBuffer = Buffer.from(await crtFile.arrayBuffer());
    writeFileSync(crtFilePath, crtBuffer);

    // Prepare PFX output path
    const pfxFilePath = path.join(fqdnDir, `${fqdn}.pfx`);

    // Generate PFX file using openssl
    await execShell(
      `openssl pkcs12 -export -out "${pfxFilePath}" -inkey "${keyFile}" -in "${crtFilePath}" -password pass:${passphrase}`
    );

    // Return download URL of the generated PFX
    return NextResponse.json({
      success: true,
      downloadUrl: `/certs/${fqdn}/${fqdn}.pfx`,
    });
  } catch (err: any) {
    console.error("Error generating PFX:", err);
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
