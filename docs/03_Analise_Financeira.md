3.1 Visão Geral Financeira
Contexto
Crie uma página de análise financeira completa para uma fazenda de soja de 50.000 hectares. Esta página deve fornecer uma visão holística da saúde financeira da operação, permitindo análise detalhada de receitas, custos, margens e indicadores de performance financeira.
Requisitos Técnicos

React com TypeScript
Bibliotecas: Recharts para gráficos, react-number-format para valores monetários
Integração com API REST para dados financeiros
Export para Excel/PDF
Filtros por período, safra, talhão

Layout Principal
Header da Página

Título: "Análise Financeira - Safra 2024/25"
Breadcrumb: Home > Análise Financeira > Visão Geral
Botões de ação:

Exportar relatório (PDF/Excel)
Compartilhar dashboard
Configurar alertas


Seletores:

Período: Mensal/Trimestral/Safra/Anual
Comparar com: Safra anterior/Orçamento/Média 3 anos



Componentes Principais
1. Cards de KPIs Principais (Linha superior - 6 cards)
Layout: Grid horizontal com 6 cards iguais
Card 1 - Receita Total

Valor principal: R$ 485.2M
Variação: +12.3% vs safra anterior
Sparkline: Evolução mensal
Breakdown: 85% Soja, 15% Milho safrinha

Card 2 - EBITDA

Valor: R$ 142.5M
Margem EBITDA: 29.4%
Indicador visual: Gauge semicircular
Meta: R$ 150M (95% atingido)

Card 3 - Lucro Líquido

Valor: R$ 78.3M
Margem líquida: 16.1%
Variação YoY: +8.7%
Lucro por hectare: R$ 1.566/ha

Card 4 - ROE (Return on Equity)

Percentual: 18.5%
Benchmark setor: 15.2%
Tendência: Arrow up
Gráfico mini: Últimos 5 anos

Card 5 - ROIC

Percentual: 14.2%
WACC: 11.8%
Spread: +2.4 p.p.
Indicador: Positivo (verde)

Card 6 - EVA

Valor: R$ 24.7M
Por hectare: R$ 494/ha
Crescimento: +15.3%
Rank regional: Top 10%

2. Demonstração de Resultados - Gráfico Cascata
Tamanho: 70% da largura, altura 400px
Elementos:

Começando com Receita Bruta
Deduções sequenciais:

(-) Impostos sobre vendas
(-) Custos de produção
(-) Despesas operacionais
(-) Despesas financeiras
(-) Depreciação
(=) EBITDA
(-) Impostos sobre lucro
(=) Lucro líquido


Cores: Verde (positivo), Vermelho (negativo), Azul (totais)
Hover: Valores absolutos e percentuais
Comparação visual com orçamento (linha tracejada)

3. Análise de Custos - Treemap Interativo
Tamanho: 30% da largura
Categorias principais:

Insumos (R$ 95M)

Sementes: R$ 28M
Fertilizantes: R$ 42M
Defensivos: R$ 25M


Operacionais (R$ 68M)

Mão de obra: R$ 22M
Combustível: R$ 18M
Manutenção: R$ 15M
Arrendamentos: R$ 13M


Administrativos (R$ 31M)
Financeiros (R$ 45M)
Logística (R$ 41M)

Interatividade:

Click para drill-down em subcategorias
Hover mostra % do total e valor absoluto
Cores por eficiência (verde = abaixo orçamento)

4. Evolução de Margens - Gráfico de Linhas
Período: Últimos 5 anos
Métricas:

Margem bruta (linha azul)
Margem operacional (linha verde)
Margem EBITDA (linha roxa)
Margem líquida (linha laranja)
Features:
Área sombreada para intervalos de confiança
Marcadores para eventos importantes
Projeção próximos 12 meses (tracejado)
Benchmark do setor (linha cinza)

5. Análise de Custos por Hectare
Tipo: Gráfico de barras horizontais agrupadas
Comparações:

Atual vs Orçamento vs Ano anterior
Categorias:

Sementes/ha
Fertilizantes/ha
Defensivos/ha
Operações/ha
Overhead/ha


Indicadores de eficiência (setas)
Valores absolutos nas barras

6. Dashboard de Indicadores Financeiros
Layout: Grid 2x3 com mini visualizações
Liquidez Corrente

Gauge: 1.45
Meta: >1.3
Tendência: Estável

Capital de Giro

Valor: R$ 124M
Dias de caixa: 87
Necessidade próx. 90 dias

Endividamento

Dívida/Patrimônio: 0.68
Dívida/EBITDA: 2.8x
Rating: A-

Giro do Ativo

Índice: 0.72
Benchmark: 0.65
Evolução: +10%

Ciclo Financeiro

Prazo médio: 147 dias
Redução YoY: -12 dias
Gráfico circular

Ponto de Equilíbrio

Sacas/ha: 42.5
Margem segurança: 28%
Visualização: Termômetro

Funcionalidades Avançadas
Filtros Laterais (Sidebar colapsável)

Por período (date picker range)
Por cultura (Soja/Milho/Total)
Por talhão (multiselect com busca)
Por centro de custo
Comparação com safras anteriores

Ações Contextuais

Drill-down em qualquer métrica
Exportar dados selecionados
Criar alerta para variações
Adicionar anotações
Compartilhar view específica


3.2 Gestão de Dívidas
Contexto
Crie uma página especializada em gestão e monitoramento de dívidas para a fazenda, considerando a complexidade de múltiplas moedas, diferentes linhas de crédito e necessidade de gestão de risco cambial e de taxas de juros.
Layout Principal
Header de Contexto

Título: "Gestão de Dívidas e Financiamentos"
Cards resumo no topo:

Dívida Total: R$ 287.5M
Exposição USD: 42% (US$ 24.2M)
Taxa Média Ponderada: 9.7% a.a.
DSCR: 1.48x
Próximo vencimento: R$ 12.5M em 15 dias



Componentes Principais
1. Composição do Portfolio de Dívidas - Donut Chart Interativo
Tamanho: 40% largura
Visualizações:
Por Moeda

BRL: R$ 166.8M (58%)
USD: R$ 120.7M (42%)
Hover: Taxa de câmbio atual e impacto

Por Tipo de Taxa

CDI: 35%
Pré-fixada: 28%
TJLP: 15%
Libor: 12%
IPCA+: 10%

Por Instituição

Banco do Brasil: 30%
Rabobank: 25%
John Deere Financial: 15%
BNDES: 12%
Outros: 18%

Por Finalidade

Custeio: 45%
Investimento: 30%
Capital de giro: 15%
Comercialização: 10%

2. Perfil de Vencimento - Stacked Area Chart
Período: Próximos 10 anos
Eixo X: Trimestres
Eixo Y: Valores em R$ milhões
Camadas:

Principal em BRL
Principal em USD (convertido)
Juros projetados
Features:
Linha de capacidade de pagamento
Marcadores de safras
Tooltip com detalhamento
Opção de visualizar em USD

3. Tabela Detalhada de Contratos
Colunas:

Instituição/Contrato
Valor Original
Saldo Devedor
Moeda
Taxa (tipo e valor)
Vencimento
DSCR Individual
Status (Normal/Atenção/Vencido)
Ações

Features:

Ordenação por qualquer coluna
Filtros inline
Expansão para ver histórico de pagamentos
Exportação selecionada
Agrupamento por tipo/instituição

Ações por linha:

Ver contrato completo
Simular pré-pagamento
Renegociar
Histórico de pagamentos

4. Análise de Sensibilidade a Taxas - Heatmap
Layout: Matriz de sensibilidade
Eixo X: Variação Selic (-2% a +4%)
Eixo Y: Variação câmbio (-20% a +30%)
Células: Impacto no serviço da dívida anual
Cores:

Verde: Redução de custo
Amarelo: Neutro
Vermelho: Aumento significativo
Indicadores:
Cenário atual (marcado)
Cenário estressado
Melhor/pior caso

5. Dashboard de Monitoramento de Covenants
Grid de cards mostrando compliance:
DSCR (Debt Service Coverage Ratio)

Atual: 1.48x
Mínimo contratual: 1.25x
Margem: 18.4%
Tendência: Gráfico sparkline

Dívida/EBITDA

Atual: 2.02x
Máximo: 3.0x
Status: ✓ Conforme
Projeção: 1.85x em 12M

Liquidez Corrente

Atual: 1.45
Mínimo: 1.2
Folga: R$ 45M
Alerta: Nenhum

Garantias

Penhor safra: 85% comprometido
Hipoteca: R$ 180M (35% patrimônio)
CPR vinculada: R$ 67M
Margem disponível: R$ 89M

6. Simulador de Cenários e Reestruturação
Interface interativa com sliders:
Variáveis ajustáveis:

Taxa Selic (atual: 13.25%)
USD/BRL (atual: 5.42)
Spread bancário
Prazo médio
% pré-pagamento

Resultados em tempo real:

Novo serviço da dívida
Economia/custo adicional
Impacto no fluxo de caixa
DSCR projetado
Payback da operação

7. Gestão de Risco Cambial
Gráfico combinado:

Barras: Exposição por mês (próx. 24 meses)
Linha: Hedge contratado
Área: Exposição líquida
Marcadores: Vencimentos importantes

Métricas laterais:

Exposição total: US$ 24.2M
Hedge atual: US$ 14.5M (60%)
Exposição líquida: US$ 9.7M
VaR cambial (95%): R$ 4.2M

Funcionalidades Específicas
Alertas Automáticos

Vencimentos próximos (30/15/7 dias)
Quebra de covenants potencial
Oportunidades de mercado
Mudanças significativas em taxas

Relatórios Disponíveis

Posição de endividamento
Fluxo de vencimentos
Análise de risco
Compliance de covenants
Custo all-in do funding


3.3 Fluxo de Caixa
Contexto
Crie uma página de gestão de fluxo de caixa que permita visualização, projeção e otimização do caixa da fazenda, considerando a forte sazonalidade do agronegócio e múltiplas fontes de entrada e saída.
Layout Principal
Dashboard Superior - KPIs de Caixa
6 cards em linha:
Saldo Atual

Valor: R$ 45.7M
Variação dia: +R$ 2.3M
Ícone: Cofre

Projeção 30 dias

Valor: R$ 38.2M
Status: Adequado
Mini gráfico

Dias de Caixa

Valor: 87 dias
Meta: >60 dias
Indicador: Verde

Necessidade Capital Giro

Próx. 90 dias: R$ 125M
Disponível: R$ 95M
Gap: R$ 30M

Recebíveis

Total: R$ 156M
Vencidos: R$ 8.2M
Prazo médio: 22 dias

Pagáveis

Total: R$ 89M
Vencendo 7d: R$ 12M
Prazo médio: 45 dias

Componentes Principais
1. Fluxo de Caixa Projetado - Gráfico de Área Empilhada
Período: 12 meses rolantes
Visualização principal:

Área superior (azul): Entradas

Vendas de soja
Vendas de milho
CPRs
Financiamentos
Outros


Área inferior (vermelho): Saídas

Fornecedores
Folha pagamento
Financiamentos
Impostos
Outros


Linha preta: Saldo acumulado
Linha tracejada: Saldo mínimo desejado

Interatividade:

Hover: Detalhamento do dia
Click: Drill-down para lançamentos
Zoom: Seleção de período
Toggle: Realizado vs Projetado

2. Calendário de Pagamentos e Recebimentos
Tipo: Calendar heatmap
Visualização:

Cada dia do mês como célula
Cor verde: Recebimentos predominantes
Cor vermelha: Pagamentos predominantes
Intensidade: Volume financeiro
Badges: Eventos importantes

Detalhes ao clicar:

Lista de lançamentos do dia
Totais de entrada/saída
Saldo projetado EOD
Opção de editar/adicionar

3. Análise de Capital de Giro
Gráfico combinado:

Barras: Necessidade mensal
Linha 1: Capital disponível
Linha 2: Linha de crédito
Área: Utilização de crédito

Tabela complementar:
MêsNecessidadeDisponívelGap/SobraAção SugeridaJanR$ 125MR$ 95M-R$ 30MAtivar linha créditoFevR$ 180MR$ 120M-R$ 60MCPR complementarMarR$ 145MR$ 200M+R$ 55MAplicar excedente
4. Ciclo de Conversão de Caixa Visual
Diagrama de processo circular:

Compra insumos → Plantio → Crescimento → Colheita → Venda → Recebimento
Dias em cada fase
Valores comprometidos
Indicadores de eficiência

Métricas centrais:

Ciclo total: 147 dias
Redução YoY: -12 dias
Benchmark setor: 165 dias
Potencial melhoria: 15 dias

5. Aging de Recebíveis e Pagáveis
Dois gráficos de barras horizontais espelhados:
Recebíveis (superior):

A vencer 0-30 dias: R$ 78M
A vencer 31-60 dias: R$ 45M
A vencer 61-90 dias: R$ 25M
Vencidos 1-30 dias: R$ 6M
Vencidos >30 dias: R$ 2.2M

Pagáveis (inferior):

Categorias similares
Cores por prioridade
Indicadores de desconto por antecipação

6. Otimizador de Caixa
Painel interativo com recomendações:
Oportunidades identificadas:

Antecipação de recebíveis

Volume disponível: R$ 45M
Taxa: 1.2% a.m.
Resultado: +R$ 44.5M imediato


Negociação de prazos

Fornecedores elegíveis: 12
Potencial extensão: 15 dias
Impacto: +R$ 18M liquidez


Aplicação de excedentes

Período identificado: Mar-Abr
Montante: R$ 35M
Rendimento potencial: R$ 580k



Simulador what-if:

Sliders para ajustar variáveis
Impacto em tempo real no fluxo
Comparação de cenários
Botão "Aplicar otimizações"

7. Painel de Contingência
Dashboard de gestão de crise:
Fontes de liquidez emergencial:

Linha de crédito disponível: R$ 50M
Ativos líquidos: R$ 15M
Recebíveis antecipáveis: R$ 45M
CPR potencial: R$ 80M
Total disponível: R$ 190M

Stress test:

Cenário 1: Queda 30% preço soja
Cenário 2: Atraso 60 dias recebimentos
Cenário 3: Seca severa
Indicador: Meses de sobrevivência

Funcionalidades Avançadas
Integrações Bancárias

Importação OFX/API bancária
Conciliação automática
Saldos em tempo real
Múltiplas contas consolidadas

Machine Learning

Previsão de inadimplência
Otimização de prazos
Detecção de anomalias
Sugestões de timing

Notificações Inteligentes

Saldo abaixo do mínimo
Grandes vencimentos próximos
Oportunidades de otimização
Descasamento de prazos

Relatórios Especializados

DFC gerencial
Demonstrativo de origens e aplicações
Análise de sazonalidade
Relatório de tesouraria
Dashboard executivo de liquidez

Estados e Interações
Modo de Edição

Arrastar e soltar para reprogramar
Edição inline de valores
Criação rápida de lançamentos
Parcelamento automático

Visualizações Alternativas

Visão lista (tipo extrato)
Visão kanban (por status)
Visão timeline (Gantt)
Visão mapa de calor

Filtros Avançados

Por categoria
Por centro de custo
Por projeto/safra
Por status de confirmação
Por fonte pagadora/recebedora
Tentar novamenteO Claude pode cometer erros. Confira sempre as respostas.