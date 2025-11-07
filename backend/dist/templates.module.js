"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplatesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const templates_controller_1 = require("./templates.controller");
const templates_service_1 = require("./templates.service");
const template_schema_1 = require("./template.schema");
const editor_elements_controller_1 = require("./editor-elements.controller");
const editor_elements_service_1 = require("./editor-elements.service");
const editor_element_schema_1 = require("./editor-element.schema");
const migrate_coordinates_1 = require("./migrate-coordinates");
const histoires_module_1 = require("./histoires/histoires.module");
let TemplatesModule = class TemplatesModule {
};
exports.TemplatesModule = TemplatesModule;
exports.TemplatesModule = TemplatesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: template_schema_1.Template.name, schema: template_schema_1.TemplateSchema },
                { name: editor_element_schema_1.EditorElement.name, schema: editor_element_schema_1.EditorElementSchema },
            ]),
            (0, common_1.forwardRef)(() => histoires_module_1.HistoiresModule),
        ],
        controllers: [templates_controller_1.TemplatesController, editor_elements_controller_1.EditorElementsController],
        providers: [templates_service_1.TemplatesService, editor_elements_service_1.EditorElementsService, migrate_coordinates_1.CoordinateMigrationService],
        exports: [templates_service_1.TemplatesService, editor_elements_service_1.EditorElementsService, migrate_coordinates_1.CoordinateMigrationService],
    })
], TemplatesModule);
//# sourceMappingURL=templates.module.js.map