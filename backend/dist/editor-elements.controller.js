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
exports.EditorElementsController = void 0;
const common_1 = require("@nestjs/common");
const editor_elements_service_1 = require("./editor-elements.service");
const create_element_dto_1 = require("./create-element.dto");
const update_element_dto_1 = require("./update-element.dto");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const roles_guard_1 = require("./roles.guard");
const roles_decorator_1 = require("./roles.decorator");
let EditorElementsController = class EditorElementsController {
    constructor(editorElementsService) {
        this.editorElementsService = editorElementsService;
    }
    async findAll(templateId) {
        return this.editorElementsService.findAllByTemplate(templateId);
    }
    async findAllPublic(templateId) {
        console.log('=== PUBLIC ELEMENTS ENDPOINT ===');
        console.log('Template ID:', templateId);
        const result = await this.editorElementsService.findAllByTemplate(templateId);
        console.log('Public elements result:', result.length, 'elements');
        return result;
    }
    async create(templateId, elementData) {
        return this.editorElementsService.create(templateId, elementData);
    }
    async update(templateId, elementId, elementData) {
        return this.editorElementsService.update(templateId, elementId, elementData);
    }
    async remove(templateId, elementId) {
        await this.editorElementsService.remove(templateId, elementId);
        return;
    }
};
exports.EditorElementsController = EditorElementsController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EditorElementsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('public/:templateId'),
    __param(0, (0, common_1.Param)('templateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EditorElementsController.prototype, "findAllPublic", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_element_dto_1.CreateElementDto]),
    __metadata("design:returntype", Promise)
], EditorElementsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':elementId'),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('elementId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_element_dto_1.UpdateElementDto]),
    __metadata("design:returntype", Promise)
], EditorElementsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':elementId'),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('elementId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EditorElementsController.prototype, "remove", null);
exports.EditorElementsController = EditorElementsController = __decorate([
    (0, common_1.Controller)('templates/:id/elements'),
    __metadata("design:paramtypes", [editor_elements_service_1.EditorElementsService])
], EditorElementsController);
//# sourceMappingURL=editor-elements.controller.js.map