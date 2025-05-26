import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Users, AlertTriangle, Mail } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao início
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Termos de Serviço</h1>
          <p className="text-gray-600">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>
        </div>

        <div className="space-y-8">
          {/* Introdução */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Introdução
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p>
                Bem-vindo ao Hábitus! Estes Termos de Serviço ("Termos") regem o uso do nosso aplicativo de
                gerenciamento de hábitos e produtividade ("Serviço") operado por Hábitus ("nós", "nosso" ou
                "aplicativo").
              </p>
              <p>
                Ao acessar ou usar nosso Serviço, você concorda em ficar vinculado a estes Termos. Se você discordar de
                qualquer parte destes termos, não poderá acessar o Serviço.
              </p>
            </CardContent>
          </Card>

          {/* Aceitação dos termos */}
          <Card>
            <CardHeader>
              <CardTitle>Aceitação dos Termos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Ao criar uma conta ou usar o Hábitus, você confirma que:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Tem pelo menos 13 anos de idade</li>
                <li>Possui capacidade legal para aceitar estes Termos</li>
                <li>Fornecerá informações precisas e atualizadas</li>
                <li>Usará o Serviço de acordo com estes Termos</li>
              </ul>
            </CardContent>
          </Card>

          {/* Descrição do serviço */}
          <Card>
            <CardHeader>
              <CardTitle>Descrição do Serviço</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">O Hábitus oferece:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Ferramenta de criação e acompanhamento de hábitos</li>
                <li>Gerenciamento de tarefas e rotinas</li>
                <li>Integração com Google Calendar</li>
                <li>Análise de progresso e estatísticas</li>
                <li>Sincronização de dados entre dispositivos</li>
              </ul>
              <p className="mt-4">
                Reservamo-nos o direito de modificar ou descontinuar o Serviço a qualquer momento, com ou sem aviso
                prévio.
              </p>
            </CardContent>
          </Card>

          {/* Contas de usuário */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                Contas de Usuário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Responsabilidades do Usuário</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>Manter a segurança de sua conta e senha</li>
                    <li>Notificar-nos imediatamente sobre uso não autorizado</li>
                    <li>Fornecer informações precisas e atualizadas</li>
                    <li>Não compartilhar sua conta com terceiros</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Suspensão de Conta</h3>
                  <p className="text-gray-700">
                    Podemos suspender ou encerrar sua conta se você violar estes Termos ou usar o Serviço de forma
                    inadequada.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Uso aceitável */}
          <Card>
            <CardHeader>
              <CardTitle>Uso Aceitável</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Você concorda em NÃO:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Usar o Serviço para atividades ilegais ou não autorizadas</li>
                <li>Tentar acessar dados de outros usuários</li>
                <li>Interferir no funcionamento do Serviço</li>
                <li>Fazer engenharia reversa do aplicativo</li>
                <li>Transmitir vírus ou código malicioso</li>
                <li>Usar o Serviço para spam ou comunicações não solicitadas</li>
                <li>Violar direitos de propriedade intelectual</li>
              </ul>
            </CardContent>
          </Card>

          {/* Integração Google */}
          <Card>
            <CardHeader>
              <CardTitle>Integração com Google Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  A integração com Google Calendar é opcional e requer sua autorização explícita. Ao conectar sua conta
                  Google:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Você nos autoriza a acessar seu Google Calendar</li>
                  <li>Podemos criar, editar e excluir eventos relacionados aos seus hábitos e rotinas</li>
                  <li>Você pode revogar essa autorização a qualquer momento</li>
                  <li>Seguimos as políticas de privacidade do Google</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Propriedade intelectual */}
          <Card>
            <CardHeader>
              <CardTitle>Propriedade Intelectual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Nossos Direitos</h3>
                  <p className="text-gray-700">
                    O Hábitus e todo seu conteúdo, recursos e funcionalidades são de propriedade exclusiva nossa e estão
                    protegidos por leis de direitos autorais, marcas registradas e outras leis de propriedade
                    intelectual.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Seus Dados</h3>
                  <p className="text-gray-700">
                    Você mantém todos os direitos sobre os dados que cria no Hábitus (hábitos, tarefas, rotinas).
                    Concedemos a você uma licença para usar nosso Serviço para gerenciar esses dados.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Limitação de responsabilidade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
                Limitação de Responsabilidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">O Serviço é fornecido "como está" e "conforme disponível". Não garantimos que:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>O Serviço será ininterrupto ou livre de erros</li>
                <li>Os resultados obtidos serão precisos ou confiáveis</li>
                <li>Todos os bugs serão corrigidos</li>
              </ul>
              <p className="mt-4 font-semibold">
                Em nenhuma circunstância seremos responsáveis por danos indiretos, incidentais, especiais ou
                consequenciais.
              </p>
            </CardContent>
          </Card>

          {/* Privacidade */}
          <Card>
            <CardHeader>
              <CardTitle>Privacidade</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Sua privacidade é importante para nós. Nossa coleta e uso de informações pessoais são regidos por nossa{" "}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                  Política de Privacidade
                </Link>
                , que é incorporada a estes Termos por referência.
              </p>
            </CardContent>
          </Card>

          {/* Alterações nos termos */}
          <Card>
            <CardHeader>
              <CardTitle>Alterações nos Termos</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Reservamo-nos o direito de modificar estes Termos a qualquer momento. Notificaremos você sobre
                alterações significativas por email ou através do aplicativo. O uso continuado do Serviço após as
                alterações constitui aceitação dos novos Termos.
              </p>
            </CardContent>
          </Card>

          {/* Rescisão */}
          <Card>
            <CardHeader>
              <CardTitle>Rescisão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  Você pode encerrar sua conta a qualquer momento através das configurações do aplicativo ou entrando em
                  contato conosco.
                </p>
                <p>
                  Podemos encerrar ou suspender sua conta imediatamente, sem aviso prévio, se você violar estes Termos.
                </p>
                <p>
                  Após o encerramento, seu direito de usar o Serviço cessará imediatamente, e excluiremos seus dados
                  conforme nossa Política de Privacidade.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Lei aplicável */}
          <Card>
            <CardHeader>
              <CardTitle>Lei Aplicável</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Estes Termos são regidos pelas leis do Brasil. Qualquer disputa será resolvida nos tribunais competentes
                do Brasil.
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
              <p className="mb-4">Se você tiver dúvidas sobre estes Termos de Serviço, entre em contato conosco:</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p>
                  <strong>Email:</strong> legal@habitus.app
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
