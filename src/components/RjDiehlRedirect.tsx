import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface RjDiehlRedirectProps {
    children: React.ReactNode;
}

// ID do usuário RJ DIEHL específico
const RJ_DIEHL_USER_ID = 'b3e2bb3f-d920-444c-87ea-dfbdcb144413';

export function RjDiehlRedirect({ children }: RjDiehlRedirectProps) {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.id === RJ_DIEHL_USER_ID) {
            // Usuário RJ DIEHL deve ir direto para o dashboard específico
            navigate('/rj-diehl', { replace: true });
        }
    }, [user, navigate]);

    // Se for o usuário RJ DIEHL, não renderiza nada (está sendo redirecionado)
    if (user?.id === RJ_DIEHL_USER_ID) {
        return null;
    }

    return <>{children}</>;
}
