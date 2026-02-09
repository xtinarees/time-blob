import esbuild from "esbuild";
import babel from "esbuild-plugin-babel";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const mode = process.argv[2] || "production";
const isTest = mode === "test" || mode === "watch";
const isWatch = mode === "watch";

const distDir = path.join(__dirname, "dist");
const srcDir = path.join(__dirname, "src");
const templatePath = path.join(__dirname, "template.html");

function contentHash(content) {
  return crypto.createHash("sha256").update(content).digest("hex").slice(0, 8);
}

function cleanDist() {
  if (fs.existsSync(distDir)) {
    for (const file of fs.readdirSync(distDir)) {
      fs.unlinkSync(path.join(distDir, file));
    }
  }
}

function buildCSS() {
  let css = fs.readFileSync(path.join(srcDir, "styles.css"), "utf-8");
  if (isTest) {
    css +=
      "\n" +
      fs.readFileSync(path.join(srcDir, "test-controls.css"), "utf-8");
  }

  const filename = isTest
    ? "styles.css"
    : `styles.${contentHash(css)}.css`;
  fs.writeFileSync(path.join(distDir, filename), css);
  return filename;
}

function buildHTML(jsFilename, cssFilename) {
  let html = fs.readFileSync(templatePath, "utf-8");

  if (!isTest) {
    html = html.replace(
      /<!-- TEST_CONTROLS_START -->[\s\S]*?<!-- TEST_CONTROLS_END -->/,
      "",
    );
  }

  html = html.replace("styles.css", cssFilename);
  html = html.replace("script.js", jsFilename);

  fs.writeFileSync(path.join(distDir, "index.html"), html);
}

async function build() {
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  cleanDist();

  const result = await esbuild.build({
    entryPoints: [path.join(srcDir, "main.js")],
    bundle: true,
    write: false,
    format: "esm",
    target: "es2022",
    external: ["three", "three/addons/*"],
    define: {
      TEST_MODE: isTest ? "true" : "false",
    },
    minify: !isTest,
    sourcemap: isTest ? "inline" : false,
    plugins: [babel()],
  });

  const jsCode = result.outputFiles[0].text;
  const jsFilename = isTest
    ? "script.js"
    : `script.${contentHash(jsCode)}.js`;
  fs.writeFileSync(path.join(distDir, jsFilename), jsCode);

  const cssFilename = buildCSS();
  buildHTML(jsFilename, cssFilename);

  const jsSize = Buffer.byteLength(jsCode);
  const cssSize = fs.statSync(path.join(distDir, cssFilename)).size;
  const htmlSize = fs.statSync(path.join(distDir, "index.html")).size;
  const totalKB = ((jsSize + cssSize + htmlSize) / 1024).toFixed(1);
  console.log(
    `Built dist/ (${mode} mode, ${totalKB}KB total: index.html + ${jsFilename} + ${cssFilename})`,
  );
}

async function watch() {
  const chokidar = await import("chokidar");

  await build();

  const watcher = chokidar.watch([srcDir, templatePath], {
    ignoreInitial: true,
  });

  watcher.on("all", async (event, filePath) => {
    console.log(`\n${event}: ${path.relative(__dirname, filePath)}`);
    try {
      await build();
    } catch (err) {
      console.error("Build error:", err.message);
    }
  });

  console.log("\nWatching for changes...");
}

if (isWatch) {
  watch().catch(console.error);
} else {
  build().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
