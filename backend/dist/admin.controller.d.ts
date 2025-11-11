import { HistoiresService } from './histoires/histoires.service';
import { UsersService } from './users.service';
import { TemplatesService } from './templates.service';
import { Model } from 'mongoose';
import { Histoire } from './histoires/schemas/histoire.schema';
import { User } from './user.schema';
import { Template } from './template.schema';
export declare class AdminController {
    private histoiresService;
    private usersService;
    private templatesService;
    private histoireModel;
    private userModel;
    private templateModel;
    constructor(histoiresService: HistoiresService, usersService: UsersService, templatesService: TemplatesService, histoireModel: Model<Histoire>, userModel: Model<User>, templateModel: Model<Template>);
    getStats(): Promise<{
        overview: {
            totalUsers: number;
            totalTemplates: number;
            totalHistoires: number;
            activeUsers: number;
            histoiresLast7Days: number;
            histoiresLast30Days: number;
        };
        users: {
            adminUsers: number;
            regularUsers: number;
            usersByCountry: any[];
        };
        templates: {
            templatesByCategory: any[];
        };
        histoires: {
            histoiresByTemplate: any[];
            histoiresTimeline: any[];
        };
    }>;
}
