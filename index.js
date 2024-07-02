const Fs = require("fs");
const Path = require("path");

class DeleteEmptyFilesPlugin {
  /**
   * Constructor del plugin.
   * @param {string} baseDir - Directorio base del proyecto.
   * @param {string} outputDir - Directorio de salida donde se buscarán archivos vacíos.
   */
  constructor(baseDir, outputDir) {
    this.baseDir = baseDir;
    this.outputDir = outputDir;
  }

  /**
   * Método apply que se ejecuta cuando el plugin es aplicado por Webpack.
   * @param {object} compiler - Instancia del compilador de Webpack.
   */
  apply(compiler) {
    compiler.hooks.afterEmit.tap("DeleteEmptyFilesPlugin", (compilation) => {
      // Resolviendo la ruta completa del directorio de salida.
      const outputPath = Path.resolve(this.baseDir, this.outputDir);
      // Llamada al método para eliminar archivos vacíos.
      this.deleteEmptyFiles(outputPath);
    });
  }

  /**
   * Método para eliminar archivos vacíos de un directorio.
   * @param {string} directory - Ruta del directorio donde se buscarán archivos vacíos.
   */
  async deleteEmptyFiles(directory) {
    // Importando el módulo chalk para colorear los mensajes en la consola.
    const chalk = await import("chalk").then(
      (module) => module.default || module
    );

    // Verificar si el directorio existe antes de proceder.
    if (!Fs.existsSync(directory)) {
      console.log(
        chalk.yellow(
          `Directorio no encontrado: ${directory}, omitiendo eliminación de archivos vacíos.`
        )
      );
      return;
    }

    // Leyendo los archivos y directorios dentro del directorio especificado.
    Fs.readdirSync(directory).forEach((file) => {
      const filePath = Path.join(directory, file);
      const stats = Fs.statSync(filePath);

      if (stats.isDirectory()) {
        // Si es un directorio, llamar recursivamente para buscar archivos vacíos dentro de él.
        this.deleteEmptyFiles(filePath);
      } else if (stats.isFile() && stats.size === 0) {
        // Si es un archivo vacío, eliminarlo.
        Fs.unlinkSync(filePath);
        const relativePath = Path.relative(this.baseDir, filePath);
        console.log(chalk.green(`Archivo eliminado: ${relativePath}`));
      }
    });
  }
}

module.exports = DeleteEmptyFilesPlugin;
