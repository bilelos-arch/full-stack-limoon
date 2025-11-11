'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import {
  Users,
  FileText,
  BookOpen,
  TrendingUp,
  Activity,
  Globe,
  Calendar,
  BarChart3
} from 'lucide-react';

interface StatsData {
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
    usersByCountry: Array<{ _id: string; count: number }>;
  };
  templates: {
    templatesByCategory: Array<{ _id: string; count: number }>;
  };
  histoires: {
    histoiresByTemplate: Array<{ templateId: string; count: number; templateTitle: string }>;
    histoiresTimeline: Array<{ _id: string; count: number }>;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      console.log('🔍 [AdminDashboard] Début de récupération des statistiques...');
      const response = await fetch('/api/admin/stats');
      console.log('🔍 [AdminDashboard] Réponse reçue:', response.status, response.statusText);

      if (!response.ok) {
        console.error('❌ [AdminDashboard] Erreur HTTP:', response.status, response.statusText);
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ [AdminDashboard] Données reçues:', data);
      setStats(data);
    } catch (err) {
      console.error('❌ [AdminDashboard] Erreur lors du fetch:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-2">Erreur de chargement</p>
            <p className="text-sm text-gray-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  // Préparer les données pour les graphiques
  const categoryData = stats.templates.templatesByCategory.map(item => ({
    name: item._id || 'Non catégorisé',
    value: item.count
  }));

  const countryData = stats.users.usersByCountry.map(item => ({
    name: item._id || 'Non spécifié',
    value: item.count
  }));

  const timelineData = stats.histoires.histoiresTimeline.map(item => ({
    date: new Date(item._id).toLocaleDateString('fr-FR'),
    histoires: item.count
  }));

  const templateUsageData = stats.histoires.histoiresByTemplate.slice(0, 10).map(item => ({
    name: item.templateTitle || `Template ${item.templateId.slice(-6)}`,
    count: item.count
  }));

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs totaux</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.overview.activeUsers} actifs (30j)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalTemplates}</div>
            <p className="text-xs text-muted-foreground">
              Disponibles pour création
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Histoires créées</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalHistoires}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.overview.histoiresLast7Days} cette semaine
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'activité</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.overview.totalUsers > 0
                ? Math.round((stats.overview.activeUsers / stats.overview.totalUsers) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Utilisateurs actifs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution temporelle des histoires */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Évolution des histoires (30 derniers jours)
            </CardTitle>
            <CardDescription>
              Nombre d'histoires créées par jour
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="histoires"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition par catégorie de templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Templates par catégorie
            </CardTitle>
            <CardDescription>
              Répartition des templates disponibles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top templates utilisés */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Templates les plus utilisés
            </CardTitle>
            <CardDescription>
              Nombre d'histoires créées par template
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={templateUsageData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition géographique */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Utilisateurs par pays
            </CardTitle>
            <CardDescription>
              Répartition géographique des utilisateurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={countryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Rôles utilisateurs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Administrateurs</span>
              <Badge variant="secondary">{stats.users.adminUsers}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Utilisateurs réguliers</span>
              <Badge variant="secondary">{stats.users.regularUsers}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">7 derniers jours</span>
              <Badge variant="default">{stats.overview.histoiresLast7Days} histoires</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">30 derniers jours</span>
              <Badge variant="default">{stats.overview.histoiresLast30Days} histoires</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ratios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Histoires par utilisateur</span>
              <Badge variant="outline">
                {stats.overview.totalUsers > 0
                  ? (stats.overview.totalHistoires / stats.overview.totalUsers).toFixed(1)
                  : '0'
                }
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Taux d'activité</span>
              <Badge variant="outline">
                {stats.overview.totalUsers > 0
                  ? `${Math.round((stats.overview.activeUsers / stats.overview.totalUsers) * 100)}%`
                  : '0%'
                }
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}