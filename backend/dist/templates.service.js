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
exports.TemplatesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const template_schema_1 = require("./template.schema");
const editor_element_schema_1 = require("./editor-element.schema");
const variables_1 = require("./utils/variables");
const pdf_generator_service_1 = require("./histoires/utils/pdf-generator.service");
const fs = require("fs");
const path = require("path");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.min.mjs");
pdfjsLib.GlobalWorkerOptions.workerSrc = path.resolve(require.resolve('pdfjs-dist/legacy/build/pdf.worker.min.mjs'));
let TemplatesService = class TemplatesService {
    constructor(templateModel, editorElementModel, pdfGeneratorService) {
        this.templateModel = templateModel;
        this.editorElementModel = editorElementModel;
        this.pdfGeneratorService = pdfGeneratorService;
        this.tempPreviewsDir = './uploads/temp-previews';
        if (!fs.existsSync(this.tempPreviewsDir)) {
            fs.mkdirSync(this.tempPreviewsDir, { recursive: true });
        }
    }
    async create(createTemplateDto, pdfPath, coverPath) {
        console.log('=== TEMPLATES SERVICE CREATE ===');
        console.log('DTO:', createTemplateDto);
        console.log('DTO.ageRange:', createTemplateDto.ageRange);
        console.log('Paths:', { pdfPath, coverPath });
        try {
            const normalizedDto = {
                ...createTemplateDto,
                category: this.normalizeCategory(createTemplateDto.category),
                language: this.normalizeLanguage(createTemplateDto.language),
            };
            console.log('Analyzing PDF...');
            const pdfMetadata = await this.analyzePdf(pdfPath);
            console.log('PDF metadata:', pdfMetadata);
            const editorElements = await this.editorElementModel.find({ templateId: null }).exec();
            const variables = (0, variables_1.parseVariablesFromEditorElements)(editorElements);
            const templateData = {
                ...normalizedDto,
                pdfPath,
                coverPath,
                pageCount: pdfMetadata.pageCount,
                dimensions: pdfMetadata.dimensions,
                variables,
            };
            console.log('Template data to save:', templateData);
            console.log('Template data ageRange:', templateData.ageRange);
            const createdTemplate = new this.templateModel(templateData);
            console.log('Saving template...');
            const result = await createdTemplate.save();
            console.log('Template saved successfully:', result._id);
            return result;
        }
        catch (error) {
            console.error('ERROR in template creation:', error);
            if (fs.existsSync(pdfPath))
                fs.unlinkSync(pdfPath);
            if (fs.existsSync(coverPath))
                fs.unlinkSync(coverPath);
            throw error;
        }
    }
    async findAll(query = {}) {
        const filter = {};
        if (query.category)
            filter.category = query.category;
        if (query.gender)
            filter.gender = query.gender;
        if (query.ageRange)
            filter.ageRange = query.ageRange;
        if (query.isPublished !== undefined)
            filter.isPublished = query.isPublished === 'true';
        if (query.language)
            filter.language = query.language;
        if (query.featured !== undefined)
            filter.isFeatured = query.featured === 'true';
        return this.templateModel.find(filter).sort({ createdAt: -1 }).exec();
    }
    async findOne(id) {
        console.log('findOne called with id:', id);
        console.log('id is valid ObjectId:', mongoose_2.Types.ObjectId.isValid(id));
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            console.log('Throwing BadRequestException for invalid ID');
            throw new common_1.BadRequestException('Invalid template ID');
        }
        const template = await this.templateModel.findById(id).exec();
        console.log('Template found:', !!template);
        if (!template) {
            console.log('Throwing NotFoundException for template not found');
            throw new common_1.NotFoundException('Template not found');
        }
        return template;
    }
    async update(id, updateTemplateDto, files) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid template ID');
        }
        const updateData = { ...updateTemplateDto };
        if (files?.pdf && files.pdf.length > 0) {
            const pdfPath = files.pdf[0].filename;
            updateData.pdfPath = pdfPath;
            const pdfMetadata = await this.analyzePdf(pdfPath);
            updateData.pageCount = pdfMetadata.pageCount;
            updateData.dimensions = pdfMetadata.dimensions;
            const editorElements = await this.editorElementModel.find({ templateId: id }).exec();
            updateData.variables = (0, variables_1.parseVariablesFromEditorElements)(editorElements);
        }
        if (files?.cover && files.cover.length > 0) {
            updateData.coverPath = files.cover[0].filename;
        }
        const updatedTemplate = await this.templateModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .exec();
        if (!updatedTemplate) {
            throw new common_1.NotFoundException('Template not found');
        }
        return updatedTemplate;
    }
    async remove(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid template ID');
        }
        const template = await this.findOne(id);
        if (fs.existsSync(template.pdfPath))
            fs.unlinkSync(template.pdfPath);
        if (fs.existsSync(template.coverPath))
            fs.unlinkSync(template.coverPath);
        await this.templateModel.findByIdAndDelete(id).exec();
    }
    async search(query, limit = 10) {
        if (!query.trim()) {
            return [];
        }
        const searchRegex = new RegExp(query, 'i');
        return this.templateModel
            .find({
            $or: [
                { title: searchRegex },
                { description: searchRegex },
                { category: searchRegex },
            ],
            isPublished: true,
        })
            .limit(limit)
            .sort({ createdAt: -1 })
            .exec();
    }
    async generatePreview(templateId, variables) {
        console.log('=== GENERATE PREVIEW DEBUG ===');
        console.log('Template ID:', templateId);
        console.log('Variables:', variables);
        const template = await this.findOne(templateId);
        console.log('Template found:', template._id, template.title);
        if (!template.isPublished) {
            throw new common_1.BadRequestException('Template is not available for preview');
        }
        console.log('Generating temporary PDF...');
        const tempPdfFilename = await this.pdfGeneratorService.generateFinalPdf(template, variables);
        console.log('Generated PDF filename:', tempPdfFilename);
        const tempPdfPath = path.join('.', tempPdfFilename);
        const finalTempPath = path.join(this.tempPreviewsDir, `preview-${templateId}-${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`);
        console.log('Moving PDF from:', tempPdfPath, 'to:', finalTempPath);
        console.log('Temp PDF exists:', fs.existsSync(tempPdfPath));
        console.log('Temp previews dir exists:', fs.existsSync(this.tempPreviewsDir));
        fs.renameSync(tempPdfPath, finalTempPath);
        console.log('File moved successfully. Final path exists:', fs.existsSync(finalTempPath));
        setTimeout(() => {
            try {
                if (fs.existsSync(finalTempPath)) {
                    fs.unlinkSync(finalTempPath);
                }
            }
            catch (error) {
                console.error('Failed to cleanup temp preview file:', error);
            }
        }, 24 * 60 * 60 * 1000);
        const filename = path.basename(finalTempPath);
        const pdfUrl = `/uploads/temp-previews/${filename}`;
        console.log('Returning PDF URL:', pdfUrl);
        console.log('Full URL should be:', `${process.env.BASE_URL || 'http://localhost:3000'}${pdfUrl}`);
        console.log('File exists at final path:', fs.existsSync(finalTempPath));
        console.log('File size:', fs.existsSync(finalTempPath) ? fs.statSync(finalTempPath).size : 'N/A');
        return {
            pdfUrl
        };
    }
    normalizeCategory(category) {
        const categoryMap = {
            'contes-et-aventures-imaginaires': 'Contes et aventures imaginaires',
            'heros-du-quotidien': 'Héros du quotidien',
            'histoires-avec-des-animaux': 'Histoires avec des animaux',
            'histoires-educatives': 'Histoires éducatives',
            'valeurs-et-developpement-personnel': 'Valeurs et développement personnel',
            'vie-quotidienne-et-ecole': 'Vie quotidienne et école',
            'fetes-et-occasions-speciales': 'Fêtes et occasions spéciales',
            'exploration-et-science-fiction': 'Exploration et science-fiction',
            'culture-et-traditions': 'Culture et traditions',
            'histoires-du-soir': 'Histoires du soir',
        };
        return categoryMap[category] || category;
    }
    normalizeLanguage(language) {
        const languageMap = {
            'français': 'Français',
            'anglais': 'Anglais',
            'arabe': 'Arabe',
        };
        return languageMap[language] || language;
    }
    async analyzePdf(pdfPath) {
        try {
            const fullPath = path.join('./uploads', pdfPath);
            console.log('Analyzing PDF at path:', pdfPath);
            console.log('Full path:', fullPath);
            console.log('File exists:', fs.existsSync(fullPath));
            console.log('File size:', fs.existsSync(fullPath) ? fs.statSync(fullPath).size : 'N/A');
            const data = new Uint8Array(fs.readFileSync(fullPath));
            console.log('PDF data length:', data.length);
            const pdf = await pdfjsLib.getDocument({ data }).promise;
            console.log('PDF loaded successfully, pages:', pdf.numPages);
            const pageCount = pdf.numPages;
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 1.0 });
            const dimensions = {
                width: viewport.width,
                height: viewport.height,
            };
            console.log('PDF analysis complete - Real PDF dimensions:', { pageCount, dimensions });
            return { pageCount, dimensions };
        }
        catch (error) {
            console.error('PDF analysis error details:', error);
            throw new common_1.BadRequestException('Invalid PDF file');
        }
    }
};
exports.TemplatesService = TemplatesService;
exports.TemplatesService = TemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(template_schema_1.Template.name)),
    __param(1, (0, mongoose_1.InjectModel)(editor_element_schema_1.EditorElement.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        pdf_generator_service_1.PdfGeneratorService])
], TemplatesService);
//# sourceMappingURL=templates.service.js.map