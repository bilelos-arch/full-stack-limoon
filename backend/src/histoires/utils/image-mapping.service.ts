// backend/src/histoires/utils/image-mapping.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface ImageMappingResult {
  found: boolean;
  imagePath?: string;
  variableName?: string;
  filename?: string;
  error?: string;
}

@Injectable()
export class ImageMappingService {
  private readonly logger = new Logger(ImageMappingService.name);
  private readonly uploadsDir = './uploads';
  private readonly tempImagesDir = './uploads/temp-images';
  private readonly histoiresImagesDir = './uploads/histoires-images';
  private readonly previewsDir = './uploads/previews';
  private readonly pdfsDir = './uploads/pdfs';

  constructor() {
    this.ensureDirectoriesExist();
  }

  /**
   * S'assurer que tous les répertoires nécessaires existent
   */
  private ensureDirectoriesExist(): void {
    const directories = [this.uploadsDir, this.tempImagesDir, this.histoiresImagesDir, this.previewsDir, this.pdfsDir];

    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        this.logger.log(`Created directory: ${dir}`);
      }
    });
  }

  /**
   * Trouver une image par nom de variable avec recherche multi-méthodes
   */
  async findImageByVariable(
    variableName: string,
    imageVariableValue: string,
    uploadedImageUrls: string[] = []
  ): Promise<ImageMappingResult> {
    this.logger.log(`[IMAGE-MAPPING] 🔍 Starting image search: variable="${variableName}", value="${imageVariableValue}"`);
    this.logger.log(`[IMAGE-MAPPING] 📁 Available uploaded URLs:`, uploadedImageUrls);
    this.logger.log(`[IMAGE-MAPPING] 📂 Current working directory: ${process.cwd()}`);
    this.logger.log(`[IMAGE-MAPPING] 📂 Uploads dir: ${this.uploadsDir}, exists: ${fs.existsSync(this.uploadsDir)}`);
    this.logger.log(`[IMAGE-MAPPING] 📂 Temp images dir: ${this.tempImagesDir}, exists: ${fs.existsSync(this.tempImagesDir)}`);

    try {
      // MÉTHODE 1: Recherche directe dans uploadedImageUrls avec correspondance exacte
      if (uploadedImageUrls && uploadedImageUrls.length > 0) {
        this.logger.log(`[IMAGE-MAPPING] 🔍 Method 1: Direct match search in ${uploadedImageUrls.length} uploaded URLs`);
        const directMatch = this.findDirectMatch(imageVariableValue, uploadedImageUrls);
        if (directMatch.found) {
          this.logger.log(`[IMAGE-MAPPING] ✅ Direct match found: ${directMatch.imagePath}`);
          return directMatch;
        } else {
          this.logger.log(`[IMAGE-MAPPING] ❌ No direct match found in uploaded URLs`);
        }
      } else {
        this.logger.log(`[IMAGE-MAPPING] ⚠️ No uploaded URLs provided, skipping direct match`);
      }

      // MÉTHODE 2: Recherche par préfixe de variable dans les fichiers uploaded
      if (uploadedImageUrls && uploadedImageUrls.length > 0) {
        this.logger.log(`[IMAGE-MAPPING] 🔍 Method 2: Prefix match search for variable "${variableName}"`);
        const prefixMatch = this.findByVariablePrefix(variableName, uploadedImageUrls);
        if (prefixMatch.found) {
          this.logger.log(`[IMAGE-MAPPING] ✅ Prefix match found: ${prefixMatch.imagePath}`);
          return prefixMatch;
        } else {
          this.logger.log(`[IMAGE-MAPPING] ❌ No prefix match found for "${variableName}"`);
        }
      }

      // MÉTHODE 3: Recherche par préfixe dans temp-images
      const tempImagesMatch = await this.findInTempImages(variableName, imageVariableValue);
      if (tempImagesMatch.found) {
        this.logger.log(`[IMAGE-MAPPING] ✅ Temp images match found: ${tempImagesMatch.imagePath}`);
        return tempImagesMatch;
      }

      // MÉTHODE 4: Recherche exhaustive dans tous les répertoires d'uploads
      const exhaustiveMatch = await this.findInAllDirectories(variableName, imageVariableValue);
      if (exhaustiveMatch.found) {
        this.logger.log(`[IMAGE-MAPPING] ✅ Exhaustive search found: ${exhaustiveMatch.imagePath}`);
        return exhaustiveMatch;
      }

      // Aucune correspondance trouvée
      const errorMsg = `Image not found for variable "${variableName}" with value "${imageVariableValue}"`;
      this.logger.error(`[IMAGE-MAPPING] ❌ ${errorMsg}`);
      
      return {
        found: false,
        error: errorMsg,
        variableName
      };

    } catch (error) {
      const errorMessage = error && error.message ? error.message : (error && error.toString) ? error.toString() : 'Unknown error';
      const errorMsg = `Error searching for image "${variableName}": ${errorMessage}`;
      this.logger.error(`[IMAGE-MAPPING] ❌ ${errorMsg}`, error.stack || error);
      
      return {
        found: false,
        variableName,
        error: errorMsg
      };
    }
  }

  /**
   * MÉTHODE 1: Recherche directe avec correspondance exacte
   */
  private findDirectMatch(imageVariableValue: string, uploadedImageUrls: string[]): ImageMappingResult {
    for (const uploadedPath of uploadedImageUrls) {
      const uploadedFilename = path.basename(uploadedPath);
      
      // Correspondance exacte du nom de fichier
      if (uploadedFilename === imageVariableValue) {
        return {
          found: true,
          imagePath: uploadedPath,
          filename: uploadedFilename
        };
      }

      // Correspondance sans timestamp/unique suffix (pattern: variableName-timestamp-random.ext)
      const filenameWithoutSuffix = this.extractBaseFilename(uploadedFilename);
      if (filenameWithoutSuffix === imageVariableValue) {
        return {
          found: true,
          imagePath: uploadedPath,
          filename: uploadedFilename
        };
      }
    }

    return { found: false };
  }

  /**
   * MÉTHODE 2: Recherche par préfixe de variable
   */
  private findByVariablePrefix(variableName: string, uploadedImageUrls: string[]): ImageMappingResult {
    for (const uploadedPath of uploadedImageUrls) {
      const uploadedFilename = path.basename(uploadedPath);
      
      // Vérifier si le fichier commence par le nom de variable
      if (uploadedFilename.startsWith(`${variableName}-`)) {
        return {
          found: true,
          imagePath: uploadedPath,
          filename: uploadedFilename
        };
      }
    }

    return { found: false };
  }

  /**
   * MÉTHODE 3: Recherche dans le répertoire temp-images
   */
  private async findInTempImages(variableName: string, imageVariableValue: string): Promise<ImageMappingResult> {
    try {
      if (!fs.existsSync(this.tempImagesDir)) {
        return { found: false };
      }

      const files = fs.readdirSync(this.tempImagesDir);
      
      for (const filename of files) {
        const filePath = path.join(this.tempImagesDir, filename);
        
        // Vérifier si c'est un fichier image
        if (!this.isImageFile(filename)) {
          continue;
        }

        // Correspondance directe
        if (filename === imageVariableValue) {
          return {
            found: true,
            imagePath: filePath,
            filename
          };
        }

        // Correspondance par préfixe
        if (filename.startsWith(`${variableName}-`)) {
          return {
            found: true,
            imagePath: filePath,
            filename
          };
        }

        // Correspondance sans suffix
        const baseFilename = this.extractBaseFilename(filename);
        if (baseFilename === imageVariableValue) {
          return {
            found: true,
            imagePath: filePath,
            filename
          };
        }
      }

      return { found: false };
    } catch (error) {
      const errorMessage = error && error.message ? error.message : (error && error.toString) ? error.toString() : 'Unknown error';
      this.logger.error(`[IMAGE-MAPPING] Error in temp-images search: ${errorMessage}`, error.stack || error);
      return { found: false };
    }
  }

  /**
   * MÉTHODE 4: Recherche exhaustive dans tous les répertoires
   */
  private async findInAllDirectories(variableName: string, imageVariableValue: string): Promise<ImageMappingResult> {
    const searchDirectories = [
      this.uploadsDir,
      this.tempImagesDir,
      this.histoiresImagesDir,
      this.previewsDir,
      this.pdfsDir
    ];

    for (const searchDir of searchDirectories) {
      if (!fs.existsSync(searchDir)) {
        continue;
      }

      try {
        const result = await this.searchDirectory(searchDir, variableName, imageVariableValue);
        if (result.found) {
          return result;
        }
      } catch (error) {
        const errorMessage = error && error.message ? error.message : (error && error.toString) ? error.toString() : 'Unknown error';
        this.logger.warn(`[IMAGE-MAPPING] Error searching directory ${searchDir}: ${errorMessage}`, error.stack || error);
      }
    }

    return { found: false };
  }

  /**
   * Rechercher dans un répertoire spécifique
   */
  private async searchDirectory(searchDir: string, variableName: string, imageVariableValue: string): Promise<ImageMappingResult> {
    const files = fs.readdirSync(searchDir);

    for (const filename of files) {
      const filePath = path.join(searchDir, filename);
      
      // Ignorer les répertoires
      if (fs.statSync(filePath).isDirectory()) {
        continue;
      }

      // Vérifier si c'est un fichier image
      if (!this.isImageFile(filename)) {
        continue;
      }

      // Correspondance directe
      if (filename === imageVariableValue) {
        return {
          found: true,
          imagePath: filePath,
          filename
        };
      }

      // Correspondance par préfixe
      if (filename.startsWith(`${variableName}-`)) {
        return {
          found: true,
          imagePath: filePath,
          filename
        };
      }
    }

    return { found: false };
  }

  /**
   * Valider qu'une image existe et est accessible
   */
  validateImageExists(imagePath: string): { valid: boolean; error?: string } {
    try {
      if (!fs.existsSync(imagePath)) {
        return { valid: false, error: `Image file does not exist: ${imagePath}` };
      }

      const stats = fs.statSync(imagePath);
      if (stats.size === 0) {
        return { valid: false, error: `Image file is empty: ${imagePath}` };
      }

      const filename = path.basename(imagePath);
      if (!this.isImageFile(filename)) {
        return { valid: false, error: `File is not a valid image: ${imagePath}` };
      }

      return { valid: true };
    } catch (error) {
      const errorMessage = error && error.message ? error.message : (error && error.toString) ? error.toString() : 'Unknown error';
      return { valid: false, error: `Error validating image: ${errorMessage}` };
    }
  }

  /**
   * Obtenir le chemin d'image pour une variable
   */
  getImagePath(variableName: string, imageVariableValue: string, uploadedImageUrls: string[] = []): Promise<string | null> {
    return this.findImageByVariable(variableName, imageVariableValue, uploadedImageUrls)
      .then(result => result.found ? result.imagePath || null : null);
  }

  /**
   * Extraire le nom de base d'un fichier (sans timestamp/random suffix)
   */
  private extractBaseFilename(filename: string): string {
    // Pattern: variableName-timestamp-random.ext
    const parts = filename.split('-');
    if (parts.length >= 3) {
      // Reconstruire sans les dernières parties (timestamp + random)
      const ext = path.extname(filename);
      const variablePart = parts[0]; // première partie = nom de variable
      return `${variablePart}${ext}`;
    }
    return filename;
  }

  /**
   * Vérifier si un fichier est une image valide
   */
  private isImageFile(filename: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(filename).toLowerCase();
    return imageExtensions.includes(ext);
  }

  /**
   * Lister toutes les images disponibles dans les répertoires
   */
  listAvailableImages(): { directory: string; files: string[] }[] {
    const directories = [
      { path: this.tempImagesDir, name: 'temp-images' },
      { path: this.histoiresImagesDir, name: 'histoires-images' },
      { path: this.uploadsDir, name: 'uploads' },
      { path: this.previewsDir, name: 'previews' },
      { path: this.pdfsDir, name: 'pdfs' }
    ];

    return directories.map(dir => {
      let files: string[] = [];
      
      if (fs.existsSync(dir.path)) {
        try {
          files = fs.readdirSync(dir.path)
            .filter(file => this.isImageFile(file))
            .sort();
        } catch (error) {
          const errorMessage = error && error.message ? error.message : (error && error.toString) ? error.toString() : 'Unknown error';
          this.logger.warn(`Error reading directory ${dir.path}: ${errorMessage}`, error.stack || error);
        }
      }

      return {
        directory: dir.name,
        files
      };
    });
  }

  /**
   * Nettoyer les images temporaires (optionnel)
   */
  async cleanupTempImages(olderThanDays: number = 1): Promise<number> {
    if (!fs.existsSync(this.tempImagesDir)) {
      return 0;
    }

    const files = fs.readdirSync(this.tempImagesDir);
    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    let cleanedCount = 0;

    for (const filename of files) {
      const filePath = path.join(this.tempImagesDir, filename);

      try {
        const stats = fs.statSync(filePath);
        if (stats.mtime.getTime() < cutoffTime) {
          fs.unlinkSync(filePath);
          cleanedCount++;
          this.logger.log(`Cleaned up temp image: ${filename}`);
        }
      } catch (error) {
        const errorMessage = error && error.message ? error.message : (error && error.toString) ? error.toString() : 'Unknown error';
        this.logger.warn(`Error cleaning up ${filename}: ${errorMessage}`, error.stack || error);
      }
    }

    return cleanedCount;
  }

}