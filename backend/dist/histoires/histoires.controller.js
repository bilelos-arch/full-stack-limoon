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
var HistoiresController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoiresController = void 0;
const common_1 = require("@nestjs/common");
const histoires_service_1 = require("./histoires.service");
const templates_service_1 = require("../templates.service");
const create_histoire_dto_1 = require("./dto/create-histoire.dto");
const update_histoire_dto_1 = require("./dto/update-histoire.dto");
const jwt_auth_guard_1 = require("../jwt-auth.guard");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
let HistoiresController = HistoiresController_1 = class HistoiresController {
    constructor(histoiresService, templatesService) {
        this.histoiresService = histoiresService;
        this.templatesService = templatesService;
        this.logger = new common_1.Logger(HistoiresController_1.name);
    }
    async findByTemplate(templateId) {
        this.logger.log(`Finding histoires for template ${templateId}`);
        return this.histoiresService.findByTemplate(templateId);
    }
    async findByUser(req) {
        const userId = req.user.userId;
        this.logger.log(`Finding histoires for user ${userId}`);
        return this.histoiresService.findByUser(userId);
    }
    async findOne(id, req) {
        const userId = req.user.userId;
        this.logger.log(`Finding histoire ${id} for user ${userId}`);
        return this.histoiresService.findOne(id, userId);
    }
    async create(createHistoireDto, req) {
        const userId = req.user.userId;
        this.logger.log(`Creating histoire for user ${userId}`);
        return this.histoiresService.create(userId, createHistoireDto);
    }
    async update(id, updateHistoireDto, req) {
        const userId = req.user.userId;
        this.logger.log(`Updating histoire ${id} for user ${userId}`);
        return this.histoiresService.update(id, userId, updateHistoireDto);
    }
    async remove(id, req) {
        const userId = req.user.userId;
        this.logger.log(`Deleting histoire ${id} for user ${userId}`);
        await this.histoiresService.remove(id, userId);
        return { message: 'Histoire deleted successfully' };
    }
    async generatePreview(body, files, req) {
        const userId = req.user.userId;
        this.logger.log(`[CONTROLLER] 📸 Generating preview for user ${userId}`);
        this.logger.log(`[CONTROLLER] 📝 Request body:`, JSON.stringify(body, null, 2));
        this.logger.log(`[CONTROLLER] 📁 Uploaded files:`, Object.keys(files || {}));
        if (!body.templateId) {
            throw new common_1.BadRequestException('Template ID is required');
        }
        if (!body.variables) {
            throw new common_1.BadRequestException('Variables object is required');
        }
        const uploadedImageUrls = [];
        const imageVariableMapping = {};
        const fileProcessingErrors = [];
        if (files && Object.keys(files).length > 0) {
            this.logger.log(`[CONTROLLER] Processing ${Object.keys(files).length} file fields for preview`);
            for (const [fieldName, fileArray] of Object.entries(files)) {
                try {
                    if (fieldName.startsWith('images_') && fileArray && fileArray.length > 0) {
                        const variableName = fieldName.replace('images_', '');
                        const file = fileArray[0];
                        if (!file || !file.path) {
                            const errorMsg = `Invalid file data for field "${fieldName}"`;
                            this.logger.error(`[CONTROLLER] ${errorMsg}`);
                            fileProcessingErrors.push(errorMsg);
                            continue;
                        }
                        uploadedImageUrls.push(file.path);
                        imageVariableMapping[variableName] = file.path;
                        this.logger.log(`[CONTROLLER] ✅ Mapped preview image variable "${variableName}" to local path "${file.path}"`);
                    }
                }
                catch (error) {
                    const errorMsg = `Error processing file field "${fieldName}": ${error.message}`;
                    this.logger.error(`[CONTROLLER] ${errorMsg}`);
                    fileProcessingErrors.push(errorMsg);
                }
            }
        }
        else {
            this.logger.log(`[CONTROLLER] No image files uploaded for preview`);
        }
        this.logger.log(`[CONTROLLER] 📊 File processing summary: ${uploadedImageUrls.length} files processed, ${fileProcessingErrors.length} errors`);
        let variables;
        try {
            variables = typeof body.variables === 'string' ? JSON.parse(body.variables) : body.variables;
            if (!variables || typeof variables !== 'object') {
                throw new Error('Variables must be a valid object');
            }
            this.logger.log(`[CONTROLLER] ✅ Parsed ${Object.keys(variables).length} variables`);
        }
        catch (error) {
            const errorMsg = `Failed to parse variables: ${error.message}`;
            this.logger.error(`[CONTROLLER] ❌ ${errorMsg}`);
            throw new common_1.BadRequestException(`Variables must be a valid JSON object: ${error.message}`);
        }
        const addedImageVars = [];
        Object.entries(imageVariableMapping).forEach(([variableName, filename]) => {
            variables[variableName] = filename;
            addedImageVars.push(variableName);
            this.logger.log(`[CONTROLLER] ✅ Added preview image variable "${variableName}" with filename "${filename}"`);
        });
        this.logger.log(`[CONTROLLER] 📸 Added ${addedImageVars.length} image variables to the variables object`);
        const previewDto = {
            templateId: body.templateId,
            variables,
        };
        try {
            const result = await this.histoiresService.generatePreview(userId, previewDto, uploadedImageUrls);
            this.logger.log(`[CONTROLLER] ✅ Preview generation successful: ${result.previewUrls?.length || 0} preview URLs generated`);
            this.logger.log(`[CONTROLLER] 📋 Preview URLs:`, result.previewUrls);
            this.logger.log(`[CONTROLLER] 📄 PDF URL:`, result.pdfUrl);
            this.logger.log(`[CONTROLLER] 🆔 Histoire ID:`, result.histoireId);
            return {
                success: true,
                previewUrls: result.previewUrls || [],
                pdfUrl: result.pdfUrl,
                histoireId: result.histoireId,
                processingSummary: {
                    uploadedImages: uploadedImageUrls.length,
                    mappedVariables: addedImageVars,
                    fileErrors: fileProcessingErrors.length > 0 ? fileProcessingErrors : undefined
                }
            };
        }
        catch (error) {
            this.logger.error(`[CONTROLLER] ❌ Preview generation failed: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(`Preview generation failed: ${error.message}`);
        }
    }
    async generatePdf(histoireId, req) {
        const userId = req.user.userId;
        this.logger.log(`Generating final PDF for histoire ${histoireId} by user ${userId}`);
        return this.histoiresService.generatePdf(userId, histoireId);
    }
    async generateHistoire(body, files, req) {
        const userId = req.user.userId;
        this.logger.log(`[CONTROLLER] 🎯 Generating final PDF for template ${body.templateId} by user ${userId}`);
        if (!body.templateId) {
            throw new common_1.BadRequestException('Template ID is required');
        }
        if (!body.variables) {
            throw new common_1.BadRequestException('Variables object is required');
        }
        const uploadedImageUrls = [];
        const imageVariableMapping = {};
        const fileProcessingErrors = [];
        if (files && Object.keys(files).length > 0) {
            this.logger.log(`[CONTROLLER] Processing ${Object.keys(files).length} file fields for generation`);
            for (const [fieldName, fileArray] of Object.entries(files)) {
                try {
                    if (fieldName.startsWith('images_') && fileArray && fileArray.length > 0) {
                        const variableName = fieldName.replace('images_', '');
                        const file = fileArray[0];
                        if (!file || !file.path) {
                            const errorMsg = `Invalid file data for field "${fieldName}"`;
                            this.logger.error(`[CONTROLLER] ${errorMsg}`);
                            fileProcessingErrors.push(errorMsg);
                            continue;
                        }
                        uploadedImageUrls.push(file.path);
                        imageVariableMapping[variableName] = file.path;
                        this.logger.log(`[CONTROLLER] ✅ Mapped generation image variable "${variableName}" to local path "${file.path}"`);
                    }
                }
                catch (error) {
                    const errorMsg = `Error processing file field "${fieldName}": ${error.message}`;
                    this.logger.error(`[CONTROLLER] ${errorMsg}`);
                    fileProcessingErrors.push(errorMsg);
                }
            }
        }
        else {
            this.logger.log(`[CONTROLLER] No image files uploaded for generation`);
        }
        this.logger.log(`[CONTROLLER] 📊 File processing summary: ${uploadedImageUrls.length} files processed, ${fileProcessingErrors.length} errors`);
        let variables;
        try {
            variables = typeof body.variables === 'string' ? JSON.parse(body.variables) : body.variables;
            if (!variables || typeof variables !== 'object') {
                throw new Error('Variables must be a valid object');
            }
            this.logger.log(`[CONTROLLER] ✅ Parsed ${Object.keys(variables).length} variables`);
        }
        catch (error) {
            const errorMsg = `Failed to parse variables: ${error.message}`;
            this.logger.error(`[CONTROLLER] ❌ ${errorMsg}`);
            throw new common_1.BadRequestException(`Variables must be a valid JSON object: ${error.message}`);
        }
        const addedImageVars = [];
        Object.entries(imageVariableMapping).forEach(([variableName, filename]) => {
            variables[variableName] = filename;
            addedImageVars.push(variableName);
            this.logger.log(`[CONTROLLER] ✅ Added generation image variable "${variableName}" with filename "${filename}"`);
        });
        this.logger.log(`[CONTROLLER] 📸 Added ${addedImageVars.length} image variables to the variables object`);
        const generateDto = {
            templateId: body.templateId,
            variables,
        };
        this.logger.log(`[CONTROLLER] 🎯 Calling histoiresService.generateHistoire with:`, {
            userId,
            templateId: generateDto.templateId,
            variablesCount: Object.keys(generateDto.variables).length,
            uploadedImageUrlsCount: uploadedImageUrls.length
        });
        try {
            const result = await this.histoiresService.generateHistoire(userId, generateDto, uploadedImageUrls);
            this.logger.log(`[CONTROLLER] ✅ Histoire generation successful for user ${userId}, histoire ID: ${result._id}`);
            return {
                success: true,
                histoire: result,
                processingSummary: {
                    uploadedImages: uploadedImageUrls.length,
                    mappedVariables: addedImageVars,
                    fileErrors: fileProcessingErrors.length > 0 ? fileProcessingErrors : undefined
                }
            };
        }
        catch (error) {
            this.logger.error(`[CONTROLLER] ❌ Histoire generation failed for user ${userId}: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(`Histoire generation failed: ${error.message}`);
        }
    }
    async getTemplateVariables(templateId) {
        this.logger.log(`Getting variables for template ${templateId}`);
        const template = await this.templatesService.findOne(templateId);
        const defaultValues = {
            nom: 'Alex',
            âge: '5',
            date: '2025-10-30',
            image: '/assets/avatar.png',
        };
        return {
            variables: template.variables,
            defaultValues,
        };
    }
};
exports.HistoiresController = HistoiresController;
__decorate([
    (0, common_1.Get)('template/:templateId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('templateId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HistoiresController.prototype, "findByTemplate", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HistoiresController.prototype, "findByUser", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], HistoiresController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_histoire_dto_1.CreateHistoireDto, Object]),
    __metadata("design:returntype", Promise)
], HistoiresController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_histoire_dto_1.UpdateHistoireDto, Object]),
    __metadata("design:returntype", Promise)
], HistoiresController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], HistoiresController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('preview'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'images_photo', maxCount: 1 },
        { name: 'images_image', maxCount: 1 },
        { name: 'images_picture', maxCount: 1 },
        { name: 'images_portrait', maxCount: 1 },
        { name: 'images_avatar', maxCount: 1 },
        { name: 'images_personnage', maxCount: 1 },
        { name: 'images_scene', maxCount: 1 },
        { name: 'images_fond', maxCount: 1 },
        { name: 'images_objet', maxCount: 1 },
        { name: 'images_autre', maxCount: 1 }
    ], {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, callback) => {
                const uploadPath = (0, path_1.join)(process.cwd(), 'uploads', 'temp-images');
                try {
                    (0, fs_1.mkdirSync)(uploadPath, { recursive: true });
                    callback(null, uploadPath);
                }
                catch (error) {
                    callback(error, uploadPath);
                }
            },
            filename: (req, file, callback) => {
                const variableName = (file.fieldname || '').replace('images_', '');
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const extension = (0, path_1.extname)(file.originalname);
                callback(null, `${variableName}-${uniqueSuffix}${extension}`);
            },
        }),
        fileFilter: (req, file, callback) => {
            const logger = req.res?.locals?.logger || new common_1.Logger('FileUpload');
            const fileType = file.mimetype || 'unknown';
            if (!fileType.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
                const errorMsg = `Invalid file type: ${fileType}. Only image files (jpg, jpeg, png, gif, webp) are allowed!`;
                logger.error(`[CONTROLLER] File filter rejected: ${errorMsg}`);
                return callback(new common_1.BadRequestException(errorMsg || 'Invalid file type'), false);
            }
            const fileName = file.originalname || 'unknown';
            if (fileName && fileType) {
                logger.log(`[CONTROLLER] File filter accepted: ${fileName} (${fileType})`);
            }
            callback(null, true);
        },
        limits: {
            fileSize: 50 * 1024 * 1024,
            files: 10,
        },
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], HistoiresController.prototype, "generatePreview", null);
__decorate([
    (0, common_1.Post)(':id/generer'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], HistoiresController.prototype, "generatePdf", null);
__decorate([
    (0, common_1.Post)('generate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'images_photo', maxCount: 1 },
        { name: 'images_image', maxCount: 1 },
        { name: 'images_picture', maxCount: 1 },
        { name: 'images_portrait', maxCount: 1 },
        { name: 'images_avatar', maxCount: 1 },
        { name: 'images_personnage', maxCount: 1 },
        { name: 'images_scene', maxCount: 1 },
        { name: 'images_fond', maxCount: 1 },
        { name: 'images_objet', maxCount: 1 },
        { name: 'images_autre', maxCount: 1 }
    ], {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, callback) => {
                const uploadPath = (0, path_1.join)(process.cwd(), 'uploads', 'temp-images');
                try {
                    (0, fs_1.mkdirSync)(uploadPath, { recursive: true });
                    callback(null, uploadPath);
                }
                catch (error) {
                    callback(error, uploadPath);
                }
            },
            filename: (req, file, callback) => {
                const variableName = (file.fieldname || '').replace('images_', '');
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const extension = (0, path_1.extname)(file.originalname);
                callback(null, `${variableName}-${uniqueSuffix}${extension}`);
            },
        }),
        fileFilter: (req, file, callback) => {
            const logger = req.res?.locals?.logger || new common_1.Logger('FileUpload');
            const fileType = file.mimetype || 'unknown';
            if (!fileType.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
                const errorMsg = `Invalid file type: ${fileType}. Only image files are allowed!`;
                logger.error(`[CONTROLLER] File filter rejected: ${errorMsg}`);
                return callback(new common_1.BadRequestException(errorMsg || 'Invalid file type'), false);
            }
            const fileName = file.originalname || 'unknown';
            if (fileName && fileType) {
                logger.log(`[CONTROLLER] File filter accepted: ${fileName} (${fileType})`);
            }
            callback(null, true);
        },
        limits: {
            fileSize: 50 * 1024 * 1024,
            files: 10,
        },
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], HistoiresController.prototype, "generateHistoire", null);
__decorate([
    (0, common_1.Get)('template/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HistoiresController.prototype, "getTemplateVariables", null);
exports.HistoiresController = HistoiresController = HistoiresController_1 = __decorate([
    (0, common_1.Controller)('histoires'),
    __metadata("design:paramtypes", [histoires_service_1.HistoiresService,
        templates_service_1.TemplatesService])
], HistoiresController);
//# sourceMappingURL=histoires.controller.js.map