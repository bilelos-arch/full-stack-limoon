import { Model } from 'mongoose';
import { EditorElement } from './editor-element.schema';
import { Template } from './template.schema';
export declare class CoordinateMigrationService {
    private editorElementModel;
    private templateModel;
    constructor(editorElementModel: Model<EditorElement>, templateModel: Model<Template>);
    migrateAllCoordinates(): Promise<{
        migrated: number;
        errors: number;
    }>;
    runMigration(): Promise<void>;
}
