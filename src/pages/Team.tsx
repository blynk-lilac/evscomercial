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
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      <div className="absolute top-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
      
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="relative pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-20 animate-fade-in">
            <div className="inline-block mb-6">
              <Badge className="bg-accent text-accent-foreground shadow-medium px-8 py-3 text-base font-semibold">
                <Star className="h-5 w-5 mr-2 inline animate-pulse" />
                Conheça Nossa Equipe
              </Badge>
            </div>
            <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-br from-foreground via-foreground to-accent bg-clip-text text-transparent leading-tight">
              Talento e Inovação
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-accent/50 via-accent to-accent/50 mx-auto mb-6 rounded-full" />
            <p className="text-muted-foreground text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed">
              Profissionais dedicados que transformam tecnologia em experiências excepcionais para a moda
            </p>
          </div>

          {/* Main Profile Card */}
          <Card className="relative overflow-hidden border-2 border-accent/20 shadow-strong hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-500 animate-scale-in mb-16">
            {/* Animated Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent opacity-50 pointer-events-none" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="relative p-8 md:p-16">
              <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
                {/* Image Section */}
                <div className="relative group">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent via-accent/50 to-accent/20 rounded-3xl blur-3xl opacity-30 group-hover:opacity-50 transition-all duration-700" />
                  
                  {/* Main image container */}
                  <div className="relative overflow-hidden rounded-3xl shadow-strong border-4 border-accent/30 group-hover:border-accent/50 transition-all duration-500">
                    <img
                      src={isaacImage}
                      alt="Isaac Muaco - Desenvolvedor Principal EVS Fashion"
                      className="w-full h-[450px] md:h-[550px] object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Hover text */}
                    <div className="absolute bottom-6 left-6 right-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-4 group-hover:translate-y-0">
                      <p className="font-serif text-2xl font-bold mb-2">Isaac Muaco</p>
                      <p className="text-sm text-white/90">Desenvolvedor & Gerenciador de Sistemas</p>
                    </div>
                  </div>
                  
                  {/* Floating Badge */}
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 animate-fade-in z-10" style={{ animationDelay: '0.3s' }}>
                    <Badge className="bg-accent text-accent-foreground shadow-strong px-8 py-3 text-base font-bold border-4 border-background">
                      💻 Desenvolvedor Principal
                    </Badge>
                  </div>
                </div>

                {/* Content Section */}
                <div className="space-y-8">
                  <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <div className="mb-6">
                      <h2 className="font-serif text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-br from-foreground via-accent to-foreground bg-clip-text text-transparent leading-tight">
                        Isaac Muaco
                      </h2>
                      <div className="h-1 w-20 bg-gradient-to-r from-accent to-accent/50 rounded-full mb-6" />
                    </div>
                    <div className="flex flex-wrap gap-3 mb-6">
                      <Badge className="bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 transition-all px-4 py-2 text-sm font-semibold">
                        🎯 Programador Full-Stack
                      </Badge>
                      <Badge className="bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 transition-all px-4 py-2 text-sm font-semibold">
                        ⚡ Gerenciador de Sistemas
                      </Badge>
                      <Badge className="bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 transition-all px-4 py-2 text-sm font-semibold">
                        🚀 Arquiteto de Software
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-5 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                      Isaac Muaco é o <span className="text-foreground font-bold">talento visionário</span> por trás da plataforma digital da EVS Fashion. 
                      Como <span className="text-accent font-bold">Programador e Gerenciador de Sistemas</span>, ele arquitetou e desenvolveu toda a infraestrutura 
                      tecnológica que permite à EVS oferecer uma experiência de compra <span className="text-foreground font-semibold">moderna, segura e eficiente</span>.
                    </p>
                    
                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                      Com expertise em <span className="text-foreground font-bold">desenvolvimento full-stack e arquitetura de software</span>, Isaac construiu desde 
                      o sistema de e-commerce completo até o assistente virtual inteligente EVS Comercial, implementando soluções inovadoras que conectam a moda 
                      à <span className="text-accent font-semibold">tecnologia de ponta</span>.
                    </p>

                    <div className="p-5 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
                      <p className="text-sm md:text-base text-foreground/90 italic leading-relaxed">
                        "Cada linha de código é uma oportunidade de criar experiências memoráveis e transformar a forma como as pessoas interagem com a moda."
                      </p>
                      <p className="text-sm text-accent font-semibold mt-2">— Isaac Muaco</p>
                    </div>
                  </div>

                  {/* Skills Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    {skills.map((skill, index) => (
                      <div
                        key={index}
                        className={`group relative overflow-hidden p-5 rounded-2xl border-2 border-accent/20 bg-gradient-to-br ${skill.color} hover:shadow-strong hover:border-accent/40 transition-all duration-300 hover:-translate-y-2`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-accent/20 group-hover:bg-accent/30 group-hover:scale-110 transition-all duration-300 border border-accent/30">
                            <skill.icon className="h-6 w-6 text-accent" />
                          </div>
                          <span className="text-base font-semibold text-foreground group-hover:text-accent transition-colors">{skill.label}</span>
                        </div>
                        <div className="absolute top-0 right-0 w-20 h-20 bg-accent/10 rounded-full blur-2xl group-hover:bg-accent/20 transition-colors" />
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
