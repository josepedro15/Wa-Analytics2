import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface RedemacMorelliRedirectProps {
    children: React.ReactNode;
}

// ID do usuário RedemacMorelli específico
const REDEMAC_MORELLI_USER_ID = 'ffc2b652-a320-4ed0-af97-bb61b5c224a7';

export function RedemacMorelliRedirect({ children }: RedemacMorelliRedirectProps) {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.id === REDEMAC_MORELLI_USER_ID) {
            // Usuário RedemacMorelli deve ir direto para o dashboard específico
            navigate('/redemac-morelli', { replace: true });
        }
    }, [user, navigate]);

    // Se for o usuário RedemacMorelli, não renderiza nada (está sendo redirecionado)
    if (user?.id === REDEMAC_MORELLI_USER_ID) {
        return null;
    }

    return <>{children}</>;
}
