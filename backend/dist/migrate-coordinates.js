"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoordinateMigrationService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const editor_element_schema_1 = require("./editor-element.schema");
const template_schema_1 = require("./template.schema");
let CoordinateMigrationService = class CoordinateMigrationService {
    constructor(editorElementModel, templateModel) {
        this.editorElementModel = editorElementModel;
        this.templateModel = templateModel;
    }
    async migrateAllCoordinates() {
        console.log('=== MIGRATION DES COORDONNÉES ===');
        console.log('Début de la migration des coordonnées absolues vers relatives...');
        let migrated = 0;
        let errors = 0;
        try {
            const templates = await this.templateModel.find({}).exec();
            console.log(`Trouvé ${templates.length} templates à migrer`);
            for (const template of templates) {
                if (!template.dimensions) {
                    console.warn(`Template ${template._id} n'a pas de dimensions, ignoré`);
                    continue;
                }
                console.log(`Migration du template ${template._id} (${template.title})`);
                const elements = await this.editorElementModel.find({ templateId: template._id }).exec();
                console.log(`  ${elements.length} éléments trouvés`);
                for (const element of elements) {
                    try {
                        const isAlreadyRelative = element.x >= 0 && element.x <= 100 &&
                            element.y >= 0 && element.y <= 100 &&
                            element.width >= 0 && element.width <= 100 &&
                            element.height >= 0 && element.height <= 100;
                        if (isAlreadyRelative) {
                            console.log(`  Élément ${element._id} déjà en coordonnées relatives, ignoré`);
                            continue;
                        }
                        const relativeX = (element.x / template.dimensions.width) * 100;
                        const relativeY = (element.y / template.dimensions.height) * 100;
                        const relativeWidth = (element.width / template.dimensions.width) * 100;
                        const relativeHeight = (element.height / template.dimensions.height) * 100;
                        await this.editorElementModel.findByIdAndUpdate(element._id, {
                            x: Math.max(0, Math.min(100, relativeX)),
                            y: Math.max(0, Math.min(100, relativeY)),
                            width: Math.max(0, Math.min(100, relativeWidth)),
                            height: Math.max(0, Math.min(100, relativeHeight)),
                            updatedAt: new Date()
                        }).exec();
                        console.log(`  Élément ${element._id} migré: (${element.x}, ${element.y}, ${element.width}, ${element.height}) -> (${relativeX.toFixed(2)}, ${relativeY.toFixed(2)}, ${relativeWidth.toFixed(2)}, ${relativeHeight.toFixed(2)})`);
                        migrated++;
                    }
                    catch (error) {
                        console.error(`Erreur lors de la migration de l'élément ${element._id}:`, error);
                        errors++;
                    }
                }
            }
            console.log('=== MIGRATION TERMINÉE ===');
            console.log(`Éléments migrés: ${migrated}`);
            console.log(`Erreurs: ${errors}`);
            return { migrated, errors };
        }
        catch (error) {
            console.error('Erreur générale lors de la migration:', error);
            throw error;
        }
    }
    async runMigration() {
        const result = await this.migrateAllCoordinates();
        console.log(`Migration terminée: ${result.migrated} éléments migrés, ${result.errors} erreurs`);
        process.exit(result.errors > 0 ? 1 : 0);
    }
};
exports.CoordinateMigrationService = CoordinateMigrationService;
exports.CoordinateMigrationService = CoordinateMigrationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(editor_element_schema_1.EditorElement.name)),
    __param(1, (0, mongoose_1.InjectModel)(template_schema_1.Template.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], CoordinateMigrationService);
//# sourceMappingURL=migrate-coordinates.js.map