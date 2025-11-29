import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Database, Settings, Award, Star, Zap, Target, Sparkles } from "lucide-react";
import isaacImage from "@/assets/isaac-muaco.jpg";

const Team = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const skills = [
    { icon: Code, label: "Programação Full-Stack", color: "from-blue-500/20 to-purple-500/20" },
    { icon: Database, label: "Gerenciamento de Sistemas", color: "from-green-500/20 to-emerald-500/20" },
    { icon: Settings, label: "Arquitetura de Software", color: "from-orange-500/20 to-red-500/20" },
    { icon: Award, label: "Gestão de Projetos", color: "from-pink-500/20 to-rose-500/20" },
  ];

  const achievements = [
    { icon: Zap, text: "Desenvolvimento completo da plataforma EVS Fashion" },
    { icon: Sparkles, text: "Implementação do assistente virtual EVS Comercial" },
    { icon: Target, text: "Sistema de cupons inteligentes e gerenciamento" },
    { icon: Star, text: "Integração PayPal e sistemas de pagamento" },
    { icon: Award, text: "Arquitetura escalável para crescimento global" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-block mb-4">
              <Badge className="bg-accent/10 text-accent border-accent/20 px-6 py-2 text-sm">
                <Star className="h-4 w-4 mr-2 inline" />
                Conheça Nossa Equipe
              </Badge>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Talento e Inovação
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Profissionais dedicados que transformam tecnologia em experiências excepcionais
            </p>
          </div>

          {/* Main Profile Card */}
          <Card className="relative overflow-hidden border-0 shadow-strong animate-scale-in mb-12">
            {/* Background Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/10 pointer-events-none" />
            
            <div className="relative p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
                {/* Image Section */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500" />
                  <div className="relative overflow-hidden rounded-2xl shadow-strong border-4 border-background">
                    <img
                      src={isaacImage}
                      alt="Isaac Muaco"
                      className="w-full h-[400px] md:h-[500px] object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  
                  {/* Floating Badge */}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <Badge className="bg-accent text-accent-foreground shadow-strong px-6 py-2 text-sm font-semibold">
                      💻 Desenvolvedor Principal
                    </Badge>
                  </div>
                </div>

                {/* Content Section */}
                <div className="space-y-6">
                  <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <h2 className="font-serif text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-foreground to-accent bg-clip-text text-transparent">
                      Isaac Muaco
                    </h2>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline" className="border-accent/30 text-accent hover:bg-accent/10 transition-colors">
                        🎯 Programador
                      </Badge>
                      <Badge variant="outline" className="border-accent/30 text-accent hover:bg-accent/10 transition-colors">
                        ⚡ Gerenciador de Sistemas
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4 text-muted-foreground leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <p className="text-base">
                      Isaac Muaco é o <span className="text-foreground font-semibold">talento por trás</span> da plataforma digital da EVS Fashion. 
                      Como <span className="text-accent font-semibold">Programador e Gerenciador</span>, ele desenvolveu toda a infraestrutura 
                      tecnológica que permite à EVS oferecer uma experiência de compra moderna e eficiente.
                    </p>
                    
                    <p className="text-base">
                      Com expertise em <span className="text-foreground font-semibold">desenvolvimento full-stack</span>, Isaac construiu desde 
                      o sistema de e-commerce até o assistente virtual EVS Comercial, implementando soluções inovadoras que conectam a moda 
                      à tecnologia de ponta.
                    </p>
                  </div>

                  {/* Skills Grid */}
                  <div className="grid grid-cols-2 gap-3 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    {skills.map((skill, index) => (
                      <div
                        key={index}
                        className={`group relative overflow-hidden p-4 rounded-xl border border-border/50 bg-gradient-to-br ${skill.color} hover:shadow-medium transition-all duration-300 hover:-translate-y-1`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-background/80 group-hover:bg-accent/20 transition-colors">
                            <skill.icon className="h-5 w-5 text-accent" />
                          </div>
                          <span className="text-sm font-medium">{skill.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Achievements Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Achievements Card */}
            <Card className="border-0 shadow-medium hover:shadow-strong transition-all duration-300 animate-fade-in overflow-hidden" style={{ animationDelay: '0.4s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
              <div className="relative p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-accent/10">
                    <Award className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold">Conquistas na EVS</h3>
                </div>
                <div className="space-y-4">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/5 transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors flex-shrink-0">
                        <achievement.icon className="h-4 w-4 text-accent" />
                      </div>
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        {achievement.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Vision Card */}
            <Card className="border-0 shadow-medium hover:shadow-strong transition-all duration-300 animate-fade-in overflow-hidden" style={{ animationDelay: '0.5s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent pointer-events-none" />
              <div className="relative p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-accent/10">
                    <Sparkles className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold">Nossa Visão</h3>
                </div>
                <div className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    Na EVS Fashion, acreditamos que a <span className="text-foreground font-semibold">tecnologia deve facilitar</span> a 
                    vida dos nossos clientes. Por isso, investimos em profissionais como Isaac Muaco, que transformam ideias em 
                    realidade digital.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Sua dedicação reflete não apenas <span className="text-foreground font-semibold">habilidades técnicas excepcionais</span>, 
                    mas também uma visão estratégica de como a tecnologia pode impulsionar o crescimento da marca.
                  </p>
                  <div className="pt-4">
                    <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                      <p className="text-sm text-accent font-semibold text-center">
                        "Mais Que Moda, É Identidade" - EVS Fashion
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Bottom CTA */}
          <div className="text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Card className="border-0 shadow-medium overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-accent/10 to-accent/5 pointer-events-none" />
              <div className="relative p-8">
                <h3 className="font-serif text-2xl font-bold mb-3">Tecnologia ao Serviço da Moda</h3>
                <p className="text-muted-foreground max-w-3xl mx-auto">
                  Junte-se a nós nessa jornada onde a inovação encontra o estilo. A EVS Fashion está sempre em busca de talentos 
                  que compartilhem nossa paixão por excelência e transformação digital.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;
