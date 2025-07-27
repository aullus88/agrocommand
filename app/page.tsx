import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  Database,
  DollarSign,
  Eye,
  Globe,
  Leaf,
  MapPin,
  Monitor,
  Phone,
  Shield,
  Smartphone,
  Target,
  TrendingUp,
  Truck,
  Users,
  Zap,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function AgroLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image 
              src="/logo.png" 
              alt="Agro Command Logo" 
              width={32} 
              height={32} 
              className="h-8 w-8"
            />
            <span className="text-2xl font-bold text-gray-900">Agro Command</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#solucao" className="text-gray-600 hover:text-green-600 transition-colors">
              Solução
            </Link>
            <Link href="#beneficios" className="text-gray-600 hover:text-green-600 transition-colors">
              Benefícios
            </Link>
            <Link href="#implementacao" className="text-gray-600 hover:text-green-600 transition-colors">
              Implementação
            </Link>
            <Button className="bg-green-600 hover:bg-green-700">Demonstração</Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-6xl">
          <Badge className="mb-6 bg-green-100 text-green-800 hover:bg-green-100">Sistema de Gestão Integrada</Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Transforme dados em decisões estratégicas com o sistema de gestão mais{" "}
            <span className="text-green-600">avançado do agronegócio brasileiro</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            Dashboard integrado que monitora, analisa e otimiza cada hectare da sua operação em tempo real, desenvolvido
            especificamente para fazendas de soja e milho de grande escala
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8 py-4">
              <Calendar className="mr-2 h-5 w-5" />
              Agende uma demonstração personalizada
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 bg-transparent">
              <Phone className="mr-2 h-5 w-5" />
              Falar com especialista
            </Button>
          </div>
        </div>
      </section>

      {/* O Desafio */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Gestão de fazendas de grande porte exige visão completa e decisões precisas
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Em operações de <strong>10.000+ hectares</strong>, a complexidade multiplica exponencialmente. São
                centenas de variáveis impactando simultaneamente sua rentabilidade: condições climáticas em diferentes
                talhões, flutuações de mercado, gestão de frota, controle de insumos, análise financeira multimoeda,
                cumprimento de metas ESG.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Tomar decisões baseadas em planilhas fragmentadas e relatórios defasados não é mais uma opção.
                <strong className="text-green-600"> Você precisa de inteligência em tempo real.</strong>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 text-center">
                <BarChart3 className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Dados fragmentados</p>
              </Card>
              <Card className="p-4 text-center">
                <Clock className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Decisões tardias</p>
              </Card>
              <Card className="p-4 text-center">
                <Target className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Falta de precisão</p>
              </Card>
              <Card className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Oportunidades perdidas</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Nossa Solução */}
      <section id="solucao" className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Um único sistema que integra toda sua operação
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Desenvolvemos uma plataforma que consolida todos os dados da sua fazenda em dashboards inteligentes,
              permitindo gestão proativa e decisões baseadas em análises preditivas avançadas.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Centro de Comando Digital */}
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3 mb-4">
                  <Monitor className="h-8 w-8 text-green-600" />
                  <CardTitle className="text-2xl">Centro de Comando Digital</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600">
                    Visualização em tempo real de toda propriedade através de mapas interativos
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600">Monitoramento simultâneo de múltiplas operações em campo</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600">Alertas automáticos para desvios e oportunidades</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600">Integração com dados de satélite, drones e sensores IoT</p>
                </div>
              </CardContent>
            </Card>

            {/* Inteligência Financeira Avançada */}
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3 mb-4">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <CardTitle className="text-2xl">Inteligência Financeira Avançada</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600">Análise de rentabilidade por talhão, cultura e safra</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600">Gestão de exposição cambial e hedge em múltiplas moedas</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600">Simulação de cenários com variáveis macroeconômicas</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600">Fluxo de caixa projetado com sazonalidade agrícola</p>
                </div>
              </CardContent>
            </Card>

            {/* Otimização de Comercialização */}
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3 mb-4">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <CardTitle className="text-2xl">Otimização de Comercialização</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600">Análise integrada de preços em CBOT, B3 e mercado físico</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600">Gestão de contratos, CPRs e posições futuras</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600">Cálculo automático de base e oportunidades de arbitragem</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600">Machine learning para previsão de preços e timing ideal de venda</p>
                </div>
              </CardContent>
            </Card>

            {/* Gestão Operacional Inteligente */}
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3 mb-4">
                  <Truck className="h-8 w-8 text-green-600" />
                  <CardTitle className="text-2xl">Gestão Operacional Inteligente</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600">Rastreamento de frota com análise de eficiência</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600">Otimização de rotas e aplicação de insumos</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600">Manutenção preditiva baseada em telemetria</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600">Controle de estoque integrado com planejamento de safra</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tecnologia de Ponta */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Construído com as tecnologias mais avançadas do mercado
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Zap className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Processamento em Tempo Real</h3>
              <p className="text-gray-600">Dados de milhares de sensores processados instantaneamente</p>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Brain className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Inteligência Artificial</h3>
              <p className="text-gray-600">Modelos preditivos para produtividade, preços e riscos climáticos</p>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Smartphone className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Edge Computing</h3>
              <p className="text-gray-600">Funcionamento garantido mesmo sem internet, com sincronização automática</p>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Eye className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Visualizações 3D</h3>
              <p className="text-gray-600">Mapas de calor, análise de relevo e simulações visuais</p>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Database className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">APIs Abertas</h3>
              <p className="text-gray-600">Integração com qualquer sistema ERP, máquina ou sensor</p>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Segurança Bancária</h3>
              <p className="text-gray-600">Criptografia de ponta e backup redundante em múltiplas regiões</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefícios Mensuráveis */}
      <section id="beneficios" className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Resultados comprovados em fazendas líderes do setor
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow border-green-200">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-green-700">Aumento de Produtividade</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Identificação precisa de zonas de manejo</p>
                <p>• Otimização de aplicação de insumos</p>
                <p>• Redução de perdas por decisões tardias</p>
                <p className="font-semibold text-green-600">Melhoria de 8-15% na produtividade média</p>
              </div>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow border-blue-200">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-blue-700">Redução de Custos</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Economia de 15-25% em insumos</p>
                <p>• Redução de 20-30% no consumo de combustível</p>
                <p>• Diminuição de 40% no tempo de análise</p>
                <p className="font-semibold text-blue-600">Otimização de capital de giro</p>
              </div>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow border-purple-200">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-purple-700">Melhoria na Tomada de Decisão</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Decisões 5x mais rápidas</p>
                <p>• Redução de 70% em erros de planejamento</p>
                <p>• Antecipação de problemas com 48-72h</p>
                <p className="font-semibold text-purple-600">ROI mensurável em todas as operações</p>
              </div>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow border-red-200">
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-red-700">Gestão de Riscos</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Monitoramento contínuo de exposição financeira</p>
                <p>• Alertas automáticos para desvios de mercado</p>
                <p>• Simulação de cenários para hedge otimizado</p>
                <p className="font-semibold text-red-600">Redução de 30-50% em perdas evitáveis</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Por que somos diferentes</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <MapPin className="h-8 w-8 text-green-600" />
                <h3 className="text-2xl font-semibold">Desenvolvido para o Agro Brasileiro</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Não é uma adaptação de software genérico. Cada funcionalidade foi pensada para a realidade das grandes
                fazendas brasileiras, considerando nossa logística, mercado, clima e regulamentações.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="h-8 w-8 text-green-600" />
                <h3 className="text-2xl font-semibold">Consultoria Integrada</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Mais que software: uma parceria estratégica. Nossa equipe de consultores especializados acompanha toda
                implementação e otimização contínua dos processos.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <Globe className="h-8 w-8 text-green-600" />
                <h3 className="text-2xl font-semibold">Flexibilidade Total</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Sistema modular que se adapta à sua operação, não o contrário. Dashboards customizáveis, relatórios
                personalizados e integrações sob medida.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <Phone className="h-8 w-8 text-green-600" />
                <h3 className="text-2xl font-semibold">Suporte 24/7 Durante a Safra</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Equipe dedicada disponível quando você mais precisa, com especialistas em agronomia, TI e finanças.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Implementação Estruturada */}
      <section id="implementacao" className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Implementação em fases, resultados desde o primeiro mês
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow relative">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Diagnóstico</h3>
              <Badge className="mb-4 bg-green-100 text-green-800">30 dias</Badge>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Mapeamento completo dos processos atuais</p>
                <p>• Identificação de quick wins</p>
                <p>• Desenho da arquitetura de dados</p>
              </div>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Piloto</h3>
              <Badge className="mb-4 bg-blue-100 text-blue-800">60 dias</Badge>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Implementação em área selecionada</p>
                <p>• Primeiros dashboards operacionais</p>
                <p>• Validação de ROI</p>
              </div>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Expansão</h3>
              <Badge className="mb-4 bg-purple-100 text-purple-800">90-180 dias</Badge>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Roll-out para toda propriedade</p>
                <p>• Integração completa de sistemas</p>
                <p>• Treinamento avançado de equipes</p>
              </div>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">4</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Otimização Contínua</h3>
              <Badge className="mb-4 bg-orange-100 text-orange-800">Permanente</Badge>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Machine learning ativado</p>
                <p>• Refinamento de modelos</p>
                <p>• Consultoria permanente</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Para Quem É */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Desenvolvido para líderes do agronegócio
            </h2>
            <p className="text-xl text-gray-600">Perfil ideal:</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Leaf className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Produtores de soja e milho</h3>
              <p className="text-gray-600">com 10.000+ hectares</p>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Operações que buscam</h3>
              <p className="text-gray-600">profissionalização da gestão</p>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Eye className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Empresas com visão</h3>
              <p className="text-gray-600">de longo prazo</p>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Zap className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Organizações comprometidas</h3>
              <p className="text-gray-600">com inovação</p>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Database className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Gestores que entendem</h3>
              <p className="text-gray-600">o valor dos dados</p>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <Target className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Foco em resultados</h3>
              <p className="text-gray-600">e eficiência operacional</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Final */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto para revolucionar sua gestão?</h2>
          <p className="text-xl mb-8 opacity-90">
            Descubra como fazendas líderes estão usando tecnologia para tomar decisões mais inteligentes, reduzir custos
            e maximizar produtividade.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-4">
              <Calendar className="mr-2 h-5 w-5" />
              Solicite uma apresentação executiva
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-green-600 text-lg px-8 py-4 bg-transparent"
            >
              <Phone className="mr-2 h-5 w-5" />
              Falar com especialista
            </Button>
          </div>
          <p className="text-sm opacity-75">
            Demonstração personalizada com dados da sua região e análise preliminar de potencial de melhoria
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Image 
                  src="/logo.png" 
                  alt="Agro Command Logo" 
                  width={32} 
                  height={32} 
                  className="h-8 w-8"
                />
                <span className="text-2xl font-bold">Agro Command</span>
              </div>
              <p className="text-gray-400">
                Transformando o agronegócio brasileiro através da tecnologia e inteligência de dados.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Solução</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Centro de Comando
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Inteligência Financeira
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Comercialização
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Gestão Operacional
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Sobre nós
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Cases de sucesso
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Equipe
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Carreiras
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contato</h3>
              <ul className="space-y-2 text-gray-400">
                <li>contato@agrocommand.com.br</li>
                <li>(11) 99999-9999</li>
                <li>São Paulo - SP</li>
                <li>Ribeirão Preto - SP</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Agro Command. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
