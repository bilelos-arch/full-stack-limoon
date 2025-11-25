'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AvatarBuilder from './AvatarBuilder';
import HistoireForm from './HistoireForm';

interface StoryCustomizationWizardProps {
    templateId: string;
    userId: string;
    onShowPreview: (variables: Record<string, string>) => void;
}

export default function StoryCustomizationWizard({
    templateId,
    userId,
    onShowPreview
}: StoryCustomizationWizardProps) {
    const [currentStep, setCurrentStep] = useState<'avatar' | 'story-data'>('avatar');
    const [childData, setChildData] = useState<{
        name: string;
        avatarUri: string;
        config: Record<string, any>;
    } | null>(null);

    const handleAvatarComplete = async (name: string, avatarUri: string, config: Record<string, any>) => {
        console.log('👨‍👩‍👧 Wizard: Avatar completed', { name, avatarUri: avatarUri.substring(0, 50) + '...', config });

        // Save to user profile
        try {
            const res = await fetch(`/api/users/profile/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    child: { name, ...config },
                    childAvatar: avatarUri
                }),
            });

            if (!res.ok) {
                console.error('Failed to save avatar to profile:', await res.text());
                alert('Erreur lors de la sauvegarde de l\'avatar');
                return;
            }

            console.log('✅ Wizard: Avatar saved to profile');

            // Store data and move to next step
            setChildData({ name, avatarUri, config });
            setCurrentStep('story-data');
        } catch (error) {
            console.error('Error saving avatar:', error);
            alert('Erreur de connexion lors de la sauvegarde');
        }
    };

    const handleBackToAvatar = () => {
        setCurrentStep('avatar');
    };

    return (
        <div className="w-full">
            {/* Step Indicator - Antigravity Style */}
            <div className="mb-8">
                <div className="flex items-center justify-center gap-4">
                    <div className={`flex items-center gap-2 ${currentStep === 'avatar' ? 'text-[#0055FF]' : 'text-slate-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${currentStep === 'avatar' ? 'bg-[#0055FF] text-white shadow-md shadow-blue-500/20' : 'bg-slate-100'}`}>
                            <User className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium">Avatar</span>
                    </div>

                    <div className="w-12 h-px bg-slate-200" />

                    <div className={`flex items-center gap-2 ${currentStep === 'story-data' ? 'text-[#0055FF]' : 'text-slate-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${currentStep === 'story-data' ? 'bg-[#0055FF] text-white shadow-md shadow-blue-500/20' : 'bg-slate-100'}`}>
                            <FileText className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium">Détails</span>
                    </div>
                </div>
            </div>

            {/* Step Content */}
            <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
            >
                {currentStep === 'avatar' ? (
                    <AvatarBuilder
                        userId={userId}
                        showNameField={true}
                        initialChildName={childData?.name || ''}
                        initialConfig={childData?.config}
                        onComplete={handleAvatarComplete}
                    />
                ) : (
                    <div>
                        {/* Back Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBackToAvatar}
                            className="mb-4"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Modifier l'avatar
                        </Button>

                        {/* Histoire Form with pre-filled data */}
                        <HistoireForm
                            templateId={templateId}
                            onShowPreview={onShowPreview}
                            initialData={{
                                childName: childData?.name || '',
                                avatarUri: childData?.avatarUri || ''
                            }}
                        />
                    </div>
                )}
            </motion.div>
        </div>
    );
}
