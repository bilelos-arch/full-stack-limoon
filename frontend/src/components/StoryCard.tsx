'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Template } from '@/lib/templatesApi'

interface StoryCardProps {
  template: Template
  onPreview: (template: Template) => void
  onCustomize: (template: Template) => void
}

export function StoryCard({ template, onPreview, onCustomize }: StoryCardProps) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group"
      role="gridcell"
    >
      <Card
        className="h-full flex flex-col hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20"
        role="article"
        aria-labelledby={`template-title-${template._id}`}
        aria-describedby={`template-desc-${template._id}`}
      >
        <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-xl flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden">
          <Image
            src={`${API_BASE_URL}/uploads/${template.coverPath}`}
            alt={`Couverture du template d'histoire "${template.title}" - ${template.description}`}
            width={450}
            height={300}
            className="w-full h-full object-cover transition-opacity duration-300"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <CardHeader className="pb-4 px-6 flex-grow">
          <CardTitle
            id={`template-title-${template._id}`}
            className="text-xl group-hover:text-primary transition-colors"
          >
            {template.title}
          </CardTitle>
          <CardDescription
            id={`template-desc-${template._id}`}
            className="text-base"
          >
            {template.description}
          </CardDescription>
          <div className="flex gap-2 mt-3">
            <Badge variant="outline" className="text-xs px-2 py-0.5 rounded-md">
              {template.category}
            </Badge>
            <Badge variant="secondary" className="text-xs px-2 py-0.5 rounded-md">
              {template.ageRange}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-6 pb-6 mt-auto">
          <div className="flex gap-3">
            <Button
              className="flex-1"
              size="default"
              variant="outline"
              aria-label={`Aperçu de ${template.title}`}
              onClick={() => onPreview(template)}
            >
              Aperçu
            </Button>
            <Button
              className="flex-1"
              size="default"
              aria-label={`Personnaliser ${template.title}`}
              onClick={() => onCustomize(template)}
            >
              Personnaliser
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}