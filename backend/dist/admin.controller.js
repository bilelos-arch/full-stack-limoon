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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const histoires_service_1 = require("./histoires/histoires.service");
const users_service_1 = require("./users.service");
const templates_service_1 = require("./templates.service");
const mongoose_1 = require("mongoose");
const mongoose_2 = require("@nestjs/mongoose");
const histoire_schema_1 = require("./histoires/schemas/histoire.schema");
const user_schema_1 = require("./user.schema");
const template_schema_1 = require("./template.schema");
let AdminController = class AdminController {
    constructor(histoiresService, usersService, templatesService, histoireModel, userModel, templateModel) {
        this.histoiresService = histoiresService;
        this.usersService = usersService;
        this.templatesService = templatesService;
        this.histoireModel = histoireModel;
        this.userModel = userModel;
        this.templateModel = templateModel;
    }
    async getStats() {
        console.log('🔍 [AdminController] Début de récupération des statistiques...');
        try {
            const totalUsers = await this.userModel.countDocuments({ deletedAt: { $exists: false } });
            const totalTemplates = await this.templateModel.countDocuments();
            const totalHistoires = await this.histoireModel.countDocuments();
            console.log('🔍 [AdminController] Comptages de base:', { totalUsers, totalTemplates, totalHistoires });
            const activeUsers = await this.userModel.countDocuments({
                deletedAt: { $exists: false },
                lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            });
            const now = new Date();
            const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const histoiresLast7Days = await this.histoireModel.countDocuments({
                createdAt: { $gte: last7Days }
            });
            const histoiresLast30Days = await this.histoireModel.countDocuments({
                createdAt: { $gte: last30Days }
            });
            const adminUsers = await this.userModel.countDocuments({
                role: 'admin',
                deletedAt: { $exists: false }
            });
            const regularUsers = await this.userModel.countDocuments({
                role: 'user',
                deletedAt: { $exists: false }
            });
            const templatesByCategory = await this.templateModel.aggregate([
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { count: -1 }
                }
            ]);
            const histoiresByTemplate = await this.histoireModel.aggregate([
                {
                    $group: {
                        _id: '$templateId',
                        count: { $sum: 1 }
                    }
                },
                {
                    $lookup: {
                        from: 'templates',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'template'
                    }
                },
                {
                    $unwind: '$template'
                },
                {
                    $project: {
                        templateId: '$_id',
                        count: 1,
                        templateTitle: '$template.title'
                    }
                },
                {
                    $sort: { count: -1 }
                },
                {
                    $limit: 10
                }
            ]);
            const histoiresTimeline = await this.histoireModel.aggregate([
                {
                    $match: {
                        createdAt: { $gte: last30Days }
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { '_id': 1 }
                }
            ]);
            const usersByCountry = await this.userModel.aggregate([
                {
                    $match: {
                        deletedAt: { $exists: false },
                        country: { $exists: true, $ne: null }
                    }
                },
                {
                    $group: {
                        _id: '$country',
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { count: -1 }
                },
                {
                    $limit: 10
                }
            ]);
            const result = {
                overview: {
                    totalUsers,
                    totalTemplates,
                    totalHistoires,
                    activeUsers,
                    histoiresLast7Days,
                    histoiresLast30Days
                },
                users: {
                    adminUsers,
                    regularUsers,
                    usersByCountry
                },
                templates: {
                    templatesByCategory
                },
                histoires: {
                    histoiresByTemplate,
                    histoiresTimeline
                }
            };
            console.log('✅ [AdminController] Statistiques calculées:', result);
            return result;
        }
        catch (error) {
            console.error('❌ [AdminController] Erreur lors du calcul des statistiques:', error);
            throw error;
        }
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getStats", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    __param(3, (0, mongoose_2.InjectModel)(histoire_schema_1.Histoire.name)),
    __param(4, (0, mongoose_2.InjectModel)(user_schema_1.User.name)),
    __param(5, (0, mongoose_2.InjectModel)(template_schema_1.Template.name)),
    __metadata("design:paramtypes", [histoires_service_1.HistoiresService,
        users_service_1.UsersService,
        templates_service_1.TemplatesService,
        mongoose_1.Model,
        mongoose_1.Model,
        mongoose_1.Model])
], AdminController);
//# sourceMappingURL=admin.controller.js.map