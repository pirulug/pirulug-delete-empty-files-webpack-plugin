const Fs = require("fs");
const Path = require("path");

class DeleteEmptyFilesPlugin {
  constructor(baseDir, outputDir) {
    this.baseDir = baseDir;
    this.outputDir = outputDir;
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tap("DeleteEmptyFilesPlugin", (compilation) => {
      const outputPath = Path.resolve(this.baseDir, this.outputDir);
      this.deleteEmptyFiles(outputPath);
    });
  }

  async deleteEmptyFiles(directory) {
    const chalk = await import("chalk").then(
      (module) => module.default || module
    );

    Fs.readdirSync(directory).forEach((file) => {
      const filePath = Path.join(directory, file);
      const stats = Fs.statSync(filePath);

      if (stats.isDirectory()) {
        this.deleteEmptyFiles(filePath); // Si es un directorio, recursivamente buscar archivos vacíos dentro de él
      } else if (stats.isFile() && stats.size === 0) {
        Fs.unlinkSync(filePath); // Si es un archivo vacío, eliminarlo
        const relativePath = Path.relative(this.baseDir, filePath);
        console.log(chalk.green(`Archivo eliminado: ${relativePath}`));
      }
    });
  }
}

module.exports = DeleteEmptyFilesPlugin;
