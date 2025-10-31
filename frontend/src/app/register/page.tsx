import { AuthLayout } from '@/components/AuthLayout';
import { AuthForm } from '@/components/AuthForm';

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Inscription"
      subtitle="Créez votre compte"
    >
      <AuthForm isRegister />
    </AuthLayout>
  );
}