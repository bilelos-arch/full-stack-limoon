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
        <Badge variant="default" className="bg-green-100 text-green-800">
          Terminée
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        En cours
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
      <Card className="group cursor-pointer overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300">
        {/* Cover Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
          {template?.coverPath ? (
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/uploads/${template.coverPath}`}
              alt={template.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucune couverture</p>
              </div>
            </div>
          )}

          {/* Overlay avec actions rapides */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2"
          >
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onView?.(histoire);
              }}
              className="backdrop-blur-sm"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onDownload?.(histoire);
              }}
              className="backdrop-blur-sm"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onShare?.(histoire);
              }}
              className="backdrop-blur-sm"
            >
              <Share className="h-4 w-4" />
            </Button>
          </motion.div>

          {/* Favorite button */}
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 h-8 w-8 bg-white/80 hover:bg-white backdrop-blur-sm"
            onClick={handleFavorite}
          >
            <Heart
              className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
            />
          </Button>

          {/* Status badge */}
          <div className="absolute top-2 left-2">
            {getStatusBadge()}
          </div>
        </div>

        <CardContent className="p-4">
          {/* Title and Template Info */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {template?.title || 'Histoire personnalisée'}
            </h3>

            {template && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {template.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {template.ageRange}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {template.language}
                </Badge>
              </div>
            )}
          </div>

          {/* Date and Actions */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formatDate(histoire.createdAt)}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView?.(histoire)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Voir
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(histoire)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDownload?.(histoire)}>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShare?.(histoire)}>
                  <Share className="h-4 w-4 mr-2" />
                  Partager
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete?.(histoire)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Rating (si disponible) */}
          {template?.rating && (
            <div className="flex items-center gap-1 mt-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-muted-foreground">
                {template.rating.toFixed(1)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}