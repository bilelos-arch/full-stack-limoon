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
exports.TemplatesController = void 0;
const common_1 = require("@nestjs/common");
const templates_service_1 = require("./templates.service");
const create_template_dto_1 = require("./create-template.dto");
const update_template_dto_1 = require("./update-template.dto");
const preview_template_dto_1 = require("./preview-template.dto");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const roles_guard_1 = require("./roles.guard");
const roles_decorator_1 = require("./roles.decorator");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
let TemplatesController = class TemplatesController {
    constructor(templatesService) {
        this.templatesService = templatesService;
    }
    async create(createTemplateDto, files) {
        console.log('=== CREATE TEMPLATE REQUEST ===');
        console.log('Raw Body:', JSON.stringify(createTemplateDto, null, 2));
        console.log('Body.ageRange:', createTemplateDto.ageRange);
        console.log('Body.ageRange type:', typeof createTemplateDto.ageRange);
        console.log('Body.ageRange is undefined:', createTemplateDto.ageRange === undefined);
        console.log('Body.ageRange is null:', createTemplateDto.ageRange === null);
        console.log('Body.ageRange is falsy:', !createTemplateDto.ageRange);
        console.log('Files received:', {
            pdf: files.pdf ? files.pdf[0]?.filename : 'MISSING',
            cover: files.cover ? files.cover[0]?.filename : 'MISSING'
        });
        if (!files.pdf || !files.cover) {
            console.log('ERROR: Missing files - PDF:', !!files.pdf, 'Cover:', !!files.cover);
            throw new common_1.BadRequestException('Both PDF and cover image are required');
        }
        const pdfPath = files.pdf[0].filename;
        const coverPath = files.cover[0].filename;
        console.log('Calling service with paths:', { pdfPath, coverPath });
        return this.templatesService.create(createTemplateDto, pdfPath, coverPath);
    }
    async findAll(category, gender, ageRange, isPublished, language, featured) {
        const query = { category, gender, ageRange, isPublished: isPublished !== undefined ? isPublished : 'true', language, featured };
        return this.templatesService.findAll(query);
    }
    async search(query, limit) {
        const searchLimit = limit ? parseInt(limit, 10) : 10;
        return this.templatesService.search(query || '', searchLimit);
    }
    async findOne(id) {
        return this.templatesService.findOne(id);
    }
    async generatePreview(previewDto) {
        return this.templatesService.generatePreview(previewDto.templateId, previewDto.variables || {});
    }
    async update(id, updateTemplateDto, files) {
        return this.templatesService.update(id, updateTemplateDto, files);
    }
    async remove(id) {
        await this.templatesService.remove(id);
        return { message: 'Template deleted successfully' };
    }
};
exports.TemplatesController = TemplatesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'pdf', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
    ], {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const filename = file.fieldname + '-' + uniqueSuffix + (0, path_1.extname)(file.originalname);
                console.log('Generated filename:', filename);
                callback(null, filename);
            },
        }),
        fileFilter: (req, file, callback) => {
            console.log('File filter check:', file.fieldname, file.mimetype);
            if (file.fieldname === 'pdf' && file.mimetype !== 'application/pdf') {
                return callback(new common_1.BadRequestException('Only PDF files are allowed for pdf field'), false);
            }
            if (file.fieldname === 'cover' && !file.mimetype.startsWith('image/')) {
                return callback(new common_1.BadRequestException('Only image files are allowed for cover field'), false);
            }
            callback(null, true);
        },
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_template_dto_1.CreateTemplateDto, Object]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(),
    __param(0, (0, common_1.Query)('category')),
    __param(1, (0, common_1.Query)('gender')),
    __param(2, (0, common_1.Query)('ageRange')),
    __param(3, (0, common_1.Query)('isPublished')),
    __param(4, (0, common_1.Query)('language')),
    __param(5, (0, common_1.Query)('featured')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, common_1.UseGuards)(),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "search", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('preview'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [preview_template_dto_1.PreviewTemplateDto]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "generatePreview", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'pdf', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
    ], {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const filename = file.fieldname + '-' + uniqueSuffix + (0, path_1.extname)(file.originalname);
                console.log('Generated filename for update:', filename);
                callback(null, filename);
            },
        }),
        fileFilter: (req, file, callback) => {
            console.log('File filter check for update:', file.fieldname, file.mimetype);
            if (file.fieldname === 'pdf' && file.mimetype !== 'application/pdf') {
                return callback(new common_1.BadRequestException('Only PDF files are allowed for pdf field'), false);
            }
            if (file.fieldname === 'cover' && !file.mimetype.startsWith('image/')) {
                return callback(new common_1.BadRequestException('Only image files are allowed for cover field'), false);
            }
            callback(null, true);
        },
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_template_dto_1.UpdateTemplateDto, Object]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "remove", null);
exports.TemplatesController = TemplatesController = __decorate([
    (0, common_1.Controller)('templates'),
    __metadata("design:paramtypes", [templates_service_1.TemplatesService])
], TemplatesController);
//# sourceMappingURL=templates.controller.js.map