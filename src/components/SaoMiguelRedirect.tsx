import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface SaoMiguelRedirectProps {
  children: React.ReactNode;
}

// ID do usuário São Miguel específico
const SAO_MIGUEL_USER_ID = '1c93324c-65d3-456e-992e-c84e1f7d6ab1';

export function SaoMiguelRedirect({ children }: SaoMiguelRedirectProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id === SAO_MIGUEL_USER_ID) {
      // Usuário São Miguel deve ir direto para o dashboard específico
      navigate('/sao-miguel', { replace: true });
    }
  }, [user, navigate]);

  // Se for o usuário São Miguel, não renderiza nada (está sendo redirecionado)
  if (user?.id === SAO_MIGUEL_USER_ID) {
    return null;
  }

  return <>{children}</>;
}
