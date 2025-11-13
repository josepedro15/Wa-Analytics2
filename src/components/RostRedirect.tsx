import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface RostRedirectProps {
  children: React.ReactNode;
}

// ID do usuário Funerária Rost específico
const ROST_USER_ID = 'dfaac2f3-4ae9-410c-a0bf-bd9ba5d7559f';

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

