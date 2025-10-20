import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface RolaMaisRedirectProps {
  children: React.ReactNode;
}

// ID do usuário RolaMais específico
const ROLA_MAIS_USER_ID = 'bdc06188-645d-4a2d-91cc-a02e44dea18b';

export function RolaMaisRedirect({ children }: RolaMaisRedirectProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id === ROLA_MAIS_USER_ID) {
      // Usuário RolaMais deve ir direto para o dashboard específico
      navigate('/rolamais', { replace: true });
    }
  }, [user, navigate]);

  // Se for o usuário RolaMais, não renderiza nada (está sendo redirecionado)
  if (user?.id === ROLA_MAIS_USER_ID) {
    return null;
  }

  return <>{children}</>;
}
