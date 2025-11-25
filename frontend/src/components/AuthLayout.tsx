import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md antigravity-card border-0 shadow-2xl shadow-slate-200/50">
        <CardHeader className="text-center space-y-3 pb-8 pt-8">
          <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">{title}</CardTitle>
          {subtitle && (
            <p className="text-slate-500 text-base">{subtitle}</p>
          )}
        </CardHeader>
        <CardContent className="px-8 pb-8">
          {children}
        </CardContent>
      </Card>
    </div>
  );
};