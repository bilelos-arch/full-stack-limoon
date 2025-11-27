'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const features = [
    {
        title: 'Immersion Totale',
        subtitle: 'Votre enfant au cœur de l\'aventure.',
        description: 'Grâce à notre technologie, chaque histoire est unique. Le prénom, l\'apparence et les préférences de votre enfant sont intégrés pour une expérience de lecture inoubliable.',
        image: '/images/reading-child.jpg', // Placeholder path
        link: '/le-concept',
        linkText: 'Découvrir le concept',
    },
    {
        title: 'Éducatif & Ludique',
        subtitle: 'Apprendre en s\'amusant.',
        description: 'Nos histoires sont conçues avec des pédagogues pour enrichir le vocabulaire, développer l\'imagination et transmettre des valeurs positives comme le courage et l\'amitié.',
        image: '/images/learning-fun.jpg', // Placeholder path
        link: '/book-store',
        linkText: 'Voir les histoires',
    },
    {
        title: 'Souvenir Unique',
        subtitle: 'Un cadeau pour la vie.',
        description: 'Plus qu\'un livre, c\'est un souvenir précieux que vous créez ensemble. Téléchargez le PDF instantanément ou commandez une version imprimée de haute qualité.',
        image: '/images/precious-gift.jpg', // Placeholder path
        link: '/histoires/creer',
        linkText: 'Commencer maintenant',
    },
];

export default function ValuePropSection() {
    return (
        <section className="py-24 bg-background">
            <div className="container mx-auto px-4">
                {features.map((feature, index) => (
                    <div
                        key={feature.title}
                        className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-24 mb-32 last:mb-0 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                            }`}
                    >
                        {/* Text Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="flex-1"
                        >
                            <span className="text-primary font-semibold tracking-wider uppercase text-sm mb-4 block">
                                {feature.title}
                            </span>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                                {feature.subtitle}
                            </h2>
                            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                                {feature.description}
                            </p>
                            <Link href={feature.link}>
                                <Button variant="link" className="text-lg p-0 h-auto font-semibold group">
                                    {feature.linkText}
                                    <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                        </motion.div>

                        {/* Image/Visual */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="flex-1 w-full"
                        >
                            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-muted">
                                {/* Placeholder for actual image */}
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
                                    <span className="text-muted-foreground/50 text-lg font-medium">
                                        Image: {feature.title}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                ))}
            </div>
        </section>
    );
}
