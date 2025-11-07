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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTemplateDto = void 0;
const class_validator_1 = require("class-validator");
class CreateTemplateDto {
}
exports.CreateTemplateDto = CreateTemplateDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['contes-et-aventures-imaginaires', 'heros-du-quotidien', 'histoires-avec-des-animaux', 'histoires-educatives', 'valeurs-et-developpement-personnel', 'vie-quotidienne-et-ecole', 'fetes-et-occasions-speciales', 'exploration-et-science-fiction', 'culture-et-traditions', 'histoires-du-soir']),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['boy', 'girl', 'unisex']),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "gender", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['3 ans - 5 ans', '6 ans - 8 ans', '9 ans - 11 ans', '12 ans - 15 ans']),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "ageRange", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['français', 'anglais', 'arabe']),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "language", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateTemplateDto.prototype, "isPublished", void 0);
//# sourceMappingURL=create-template.dto.js.map