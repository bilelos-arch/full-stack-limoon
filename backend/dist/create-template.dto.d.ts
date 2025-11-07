export declare class CreateTemplateDto {
    title: string;
    description: string;
    category: 'contes-et-aventures-imaginaires' | 'heros-du-quotidien' | 'histoires-avec-des-animaux' | 'histoires-educatives' | 'valeurs-et-developpement-personnel' | 'vie-quotidienne-et-ecole' | 'fetes-et-occasions-speciales' | 'exploration-et-science-fiction' | 'culture-et-traditions' | 'histoires-du-soir';
    gender: 'boy' | 'girl' | 'unisex';
    ageRange: '3 ans - 5 ans' | '6 ans - 8 ans' | '9 ans - 11 ans' | '12 ans - 15 ans';
    language: 'français' | 'anglais' | 'arabe';
    isPublished?: boolean;
}
