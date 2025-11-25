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
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
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
      className="h-full"
    >
      <Card
        className="h-full flex flex-col antigravity-card overflow-hidden group border-0"
        role="article"
        aria-labelledby={`template-title-${template._id}`}
        aria-describedby={`template-desc-${template._id}`}
      >
        <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
          <Image
            src={`${API_BASE_URL}/uploads/${template.coverPath}`}
            alt={`Couverture du template d'histoire "${template.title}"`}
            width={450}
            height={300}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Floating Badge */}
          <div className="absolute top-3 right-3">
            <Badge className="bg-white/90 backdrop-blur-sm text-slate-900 shadow-sm hover:bg-white">
              {template.category}
            </Badge>
          </div>
        </div>

        <CardHeader className="pb-3 px-6 pt-6 flex-grow">
          <CardTitle
            id={`template-title-${template._id}`}
            className="text-lg font-semibold text-slate-900 line-clamp-1 group-hover:text-[#0055FF] transition-colors mb-2"
          >
            {template.title}
          </CardTitle>
          <CardDescription
            id={`template-desc-${template._id}`}
            className="text-sm text-slate-500 line-clamp-2 leading-relaxed"
          >
            {template.description}
          </CardDescription>

          <div className="flex gap-2 mt-4">
            <Badge variant="secondary" className="text-xs font-normal bg-slate-100 text-slate-600 hover:bg-slate-200 px-2.5 py-0.5">
              {template.ageRange}
            </Badge>
            <Badge variant="secondary" className="text-xs font-normal bg-slate-100 text-slate-600 hover:bg-slate-200 px-2.5 py-0.5">
              {template.language}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6 pt-2 mt-auto">
          <div className="flex gap-3">
            <Button
              className="flex-1 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm h-10"
              size="sm"
              onClick={() => {
                if (onPreview) onPreview(template);
              }}
            >
              Aperçu
            </Button>
            <Button
              className="flex-1 bg-[#0055FF] hover:bg-[#0044CC] text-white shadow-sm hover:shadow-md border-0 h-10"
              size="sm"
              onClick={() => onCustomize(template)}
            >
              Créer
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}