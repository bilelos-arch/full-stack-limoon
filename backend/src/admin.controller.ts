import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { HistoiresService } from './histoires/histoires.service';
import { UsersService } from './users.service';
import { TemplatesService } from './templates.service';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Histoire } from './histoires/schemas/histoire.schema';
import { User } from './user.schema';
import { Template } from './template.schema';

@Controller('admin')
// Temporairement désactivé pour les tests
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles('admin')
export class AdminController {
  constructor(
    private histoiresService: HistoiresService,
    private usersService: UsersService,
    private templatesService: TemplatesService,
    @InjectModel(Histoire.name) private histoireModel: Model<Histoire>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Template.name) private templateModel: Model<Template>,
  ) {}

  @Get('stats')
  async getStats() {
    console.log('🔍 [AdminController] Début de récupération des statistiques...');

    try {
      // Statistiques générales
      const totalUsers = await this.userModel.countDocuments({ deletedAt: { $exists: false } });
      const totalTemplates = await this.templateModel.countDocuments();
      const totalHistoires = await this.histoireModel.countDocuments();

      console.log('🔍 [AdminController] Comptages de base:', { totalUsers, totalTemplates, totalHistoires });

    // Statistiques des utilisateurs actifs (connectés récemment)
    const activeUsers = await this.userModel.countDocuments({
      deletedAt: { $exists: false },
      lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // 30 jours
    });

    // Statistiques des histoires par période
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const histoiresLast7Days = await this.histoireModel.countDocuments({
      createdAt: { $gte: last7Days }
    });

    const histoiresLast30Days = await this.histoireModel.countDocuments({
      createdAt: { $gte: last30Days }
    });

    // Statistiques des utilisateurs par rôle
    const adminUsers = await this.userModel.countDocuments({
      role: 'admin',
      deletedAt: { $exists: false }
    });

    const regularUsers = await this.userModel.countDocuments({
      role: 'user',
      deletedAt: { $exists: false }
    });

    // Statistiques des templates par catégorie
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

    // Statistiques des histoires par template (top 10)
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

    // Statistiques temporelles - histoires créées par jour (30 derniers jours)
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

    // Statistiques des utilisateurs par pays
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
    } catch (error) {
      console.error('❌ [AdminController] Erreur lors du calcul des statistiques:', error);
      throw error;
    }
  }
}