//full-stack-limoon/frontend/src/app/profil/enfant/[id]/avatar/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import ChildAvatarForm from '@/components/ChildAvatarForm'
import { Skeleton } from '@/components/ui/skeleton'

export default function ChildAvatarPage() {
  const { id } = useParams()
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  if (!id || typeof id !== 'string') {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ID invalide</h1>
          <p className="text-gray-600">L'identifiant de l'utilisateur est requis.</p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/users/profile/${id}`)
        
        if (response.ok) {
          const data = await response.json()
          setUserProfile(data)
        } else {
          throw new Error('Impossible de charger le profil utilisateur')
        }
      } catch (err) {
        console.error('Erreur lors du chargement du profil:', err)
        setError('Erreur lors du chargement du profil utilisateur')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Avatar de l'enfant</h1>
              <p className="text-gray-600 mt-2">Personnalisez l'avatar de votre enfant</p>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-64 w-64 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Avatar de l'enfant</h1>
            <p className="text-gray-600 mt-2">Personnalisez l'avatar de votre enfant</p>
          </div>
          <ChildAvatarForm userId={id} userProfile={userProfile} />
        </div>
      </div>
    </div>
  )
}