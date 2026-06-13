import sharp from "sharp";
import fs from "fs";
import path from "path";

const inputDir = "src/assets/svg";
const outputDir = "src/assets/webp";

const filesToConvert = [
  "felix_asustado_animado_real.svg",
  "felix_enojado_animado.svg",
  "felix_cara_triste_animado.svg",
  "felix_cara_sorprendido.svg",
  "felix_cara_sonriendo.svg",
  "felix_respirando.svg",
  "felix_triste_svg_regenerado.svg",
  "estrella_animada.svg",
];

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

for (const file of filesToConvert) {
  const inputPath = path.join(inputDir, file);
  const outputPath = path.join(outputDir, file.replace(".svg", ".webp"));

  console.log("Convirtiendo:", inputPath);

  await sharp(inputPath)
    .resize({ width: 700 })
    .webp({ quality: 80 })
    .toFile(outputPath);

  console.log("OK:", outputPath);
}
