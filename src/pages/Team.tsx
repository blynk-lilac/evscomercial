import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Database, Settings, Award } from "lucide-react";
import isaacImage from "@/assets/isaac-muaco.jpg";

const Team = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const skills = [
    { icon: Code, label: "Programação Full-Stack" },
    { icon: Database, label: "Gerenciamento de Sistemas" },
    { icon: Settings, label: "Arquitetura de Software" },
    { icon: Award, label: "Gestão de Projetos" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="font-serif text-4xl font-bold mb-8 animate-fade-in">
            Nossa Equipe
          </h1>

          <Card className="shadow-medium animate-fade-in max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="font-serif text-3xl">
                Conheça Nossos Colaboradores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Isaac Muaco Profile */}
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                <div className="flex-shrink-0">
                  <img
                    src={isaacImage}
                    alt="Isaac Muaco"
                    className="w-64 h-64 object-cover rounded-lg shadow-strong"
                  />
                </div>
                
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <div>
                    <h2 className="font-serif text-3xl font-bold mb-2">
                      Isaac Muaco
                    </h2>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                      <Badge variant="default" className="bg-accent text-accent-foreground">
                        Programador
                      </Badge>
                      <Badge variant="default" className="bg-accent text-accent-foreground">
                        Gerenciador de Sistemas
                      </Badge>
                    </div>
                  </div>

                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground leading-relaxed">
                      Isaac Muaco é o talento por trás da plataforma digital da EVS Fashion. 
                      Como <strong>Programador e Gerenciador</strong>, ele foi responsável por 
                      desenvolver toda a infraestrutura tecnológica que permite à EVS oferecer 
                      uma experiência de compra moderna e eficiente.
                    </p>
                    
                    <p className="text-muted-foreground leading-relaxed mt-3">
                      Com expertise em desenvolvimento full-stack, Isaac construiu desde o sistema 
                      de e-commerce até o assistente virtual EVS Comercial, implementando soluções 
                      inovadoras que conectam a moda à tecnologia de ponta.
                    </p>

                    <p className="text-muted-foreground leading-relaxed mt-3">
                      Sua dedicação ao projeto EVS Fashion reflete não apenas habilidades técnicas 
                      excepcionais, mas também uma visão estratégica de como a tecnologia pode 
                      transformar a experiência do cliente e impulsionar o crescimento da marca.
                    </p>
                  </div>

                  {/* Skills Grid */}
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    {skills.map((skill, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg transition-smooth hover:bg-muted"
                      >
                        <skill.icon className="h-5 w-5 text-accent" />
                        <span className="text-sm font-medium">{skill.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Achievements */}
                  <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Award className="h-5 w-5 text-accent" />
                      Conquistas na EVS
                    </h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Desenvolvimento completo da plataforma EVS Fashion</li>
                      <li>• Implementação do assistente virtual EVS Comercial</li>
                      <li>• Sistema de cupons inteligentes e gerenciamento de pedidos</li>
                      <li>• Integração com PayPal e sistemas de pagamento</li>
                      <li>• Arquitetura escalável para crescimento internacional</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Company Vision */}
              <div className="mt-8 p-6 bg-gradient-to-br from-accent/5 to-accent/10 rounded-lg border border-accent/20">
                <h3 className="font-serif text-xl font-bold mb-3 text-center">
                  Tecnologia ao Serviço da Moda
                </h3>
                <p className="text-center text-muted-foreground">
                  Na EVS Fashion, acreditamos que a tecnologia deve facilitar a vida dos nossos 
                  clientes. Por isso, investimos em profissionais como Isaac Muaco, que 
                  transformam ideias em realidade digital, sempre com foco na melhor experiência 
                  do usuário.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Team;
