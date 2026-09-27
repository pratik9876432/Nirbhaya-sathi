const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");

async function makeZip() {
  const zip = new JSZip();

  function addDirectoryToZip(dirPath, zipFolder, ignoreList = []) {
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
      if (ignoreList.includes(item)) continue;
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        const subFolder = zipFolder.folder(item);
        addDirectoryToZip(fullPath, subFolder, ignoreList);
      } else {
        const content = fs.readFileSync(fullPath);
        zipFolder.file(item, content);
      }
    }
  }

  // Add dist static build files directly at root of ZIP for instant hosting on any static host / cPanel
  if (fs.existsSync(path.join(process.cwd(), "dist"))) {
    const distFiles = fs.readdirSync(path.join(process.cwd(), "dist"));
    const zipFiles = distFiles.filter(f => f.endsWith(".zip") || f.endsWith(".tar.gz"));
    addDirectoryToZip(path.join(process.cwd(), "dist"), zip, zipFiles);
  }

  // Also include project source and backend
  if (fs.existsSync(path.join(process.cwd(), "src"))) {
    const srcFolder = zip.folder("src");
    addDirectoryToZip(path.join(process.cwd(), "src"), srcFolder, ["prebuiltZipBase64.ts"]);
  }

  const rootFiles = [
    "package.json",
    "server.ts",
    "vite.config.ts",
    "tsconfig.json",
    "tsconfig.node.json",
    "index.html",
    ".env.example",
    "vercel.json",
    "render.yaml",
    "RENDER_DEPLOY_GUIDE.md"
  ];

  for (const f of rootFiles) {
    const fp = path.join(process.cwd(), f);
    if (fs.existsSync(fp)) {
      zip.file(f, fs.readFileSync(fp));
    }
  }

  zip.file(".htaccess", `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>`);

  console.log("Generating ZIP package...");
  const buffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 9 }
  });

  const publicZip = path.join(process.cwd(), "public", "nirbhaya_sathi_deploy.zip");
  const distZip = path.join(process.cwd(), "dist", "nirbhaya_sathi_deploy.zip");

  fs.writeFileSync(publicZip, buffer);
  if (fs.existsSync(path.join(process.cwd(), "dist"))) {
    fs.writeFileSync(distZip, buffer);
  }

  console.log("ZIP created successfully! Total size in bytes:", buffer.length);

  const b64 = buffer.toString("base64");
  const tsContent = `// Auto-generated prebuilt zip base64\nexport const PREBUILT_ZIP_BASE64 = "${b64}";\n`;
  fs.writeFileSync(path.join(process.cwd(), "src", "services", "prebuiltZipBase64.ts"), tsContent);
  console.log("Updated prebuiltZipBase64.ts with new size:", b64.length);
}

makeZip().catch(console.error);
