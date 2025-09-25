import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { 
  Search, 
  Filter, 
  Eye, 
  XCircle, 
  CheckCircle2, 
  Plus,
  CalendarDays,
  Download,
  FileText,
  Wallet,
  Clock,
  CheckCheck
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { motion } from 'motion/react';
import { getBankIcon } from './ui/smart-icons';

interface ChecksListProps {
  onNavigate: (screen: string) => void;
}

const mockChecks = [
  {
    id: 1,
    number: '001245',
    date: '2024-01-15',
    beneficiary: 'Proveedores Guatemala S.A.',
    amount: 15000,
    concept: 'Compra de materiales de construcción',
    status: 'pendiente',
    account: 'Cuenta Principal - Banco Agromercantil (BAM)',
    checkbook: 'CHQ-BAM-001',
    bank: 'BAM',
    currency: 'GTQ'
  },
  {
    id: 2,
    number: '001024',
    date: '2024-01-14',
    beneficiary: 'Servicios Generales Ltda.',
    amount: 3500,
    concept: 'Servicios de limpieza mensual',
    status: 'cobrado',
    account: 'Cuenta Operativa - Banco Industrial (BI)',
    checkbook: 'CHQ-BI-002',
    bank: 'BI',
    currency: 'GTQ'
  },
  {
    id: 3,
    number: '005012',
    date: '2024-01-13',
    beneficiary: 'Nómina Empleados Enero',
    amount: 2800,
    concept: 'Pago de nómina quincenal',
    status: 'cobrado',
    account: 'Cuenta Dólares - BAC Credomatic',
    checkbook: 'CHQ-BAC-USD-001',
    bank: 'BAC',
    currency: 'USD'
  },
  {
    id: 4,
    number: '002077',
    date: '2024-01-12',
    beneficiary: 'Transportes Rápidos Guatemala',
    amount: 4200,
    concept: 'Flete de mercadería a Quetzaltenango',
    status: 'anulado',
    account: 'Cuenta Nómina - Banrural',
    checkbook: 'CHQ-BANRURAL-003',
    bank: 'BANRURAL',
    currency: 'GTQ'
  }
];

export function ChecksList({ onNavigate }: ChecksListProps) {
  const [checks, setChecks] = useState(mockChecks);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedCheck, setSelectedCheck] = useState<any>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendiente':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 px-3 py-1 text-sm font-bold">
            ⏰ Esperando
          </Badge>
        );
      case 'cobrado':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1 text-sm font-bold">
            ✅ Pagado
          </Badge>
        );
      case 'anulado':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 px-3 py-1 text-sm font-bold">
            ❌ Cancelado
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendiente':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'cobrado':
        return <CheckCheck className="h-5 w-5 text-green-600" />;
      case 'anulado':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const handleStatusChange = (checkId: number, newStatus: string) => {
    setChecks(prev => prev.map(check => 
      check.id === checkId ? { ...check, status: newStatus } : check
    ));
    
    const statusMessages = {
      'cobrado': '✅ Cheque marcado como cobrado',
      'anulado': '❌ Cheque anulado correctamente',
      'pendiente': '⏰ Cheque marcado como pendiente'
    };
    
    toast.success(statusMessages[newStatus as keyof typeof statusMessages] || 'Estado actualizado');
  };

  const filteredChecks = checks.filter(check => {
    const matchesSearch = 
      check.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      check.beneficiary.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'todos' || check.status === statusFilter;
    
    const matchesDate = (!dateFrom || check.date >= dateFrom) && 
                       (!dateTo || check.date <= dateTo);
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const formatCurrency = (amount: number, currency: string = 'GTQ') => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const exportToCSV = () => {
    const headers = ['Número', 'Fecha', 'Beneficiario', 'Monto', 'Concepto', 'Estado'];
    const csvContent = [
      headers.join(','),
      ...filteredChecks.map(check => [
        check.number,
        check.date,
        `"${check.beneficiary}"`,
        check.amount,
        `"${check.concept}"`,
        check.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `cheques_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('📊 Reporte exportado correctamente');
  };

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Header con botón explicativo */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-8 rounded-2xl text-white"
        >
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                >
                  <Wallet className="h-9 w-9 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-4xl font-bold">📄 Mis Cheques</h1>
                  <p className="text-white/90 text-lg mt-1">
                    Aquí puedes ver todos tus cheques de forma súper fácil
                  </p>
                </div>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={() => onNavigate('new-check')}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-white/30 h-14 px-6 rounded-xl shadow-lg"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      ✍️ Escribir Cheque Nuevo
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <div className="text-center p-2">
                      <p className="font-semibold text-sm">📝 ¡Crear un cheque nuevo!</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Te lleva directo al formulario para crear un cheque completamente nuevo.
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            </div>
          </div>
          <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
        </motion.div>

        {/* Filtros con tooltip en botón de descarga */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <Filter className="h-6 w-6 text-white" />
                </div>
                🔍 Buscar y Filtrar
              </CardTitle>
              <p className="text-gray-600 text-lg">¡Encuentra exactamente lo que buscas!</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="space-y-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label htmlFor="search" className="text-lg font-semibold text-gray-700 flex items-center gap-2 cursor-help">
                        🔎 Buscar por nombre
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-sm">💡 Busca por número de cheque o nombre del beneficiario</p>
                    </TooltipContent>
                  </Tooltip>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Ej: Juan Pérez..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 text-lg"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label className="text-lg font-semibold text-gray-700 flex items-center gap-2 cursor-help">
                        🏷️ ¿Qué tipo?
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-sm">📋 Filtra por el estado del cheque</p>
                    </TooltipContent>
                  </Tooltip>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 text-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="todos" className="text-lg py-3">📋 Ver Todos</SelectItem>
                      <SelectItem value="pendiente" className="text-lg py-3">⏰ Solo Pendientes</SelectItem>
                      <SelectItem value="cobrado" className="text-lg py-3">✅ Solo Pagados</SelectItem>
                      <SelectItem value="anulado" className="text-lg py-3">❌ Solo Cancelados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label htmlFor="dateFrom" className="text-lg font-semibold text-gray-700 flex items-center gap-2 cursor-help">
                        📅 Desde
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-sm">📅 Fecha inicial para filtrar</p>
                    </TooltipContent>
                  </Tooltip>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 text-lg"
                  />
                </div>

                <div className="space-y-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label htmlFor="dateTo" className="text-lg font-semibold text-gray-700 flex items-center gap-2 cursor-help">
                        📅 Hasta
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-sm">📅 Fecha final para filtrar</p>
                    </TooltipContent>
                  </Tooltip>
                  <Input
                    id="dateTo"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 text-lg"
                  />
                </div>

                <div className="flex items-end">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          onClick={exportToCSV}
                          className="w-full h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 border-0 shadow-lg text-lg"
                        >
                          <Download className="h-5 w-5 mr-2" />
                          📊 Descargar
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <div className="text-center p-2">
                          <p className="font-semibold text-sm">📥 ¡Exporta tus cheques a Excel!</p>
                          <p className="text-xs text-gray-600 mt-1">
                            Descarga una lista de todos los cheques filtrados en formato CSV 
                            que puedes abrir en Excel o enviar a tu contador.
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Lista de cheques con tooltips en botones de acción */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          {filteredChecks.map((check, index) => (
            <motion.div
              key={check.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.02 }}
              className="group"
            >
              <Card className="rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    {/* Info principal */}
                    <div className="flex items-center gap-6">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center relative ${
                        check.status === 'pendiente' 
                          ? 'bg-yellow-100' 
                          : check.status === 'cobrado' 
                          ? 'bg-green-100' 
                          : 'bg-red-100'
                      }`}>
                        {getStatusIcon(check.status)}
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                          {(() => {
                            const BankIcon = getBankIcon(check.bank);
                            return <BankIcon className="h-4 w-4 text-primary" />;
                          })()}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <h3 className="text-xl font-bold text-gray-800">
                            📄 Cheque #{check.number}
                          </h3>
                          {getStatusBadge(check.status)}
                        </div>
                        
                        <div className="flex items-center gap-6 text-gray-600">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            <span>📅 {new Date(check.date).toLocaleDateString('es-GT')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>👤 {check.beneficiary}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm bg-gray-100 px-2 py-1 rounded-lg">🏦 {check.bank}</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-500">💬 {check.concept}</p>
                      </div>
                    </div>

                    {/* Monto y acciones con tooltips */}
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-3xl font-bold text-gray-800">
                          {formatCurrency(check.amount, check.currency)}
                        </p>
                        <p className="text-gray-500 text-sm">{check.currency === 'USD' ? 'Dólares' : 'Quetzales'}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedCheck(check)}
                                    className="h-12 w-12 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-600"
                                    aria-label={`Ver detalles del cheque ${check.number}`}
                                  >
                                    <Eye className="h-5 w-5" />
                                  </Button>
                                </motion.div>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="text-sm">👁️ Ver todos los detalles del cheque</p>
                              </TooltipContent>
                            </Tooltip>
                          </DialogTrigger>
                          <DialogContent className="rounded-2xl max-w-md">
                            <DialogHeader>
                              <DialogTitle className="text-2xl">
                                📄 Detalles del Cheque #{selectedCheck?.number}
                              </DialogTitle>
                              <DialogDescription className="text-lg">
                                Toda la información del cheque
                              </DialogDescription>
                            </DialogHeader>
                            {selectedCheck && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-4">
                                  <div className="p-4 bg-gray-50 rounded-xl">
                                    <Label className="text-lg font-bold text-gray-700">📋 Número</Label>
                                    <p className="text-xl font-mono text-gray-800">{selectedCheck.number}</p>
                                  </div>
                                  <div className="p-4 bg-gray-50 rounded-xl">
                                    <Label className="text-lg font-bold text-gray-700">📅 Fecha</Label>
                                    <p className="text-xl text-gray-800">{new Date(selectedCheck.date).toLocaleDateString('es-GT')}</p>
                                  </div>
                                  <div className="p-4 bg-gray-50 rounded-xl">
                                    <Label className="text-lg font-bold text-gray-700">👤 Para quien</Label>
                                    <p className="text-xl text-gray-800">{selectedCheck.beneficiary}</p>
                                  </div>
                                  <div className="p-4 bg-gray-50 rounded-xl">
                                    <Label className="text-lg font-bold text-gray-700">💰 Cuánto</Label>
                                    <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedCheck.amount, selectedCheck.currency)}</p>
                                  </div>
                                  <div className="p-4 bg-gray-50 rounded-xl">
                                    <Label className="text-lg font-bold text-gray-700">🏷️ Estado</Label>
                                    <div className="mt-2">{getStatusBadge(selectedCheck.status)}</div>
                                  </div>
                                  <div className="p-4 bg-gray-50 rounded-xl">
                                    <Label className="text-lg font-bold text-gray-700">💬 Para qué</Label>
                                    <p className="text-lg text-gray-800 mt-1">{selectedCheck.concept}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {check.status === 'pendiente' && (
                          <>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-12 w-12 rounded-xl bg-green-100 hover:bg-green-200 text-green-600"
                                    onClick={() => handleStatusChange(check.id, 'cobrado')}
                                    aria-label={`Marcar cheque ${check.number} como cobrado`}
                                  >
                                    <CheckCircle2 className="h-5 w-5" />
                                  </Button>
                                </motion.div>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="text-sm">✅ Marcar como cobrado/pagado</p>
                              </TooltipContent>
                            </Tooltip>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-12 w-12 rounded-xl bg-red-100 hover:bg-red-200 text-red-600"
                                        aria-label={`Anular cheque ${check.number}`}
                                      >
                                        <XCircle className="h-5 w-5" />
                                      </Button>
                                    </motion.div>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <p className="text-sm">❌ Cancelar/anular este cheque</p>
                                  </TooltipContent>
                                </Tooltip>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-2xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-2xl">🤔 ¿Cancelar este cheque?</AlertDialogTitle>
                                  <AlertDialogDescription className="text-lg">
                                    Una vez cancelado, el cheque #{check.number} no se podrá usar. 
                                    ¿Estás seguro de que quieres hacer esto?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="rounded-xl h-12 text-lg">
                                    🚫 No, mejor no
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleStatusChange(check.id, 'anulado')}
                                    className="bg-red-500 hover:bg-red-600 rounded-xl h-12 text-lg"
                                  >
                                    ❌ Sí, cancelar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {filteredChecks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-gray-50 to-slate-100">
              <CardContent className="text-center py-16">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: "spring", bounce: 0.5 }}
                  className="w-24 h-24 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6"
                >
                  <FileText className="h-12 w-12 text-gray-400" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">🤷‍♂️ ¡Ups! No encontramos nada</h3>
                <p className="text-gray-500 text-lg mb-4">
                  No hay cheques que coincidan con tu búsqueda
                </p>
                <div className="space-y-2">
                  <p className="text-gray-400">💡 Intenta con:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge className="bg-blue-100 text-blue-800">Cambiar fechas</Badge>
                    <Badge className="bg-green-100 text-green-800">Buscar otro nombre</Badge>
                    <Badge className="bg-purple-100 text-purple-800">Cambiar filtros</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </TooltipProvider>
  );
}