import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, Eye, Database, Mail } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao início
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Política de Privacidade</h1>
          <p className="text-gray-600">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>
        </div>

        <div className="space-y-8">
          {/* Introdução */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-blue-600" />
                Introdução
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                O Hábitus ("nós", "nosso" ou "aplicativo") está comprometido em proteger sua privacidade. Esta Política
                de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações quando você usa
                nosso aplicativo de gerenciamento de hábitos e produtividade.
              </p>
              <p>Ao usar o Hábitus, você concorda com a coleta e uso de informações de acordo com esta política.</p>
            </CardContent>
          </Card>

          {/* Informações que coletamos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2 text-green-600" />
                Informações que Coletamos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Informações Pessoais</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Nome completo</li>
                  <li>Endereço de email</li>
                  <li>Foto de perfil (quando fornecida via Google)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Dados de Uso</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Hábitos criados e seu progresso</li>
                  <li>Tarefas e rotinas configuradas</li>
                  <li>Dados de uso do aplicativo</li>
                  <li>Preferências e configurações</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Integração com Google</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Acesso ao Google Calendar (apenas quando autorizado)</li>
                  <li>Informações básicas do perfil Google</li>
                  <li>Token de acesso para sincronização</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Como usamos suas informações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2 text-purple-600" />
                Como Usamos Suas Informações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Utilizamos suas informações para:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Fornecer e manter nosso serviço</li>
                <li>Personalizar sua experiência no aplicativo</li>
                <li>Sincronizar dados com Google Calendar (quando autorizado)</li>
                <li>Enviar notificações relacionadas aos seus hábitos e tarefas</li>
                <li>Melhorar nosso aplicativo e desenvolver novos recursos</li>
                <li>Detectar, prevenir e resolver problemas técnicos</li>
                <li>Cumprir obrigações legais</li>
              </ul>
            </CardContent>
          </Card>

          {/* Compartilhamento de dados */}
          <Card>
            <CardHeader>
              <CardTitle>Compartilhamento de Dados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                <strong>Não vendemos, alugamos ou compartilhamos suas informações pessoais</strong> com terceiros,
                exceto nas seguintes situações:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Com seu consentimento explícito</li>
                <li>Para cumprir obrigações legais</li>
                <li>Para proteger nossos direitos e segurança</li>
                <li>Com provedores de serviços que nos ajudam a operar o aplicativo (Supabase, Vercel)</li>
              </ul>
            </CardContent>
          </Card>

          {/* Segurança */}
          <Card>
            <CardHeader>
              <CardTitle>Segurança dos Dados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Criptografia de dados em trânsito e em repouso</li>
                <li>Autenticação segura via OAuth 2.0</li>
                <li>Acesso restrito aos dados pessoais</li>
                <li>Monitoramento regular de segurança</li>
                <li>Backup seguro dos dados</li>
              </ul>
            </CardContent>
          </Card>

          {/* Seus direitos */}
          <Card>
            <CardHeader>
              <CardTitle>Seus Direitos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Você tem o direito de:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Acessar suas informações pessoais</li>
                <li>Corrigir dados incorretos</li>
                <li>Solicitar a exclusão de sua conta e dados</li>
                <li>Revogar permissões do Google Calendar</li>
                <li>Exportar seus dados</li>
                <li>Receber uma cópia de suas informações</li>
              </ul>
            </CardContent>
          </Card>

          {/* Retenção de dados */}
          <Card>
            <CardHeader>
              <CardTitle>Retenção de Dados</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Mantemos suas informações pessoais apenas pelo tempo necessário para fornecer nossos serviços e cumprir
                obrigações legais. Quando você excluir sua conta, removeremos permanentemente todos os seus dados
                pessoais dentro de 30 dias.
              </p>
            </CardContent>
          </Card>

          {/* Alterações na política */}
          <Card>
            <CardHeader>
              <CardTitle>Alterações nesta Política</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Podemos atualizar nossa Política de Privacidade periodicamente. Notificaremos você sobre quaisquer
                alterações publicando a nova Política de Privacidade nesta página e atualizando a data de "última
                atualização".
              </p>
            </CardContent>
          </Card>

          {/* Contato */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-blue-600" />
                Entre em Contato
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p>
                  <strong>Email:</strong> privacy@habitus.app
                </p>
                <p>
                  <strong>Aplicativo:</strong> Hábitus - Produtividade Inteligente
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Button asChild>
            <Link href="/">Voltar ao Hábitus</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
