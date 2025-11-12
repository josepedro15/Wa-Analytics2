import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface RostRedirectProps {
  children: React.ReactNode;
}

// ID do usuário Funerária Rost específico
const ROST_USER_ID = '1594e0bd-8f8c-41de-9257-bda0280ea38e';

export function RostRedirect({ children }: RostRedirectProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id === ROST_USER_ID) {
      // Usuário Rost deve ir direto para o dashboard específico
      navigate('/rost', { replace: true });
    }
  }, [user, navigate]);

  // Se for o usuário Rost, não renderiza nada (está sendo redirecionado)
  if (user?.id === ROST_USER_ID) {
    return null;
  }

  return <>{children}</>;
}

