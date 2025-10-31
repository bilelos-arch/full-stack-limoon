import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EditorElement } from './editor-element.schema';
import { Template } from './template.schema';

/**
 * Script de migration pour convertir les coordonnées absolues existantes en coordonnées relatives
 * À exécuter une seule fois après le déploiement des changements
 */
@Injectable()
export class CoordinateMigrationService {
  constructor(
    @InjectModel(EditorElement.name) private editorElementModel: Model<EditorElement>,
    @InjectModel(Template.name) private templateModel: Model<Template>,
  ) {}

  async migrateAllCoordinates(): Promise<{ migrated: number; errors: number }> {
    console.log('=== MIGRATION DES COORDONNÉES ===');
    console.log('Début de la migration des coordonnées absolues vers relatives...');

    let migrated = 0;
    let errors = 0;

    try {
      // Récupérer tous les templates avec leurs dimensions
      const templates = await this.templateModel.find({}).exec();
      console.log(`Trouvé ${templates.length} templates à migrer`);

      for (const template of templates) {
        if (!template.dimensions) {
          console.warn(`Template ${template._id} n'a pas de dimensions, ignoré`);
          continue;
        }

        console.log(`Migration du template ${template._id} (${template.title})`);

        // Récupérer tous les éléments de ce template
        const elements = await this.editorElementModel.find({ templateId: template._id }).exec();
        console.log(`  ${elements.length} éléments trouvés`);

        for (const element of elements) {
          try {
            // Vérifier si les coordonnées sont déjà relatives (valeurs entre 0-100)
            const isAlreadyRelative =
              element.x >= 0 && element.x <= 100 &&
              element.y >= 0 && element.y <= 100 &&
              element.width >= 0 && element.width <= 100 &&
              element.height >= 0 && element.height <= 100;

            if (isAlreadyRelative) {
              console.log(`  Élément ${element._id} déjà en coordonnées relatives, ignoré`);
              continue;
            }

            // Convertir les coordonnées absolues en relatives
            const relativeX = (element.x / template.dimensions.width) * 100;
            const relativeY = (element.y / template.dimensions.height) * 100;
            const relativeWidth = (element.width / template.dimensions.width) * 100;
            const relativeHeight = (element.height / template.dimensions.height) * 100;

            // Mettre à jour l'élément
            await this.editorElementModel.findByIdAndUpdate(element._id, {
              x: Math.max(0, Math.min(100, relativeX)),
              y: Math.max(0, Math.min(100, relativeY)),
              width: Math.max(0, Math.min(100, relativeWidth)),
              height: Math.max(0, Math.min(100, relativeHeight)),
              updatedAt: new Date()
            }).exec();

            console.log(`  Élément ${element._id} migré: (${element.x}, ${element.y}, ${element.width}, ${element.height}) -> (${relativeX.toFixed(2)}, ${relativeY.toFixed(2)}, ${relativeWidth.toFixed(2)}, ${relativeHeight.toFixed(2)})`);
            migrated++;

          } catch (error) {
            console.error(`Erreur lors de la migration de l'élément ${element._id}:`, error);
            errors++;
          }
        }
      }

      console.log('=== MIGRATION TERMINÉE ===');
      console.log(`Éléments migrés: ${migrated}`);
      console.log(`Erreurs: ${errors}`);

      return { migrated, errors };

    } catch (error) {
      console.error('Erreur générale lors de la migration:', error);
      throw error;
    }
  }

  /**
   * Script standalone pour exécuter la migration
   */
  async runMigration(): Promise<void> {
    const result = await this.migrateAllCoordinates();
    console.log(`Migration terminée: ${result.migrated} éléments migrés, ${result.errors} erreurs`);
    process.exit(result.errors > 0 ? 1 : 0);
  }
}