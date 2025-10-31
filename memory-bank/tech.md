Technologies utilisées :
- Node.js 18+, TypeScript.
- Backend : NestJS, Mongoose (MongoDB), Passport-JWT, Multer, pdfjs-dist 3.11.174, pdf-lib 1.17.1, canvas 3.2.0.
- Frontend : Next.js 16, React 19, TailwindCSS v4, shadcn/ui, Framer Motion, Zustand, pdfjs-dist 5.4.296, react-rnd, @tanstack/react-query.
- Auth : JWT access (1 h) + refresh token (7 jours) en cookies HTTP-only.
- Storage : fichiers locaux (upload) + URLs sécurisées.
- APIs externes : cartoonification (DeepAI, remove.bg, Replicate).
- DevOps : Docker + docker-compose pour backend, Vercel pour frontend, MongoDB Atlas.
- Testing : Jest for backend, Playwright for E2E frontend.