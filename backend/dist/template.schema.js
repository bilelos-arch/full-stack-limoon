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
exports.TemplateSchema = exports.Template = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Template = class Template {
};
exports.Template = Template;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Template.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Template.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ['Contes et aventures imaginaires', 'Héros du quotidien', 'Histoires avec des animaux', 'Histoires éducatives', 'Valeurs et développement personnel', 'Vie quotidienne et école', 'Fêtes et occasions spéciales', 'Exploration et science-fiction', 'Culture et traditions', 'Histoires du soir'], required: true }),
    __metadata("design:type", String)
], Template.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ['boy', 'girl', 'unisex'], required: true }),
    __metadata("design:type", String)
], Template.prototype, "gender", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ['3 ans - 5 ans', '6 ans - 8 ans', '9 ans - 11 ans', '12 ans - 15 ans'], required: true }),
    __metadata("design:type", String)
], Template.prototype, "ageRange", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ['Français', 'Anglais', 'Arabe'], required: true }),
    __metadata("design:type", String)
], Template.prototype, "language", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Template.prototype, "pdfPath", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Template.prototype, "coverPath", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Template.prototype, "pageCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Template.prototype, "dimensions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Template.prototype, "variables", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Template.prototype, "isPublished", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Template.prototype, "isFeatured", void 0);
exports.Template = Template = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Template);
exports.TemplateSchema = mongoose_1.SchemaFactory.createForClass(Template);
//# sourceMappingURL=template.schema.js.map