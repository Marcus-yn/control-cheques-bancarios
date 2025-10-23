import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { 
  DollarSign, 
  Clock, 
  XCircle, 
  TrendingUp, 
  Plus, 
  Upload, 
  BarChart3,
  FileText,
  CreditCard,
  Zap,
  CheckCircle,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import React from "react";
import { motion } from 'motion/react';

interface DashboardProps {
  onNavigate: (screen: string) => void;
}

const chartData = [
  { day: '1', ingresos: 2400, egresos: 1800 },
  { day: '5', ingresos: 1398, egresos: 2200 },
  { day: '10', ingresos: 9800, egresos: 3400 },
  { day: '15', ingresos: 3908, egresos: 2800 },
  { day: '20', ingresos: 4800, egresos: 3200 },
  { day: '25', ingresos: 3800, egresos: 4100 },
  { day: '30', ingresos: 4300, egresos: 2900 },
];

const recentMovements = [
  { id: 1, type: 'cheque', number: '001245', beneficiary: 'Proveedores S.A.', amount: -15000, date: '2024-01-15' },
  { id: 2, type: 'deposit', beneficiary: 'Depósito Cliente', amount: 25000, date: '2024-01-14' },
  { id: 3, type: 'cheque', number: '001244', beneficiary: 'Servicios Generales', amount: -3500, date: '2024-01-14' },
  { id: 4, type: 'cheque', number: '001243', beneficiary: 'Nómina Empleados', amount: -45000, date: '2024-01-13' },
];

export function Dashboard({ onNavigate }: DashboardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(amount);
  };

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Header con Welcome */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-primary via-secondary to-accent p-8 rounded-2xl text-white"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm"
              >
                <Sparkles className="h-7 w-7 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold">¡Bienvenido al Control de Chequeras! 👋</h1>
                <p className="text-white/90 text-lg">
                  Todo tu dinero en un solo lugar - {new Date().toLocaleDateString('es-GT', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
        </motion.div>

        {/* Stats Cards Súper Visuales con Tooltips */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="group"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 border-l-4 border-l-primary overflow-hidden relative cursor-help">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <DollarSign className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-medium text-gray-600">💰 Tu Dinero</CardTitle>
                          <p className="text-xs text-gray-500">Cuenta Principal</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary mb-2">
                      {formatCurrency(387500)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        ✅ Disponible
                      </Badge>
                    </div>
                  </CardContent>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -mr-10 -mt-10"></div>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="text-center p-2">
                  <p className="font-semibold text-sm">💸 ¡Este es tu saldo actual!</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Es la cantidad de dinero que tienes disponible en tu cuenta bancaria principal. 
                    Se actualiza automáticamente cuando escribes cheques o registras depósitos.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            className="group"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-100 border-l-4 border-l-secondary overflow-hidden relative cursor-help">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Clock className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-medium text-gray-600">⏰ Por Cobrar</CardTitle>
                          <p className="text-xs text-gray-500">Cheques Pendientes</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-secondary mb-2">12</div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        {formatCurrency(89500)}
                      </Badge>
                    </div>
                  </CardContent>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-secondary/10 rounded-full -mr-10 -mt-10"></div>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="text-center p-2">
                  <p className="font-semibold text-sm">⏳ ¡Cheques esperando a ser cobrados!</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Son los cheques que has escrito pero que aún no han sido cobrados por los beneficiarios. 
                    El dinero está "reservado" pero todavía en tu cuenta.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            className="group"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-gradient-to-br from-red-50 to-pink-100 border-l-4 border-l-destructive overflow-hidden relative cursor-help">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-destructive rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <XCircle className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-medium text-gray-600">❌ Cancelados</CardTitle>
                          <p className="text-xs text-gray-500">Este Mes</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-destructive mb-2">3</div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-100 text-red-800 text-xs">
                        ⚠️ Revisar
                      </Badge>
                    </div>
                  </CardContent>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-destructive/10 rounded-full -mr-10 -mt-10"></div>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="text-center p-2">
                  <p className="font-semibold text-sm">🚫 ¡Cheques que se cancelaron!</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Cheques que por alguna razón se anularon o cancelaron este mes. 
                    Podrían ser errores o cambios de planes.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            className="group"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-100 border-l-4 border-l-accent overflow-hidden relative cursor-help">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <TrendingUp className="h-7 w-7 text-accent-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-medium text-gray-600">📈 Actividad</CardTitle>
                          <p className="text-xs text-gray-500">Movimientos</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-accent mb-2">47</div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                        📊 +12% vs anterior
                      </Badge>
                    </div>
                  </CardContent>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-accent/10 rounded-full -mr-10 -mt-10"></div>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="text-center p-2">
                  <p className="font-semibold text-sm">📊 ¡Qué tan activa está tu cuenta!</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Total de movimientos (cheques + depósitos) que has hecho este mes. 
                    ¡Más movimientos significa más actividad comercial!
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </motion.div>
        </div>

        {/* Botones de Acción Súper Fáciles con Tooltips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardHeader className="text-center pb-6">
              <CardTitle className="flex items-center justify-center gap-3 text-2xl">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center"
                >
                  <Zap className="h-6 w-6 text-white" />
                </motion.div>
                ¡Haz clic para empezar! 🚀
              </CardTitle>
              <CardDescription className="text-lg">
                Todo lo que necesitas en 3 botones súper fáciles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={() => onNavigate('new-check')}
                        className="h-24 w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 rounded-2xl shadow-lg border-0 group relative overflow-hidden"
                      >
                        <div className="flex flex-col items-center gap-2 relative z-10">
                          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileText className="h-6 w-6 text-white" />
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-base text-white leading-tight">✍️ Escribir Cheque</div>
                            <div className="text-xs text-white/90 leading-tight">Crear nuevo cheque</div>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <div className="text-center p-2">
                        <p className="font-semibold text-sm">📝 ¡Haz clic para escribir un cheque!</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Te llevará al formulario donde puedes llenar todos los datos del cheque: 
                          beneficiario, cantidad, fecha, etc. ¡Súper fácil!
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={() => onNavigate('new-deposit')}
                        className="h-24 w-full bg-gradient-to-r from-secondary to-teal-600 hover:from-secondary/90 hover:to-teal-600/90 rounded-2xl shadow-lg border-0 group relative overflow-hidden"
                      >
                        <div className="flex flex-col items-center gap-2 relative z-10">
                          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <CreditCard className="h-6 w-6 text-white" />
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-base text-white leading-tight">💰 Depositar Dinero</div>
                            <div className="text-xs text-white/90 leading-tight">Registrar depósito</div>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <div className="text-center p-2">
                        <p className="font-semibold text-sm">💸 ¡Registra el dinero que entra!</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Cuando tu empresa reciba dinero (depósitos, pagos de clientes, etc.), 
                          úsalo para registrarlo y mantener tu saldo actualizado.
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={() => onNavigate('reconciliation')}
                        className="h-24 w-full bg-gradient-to-r from-accent to-orange-500 hover:from-accent/90 hover:to-orange-500/90 text-white rounded-2xl shadow-lg border-0 group relative overflow-hidden"
                      >
                        <div className="flex flex-col items-center gap-2 relative z-10">
                          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <CheckCircle className="h-6 w-6 text-white" />
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-base text-white leading-tight">🔄 Revisar Todo</div>
                            <div className="text-xs text-white/90 leading-tight">Conciliar cuentas</div>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <div className="text-center p-2">
                        <p className="font-semibold text-sm">🔍 ¡Revisa que todo cuadre!</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Compara tus registros con el estado de cuenta del banco. 
                          Marca los cheques que ya se cobraron y verifica que no falte nada.
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts and Recent Movements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart */}
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Movimientos Últimos 30 Días
              </CardTitle>
              <CardDescription>
                Comparación de ingresos vs egresos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="day" 
                      className="text-muted-foreground"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      className="text-muted-foreground"
                      tick={{ fontSize: 12 }}
                    />
                    <RechartsTooltip 
                      formatter={(value: number) => [formatCurrency(value), '']}
                      labelStyle={{ color: 'var(--foreground)' }}
                      contentStyle={{ 
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ingresos" 
                      stroke="var(--secondary)" 
                      strokeWidth={3}
                      name="Ingresos"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="egresos" 
                      stroke="var(--primary)" 
                      strokeWidth={3}
                      name="Egresos"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Movimientos Recientes Súper Visuales */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-gray-50 to-slate-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  📋 Lo que pasó últimamente
                </CardTitle>
                <CardDescription className="text-base">
                  Tus movimientos más recientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentMovements.map((movement, index) => (
                    <motion.div 
                      key={movement.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all border border-gray-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          movement.type === 'cheque' 
                            ? 'bg-red-100 text-red-600' 
                            : 'bg-green-100 text-green-600'
                        }`}>
                          {movement.type === 'cheque' ? (
                            <FileText className="h-6 w-6" />
                          ) : (
                            <CreditCard className="h-6 w-6" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {movement.type === 'cheque' ? '💸' : '💰'} {movement.number && `#${movement.number} - `}
                            {movement.beneficiary}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            📅 {new Date(movement.date).toLocaleDateString('es-GT')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          className={`text-lg px-3 py-1 ${
                            movement.amount > 0 
                              ? "bg-green-100 text-green-800 border-green-200" 
                              : "bg-red-100 text-red-800 border-red-200"
                          }`}
                        >
                          {movement.amount > 0 ? '+' : ''}{formatCurrency(movement.amount)}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        className="w-full mt-6 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 border-0 shadow-lg"
                        onClick={() => onNavigate('checks')}
                      >
                        <span className="text-lg">👀 Ver todo mi historial</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <div className="text-center p-2">
                        <p className="font-semibold text-sm">📋 ¡Ve todos tus cheques y movimientos!</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Aquí podrás ver una lista completa de todos los cheques que has creado, 
                          cuáles están pendientes, cobrados o cancelados.
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Botón para Registrar Nueva Cuenta */}
        <div className="flex flex-wrap gap-4 mt-8">
          <Button
            variant="default"
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold shadow-lg rounded-xl px-6 py-4 text-lg transition-all duration-300 hover:scale-105"
            onClick={() => onNavigate('new-account')}
          >
            <Plus className="inline-block mr-2" /> Registrar nueva cuenta bancaria
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}