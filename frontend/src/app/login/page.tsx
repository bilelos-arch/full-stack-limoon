import { AuthLayout } from '@/components/AuthLayout';
import { AuthForm } from '@/components/AuthForm';

export default function LoginPage() {
  return (
    <AuthLayout
      title="Connexion"
      subtitle="Connectez-vous à votre compte"
    >
      <AuthForm />
    </AuthLayout>
  );
}