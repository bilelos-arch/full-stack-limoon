'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, User, Sparkles, Download } from 'lucide-react';

const steps = [
    {
        icon: BookOpen,
        title: 'Choisissez',
        description: 'Sélectionnez un univers parmi nos thèmes magiques.',
    },
    {
        icon: User,
        title: 'Personnalisez',
        description: 'Ajoutez le prénom, l\'âge et les détails de votre enfant.',
    },
    {
        icon: Sparkles,
        title: 'Visualisez',
        description: 'Découvrez instantanément un aperçu de l\'histoire.',
    },
    {
        icon: Download,
        title: 'Recevez',
        description: 'Téléchargez le PDF ou commandez le livre imprimé.',
    },
];

export default function ProcessSection() {
    return (
        <section className="py-24 bg-background border-t border-border/50">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <motion.div
                                key={step.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="flex flex-col items-start"
                            >
                                <div className="mb-6 p-4 bg-primary/5 rounded-2xl">
                                    <Icon className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {step.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
