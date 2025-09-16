/**
 * Utilitários para tratar erros do StellarWalletsKit
 */

interface WalletError {
  message?: string;
  code?: string | number;
  type?: string;
}

/**
 * Verifica se um erro é um cancelamento normal do usuário
 */
export function isUserCancellation(error: any): boolean {
  if (!error) return true; // Sem erro = fechamento normal
  
  const errorMessage = typeof error === 'string' ? error : error?.message || '';
  const normalClosures = [
    'modal closed',
    'user closed',
    'cancelled',
    'user cancelled',
    'dismissed',
    'user dismissed',
    'closed by user',
    'escape pressed',
    'overlay clicked'
  ];
  
  return normalClosures.some(phrase => 
    errorMessage.toLowerCase().includes(phrase)
  );
}

/**
 * Determina se um erro deve ser mostrado ao usuário
 */
export function shouldShowError(error: any): boolean {
  if (!error) return false;
  
  // Não mostrar erros de cancelamento do usuário
  if (isUserCancellation(error)) return false;
  
  // Não mostrar erros de desenvolvimento/hot reload
  const devErrors = [
    'hot reload',
    'fast refresh',
    'already defined',
    'custom element',
    'development mode'
  ];
  
  const errorMessage = typeof error === 'string' ? error : error?.message || '';
  
  return !devErrors.some(phrase => 
    errorMessage.toLowerCase().includes(phrase)
  );
}

/**
 * Formata uma mensagem de erro amigável para o usuário
 */
export function formatErrorMessage(error: any): string {
  if (!error || isUserCancellation(error)) {
    return '';
  }
  
  const errorMessage = typeof error === 'string' ? error : error?.message || '';
  
  // Mapear erros comuns para mensagens amigáveis
  const errorMappings: Record<string, string> = {
    'network': 'Erro de conexão. Verifique sua internet.',
    'timeout': 'Tempo limite excedido. Tente novamente.',
    'not found': 'Carteira não encontrada. Instale uma carteira Stellar.',
    'permission': 'Permissão negada. Autorize o acesso à carteira.',
    'invalid': 'Dados inválidos. Verifique as informações.',
    'connection': 'Erro de conexão com a carteira.',
    'rejected': 'Transação rejeitada pelo usuário.',
  };
  
  for (const [key, message] of Object.entries(errorMappings)) {
    if (errorMessage.toLowerCase().includes(key)) {
      return message;
    }
  }
  
  // Erro genérico se não conseguir mapear
  return 'Erro inesperado. Tente novamente.';
}

/**
 * Log de erro apenas em desenvolvimento
 */
export function devLog(message: string, error?: any): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Wallet Debug] ${message}`, error || '');
  }
}

/**
 * Log de erro para produção (pode ser enviado para serviço de monitoring)
 */
export function prodLog(message: string, error?: any): void {
  if (process.env.NODE_ENV === 'production') {
    // Em produção, você pode enviar para um serviço como Sentry, LogRocket, etc.
    console.error(`[Wallet Error] ${message}`, error);
  } else {
    console.error(`[Wallet Error] ${message}`, error);
  }
}
