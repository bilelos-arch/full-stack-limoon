//backend/src/editor-elements.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EditorElement } from './editor-element.schema';
import { Template } from './template.schema';
import { detectVariables, parseVariablesFromEditorElements } from './utils/variables';

@Injectable()
export class EditorElementsService {
  constructor(
    @InjectModel(EditorElement.name) private editorElementModel: Model<EditorElement>,
    @InjectModel(Template.name) private templateModel: Model<Template>,
  ) {}

  async findAllByTemplate(templateId: string): Promise<EditorElement[]> {
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

    // Transform _id to id for frontend compatibility - PAS DE CONVERSION DE COORDONNÉES
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

  async create(templateId: string, elementData: any): Promise<EditorElement> {
    console.log('=== CREATE ELEMENT ===');
    console.log('Template ID:', templateId);
    console.log('Element data received (RELATIVE COORDINATES):', elementData);

    const template = await this.templateModel.findById(templateId).exec();
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // ⚠️ CORRECTION : UTILISER DIRECTEMENT LES COORDONNÉES RELATIVES DU FRONTEND
    // Pas de conversion nécessaire car le frontend envoie déjà des coordonnées relatives (0-100%)
    console.log('Using direct relative coordinates from frontend:', {
      x: elementData.x, y: elementData.y, width: elementData.width, height: elementData.height
    });

    // Detect variables in textContent if it's a text element
    let variables: string[] = [];
    if (elementData.type === 'text' && elementData.textContent) {
      variables = detectVariables(elementData.textContent);
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

    // Update template variables after creating element
    await this.updateTemplateVariables(templateId);

    // Transform for frontend
    const obj = saved.toObject();
    obj.id = obj._id.toString();
    delete obj._id;
    console.log('Returning transformed element:', obj);
    return obj as any;
  }

  async update(templateId: string, elementId: string, elementData: any): Promise<EditorElement> {
    console.log('=== UPDATE ELEMENT ===');
    console.log('Template ID:', templateId);
    console.log('Element ID:', elementId);
    console.log('Element data received (RELATIVE COORDINATES):', elementData);

    const template = await this.templateModel.findById(templateId).exec();
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // ⚠️ CORRECTION : UTILISER DIRECTEMENT LES COORDONNÉES RELATIVES DU FRONTEND
    // Pas de conversion nécessaire car le frontend envoie déjà des coordonnées relatives (0-100%)
    console.log('Using direct relative coordinates from frontend:', {
      x: elementData.x, y: elementData.y, width: elementData.width, height: elementData.height
    });

    // Detect variables in textContent if it's a text element and textContent is being updated
    let variables: string[] = [];
    if (elementData.type === 'text' && elementData.textContent) {
      variables = detectVariables(elementData.textContent);
      console.log('Detected variables:', variables);
    }

    console.log('Updating element in DB with relative coordinates...');
    const updatedElement = await this.editorElementModel
      .findOneAndUpdate(
        { _id: elementId, templateId },
        { ...elementData, variables, updatedAt: new Date() },
        { new: true }
      )
      .exec();

    if (!updatedElement) {
      throw new NotFoundException('Element not found');
    }
    console.log('Element updated with ID:', updatedElement._id);

    // Update template variables after updating element
    await this.updateTemplateVariables(templateId);

    // Transform for frontend
    const obj = updatedElement.toObject();
    obj.id = obj._id.toString();
    delete obj._id;
    console.log('Returning transformed element:', obj);
    return obj as any;
  }

  async remove(templateId: string, elementId: string): Promise<void> {
    const result = await this.editorElementModel
      .findOneAndDelete({ _id: elementId, templateId })
      .exec();

    if (!result) {
      throw new NotFoundException('Element not found');
    }

    // Update template variables after removing element
    await this.updateTemplateVariables(templateId);
  }

  async extractVariablesFromElements(templateId: string): Promise<string[]> {
    console.log('=== EXTRACT VARIABLES FROM ELEMENTS ===');
    console.log('Template ID:', templateId);

    // Récupérer tous les éléments du template
    const editorElements = await this.editorElementModel.find({ templateId }).exec();
    console.log('Elements found for variable extraction:', editorElements.length);

    // Extraire les variables des éléments
    const variables = parseVariablesFromEditorElements(editorElements);
    console.log('Extracted variables:', variables);

    // Mettre à jour le template avec les variables extraites
    await this.templateModel.findByIdAndUpdate(templateId, { variables }).exec();
    console.log('Updated template variables:', variables);

    return variables;
  }

  private async updateTemplateVariables(templateId: string): Promise<void> {
    const editorElements = await this.editorElementModel.find({ templateId }).exec();
    const variables = parseVariablesFromEditorElements(editorElements);

    await this.templateModel.findByIdAndUpdate(templateId, { variables }).exec();
    console.log('Updated template variables:', variables);
  }
}