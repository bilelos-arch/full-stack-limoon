"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoiresModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const histoires_controller_1 = require("./histoires.controller");
const histoires_service_1 = require("./histoires.service");
const histoire_schema_1 = require("./schemas/histoire.schema");
const pdf_generator_service_1 = require("./utils/pdf-generator.service");
const image_mapping_service_1 = require("./utils/image-mapping.service");
const image_conversion_service_1 = require("../image-conversion.service");
const templates_module_1 = require("../templates.module");
const users_module_1 = require("../users.module");
let HistoiresModule = class HistoiresModule {
};
exports.HistoiresModule = HistoiresModule;
exports.HistoiresModule = HistoiresModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: histoire_schema_1.Histoire.name, schema: histoire_schema_1.HistoireSchema }]),
            (0, common_1.forwardRef)(() => templates_module_1.TemplatesModule),
            (0, common_1.forwardRef)(() => users_module_1.UsersModule),
        ],
        controllers: [histoires_controller_1.HistoiresController],
        providers: [histoires_service_1.HistoiresService, pdf_generator_service_1.PdfGeneratorService, image_mapping_service_1.ImageMappingService, image_conversion_service_1.ImageConversionService],
        exports: [histoires_service_1.HistoiresService, pdf_generator_service_1.PdfGeneratorService, image_mapping_service_1.ImageMappingService, image_conversion_service_1.ImageConversionService],
    })
], HistoiresModule);
//# sourceMappingURL=histoires.module.js.map