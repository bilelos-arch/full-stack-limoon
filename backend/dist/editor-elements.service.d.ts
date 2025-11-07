import { Model } from 'mongoose';
import { EditorElement } from './editor-element.schema';
import { Template } from './template.schema';
export declare class EditorElementsService {
    private editorElementModel;
    private templateModel;
    constructor(editorElementModel: Model<EditorElement>, templateModel: Model<Template>);
    findAllByTemplate(templateId: string): Promise<EditorElement[]>;
    create(templateId: string, elementData: any): Promise<EditorElement>;
    update(templateId: string, elementId: string, elementData: any): Promise<EditorElement>;
    remove(templateId: string, elementId: string): Promise<void>;
    extractVariablesFromElements(templateId: string): Promise<string[]>;
    private updateTemplateVariables;
}
