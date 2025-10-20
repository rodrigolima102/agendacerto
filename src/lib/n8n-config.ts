// ----------------------------------------------------------------------

/**
 * Configuração do N8N
 * 
 * Para GitHub Pages, as variáveis estão hardcoded.
 * Em desenvolvimento, use as variáveis de ambiente.
 */

export const N8N_CONFIG = {
  // API Key do N8N
  apiKey: process.env.N8N_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZDNmNGVmYi1jMTAwLTQzYzktYjA5My05YWJmOWJhZWEwYWYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYwOTM4MjY4fQ.Jn5LPpRPzK84RgYDc2MMTVH9KO1J_NQ4jb9PJYy3g-c',
  
  // Base URL do N8N
  baseUrl: process.env.N8N_BASE_URL || 'https://rodrigolima102.app.n8n.cloud',
  
  // Headers padrão para requisições
  getHeaders: () => ({
    'Authorization': `Bearer ${N8N_CONFIG.apiKey}`,
    'Content-Type': 'application/json',
  }),
  
  // URL completa para webhooks
  getWebhookUrl: (webhookId: string) => `${N8N_CONFIG.baseUrl}/webhook/${webhookId}`,
  
  // URL para API do N8N
  getApiUrl: (endpoint: string) => `${N8N_CONFIG.baseUrl}/api/v1/${endpoint}`,
} as const;

// ----------------------------------------------------------------------

/**
 * Cliente N8N para fazer requisições
 */
export class N8NClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = N8N_CONFIG.baseUrl;
    this.apiKey = N8N_CONFIG.apiKey;
  }

  /**
   * Faz uma requisição para o N8N
   */
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}/api/v1/${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'X-N8N-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`N8N API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Dispara um webhook do N8N
   */
  async triggerWebhook(webhookId: string, data: any) {
    const url = `${this.baseUrl}/webhook/${webhookId}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`N8N Webhook Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Lista workflows
   */
  async getWorkflows(limit: number = 50) {
    return this.request(`workflows?limit=${limit}`);
  }

  /**
   * Executa um workflow
   */
  async executeWorkflow(workflowId: string, data: any) {
    return this.request(`workflows/${workflowId}/execute`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// ----------------------------------------------------------------------

/**
 * Instância global do cliente N8N
 */
export const n8nClient = new N8NClient();
