import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  ArrowLeft, 
  Save, 
  CreditCard, 
  Calculator,
  Wallet,
  DollarSign,
  Calendar,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Banknote,
  Building,
  ArrowUpCircle,
  RefreshCw
} from 'lucide-react';

interface DepositModuleProps {
  onNavigate: (screen: string) => void;
}

interface Account {
  id: number;
  nombre: string;
  banco: string;
  saldo_actual: number;
}

interface Deposit {
  id: number;
  cuenta_id: number;
  numero_deposito: string;
  depositante: string;
  monto: number;
  tipo_deposito: string;
  descripcion: string;
  fecha_deposito: string;
  cuenta_nombre: string;
  saldo_actual: number;
}

const DepositModule: React.FC<DepositModuleProps> = ({ onNavigate }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDeposits, setLoadingDeposits] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    cuenta_id: '',
    numero_deposito: '',
    depositante: '',
    monto: '',
    tipo_deposito: 'efectivo',
    descripcion: ''
  });

  const depositTypes = [
    { value: 'efectivo', label: 'Efectivo', icon: <Banknote className="h-4 w-4" />, color: 'bg-green-100 text-green-800' },
    { value: 'cheque', label: 'Cheque', icon: <FileText className="h-4 w-4" />, color: 'bg-blue-100 text-blue-800' },
    { value: 'transferencia', label: 'Transferencia', icon: <ArrowUpCircle className="h-4 w-4" />, color: 'bg-purple-100 text-purple-800' },
    { value: 'tarjeta', label: 'Tarjeta', icon: <CreditCard className="h-4 w-4" />, color: 'bg-orange-100 text-orange-800' },
    { value: 'otros', label: 'Otros', icon: <Wallet className="h-4 w-4" />, color: 'bg-gray-100 text-gray-800' }
  ];

  // Cargar cuentas y depósitos
  useEffect(() => {
    fetchAccounts();
    fetchDeposits();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/cuentas');
      if (!response.ok) throw new Error('Error al cargar cuentas');
      const data = await response.json();
      setAccounts(data);
    } catch (err) {
      setError('Error al cargar las cuentas bancarias');
      console.error(err);
    }
  };

  const fetchDeposits = async () => {
    try {
      setLoadingDeposits(true);
      const response = await fetch('http://localhost:3001/api/depositos');
      if (!response.ok) throw new Error('Error al cargar depósitos');
      const data = await response.json();
      setDeposits(data);
    } catch (err) {
      setError('Error al cargar los depósitos');
      console.error(err);
    } finally {
      setLoadingDeposits(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cuenta_id || !formData.numero_deposito || !formData.depositante || !formData.monto) {
      setError('Por favor complete todos los campos obligatorios');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/depositos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          monto: parseFloat(formData.monto)
        }),
      });

      if (!response.ok) {
        throw new Error('Error al registrar el depósito');
      }

      // Limpiar formulario
      setFormData({
        cuenta_id: '',
        numero_deposito: '',
        depositante: '',
        monto: '',
        tipo_deposito: 'efectivo',
        descripcion: ''
      });

      // Recargar datos
      await fetchAccounts();
      await fetchDeposits();

      // Mostrar éxito
      setError(null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDepositTypeInfo = (type: string) => {
    return depositTypes.find(t => t.value === type) || depositTypes[0];
  };

  const totalDepositsAmount = deposits.reduce((sum, deposit) => sum + parseFloat(deposit.monto.toString()), 0);

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-emerald-50 to-teal-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => onNavigate('dashboard')}
            className="hover:bg-emerald-50 border-emerald-200 text-emerald-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Módulo de Depósitos
            </h1>
            <p className="text-gray-600 mt-2">Registra y gestiona depósitos bancarios</p>
          </div>
        </div>
        <Button 
          onClick={fetchDeposits}
          variant="outline"
          className="hover:bg-teal-50 border-teal-200 text-teal-700"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl border-0 hover:shadow-2xl transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Depósitos</CardTitle>
            <ArrowUpCircle className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deposits.length}</div>
            <p className="text-xs opacity-80 mt-1">depósitos registrados</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-xl border-0 hover:shadow-2xl transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Monto Total</CardTitle>
            <DollarSign className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalDepositsAmount)}</div>
            <p className="text-xs opacity-80 mt-1">en depósitos totales</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl border-0 hover:shadow-2xl transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Cuentas Activas</CardTitle>
            <Building className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accounts.length}</div>
            <p className="text-xs opacity-80 mt-1">cuentas disponibles</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de nuevo depósito */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center text-lg">
              <Save className="mr-2 h-5 w-5" />
              Registrar Nuevo Depósito
            </CardTitle>
            <CardDescription className="text-emerald-100">
              Complete la información del depósito
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cuenta_id" className="text-sm font-medium text-gray-700">
                    Cuenta Bancaria *
                  </Label>
                  <select
                    id="cuenta_id"
                    value={formData.cuenta_id}
                    onChange={(e) => setFormData({...formData, cuenta_id: e.target.value})}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  >
                    <option value="">Seleccionar cuenta</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.nombre} - {account.banco} (Saldo: {formatCurrency(account.saldo_actual)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="numero_deposito" className="text-sm font-medium text-gray-700">
                    Número de Depósito *
                  </Label>
                  <Input
                    id="numero_deposito"
                    value={formData.numero_deposito}
                    onChange={(e) => setFormData({...formData, numero_deposito: e.target.value})}
                    placeholder="DEP-001"
                    className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="depositante" className="text-sm font-medium text-gray-700">
                    Depositante *
                  </Label>
                  <Input
                    id="depositante"
                    value={formData.depositante}
                    onChange={(e) => setFormData({...formData, depositante: e.target.value})}
                    placeholder="Nombre del depositante"
                    className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="monto" className="text-sm font-medium text-gray-700">
                    Monto *
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="monto"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.monto}
                      onChange={(e) => setFormData({...formData, monto: e.target.value})}
                      placeholder="0.00"
                      className="pl-10 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="tipo_deposito" className="text-sm font-medium text-gray-700">
                  Tipo de Depósito
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2">
                  {depositTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({...formData, tipo_deposito: type.value})}
                      className={`p-3 border rounded-lg flex flex-col items-center space-y-1 transition-all duration-200 ${
                        formData.tipo_deposito === type.value
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {type.icon}
                      <span className="text-xs font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="descripcion" className="text-sm font-medium text-gray-700">
                  Descripción / Concepto
                </Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  placeholder="Descripción del depósito..."
                  className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                  rows={3}
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg transition-all duration-200"
              >
                {loading ? (
                  <>
                    <Calculator className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Registrar Depósito
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista de depósitos recientes */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
              <FileText className="mr-2 h-5 w-5 text-teal-600" />
              Depósitos Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingDeposits ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                <span className="ml-3 text-gray-600">Cargando depósitos...</span>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-auto">
                {deposits.slice(0, 10).map((deposit) => {
                  const typeInfo = getDepositTypeInfo(deposit.tipo_deposito);
                  return (
                    <div
                      key={deposit.id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-emerald-50/50 transition-colors duration-150"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-emerald-700">{deposit.numero_deposito}</span>
                            <Badge className={`${typeInfo.color} border-0`}>
                              {typeInfo.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Depositante:</strong> {deposit.depositante}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Cuenta:</strong> {deposit.cuenta_nombre}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Fecha:</strong> {formatDate(deposit.fecha_deposito)}
                          </p>
                          {deposit.descripcion && (
                            <p className="text-sm text-gray-500 mt-2 italic">
                              {deposit.descripcion}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-emerald-700">
                            {formatCurrency(parseFloat(deposit.monto.toString()))}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {deposits.length === 0 && (
                  <div className="text-center py-8">
                    <Wallet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600">No hay depósitos registrados</p>
                    <p className="text-gray-400 text-sm">Los depósitos aparecerán aquí una vez registrados</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabla completa de depósitos */}
      {deposits.length > 0 && (
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Historial Completo de Depósitos ({deposits.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="font-semibold text-gray-700">Número</TableHead>
                    <TableHead className="font-semibold text-gray-700">Depositante</TableHead>
                    <TableHead className="font-semibold text-gray-700">Cuenta</TableHead>
                    <TableHead className="font-semibold text-gray-700">Tipo</TableHead>
                    <TableHead className="font-semibold text-gray-700">Monto</TableHead>
                    <TableHead className="font-semibold text-gray-700">Fecha</TableHead>
                    <TableHead className="font-semibold text-gray-700">Descripción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deposits.map((deposit) => {
                    const typeInfo = getDepositTypeInfo(deposit.tipo_deposito);
                    return (
                      <TableRow 
                        key={deposit.id} 
                        className="hover:bg-emerald-50/50 transition-colors duration-150"
                      >
                        <TableCell className="font-medium text-emerald-700">
                          {deposit.numero_deposito}
                        </TableCell>
                        <TableCell className="text-gray-700">{deposit.depositante}</TableCell>
                        <TableCell className="text-gray-700">{deposit.cuenta_nombre}</TableCell>
                        <TableCell>
                          <Badge className={`${typeInfo.color} border-0`}>
                            {typeInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-emerald-700">
                          {formatCurrency(parseFloat(deposit.monto.toString()))}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {formatDate(deposit.fecha_deposito)}
                        </TableCell>
                        <TableCell className="text-gray-600 max-w-xs truncate">
                          {deposit.descripcion || '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DepositModule;