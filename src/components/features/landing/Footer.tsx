import { Globe, Shield, Instagram, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 relative">
                  <Image 
                    src="/treinologo.png" 
                    alt="Treino Logo" 
                    fill 
                    className="object-contain"
                  />
                </div>
                <span className="text-2xl font-bold text-primary">Treino</span>
              </div>
              <p className="text-muted-foreground">
                La plataforma todo-en-uno para entrenadores personales que quieren profesionalizar su negocio.
              </p>
              <div className="flex space-x-4">
                <Globe className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer" />
                <Shield className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer" />
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <div className="space-y-2 text-muted-foreground">
                <div className="hover:text-primary cursor-pointer">Características</div>
                <div className="hover:text-primary cursor-pointer">Precios</div> 
              </div>
            </div>


            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <div className="space-y-2 text-muted-foreground">
                <Link 
                  href="/about"
                  className="block hover:text-primary cursor-pointer transition-colors"
                >
                  Sobre Nosotros
                </Link>
              </div>
            </div>

            <div id="contact">
              <h4 className="font-semibold mb-4">Contacto</h4>
              <div className="space-y-2 text-muted-foreground">
                {/* <a 
                  href="mailto:info@treino.com"
                  className="flex items-center space-x-2 hover:text-primary cursor-pointer transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>info@treino.com (Proximamente)</span>
                </a> */}
                <a 
                  href="https://www.instagram.com/treino.coach/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 hover:text-primary cursor-pointer transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                  <span>treino.coach</span>
                </a>
                <div className="flex items-center space-x-2 hover:text-primary cursor-pointer">
                  <Phone className="w-4 h-4" />
                  <span>+5492234251511</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 Treino. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
  );
}