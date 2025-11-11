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
var HistoiresService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoiresService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const histoire_schema_1 = require("./schemas/histoire.schema");
const pdf_generator_service_1 = require("./utils/pdf-generator.service");
const templates_service_1 = require("../templates.service");
const users_service_1 = require("../users.service");
const editor_elements_service_1 = require("../editor-elements.service");
let HistoiresService = HistoiresService_1 = class HistoiresService {
    constructor(histoireModel, pdfGeneratorService, templatesService, usersService, editorElementsService) {
        this.histoireModel = histoireModel;
        this.pdfGeneratorService = pdfGeneratorService;
        this.templatesService = templatesService;
        this.usersService = usersService;
        this.editorElementsService = editorElementsService;
        this.logger = new common_1.Logger(HistoiresService_1.name);
    }
    async findByTemplate(templateId) {
        if (!mongoose_2.Types.ObjectId.isValid(templateId)) {
            throw new common_1.BadRequestException('Invalid template ID');
        }
        return this.histoireModel
            .find({ templateId })
            .populate('templateId')
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .exec();
    }
    async create(userId, createHistoireDto) {
        this.logger.log(`Creating histoire for user ${userId} with template ${createHistoireDto.templateId}`);
        const { templateId, variables } = createHistoireDto;
        try {
            await this.templatesService.findOne(templateId);
        }
        catch (error) {
            this.logger.error(`Template ${templateId} not found: ${error.message}`);
            throw new common_1.BadRequestException('Template not found');
        }
        try {
            const user = await this.usersService.findById(userId);
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
        }
        catch (error) {
            this.logger.error(`User ${userId} not found: ${error.message}`);
            throw new common_1.BadRequestException('User not found');
        }
        if (!variables || typeof variables !== 'object') {
            throw new common_1.BadRequestException('Variables must be a valid object');
        }
        const histoire = new this.histoireModel({
            templateId: new mongoose_2.Types.ObjectId(templateId),
            userId: new mongoose_2.Types.ObjectId(userId),
            variables,
        });
        const savedHistoire = await histoire.save();
        this.logger.log(`Histoire created successfully with ID: ${savedHistoire._id}`);
        return savedHistoire;
    }
    async generatePreview(userId, previewDto, uploadedImageUrls) {
        this.logger.log(`[SERVICE] Generating preview for user ${userId} with template ${previewDto.templateId}`);
        this.logger.log(`[SERVICE] Preview DTO:`, JSON.stringify(previewDto, null, 2));
        this.logger.log(`[SERVICE] Uploaded image URLs:`, uploadedImageUrls);
        const { templateId, variables } = previewDto;
        const validation = await this.pdfGeneratorService.validateVariables(await this.templatesService.findOne(templateId), variables, uploadedImageUrls);
        if (!validation.valid) {
            const errors = [];
            if (validation.missingVariables?.length)
                errors.push(`Missing variables: ${validation.missingVariables.join(', ')}`);
            if (validation.missingImages?.length)
                errors.push(`Missing images: ${validation.missingImages.join(', ')}`);
            if (validation.imageErrors?.length)
                errors.push(`Image errors: ${validation.imageErrors.join(', ')}`);
            throw new common_1.BadRequestException(`Validation failed: ${errors.join('; ')}`);
        }
        const mergedVariables = variables;
        let template;
        try {
            template = await this.templatesService.findOne(templateId);
        }
        catch (error) {
            this.logger.error(`Template ${templateId} not found: ${error.message}`);
            throw new common_1.BadRequestException('Template not found');
        }
        try {
            const user = await this.usersService.findById(userId);
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
        }
        catch (error) {
            this.logger.error(`User ${userId} not found: ${error.message}`);
            throw new common_1.BadRequestException('User not found');
        }
        const previewUrls = await this.pdfGeneratorService.generatePreview(template, mergedVariables, uploadedImageUrls);
        this.logger.log(`[SERVICE] Preview generated successfully: ${previewUrls.length} images`);
        this.logger.log(`[SERVICE] Preview URLs:`, previewUrls);
        const pdfUrl = await this.pdfGeneratorService.generateFinalPdf(template, mergedVariables, uploadedImageUrls);
        this.logger.log(`[SERVICE] PDF preview generated successfully: ${pdfUrl}`);
        const histoire = new this.histoireModel({
            templateId: new mongoose_2.Types.ObjectId(templateId),
            userId: new mongoose_2.Types.ObjectId(userId),
            variables: mergedVariables,
            previewUrls,
            pdfUrl,
        });
        const savedHistoire = await histoire.save();
        this.logger.log(`[SERVICE] Histoire with preview created successfully with ID: ${savedHistoire._id}`);
        this.logger.log(`[SERVICE] Saved histoire preview URLs:`, savedHistoire.previewUrls);
        this.logger.log(`[SERVICE] Saved histoire PDF URL:`, savedHistoire.pdfUrl);
        return { previewUrls, pdfUrl, histoireId: savedHistoire._id.toString() };
    }
    async generatePdf(userId, histoireId) {
        this.logger.log(`Generating final PDF for histoire ${histoireId} by user ${userId}`);
        const histoire = await this.histoireModel.findOne({
            _id: histoireId,
            userId: new mongoose_2.Types.ObjectId(userId),
        });
        if (!histoire) {
            this.logger.warn(`Histoire ${histoireId} not found or access denied for user ${userId}`);
            throw new common_1.NotFoundException('Histoire not found or access denied');
        }
        let template;
        try {
            template = await this.templatesService.findOne(histoire.templateId.toString());
        }
        catch (error) {
            this.logger.error(`Template ${histoire.templateId} not found: ${error.message}`);
            throw new common_1.BadRequestException('Template not found');
        }
        const pdfUrl = await this.pdfGeneratorService.generateFinalPdf(template, histoire.variables);
        histoire.pdfUrl = pdfUrl;
        histoire.generatedPdfUrl = pdfUrl;
        const updatedHistoire = await histoire.save();
        this.logger.log(`Final PDF generated successfully for histoire ${histoireId}: ${pdfUrl}`);
        return updatedHistoire;
    }
    async findOne(id, userId) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid histoire ID');
        }
        const query = { _id: id };
        if (userId) {
            query.userId = new mongoose_2.Types.ObjectId(userId);
        }
        const histoire = await this.histoireModel
            .findOne(query)
            .populate('templateId')
            .populate('userId', 'name email')
            .exec();
        if (!histoire) {
            throw new common_1.NotFoundException('Histoire not found');
        }
        const histoireObj = histoire.toObject();
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        return {
            ...histoireObj,
            previewImage: histoireObj.previewUrls?.[0] || null,
            defaultPdfUrl: histoireObj.pdfUrl || `${baseUrl}/uploads/pdfs/${histoireObj.templateId}-default.pdf`,
        };
    }
    async findByUser(userId) {
        this.logger.log(`Finding histoires for user ${userId}`);
        if (!mongoose_2.Types.ObjectId.isValid(userId)) {
            throw new common_1.BadRequestException('Invalid user ID');
        }
        return this.histoireModel
            .find({ userId: new mongoose_2.Types.ObjectId(userId) })
            .populate('templateId')
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .exec();
    }
    async update(id, userId, updateHistoireDto) {
        this.logger.log(`Updating histoire ${id} for user ${userId}`);
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid histoire ID');
        }
        const histoire = await this.histoireModel.findOne({
            _id: id,
            userId: new mongoose_2.Types.ObjectId(userId),
        });
        if (!histoire) {
            this.logger.warn(`Histoire ${id} not found or access denied for user ${userId}`);
            throw new common_1.NotFoundException('Histoire not found or access denied');
        }
        if (updateHistoireDto.templateId) {
            try {
                await this.templatesService.findOne(updateHistoireDto.templateId);
            }
            catch (error) {
                this.logger.error(`Template ${updateHistoireDto.templateId} not found: ${error.message}`);
                throw new common_1.BadRequestException('Template not found');
            }
        }
        const updatedHistoire = await this.histoireModel
            .findByIdAndUpdate(id, updateHistoireDto, { new: true })
            .populate('templateId')
            .populate('userId', 'name email')
            .exec();
        if (!updatedHistoire) {
            throw new common_1.NotFoundException('Histoire not found');
        }
        this.logger.log(`Histoire ${id} updated successfully`);
        return updatedHistoire;
    }
    async remove(id, userId) {
        this.logger.log(`Deleting histoire ${id} for user ${userId}`);
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid histoire ID');
        }
        const histoire = await this.histoireModel.findOne({
            _id: id,
            userId: new mongoose_2.Types.ObjectId(userId),
        });
        if (!histoire) {
            this.logger.warn(`Histoire ${id} not found or access denied for user ${userId}`);
            throw new common_1.NotFoundException('Histoire not found or access denied');
        }
        if (histoire.previewUrls && histoire.previewUrls.length > 0) {
            const fs = require('fs');
            const path = require('path');
            for (const previewUrl of histoire.previewUrls) {
                const previewPath = path.join('.', previewUrl);
                if (fs.existsSync(previewPath)) {
                    fs.unlinkSync(previewPath);
                    this.logger.log(`Removed preview file: ${previewPath}`);
                }
            }
        }
        if (histoire.pdfUrl) {
            const fs = require('fs');
            const path = require('path');
            const pdfPath = path.join('.', histoire.pdfUrl);
            if (fs.existsSync(pdfPath)) {
                fs.unlinkSync(pdfPath);
                this.logger.log(`Removed PDF file: ${pdfPath}`);
            }
        }
        await this.histoireModel.findByIdAndDelete(id);
        this.logger.log(`Histoire ${id} deleted successfully`);
    }
    async generateHistoire(userId, generateDto, uploadedImageUrls) {
        this.logger.log(`[DEBUG] Starting generateHistoire for user ${userId} with template ${generateDto.templateId}`);
        this.logger.log(`[DEBUG] Raw generateDto: ${JSON.stringify(generateDto, null, 2)}`);
        this.logger.log(`[DEBUG] Uploaded image URLs: ${uploadedImageUrls ? uploadedImageUrls.join(', ') : 'none'}`);
        uploadedImageUrls = uploadedImageUrls || [];
        const { templateId, variables: rawVariables } = generateDto;
        this.logger.log(`[DEBUG] Extracted templateId: ${templateId}`);
        this.logger.log(`[DEBUG] Raw variables type: ${typeof rawVariables}, value: ${JSON.stringify(rawVariables)}`);
        let variables;
        try {
            this.logger.log(`[DEBUG] Parsing variables...`);
            variables = typeof rawVariables === 'string' ? JSON.parse(rawVariables) : rawVariables;
            this.logger.log(`[DEBUG] Variables parsed successfully: ${JSON.stringify(variables)}`);
        }
        catch (error) {
            this.logger.error(`[DEBUG] Failed to parse variables JSON: ${error.message}`);
            this.logger.error(`[DEBUG] Raw variables that failed: ${rawVariables}`);
            throw new common_1.BadRequestException('Variables must be a valid JSON string or object');
        }
        let template;
        try {
            this.logger.log(`[DEBUG] Validating template ${templateId} exists`);
            template = await this.templatesService.findOne(templateId);
            this.logger.log(`[DEBUG] Template ${templateId} found: ${template?.title || 'No title'}`);
            this.logger.log(`[DEBUG] Template object: ${JSON.stringify(template, null, 2)}`);
        }
        catch (error) {
            this.logger.error(`[DEBUG] Template ${templateId} not found: ${error.message}`);
            this.logger.error(`[DEBUG] Template validation error details:`, error);
            throw new common_1.BadRequestException('Template not found');
        }
        try {
            this.logger.log(`[DEBUG] Validating user ${userId} exists`);
            const user = await this.usersService.findById(userId);
            if (!user) {
                this.logger.error(`[DEBUG] User ${userId} not found - returned null/undefined`);
                throw new common_1.NotFoundException('User not found');
            }
            this.logger.log(`[DEBUG] User ${userId} found: ${user.fullName || 'No name'}`);
            this.logger.log(`[DEBUG] User object: ${JSON.stringify(user, null, 2)}`);
        }
        catch (error) {
            this.logger.error(`[DEBUG] User ${userId} not found: ${error.message}`);
            this.logger.error(`[DEBUG] User validation error details:`, error);
            throw new common_1.BadRequestException('User not found');
        }
        this.logger.log('[DEBUG] Raw variables received:', variables);
        this.logger.log('[DEBUG] Variables type:', typeof variables);
        this.logger.log('[DEBUG] Variables constructor:', variables?.constructor?.name);
        this.logger.log('[DEBUG] Variables instanceof Object:', variables instanceof Object);
        this.logger.log('[DEBUG] Variables isArray:', Array.isArray(variables));
        this.logger.log('[DEBUG] Variables keys:', variables ? Object.keys(variables) : 'N/A');
        if (!variables || typeof variables !== 'object' || Array.isArray(variables)) {
            this.logger.error('[DEBUG] Variables validation failed: variables must be a valid object');
            this.logger.error('[DEBUG] Variables value:', variables);
            this.logger.error('[DEBUG] Variables type:', typeof variables);
            this.logger.error('[DEBUG] Variables is null/undefined:', variables == null);
            this.logger.error('[DEBUG] Variables is empty object:', variables && Object.keys(variables).length === 0);
            throw new common_1.BadRequestException('Variables must be a valid object');
        }
        this.logger.log('[DEBUG] Variables received:', JSON.stringify(variables, null, 2));
        try {
            this.logger.log('[DEBUG] Validating required variables against template');
            this.logger.log('[DEBUG] Template for validation:', JSON.stringify(template, null, 2));
            this.logger.log('[DEBUG] Variables for validation:', JSON.stringify(variables, null, 2));
            const validation = await this.pdfGeneratorService.validateVariables(template, variables, uploadedImageUrls);
            this.logger.log('[DEBUG] Validation result:', validation);
            if (!validation.valid) {
                const errors = [];
                if (validation.missingVariables?.length)
                    errors.push(`Missing variables: ${validation.missingVariables.join(', ')}`);
                if (validation.missingImages?.length)
                    errors.push(`Missing images: ${validation.missingImages.join(', ')}`);
                if (validation.imageErrors?.length)
                    errors.push(`Image errors: ${validation.imageErrors.join(', ')}`);
                this.logger.error('[DEBUG] Variable validation failed:', errors.join('; '));
                throw new common_1.BadRequestException(`Validation failed: ${errors.join('; ')}`);
            }
            this.logger.log('[DEBUG] Variable validation passed');
        }
        catch (error) {
            this.logger.error(`[DEBUG] Variable validation error: ${error.message}`);
            this.logger.error(`[DEBUG] Validation error stack:`, error.stack);
            throw error;
        }
        let previewUrls = [];
        try {
            this.logger.log('[DEBUG] Generating preview images');
            this.logger.log('[DEBUG] Template for preview:', template._id || template.id);
            this.logger.log('[DEBUG] Variables for preview:', JSON.stringify(variables, null, 2));
            previewUrls = await this.pdfGeneratorService.generatePreview(template, variables);
            this.logger.log(`[DEBUG] Preview images generated: ${previewUrls.length} images`);
            this.logger.log(`[DEBUG] Preview URLs: ${JSON.stringify(previewUrls)}`);
        }
        catch (error) {
            this.logger.error(`[DEBUG] Preview generation failed: ${error.message}`);
            this.logger.error(`[DEBUG] Preview generation error stack:`, error.stack);
            throw new common_1.BadRequestException('Failed to generate preview images');
        }
        let pdfUrl;
        try {
            this.logger.log('[DEBUG] Generating final PDF');
            this.logger.log('[DEBUG] Template for PDF:', template._id || template.id);
            this.logger.log('[DEBUG] Variables for PDF:', JSON.stringify(variables, null, 2));
            this.logger.log('[DEBUG] Uploaded image URLs for PDF:', uploadedImageUrls);
            pdfUrl = await this.pdfGeneratorService.generateFinalPdf(template, variables, uploadedImageUrls);
            this.logger.log(`[DEBUG] Final PDF generated: ${pdfUrl}`);
        }
        catch (error) {
            this.logger.error(`[DEBUG] PDF generation failed: ${error.message}`);
            this.logger.error(`[DEBUG] PDF generation error stack:`, error.stack);
            throw new common_1.BadRequestException('Failed to generate PDF');
        }
        try {
            this.logger.log('[DEBUG] Creating Histoire record in database');
            this.logger.log('[DEBUG] Histoire data to save:', {
                templateId: templateId,
                userId: userId,
                variables: JSON.stringify(variables, null, 2),
                previewUrls: previewUrls,
                pdfUrl: pdfUrl,
                previewUrlsCount: previewUrls.length
            });
            const histoire = new this.histoireModel({
                templateId: new mongoose_2.Types.ObjectId(templateId),
                userId: new mongoose_2.Types.ObjectId(userId),
                variables,
                previewUrls,
                pdfUrl,
                generatedPdfUrl: pdfUrl,
            });
            this.logger.log('[DEBUG] Histoire model created, attempting to save...');
            const savedHistoire = await histoire.save();
            this.logger.log(`[DEBUG] Histoire generated and saved successfully with ID: ${savedHistoire._id}, PDF: ${pdfUrl}, Previews: ${previewUrls.length}`);
            this.logger.log(`[DEBUG] Saved histoire object:`, JSON.stringify(savedHistoire, null, 2));
            return savedHistoire;
        }
        catch (error) {
            this.logger.error(`[DEBUG] Database save failed: ${error.message}`);
            this.logger.error(`[DEBUG] Database save error stack:`, error.stack);
            this.logger.error(`[DEBUG] Histoire data that failed to save:`, {
                templateId: templateId,
                userId: userId,
                variables: variables,
                previewUrls: previewUrls,
                pdfUrl: pdfUrl
            });
            throw new common_1.BadRequestException('Failed to save histoire to database');
        }
    }
};
exports.HistoiresService = HistoiresService;
exports.HistoiresService = HistoiresService = HistoiresService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(histoire_schema_1.Histoire.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        pdf_generator_service_1.PdfGeneratorService,
        templates_service_1.TemplatesService,
        users_service_1.UsersService,
        editor_elements_service_1.EditorElementsService])
], HistoiresService);
//# sourceMappingURL=histoires.service.js.map