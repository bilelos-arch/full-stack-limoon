'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Palette, 
  Sparkles, 
  Users, 
  Clock, 
  Star,
  ArrowRight,
  Zap,
  Heart,
  Globe,
  Shield
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

const features = [
  {
    icon: Palette,
    title: "Création Intuitive",
    description: "Créez des histoires personnalisées avec notre éditeur visuel facile à utiliser",
    color: "text-gray-600"
  },
  {
    icon: Sparkles,
    title: "Templates Uniques",
    description: "Choisissez parmi des centaines de templates professionnels et élégants",
    color: "text-gray-500"
  },
  {
    icon: Users,
    title: "Collaboration",
    description: "Travaillez en équipe et partagez vos créations en toute simplicité",
    color: "text-gray-600"
  },
  {
    icon: Clock,
    title: "Rapide & Efficace",
    description: "Créez vos histoires en quelques minutes grâce à notre interface optimisée",
    color: "text-gray-500"
  }
];

const stats = [
  { number: "10K+", label: "Histoires Créées" },
  { number: "500+", label: "Templates" },
  { number: "50K+", label: "Utilisateurs" },
  { number: "99%", label: "Satisfaction" }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      
      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-citron opacity-5 dark:opacity-10"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-6"
              >
                <Sparkles className="w-4 h-4 mr-2 text-accent-lemon" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nouvelle façon de créer des histoires
                </span>
              </motion.div>
              
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="text-gradient-citron">Créez des histoires</span>
                <br />
                <span className="text-foreground">qui captivent</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                Transformez vos idées en histoires extraordinaires avec Limoon. 
                Notre plateforme intuitive vous permet de créer, personnaliser et partager 
                des histoires uniques en quelques clics.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Button asChild size="lg" className="bg-gradient-citron hover:bg-gradient-citron-reverse text-primary-foreground border-0 shadow-citron">
                  <Link href="/register">
                    Commencer gratuitement
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/story">
                    Découvrir les templates
                  </Link>
                </Button>
              </div>
              
              <div className="flex items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>4.9/5 (2k+ avis)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Sécurisé & privé</span>
                </div>
              </div>
            </motion.div>
            
            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="relative"
            >
              <div className="relative bg-gray-100 dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-inner">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-400 dark:bg-gray-600 rounded animate-pulse" style={{animationDelay: '0.1s'}}></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="h-20 bg-gradient-citron rounded-lg opacity-50"></div>
                  </div>
                </div>
                
                {/* Floating elements */}
                <motion.div
                  animate={{ 
                    y: [-10, 10, -10],
                    rotate: [-5, 5, -5]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute -top-4 -right-4 bg-gradient-citron rounded-xl p-3 shadow-citron"
                >
                  <BookOpen className="w-6 h-6 text-white" />
                </motion.div>
                
                <motion.div
                  animate={{ 
                    y: [10, -10, 10],
                    rotate: [5, -5, 5]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                  className="absolute -bottom-4 -left-4 bg-gradient-citron-reverse rounded-xl p-3 shadow-citron"
                >
                  <Heart className="w-6 h-6 text-white" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-100 dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold text-gradient-citron mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300">
              Fonctionnalités
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Tout ce dont vous avez besoin pour
              <span className="text-gradient-citron"> créer</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Des outils puissants et intuitifs pour donner vie à vos histoires les plus créatives
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-gray-300 dark:hover:border-gray-600 group cursor-pointer">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-citron-soft flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${feature.color}`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-gradient-citron transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center bg-gray-100 dark:bg-gray-800 rounded-3xl p-12 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <Zap className="w-6 h-6 text-accent-lemon" />
              <Badge variant="outline" className="border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300">
                Prêt à commencer ?
              </Badge>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Créez votre première histoire
              <span className="text-gradient-citron"> dès aujourd'hui</span>
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers de créateurs qui utilisent Limoon pour donner vie à leurs idées. 
              C'est gratuit et ça prend moins de 2 minutes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-gradient-citron hover:bg-gradient-citron-reverse text-primary-foreground border-0 shadow-citron">
                <Link href="/register">
                  Commencer maintenant
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">
                  Se connecter
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}