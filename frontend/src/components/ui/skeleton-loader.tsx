import { motion } from 'framer-motion'

// Skeleton loader pour les cartes de témoignages
export const TestimonialCardSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-2xl p-6 shadow-lg border-0"
    >
      {/* Header avec avatar et rating skeleton */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar skeleton */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-purple/20 to-secondary-teal/20 animate-pulse" />
          <div className="flex-1">
            {/* Name skeleton */}
            <div className="h-4 bg-gris-doux/20 rounded mb-2 animate-pulse" />
            {/* Child info skeleton */}
            <div className="h-3 bg-gris-doux/10 rounded mb-1 animate-pulse" />
            <div className="h-3 bg-gris-doux/10 rounded w-2/3 animate-pulse" />
          </div>
        </div>
        {/* Rating stars skeleton */}
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-4 h-4 bg-accent-yellow/20 rounded animate-pulse" />
          ))}
        </div>
      </div>

      {/* Content skeleton */}
      <div className="mb-4 flex-1">
        <div className="flex items-start gap-2 mb-3">
          <div className="w-6 h-6 bg-primary-purple/10 rounded animate-pulse flex-shrink-0 mt-1" />
          <div className="flex-1">
            <div className="h-3 bg-gris-doux/10 rounded mb-2 animate-pulse" />
            <div className="h-3 bg-gris-doux/10 rounded mb-2 animate-pulse" />
            <div className="h-3 bg-gris-doux/10 rounded w-3/4 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Story info skeleton */}
      <div className="border-t border-lavande-pale pt-4 mt-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="h-6 bg-primary-purple/10 rounded animate-pulse" />
          <div className="h-3 bg-gris-doux/10 rounded w-1/2 animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-secondary-teal/20 rounded animate-pulse" />
          <div className="h-3 bg-gris-doux/10 rounded w-2/3 animate-pulse" />
        </div>
      </div>
    </motion.div>
  )
}

// Skeleton loader pour les cartes du WorldCarousel
export const WorldCardSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-w-[300px] lg:min-w-[350px] snap-center"
    >
      <div className="bg-white rounded-3xl overflow-hidden shadow-lg border-0 h-full">
        {/* Image skeleton */}
        <div className="h-48 bg-gradient-to-br from-primary-purple/20 to-secondary-teal/20 animate-pulse relative">
          <div className="absolute top-4 right-4 w-16 h-6 bg-white/20 rounded-full animate-pulse" />
        </div>
        
        {/* Content skeleton */}
        <div className="p-6">
          {/* Title skeleton */}
          <div className="h-8 bg-gris-doux/20 rounded mb-3 animate-pulse" />
          
          {/* Description skeleton */}
          <div className="space-y-2 mb-6">
            <div className="h-4 bg-gris-doux/10 rounded animate-pulse" />
            <div className="h-4 bg-gris-doux/10 rounded animate-pulse" />
            <div className="h-4 bg-gris-doux/10 rounded w-3/4 animate-pulse" />
          </div>
          
          {/* Button skeleton */}
          <div className="h-12 bg-gradient-to-r from-primary-purple/20 to-secondary-teal/20 rounded-2xl animate-pulse" />
        </div>
      </div>
    </motion.div>
  )
}

// Skeleton loader pour le HeroPortal avatar
export const AvatarSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-3 shadow-xl border-4 border-gradient-primary"
    >
      <div className="w-16 h-16 flex items-center justify-center">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-purple/20 to-secondary-teal/20 animate-pulse" />
      </div>
    </motion.div>
  )
}

// Grid de skeleton loaders pour les témoignages
export const TestimonialsGridSkeleton = ({ count = 12 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 auto-rows-fr gap-4 lg:gap-6">
      {Array.from({ length: count }, (_, index) => (
        <TestimonialCardSkeleton key={index} />
      ))}
    </div>
  )
}

// Grid de skeleton loaders pour le carousel
export const WorldCarouselSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="flex gap-8 overflow-hidden">
      {Array.from({ length: count }, (_, index) => (
        <WorldCardSkeleton key={index} />
      ))}
    </div>
  )
}