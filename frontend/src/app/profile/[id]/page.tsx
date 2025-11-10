'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Settings,
  BookOpen,
  ShoppingCart,
  Edit,
  Download,
  Trash2,
  Eye,
  Star,
  Heart,
  Sparkles
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface UserProfile {
  _id: string
  fullName: string
  email: string
  phone?: string
  avatarUrl?: string
  birthDate?: string
  country?: string
  city?: string
  settings: {
    language: string
    theme: string
    notifications: boolean
  }
  storyHistory: {
    id: string
    title: string
    createdAt: string
    category: string
    language: string
    link: string
  }[]
  purchaseHistory: {
    id: string
    productName: string
    price: number
    date: string
    paymentMethod: string
    status: string
    invoiceUrl: string
  }[]
  role: 'admin' | 'user'
  status: 'active' | 'inactive' | 'suspended'
  createdAt: string
  updatedAt: string
  lastLogin?: string
}

export default function ProfilePage() {
  const { id } = useParams()
  const { user, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    birthDate: '',
    country: '',
    city: '',
    language: 'fr',
    theme: 'light',
    notifications: true
  })

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchProfile()
    }
  }, [isAuthenticated, id])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/users/profile/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setEditForm({
          fullName: data.fullName || '',
          email: data.email || '',
          phone: data.phone || '',
          birthDate: data.birthDate ? new Date(data.birthDate).toISOString().split('T')[0] : '',
          country: data.country || '',
          city: data.city || '',
          language: data.settings?.language || 'fr',
          theme: data.settings?.theme || 'light',
          notifications: data.settings?.notifications ?? true
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch(`/api/users/profile/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          fullName: editForm.fullName,
          email: editForm.email,
          phone: editForm.phone,
          birthDate: editForm.birthDate ? new Date(editForm.birthDate) : undefined,
          country: editForm.country,
          city: editForm.city,
          settings: {
            language: editForm.language,
            theme: editForm.theme,
            notifications: editForm.notifications
          }
        })
      })

      if (response.ok) {
        await fetchProfile()
        setEditing(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      suspended: 'bg-red-100 text-red-800 border-red-200'
    }
    return variants[status as keyof typeof variants] || variants.active
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-4xl"
        >
          ✨
        </motion.div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profil non trouvé</h1>
          <p className="text-gray-600">Veuillez vous connecter pour accéder à votre profil.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/80 backdrop-blur-sm border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
              <p className="text-gray-600 mt-1">Gérez vos informations personnelles et consultez votre historique</p>
            </div>
            <Badge className={`px-3 py-1 ${getStatusBadge(profile.status)}`}>
              {profile.status === 'active' ? 'Actif' :
               profile.status === 'inactive' ? 'Inactif' : 'Suspendu'}
            </Badge>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="personal" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-sm">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Informations personnelles
            </TabsTrigger>
            <TabsTrigger value="stories" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Mes histoires ({profile.storyHistory?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="purchases" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Mes achats ({profile.purchaseHistory?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Personal Info Tab */}
          <TabsContent value="personal" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-[#FF7B54]" />
                    Informations personnelles
                  </CardTitle>
                  <Dialog open={editing} onOpenChange={setEditing}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="border-[#3E7BFA] text-[#3E7BFA] hover:bg-[#3E7BFA] hover:text-white">
                        <Edit className="w-4 h-4 mr-2" />
                        Modifier
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Modifier mon profil</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="fullName" className="text-right">
                            Nom complet
                          </Label>
                          <Input
                            id="fullName"
                            value={editForm.fullName}
                            onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="email" className="text-right">
                            Email
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="phone" className="text-right">
                            Téléphone
                          </Label>
                          <Input
                            id="phone"
                            value={editForm.phone}
                            onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="birthDate" className="text-right">
                            Date de naissance
                          </Label>
                          <Input
                            id="birthDate"
                            type="date"
                            value={editForm.birthDate}
                            onChange={(e) => setEditForm({...editForm, birthDate: e.target.value})}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="country" className="text-right">
                            Pays
                          </Label>
                          <Input
                            id="country"
                            value={editForm.country}
                            onChange={(e) => setEditForm({...editForm, country: e.target.value})}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="city" className="text-right">
                            Ville
                          </Label>
                          <Input
                            id="city"
                            value={editForm.city}
                            onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setEditing(false)}>
                          Annuler
                        </Button>
                        <Button onClick={handleUpdateProfile} className="bg-[#FF7B54] hover:bg-[#E86945]">
                          Sauvegarder
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#FF7B54] to-[#3E7BFA] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {profile.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{profile.fullName}</h2>
                      <p className="text-gray-600 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {profile.email}
                      </p>
                      <p className="text-gray-600 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Membre depuis {formatDate(profile.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-[#00B894]" />
                        <div>
                          <p className="text-sm text-gray-500">Téléphone</p>
                          <p className="font-medium">{profile.phone || 'Non renseigné'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-[#FF7B54]" />
                        <div>
                          <p className="text-sm text-gray-500">Localisation</p>
                          <p className="font-medium">
                            {profile.city && profile.country ? `${profile.city}, ${profile.country}` : 'Non renseignée'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Settings className="w-5 h-5 text-[#3E7BFA]" />
                        <div>
                          <p className="text-sm text-gray-500">Préférences</p>
                          <p className="font-medium">
                            Langue: {profile.settings?.language === 'fr' ? 'Français' : 'English'} •
                            Thème: {profile.settings?.theme === 'light' ? 'Clair' : 'Sombre'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-[#FFD93D]" />
                        <div>
                          <p className="text-sm text-gray-500">Statut</p>
                          <p className="font-medium capitalize">{profile.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Stories History Tab */}
          <TabsContent value="stories" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Mes histoires</h2>
                <Badge className="bg-[#00B894]/10 text-[#00B894] border-[#00B894]/20">
                  {profile.storyHistory?.length || 0} histoires
                </Badge>
              </div>

              {profile.storyHistory && profile.storyHistory.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profile.storyHistory.map((story, index) => (
                    <motion.div
                      key={story.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#FF7B54] to-[#3E7BFA] rounded-lg flex items-center justify-center text-white text-xl">
                              📚
                            </div>
                            <Badge className="bg-[#FFD93D]/20 text-gray-800 border-[#FFD93D]/30">
                              {story.category}
                            </Badge>
                          </div>
                          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{story.title}</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Créée le {formatDate(story.createdAt)}
                          </p>
                          <div className="flex gap-2">
                            <Button size="sm" className="flex-1 bg-[#3E7BFA] hover:bg-[#2E5BDA]">
                              <Eye className="w-4 h-4 mr-1" />
                              Lire
                            </Button>
                            <Button size="sm" variant="outline" className="border-[#00B894] text-[#00B894] hover:bg-[#00B894] hover:text-white">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune histoire trouvée</h3>
                    <p className="text-gray-600 mb-6">Vous n'avez pas encore créé d'histoires personnalisées.</p>
                    <Button className="bg-[#FF7B54] hover:bg-[#E86945]">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Créer ma première histoire
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </TabsContent>

          {/* Purchase History Tab */}
          <TabsContent value="purchases" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Mes achats</h2>
                <Badge className="bg-[#FF7B54]/10 text-[#FF7B54] border-[#FF7B54]/20">
                  {profile.purchaseHistory?.length || 0} achats
                </Badge>
              </div>

              {profile.purchaseHistory && profile.purchaseHistory.length > 0 ? (
                <div className="space-y-4">
                  {profile.purchaseHistory.map((purchase, index) => (
                    <motion.div
                      key={purchase.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-[#00B894] to-[#FF7B54] rounded-lg flex items-center justify-center text-white text-xl">
                                📦
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900">{purchase.productName}</h3>
                                <p className="text-sm text-gray-600">
                                  {formatDate(purchase.date)} • {purchase.paymentMethod}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="font-bold text-gray-900">{purchase.price}€</p>
                                <Badge className={`${
                                  purchase.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                                  purchase.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                  'bg-red-100 text-red-800 border-red-200'
                                }`}>
                                  {purchase.status === 'completed' ? 'Terminé' :
                                   purchase.status === 'pending' ? 'En cours' : 'Échec'}
                                </Badge>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-[#3E7BFA] text-[#3E7BFA] hover:bg-[#3E7BFA] hover:text-white"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Facture
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun achat trouvé</h3>
                    <p className="text-gray-600 mb-6">Vous n'avez pas encore effectué d'achats.</p>
                    <Button className="bg-[#FF7B54] hover:bg-[#E86945]">
                      <Heart className="w-4 h-4 mr-2" />
                      Découvrir nos histoires
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}