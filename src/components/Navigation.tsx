import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from './ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { 
  LayoutDashboard, 
  FileText, 
  CreditCard, 
  BarChart3, 
  Upload, 
  Settings, 
  LogOut, 
  Menu,
  Plus,
  User,
  Home,
  List,
  DollarSign,
  CheckCircle2,
  PieChart,
  UserCog,
  Wallet
} from 'lucide-react';
import { motion } from 'motion/react';

interface NavigationProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
  userRole: string;
}

const menuItems = [
  { 
    id: 'dashboard', 
    label: '🏠 Mi Escritorio', 
    description: 'Ver todo de un vistazo',
    tooltip: 'Aquí ves el resumen de todo: cuánto dinero tienes, cheques pendientes, movimientos recientes. ¡Es como la pantalla principal de tu negocio!',
    icon: Home, 
    badge: null,
    color: 'from-blue-500 to-cyan-500',
    roles: ['admin', 'user']
  },
  { 
    id: 'checks', 
    label: '📄 Mis Cheques', 
    description: 'Ver todos los cheques',
    tooltip: 'Una lista completa de todos los cheques que has creado. Puedes ver cuáles están pendientes, cobrados o cancelados.',
    icon: List, 
    badge: null,
    color: 'from-purple-500 to-pink-500',
    roles: ['admin', 'user']
  },
  { 
    id: 'new-check', 
    label: '✍️ Escribir Cheque', 
    description: 'Crear un cheque nuevo',
    tooltip: 'Llena un formulario súper fácil para crear un nuevo cheque: elige el beneficiario, escribe la cantidad, fecha, concepto, etc.',
    icon: Plus, 
    badge: null,
    color: 'from-green-500 to-emerald-500',
    roles: ['admin', 'user']
  },
  { 
    id: 'new-deposit', 
    label: '💰 Depositar Dinero', 
    description: 'Registrar un depósito',
    tooltip: 'Cuando recibas dinero (pagos de clientes, depósitos, etc.), regístralo aquí para mantener tu saldo actualizado.',
    icon: DollarSign, 
    badge: null,
    color: 'from-yellow-500 to-orange-500',
    roles: ['admin', 'user']
  },
  { 
    id: 'reconciliation', 
    label: '🔄 Revisar Todo', 
    description: 'Conciliar mis cuentas',
    tooltip: 'Compara tus registros con el estado de cuenta del banco. Marca los cheques que ya se cobraron y verifica que todo cuadre.',
    icon: CheckCircle2, 
    badge: 12,
    color: 'from-indigo-500 to-purple-500',
    roles: ['admin', 'user']
  },
  { 
    id: 'reports', 
    label: '📊 Ver Gráficos', 
    description: 'Reportes y estadísticas',
    tooltip: 'Gráficos bonitos y reportes que puedes exportar a Excel o PDF para presentar a tu jefe o contador.',
    icon: PieChart, 
    badge: null,
    color: 'from-teal-500 to-cyan-500',
    roles: ['admin', 'user']
  },
  { 
    id: 'settings', 
    label: '⚙️ Configurar', 
    description: 'Ajustes del sistema',
    tooltip: 'Solo para administradores: configurar cuentas bancarias, chequeras, usuarios y otros ajustes importantes del sistema.',
    icon: UserCog, 
    badge: null,
    color: 'from-gray-500 to-slate-500',
    roles: ['admin']
  }
];

export function Navigation({ currentScreen, onNavigate, onLogout, userRole }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  const NavContent = () => (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-gradient-to-b from-white to-gray-50">
        {/* Logo and Title Súper Visual */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary via-secondary to-accent"
        >
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm"
            >
              <Wallet className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h2 className="font-bold text-xl text-white">💼 Mi Chequera</h2>
              <p className="text-sm text-white/90">¡Todo súper fácil!</p>
            </div>
          </div>
        </motion.div>

        {/* Info del Usuario Súper Visual */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 border-b bg-gradient-to-r from-green-50 to-emerald-50"
        >
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <User className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <p className="font-bold text-gray-800">👋 ¡Hola!</p>
              <div className="flex items-center gap-2">
                <Badge 
                  className={`text-sm px-3 py-1 rounded-full ${
                    userRole === 'admin' 
                      ? 'bg-purple-100 text-purple-800 border-purple-200' 
                      : 'bg-blue-100 text-blue-800 border-blue-200'
                  }`}
                >
                  {userRole === 'admin' ? '👑 Jefe' : '👤 Usuario'}
                </Badge>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Menú de Navegación Súper Visual con Tooltips */}
        <nav className="flex-1 p-4 space-y-3">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
            ✨ ¿Qué quieres hacer?
          </h3>
          <div className="space-y-3">
            {filteredMenuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className={`w-full p-4 h-auto rounded-xl border transition-all duration-300 ${
                          isActive 
                            ? `bg-gradient-to-r ${item.color} text-white shadow-lg border-transparent` 
                            : 'hover:bg-gray-50 border-gray-200 bg-white hover:shadow-md'
                        }`}
                        onClick={() => {
                          onNavigate(item.id);
                          setIsOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isActive 
                              ? 'bg-white/20 backdrop-blur-sm' 
                              : `bg-gradient-to-r ${item.color}`
                          }`}>
                            <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-white'}`} />
                          </div>
                          <div className="flex-1 text-left">
                            <p className={`font-semibold ${isActive ? 'text-white' : 'text-gray-800'}`}>
                              {item.label}
                            </p>
                            <p className={`text-xs ${isActive ? 'text-white/90' : 'text-gray-500'}`}>
                              {item.description}
                            </p>
                          </div>
                          {item.badge && (
                            <Badge 
                              className={`text-xs font-bold ${
                                isActive 
                                  ? 'bg-white/20 text-white border-white/30' 
                                  : 'bg-red-100 text-red-800 border-red-200'
                              }`}
                            >
                              🔔 {item.badge}
                            </Badge>
                          )}
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <div className="p-2">
                        <p className="font-semibold text-sm">{item.label}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {item.tooltip}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
              );
            })}
          </div>
        </nav>

        {/* Acciones Rápidas Súper Visuales con Tooltips */}
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-3">
            <p className="text-sm font-bold text-gray-600 mb-3">🚀 Acceso Rápido</p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 border-0 shadow-lg"
                    onClick={() => {
                      onNavigate('new-check');
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      <span className="font-bold">✍️ Escribir Cheque</span>
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <div className="p-2">
                    <p className="font-semibold text-sm">📝 ¡Botón rápido para crear cheques!</p>
                    <p className="text-xs text-gray-600 mt-1">
                      El atajo más rápido para escribir un nuevo cheque sin tener que navegar por el menú.
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 border-0 shadow-lg"
                    onClick={() => {
                      onNavigate('reconciliation');
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-bold">🔄 Revisar Todo</span>
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <div className="p-2">
                    <p className="font-semibold text-sm">🔍 ¡Botón rápido para conciliar!</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Acceso directo para revisar y conciliar tus cuentas con el banco. 
                      ¡Úsalo al final del mes!
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          </div>
        </div>

        {/* Cerrar Sesión Súper Visual con Tooltip */}
        <div className="p-4 border-t border-gray-200">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full h-12 justify-center text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 rounded-xl border-2 border-red-200 hover:border-transparent transition-all duration-300"
                  onClick={onLogout}
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="h-5 w-5" />
                    <span className="font-bold">🚪 Salir</span>
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <div className="p-2">
                  <p className="font-semibold text-sm">👋 ¡Cerrar sesión de forma segura!</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Cierra tu sesión para que nadie más pueda usar tu cuenta. 
                    ¡Siempre hazlo cuando termines de trabajar!
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80 bg-card border-r h-screen overflow-y-auto">
        <NavContent />
      </div>

      {/* Mobile Menu */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="fixed top-4 left-4 z-50 bg-card border rounded-lg shadow-md lg:hidden"
                  aria-label="Abrir menú de navegación"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-sm">📱 ¡Toca para abrir el menú!</p>
              </TooltipContent>
            </Tooltip>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
            <SheetDescription className="sr-only">
              Menú de navegación principal del sistema de control de chequeras
            </SheetDescription>
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden bg-card border-b p-4 pl-16">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold">Control de Chequeras</h1>
            <p className="text-sm text-muted-foreground">Sistema Bancario</p>
          </div>
          <Badge 
            variant={userRole === 'admin' ? 'default' : 'secondary'} 
            className="text-xs"
          >
            {userRole === 'admin' ? 'Admin' : 'Usuario'}
          </Badge>
        </div>
      </div>
    </>
  );
}