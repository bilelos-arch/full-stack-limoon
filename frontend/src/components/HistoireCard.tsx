'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Calendar,
  Download,
  Edit,
  Eye,
  MoreHorizontal,
  Share,
  Trash2,
  Heart,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Histoire } from '@/lib/histoireApi';
import { Template } from '@/lib/templatesApi';

interface HistoireCardProps {
  histoire: Histoire;
  template?: Template;
  onEdit?: (histoire: Histoire) => void;
  onDelete?: (histoire: Histoire) => void;
  onShare?: (histoire: Histoire) => void;
  onView?: (histoire: Histoire) => void;
  onDownload?: (histoire: Histoire) => void;
  className?: string;
}

export default function HistoireCard({
  histoire,
  template,
  onEdit,
  onDelete,
  onShare,
  onView,
  onDownload,
  className
}: HistoireCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
    } catch {
      return 'Date inconnue';
    }
  };

  const getStatusBadge = () => {
    if (histoire.generatedPdfUrl) {
      return (
        <Badge className="bg-gradient-citron text-primary-foreground border-0 shadow-citron">
          ✨ Terminée
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-gradient-citron-soft text-lemon-800 dark:text-lemon-200 border-lemon-300 dark:border-lemon-700">
        ⏳ En cours
      </Badge>
    );
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="group cursor-pointer overflow-hidden border-2 border-lemon-200 dark:border-lemon-800 shadow-citron hover:shadow-citron-lg transition-all duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:border-lemon-300 dark:hover:border-lemon-700">
        {/* Cover Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-citron-soft">
          {/* Effet de gradient en overlay */}
          <div className="absolute inset-0 bg-gradient-citron opacity-0 group-hover:opacity-30 transition-all duration-300 z-10"></div>
          
          {template?.coverPath ? (
            <img
              src={template.coverPath && template.coverPath.includes('res.cloudinary.com')
                ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/${template.coverPath.split('/').pop()?.split('.')[0]}.png`
                : template.coverPath.startsWith('http')
                ? template.coverPath
                : `${process.env.NEXT_PUBLIC_API_URL}/uploads/${template.coverPath}`}
              alt={template.title}
              className="w-full h-full object-contain transition-all duration-300 group-hover:scale-110 group-hover:brightness-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-citron-soft">
              <div className="text-center text-lemon-700 dark:text-lemon-300">
                <Eye className="h-16 w-16 mx-auto mb-3 opacity-60" />
                <p className="text-sm font-medium">Aucune couverture</p>
              </div>
            </div>
          )}

          {/* Overlay avec actions rapides */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 glass-citron flex items-center justify-center gap-3 z-20"
          >
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onView?.(histoire);
              }}
              className="bg-white/90 hover:bg-white border-white/50 shadow-citron hover:shadow-citron-lg transform hover:scale-110 transition-all duration-200"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onDownload?.(histoire);
              }}
              className="bg-white/90 hover:bg-white border-white/50 shadow-citron hover:shadow-citron-lg transform hover:scale-110 transition-all duration-200"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onShare?.(histoire);
              }}
              className="bg-white/90 hover:bg-white border-white/50 shadow-citron hover:shadow-citron-lg transform hover:scale-110 transition-all duration-200"
            >
              <Share className="h-4 w-4" />
            </Button>
          </motion.div>

          {/* Favorite button */}
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-3 right-3 h-9 w-9 bg-white/90 hover:bg-white backdrop-blur-sm shadow-citron transform hover:scale-110 transition-all duration-200 z-30"
            onClick={handleFavorite}
          >
            <Heart
              className={`h-4 w-4 transition-all duration-200 ${
                isFavorite ? 'fill-red-500 text-red-500 scale-125' : 'text-lemon-600 hover:text-red-400'
              }`}
            />
          </Button>

          {/* Status badge */}
          <div className="absolute top-2 left-2">
            {getStatusBadge()}
          </div>
        </div>

        <CardContent className="p-5">
          {/* Title and Template Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-gradient-citron transition-all duration-300">
              {template?.title || 'Histoire personnalisée'}
            </h3>

            {template && (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="outline" className="text-xs border-lemon-300 text-lemon-700 dark:border-lemon-700 dark:text-lemon-300 bg-gradient-citron-soft">
                  {template.category}
                </Badge>
                <Badge variant="outline" className="text-xs border-lime-300 text-lime-700 dark:border-lime-700 dark:text-lime-300 bg-gradient-citron-soft">
                  {template.ageRange}
                </Badge>
                <Badge variant="outline" className="text-xs border-lemon-300 text-lemon-700 dark:border-lemon-700 dark:text-lemon-300 bg-gradient-citron-soft">
                  {template.language}
                </Badge>
              </div>
            )}
          </div>

          {/* Date and Actions */}
          <div className="flex items-center justify-between mt-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 text-lemon-500" />
              <span className="text-lemon-700 dark:text-lemon-300 font-medium">
                {formatDate(histoire.createdAt)}
              </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-lemon-100 dark:hover:bg-lemon-900 hover:text-lemon-600 transition-all duration-200">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-lemon-200 dark:border-lemon-800 shadow-citron-lg">
                <DropdownMenuItem onClick={() => onView?.(histoire)} className="hover:bg-lemon-100 dark:hover:bg-lemon-900 hover:text-lemon-700 dark:hover:text-lemon-300 transition-all duration-200">
                  <Eye className="h-4 w-4 mr-2 text-lemon-500" />
                  Voir
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(histoire)} className="hover:bg-lime-100 dark:hover:bg-lime-900 hover:text-lime-700 dark:hover:text-lime-300 transition-all duration-200">
                  <Edit className="h-4 w-4 mr-2 text-lime-500" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDownload?.(histoire)} className="hover:bg-lemon-100 dark:hover:bg-lemon-900 hover:text-lemon-700 dark:hover:text-lemon-300 transition-all duration-200">
                  <Download className="h-4 w-4 mr-2 text-lemon-500" />
                  Télécharger
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShare?.(histoire)} className="hover:bg-lime-100 dark:hover:bg-lime-900 hover:text-lime-700 dark:hover:text-lime-300 transition-all duration-200">
                  <Share className="h-4 w-4 mr-2 text-lime-500" />
                  Partager
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-lemon-200 dark:bg-lemon-800" />
                <DropdownMenuItem
                  onClick={() => onDelete?.(histoire)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 transition-all duration-200"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Rating (si disponible) */}
          {template?.rating && (
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(template.rating || 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-lemon-200 dark:text-lemon-700'
                    } transition-colors duration-200`}
                  />
                ))}
              </div>
              <span className="text-sm text-lemon-600 dark:text-lemon-400 font-medium">
                {template.rating.toFixed(1)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}