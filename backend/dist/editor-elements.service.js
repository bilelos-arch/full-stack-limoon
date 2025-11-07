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
exports.EditorElementsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const editor_element_schema_1 = require("./editor-element.schema");
const template_schema_1 = require("./template.schema");
const variables_1 = require("./utils/variables");
let EditorElementsService = class EditorElementsService {
    constructor(editorElementModel, templateModel) {
        this.editorElementModel = editorElementModel;
        this.templateModel = templateModel;
    }
    async findAllByTemplate(templateId) {
        console.log('=== FIND ALL ELEMENTS ===');
        console.log('Template ID:', templateId);
        const elements = await this.editorElementModel.find({ templateId }).exec();
        console.log('Elements found in DB:', elements.length);
        elements.forEach((el, index) => {
            console.log(`Element ${index}:`, {
                id: el._id,
                type: el.type,
                pageIndex: el.pageIndex,
                x: el.x,
                y: el.y,
                width: el.width,
                height: el.height,
                textContent: el.textContent
            });
        });
        const transformed = elements.map(el => {
            const obj = el.toObject();
            obj.id = obj._id.toString();
            delete obj._id;
            console.log(`Element ${obj.id} coordinates (relative):`, {
                x: obj.x, y: obj.y, width: obj.width, height: obj.height
            });
            return obj;
        });
        console.log('Transformed elements for frontend:', transformed.length);
        return transformed;
    }
    async create(templateId, elementData) {
        console.log('=== CREATE ELEMENT ===');
        console.log('Template ID:', templateId);
        console.log('Element data received (RELATIVE COORDINATES):', elementData);
        const template = await this.templateModel.findById(templateId).exec();
        if (!template) {
            throw new common_1.NotFoundException('Template not found');
        }
        console.log('Using direct relative coordinates from frontend:', {
            x: elementData.x, y: elementData.y, width: elementData.width, height: elementData.height
        });
        let variables = [];
        if (elementData.type === 'text' && elementData.textContent) {
            variables = (0, variables_1.detectVariables)(elementData.textContent);
            console.log('Detected variables:', variables);
        }
        const createdElement = new this.editorElementModel({
            ...elementData,
            templateId,
            variables,
        });
        console.log('Saving element to DB with relative coordinates...');
        const saved = await createdElement.save();
        console.log('Element saved with ID:', saved._id);
        await this.updateTemplateVariables(templateId);
        const obj = saved.toObject();
        obj.id = obj._id.toString();
        delete obj._id;
        console.log('Returning transformed element:', obj);
        return obj;
    }
    async update(templateId, elementId, elementData) {
        console.log('=== UPDATE ELEMENT ===');
        console.log('Template ID:', templateId);
        console.log('Element ID:', elementId);
        console.log('Element data received (RELATIVE COORDINATES):', elementData);
        const template = await this.templateModel.findById(templateId).exec();
        if (!template) {
            throw new common_1.NotFoundException('Template not found');
        }
        console.log('Using direct relative coordinates from frontend:', {
            x: elementData.x, y: elementData.y, width: elementData.width, height: elementData.height
        });
        let variables = [];
        if (elementData.type === 'text' && elementData.textContent) {
            variables = (0, variables_1.detectVariables)(elementData.textContent);
            console.log('Detected variables:', variables);
        }
        console.log('Updating element in DB with relative coordinates...');
        const updatedElement = await this.editorElementModel
            .findOneAndUpdate({ _id: elementId, templateId }, { ...elementData, variables, updatedAt: new Date() }, { new: true })
            .exec();
        if (!updatedElement) {
            throw new common_1.NotFoundException('Element not found');
        }
        console.log('Element updated with ID:', updatedElement._id);
        await this.updateTemplateVariables(templateId);
        const obj = updatedElement.toObject();
        obj.id = obj._id.toString();
        delete obj._id;
        console.log('Returning transformed element:', obj);
        return obj;
    }
    async remove(templateId, elementId) {
        const result = await this.editorElementModel
            .findOneAndDelete({ _id: elementId, templateId })
            .exec();
        if (!result) {
            throw new common_1.NotFoundException('Element not found');
        }
        await this.updateTemplateVariables(templateId);
    }
    async extractVariablesFromElements(templateId) {
        console.log('=== EXTRACT VARIABLES FROM ELEMENTS ===');
        console.log('Template ID:', templateId);
        const editorElements = await this.editorElementModel.find({ templateId }).exec();
        console.log('Elements found for variable extraction:', editorElements.length);
        const variables = (0, variables_1.parseVariablesFromEditorElements)(editorElements);
        console.log('Extracted variables:', variables);
        await this.templateModel.findByIdAndUpdate(templateId, { variables }).exec();
        console.log('Updated template variables:', variables);
        return variables;
    }
    async updateTemplateVariables(templateId) {
        const editorElements = await this.editorElementModel.find({ templateId }).exec();
        const variables = (0, variables_1.parseVariablesFromEditorElements)(editorElements);
        await this.templateModel.findByIdAndUpdate(templateId, { variables }).exec();
        console.log('Updated template variables:', variables);
    }
};
exports.EditorElementsService = EditorElementsService;
exports.EditorElementsService = EditorElementsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(editor_element_schema_1.EditorElement.name)),
    __param(1, (0, mongoose_1.InjectModel)(template_schema_1.Template.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], EditorElementsService);
//# sourceMappingURL=editor-elements.service.js.map