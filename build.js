import esbuild from "esbuild";
import babel from "esbuild-plugin-babel";
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

function assembleHTML(jsCode) {
  let css = fs.readFileSync(path.join(srcDir, "styles.css"), "utf-8");
  if (isTest) {
    css +=
      "\n" +
      fs.readFileSync(path.join(srcDir, "test-controls.css"), "utf-8");
  }

  let html = fs.readFileSync(templatePath, "utf-8");

  html = html.replace("/* __CSS__ */", css);
  html = html.replace("/* __JS__ */", jsCode);

  if (!isTest) {
    html = html.replace(
      /<!-- TEST_CONTROLS_START -->[\s\S]*?<!-- TEST_CONTROLS_END -->/,
      "",
    );
  }

  return html;
}

async function build() {
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

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
  const html = assembleHTML(jsCode);

  fs.writeFileSync(path.join(distDir, "index.html"), html);
  console.log(
    `Built dist/index.html (${mode} mode, ${(Buffer.byteLength(html) / 1024).toFixed(1)}KB)`,
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
