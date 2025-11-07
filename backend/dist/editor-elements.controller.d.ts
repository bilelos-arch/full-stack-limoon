import { EditorElementsService } from './editor-elements.service';
import { EditorElement } from './editor-element.schema';
import { CreateElementDto } from './create-element.dto';
import { UpdateElementDto } from './update-element.dto';
export declare class EditorElementsController {
    private readonly editorElementsService;
    constructor(editorElementsService: EditorElementsService);
    findAll(templateId: string): Promise<EditorElement[]>;
    findAllPublic(templateId: string): Promise<EditorElement[]>;
    create(templateId: string, elementData: CreateElementDto): Promise<EditorElement>;
    update(templateId: string, elementId: string, elementData: UpdateElementDto): Promise<EditorElement>;
    remove(templateId: string, elementId: string): Promise<void>;
}
