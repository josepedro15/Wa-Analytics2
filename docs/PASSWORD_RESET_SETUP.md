# 🔐 Configuração de Redefinição de Senha - MetricsIA

## 📋 Visão Geral

A funcionalidade de redefinição de senha foi implementada para permitir que usuários redefinam suas senhas de forma segura através de email.

## 🚀 Funcionalidades Implementadas

### 1. **Envio de Email de Redefinição**
- Usuário pode solicitar redefinição de senha na aba "Redefinir" da página de login
- Sistema envia email com link seguro para redefinição
- Link expira automaticamente por segurança

### 2. **Página de Redefinição de Senha**
- Interface dedicada para definir nova senha
- Validação de senha (mínimo 6 caracteres)
- Confirmação de senha para evitar erros
- Botão para mostrar/ocultar senha

### 3. **Integração com Supabase Auth**
- Utiliza `resetPasswordForEmail()` para envio de email
- Utiliza `updateUser()` para atualização da senha
- Redirecionamento automático após sucesso

## 🛠️ Arquivos Modificados

### **Hook de Autenticação** (`src/hooks/useAuth.tsx`)
```typescript
// Novas funções adicionadas:
- resetPassword(email: string): Envia email de redefinição
- updatePassword(newPassword: string): Atualiza senha do usuário
```

### **Página de Autenticação** (`src/pages/Auth.tsx`)
- Adicionada aba "Redefinir" com formulário para email
- Função `handleResetPassword()` para processar solicitação
- Interface limpa e intuitiva

### **Nova Página de Redefinição** (`src/pages/ResetPassword.tsx`)
- Página dedicada para definir nova senha
- Validações de segurança
- Feedback visual para o usuário

### **Rotas** (`src/App.tsx`)
- Nova rota `/reset-password` adicionada
- Lazy loading implementado

## 🔧 Configuração do Supabase

### 1. **Configuração de Email**
No painel do Supabase, configure:
- **SMTP Settings**: Para envio de emails
- **Email Templates**: Personalize o template de redefinição
- **Redirect URLs**: Adicione `https://seudominio.com/reset-password`

### 2. **Políticas de Segurança**
```sql
-- Exemplo de política para permitir redefinição
CREATE POLICY "Users can reset their own password" ON auth.users
FOR UPDATE USING (auth.uid() = id);
```

## 📱 Como Usar

### **Para o Usuário:**
1. Acesse a página de login
2. Clique na aba "Redefinir"
3. Digite seu email cadastrado
4. Clique em "Enviar Link de Redefinição"
5. Verifique seu email e clique no link
6. Digite sua nova senha
7. Confirme a senha
8. Clique em "Atualizar Senha"

### **Para o Desenvolvedor:**
```typescript
// Exemplo de uso programático
const { resetPassword, updatePassword } = useAuth();

// Enviar email de redefinição
await resetPassword('usuario@email.com');

// Atualizar senha (após clicar no link do email)
await updatePassword('novaSenha123');
```

## 🔒 Segurança

### **Medidas Implementadas:**
- ✅ Links de redefinição expiram automaticamente
- ✅ Validação de senha (mínimo 6 caracteres)
- ✅ Confirmação de senha obrigatória
- ✅ Feedback visual para erros
- ✅ Redirecionamento seguro após sucesso

### **Recomendações Adicionais:**
- Configure rate limiting para evitar spam
- Use HTTPS em produção
- Monitore tentativas de redefinição
- Considere implementar 2FA

## 🧪 Testes

### **Cenários de Teste:**
1. **Email válido**: Deve enviar email com sucesso
2. **Email inválido**: Deve mostrar erro apropriado
3. **Senhas diferentes**: Deve mostrar erro de confirmação
4. **Senha muito curta**: Deve mostrar erro de validação
5. **Link expirado**: Deve redirecionar para login

### **Comandos de Teste:**
```bash
# Testar em desenvolvimento
npm run dev

# Testar build de produção
npm run build
npm run preview
```

## 🚨 Troubleshooting

### **Problemas Comuns:**

1. **Email não enviado**
   - Verifique configuração SMTP no Supabase
   - Confirme se o email está cadastrado
   - Verifique logs do Supabase

2. **Link não funciona**
   - Verifique se a URL de redirecionamento está configurada
   - Confirme se o link não expirou
   - Verifique se está usando HTTPS

3. **Erro ao atualizar senha**
   - Verifique se o usuário está autenticado
   - Confirme se a senha atende aos critérios
   - Verifique logs do console

## 📈 Próximos Passos

### **Melhorias Futuras:**
- [ ] Implementar 2FA
- [ ] Adicionar histórico de redefinições
- [ ] Personalizar templates de email
- [ ] Implementar rate limiting
- [ ] Adicionar notificações push

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do console
2. Consulte a documentação do Supabase
3. Teste em ambiente de desenvolvimento
4. Verifique configurações de email

---

**✅ Funcionalidade implementada com sucesso!**
