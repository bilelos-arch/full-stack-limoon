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
exports.EditorElementSchema = exports.EditorElement = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let EditorElement = class EditorElement extends mongoose_2.Document {
};
exports.EditorElement = EditorElement;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Template' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], EditorElement.prototype, "templateId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ['text', 'image'] }),
    __metadata("design:type", String)
], EditorElement.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], EditorElement.prototype, "pageIndex", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], EditorElement.prototype, "x", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], EditorElement.prototype, "y", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], EditorElement.prototype, "width", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], EditorElement.prototype, "height", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], EditorElement.prototype, "textContent", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], EditorElement.prototype, "font", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", Number)
], EditorElement.prototype, "fontSize", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, type: Object }),
    __metadata("design:type", Object)
], EditorElement.prototype, "fontStyle", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], EditorElement.prototype, "googleFont", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], EditorElement.prototype, "color", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], EditorElement.prototype, "backgroundColor", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, type: String, enum: ['left', 'center', 'right'] }),
    __metadata("design:type", String)
], EditorElement.prototype, "alignment", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], EditorElement.prototype, "variableName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, type: [String] }),
    __metadata("design:type", Array)
], EditorElement.prototype, "variables", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, type: Object }),
    __metadata("design:type", Object)
], EditorElement.prototype, "defaultValues", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], EditorElement.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], EditorElement.prototype, "updatedAt", void 0);
exports.EditorElement = EditorElement = __decorate([
    (0, mongoose_1.Schema)()
], EditorElement);
exports.EditorElementSchema = mongoose_1.SchemaFactory.createForClass(EditorElement);
//# sourceMappingURL=editor-element.schema.js.map