'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Template } from '@/lib/templatesApi'

interface StoryCardProps {
  template: Template
  onPreview: (template: Template) => void
  onCustomize: (template: Template) => void
}

export function StoryCard({ template, onPreview, onCustomize }: StoryCardProps) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  const router = useRouter()

  // Logs de débogage pour diagnostiquer la navigation
  console.log('StoryCard - template:', template)
  console.log('StoryCard - template._id:', template._id)
  console.log('StoryCard - template._id type:', typeof template._id)
  console.log('StoryCard - template._id is null:', template._id === null)
  console.log('StoryCard - template._id is undefined:', template._id === undefined)
  console.log('StoryCard - template._id is empty string:', template._id === '')
  console.log('StoryCard - template._id matches ObjectId regex:', template._id ? /^[a-f\d]{24}$/i.test(template._id) : false)

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
        className="h-full flex flex-col hover:shadow-lg transition-all duration-300 border-2 hover:border-gray-300 dark:hover:border-gray-600 group bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
        role="article"
        aria-labelledby={`template-title-${template._id}`}
        aria-describedby={`template-desc-${template._id}`}
      >
        <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded-t-xl flex items-center justify-center group-hover:scale-105 transition-all duration-300 overflow-hidden relative">
          {/* Effet de brillance au hover */}
          <div className="absolute inset-0 bg-gradient-citron opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-t-xl"></div>
          
          <Image
            src={`${API_BASE_URL}/uploads/${template.coverPath}`}
            alt={`Couverture du template d'histoire "${template.title}" - ${template.description}`}
            width={450}
            height={300}
            className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-110"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Badge flottant */}
          <div className="absolute top-3 right-3">
            <Badge className="bg-gradient-citron text-white border-0 shadow-sm">
              {template.category}
            </Badge>
          </div>
        </div>
        <CardHeader className="pb-4 px-6 flex-grow">
          <CardTitle
            id={`template-title-${template._id}`}
            className="text-xl group-hover:text-accent-lemon transition-all duration-300 line-clamp-2"
          >
            {template.title}
          </CardTitle>
          <CardDescription
            id={`template-desc-${template._id}`}
            className="text-base line-clamp-3 group-hover:text-foreground transition-colors"
          >
            {template.description}
          </CardDescription>
          <div className="flex gap-2 mt-3">
            <Badge variant="outline" className="text-xs px-2 py-0.5 rounded-md border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300">
              {template.category}
            </Badge>
            <Badge variant="secondary" className="text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-0">
              {template.ageRange}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-6 pb-6 mt-auto">
          <div className="flex flex-col gap-3">
            <Button
              className="flex-1 border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 transition-all duration-300 hover:shadow-sm"
              size="default"
              variant="outline"
              aria-label={`Aperçu de ${template.title}`}
              onClick={() => {
                console.log('Navigation to preview - template._id:', template._id);
                console.log('Template object:', template);
                console.log('Template._id type:', typeof template._id);
                console.log('Template._id is null:', template._id === null);
                console.log('Template._id is undefined:', template._id === undefined);
                console.log('Template._id is empty string:', template._id === '');
                if (template._id) {
                  console.log('Navigating to:', `/book-store/book/${template._id}`);
                  router.push(`/book-store/book/${template._id}`);
                } else {
                  console.error('Template ID is undefined, cannot navigate to preview');
                  console.error('Full template object:', JSON.stringify(template, null, 2));
                }
              }}
            >
              <span className="mr-2">👁️</span>
              Aperçu
            </Button>
            <Button
              className="flex-1 bg-gradient-citron hover:bg-gradient-citron-reverse text-white border-0 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105"
              size="default"
              aria-label={`Personnaliser ${template.title}`}
              onClick={() => onCustomize(template)}
            >
              <span className="mr-2">✨</span>
              Personnaliser
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}