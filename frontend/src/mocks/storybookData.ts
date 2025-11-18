// Données mock pour les stories Storybook
export const mockUser = {
  _id: 'user_123',
  name: 'Marie Dubois',
  email: 'marie.dubois@email.com',
  role: 'user' as const,
  childAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marie&backgroundColor=b6e3f4,c0aede,d1d4f9&radius=50'
};

export const mockAdminUser = {
  _id: 'admin_456',
  name: 'Admin Limoon',
  email: 'admin@limoon.com',
  role: 'admin' as const,
  childAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=ffd5dc,ffdfbf,b2f7ef&radius=50'
};

export const mockTemplates = [
  {
    _id: 'template_1',
    title: "L'Aventurier des Étoiles",
    category: 'Aventure',
    previewImage: 'https://api.dicebear.com/7.x/shapes/svg?seed=stars&backgroundColor=transparent&size=100'
  },
  {
    _id: 'template_2',
    title: 'Le Royaume des Dragons',
    category: 'Fantasy',
    previewImage: 'https://api.dicebear.com/7.x/shapes/svg?seed=dragon&backgroundColor=transparent&size=100'
  },
  {
    _id: 'template_3',
    title: 'La Magie du Noël',
    category: 'Vacances',
    previewImage: 'https://api.dicebear.com/7.x/shapes/svg?seed=christmas&backgroundColor=transparent&size=100'
  },
  {
    _id: 'template_4',
    title: 'Le Pirate Courageux',
    category: 'Aventure',
    previewImage: 'https://api.dicebear.com/7.x/shapes/svg?seed=pirate&backgroundColor=transparent&size=100'
  },
  {
    _id: 'template_5',
    title: 'La Princesse et le Royaume',
    category: 'Princesse',
    previewImage: 'https://api.dicebear.com/7.x/shapes/svg?seed=princess&backgroundColor=transparent&size=100'
  }
];

export const mockSearchResults = {
  stories: [
    {
      _id: 'story_1',
      title: 'Les Aventures de Timothée',
      category: 'Aventure',
      previewImage: 'https://api.dicebear.com/7.x/shapes/svg?seed=timothy&backgroundColor=transparent&size=100'
    }
  ],
  templates: [
    {
      _id: 'template_1',
      title: "L'Aventurier des Étoiles",
      category: 'Aventure',
      previewImage: 'https://api.dicebear.com/7.x/shapes/svg?seed=stars&backgroundColor=transparent&size=100'
    }
  ],
  users: [
    {
      _id: 'user_123',
      name: 'Marie Dubois',
      email: 'marie.dubois@email.com',
      role: 'user',
      childAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marie&backgroundColor=b6e3f4,c0aede,d1d4f9&radius=50'
    }
  ]
};

export const mockEmptySearchResults = {
  stories: [],
  templates: [],
  users: []
};

// Mock des hooks
export const mockUseAuth = {
  isAuthenticated: true,
  logout: () => console.log('Logout'),
};

export const mockUseAuthLoggedOut = {
  isAuthenticated: false,
  logout: () => console.log('Logout'),
};

export const mockUseTheme = {
  theme: 'light',
  toggleTheme: () => console.log('Toggle theme'),
};

// Mock pour useScrollPosition
export const mockUseScrollPosition = {
  isScrolled: false,
};

// Mock pour le scroll simulé
export const mockScrolledUseScrollPosition = {
  isScrolled: true,
};