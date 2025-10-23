import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  FileText, 
  Download,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Wallet,
  RefreshCw,
  Eye,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface TransactionsModuleProps {
  onNavigate: (screen: string) => void;
}

interface Transaction {
  id: number;
  type: 'cheque' | 'deposit';
  date: string;
  description: string;
  beneficiary?: string;
  amount: number;
  account: string;
  accountId: number;
  status: 'completed' | 'pending' | 'cancelled';
  reference: string;
  concept: string;
  checkNumber?: string;
}

interface Account {
  id: number;
  name: string;
  number: string;
  bank: string;
  balance: number;
  currency: string;
}

const mockAccounts: Account[] = [
  { id: 1, name: 'Cuenta Principal', number: 'BAM-12345678', bank: 'BANCO AGROMERCANTIL', balance: 387500, currency: 'GTQ' },
  { id: 2, name: 'Cuenta Operativa', number: 'BI-87654321', bank: 'BANCO INDUSTRIAL', balance: 125000, currency: 'GTQ' },
  { id: 3, name: 'Cuenta Dólares', number: 'BAM-USD-11111', bank: 'BANCO AGROMERCANTIL', balance: 45000, currency: 'USD' }
];

export function TransactionsModule({ onNavigate }: TransactionsModuleProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('2024-01-01');
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const formatCurrency = (amount: number, currency: string = 'GTQ') => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  // Simular carga de datos desde la API
  const loadTransactions = async () => {
    setLoading(true);
    try {
      // Simular llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockTransactions: Transaction[] = [
        {
          id: 1,
          type: 'cheque',
          date: '2024-10-22',
          description: 'Pago a proveedores',
          beneficiary: 'Proveedores Guatemala S.A.',
          amount: -15000,
          account: 'Cuenta Principal',
          accountId: 1,
          status: 'completed',
          reference: 'CHQ-001245',
          concept: 'Compra de materiales de oficina',
          checkNumber: '001245'
        },
        {
          id: 2,
          type: 'deposit',
          date: '2024-10-21',
          description: 'Depósito de ventas',
          amount: 25000,
          account: 'Cuenta Principal',
          accountId: 1,
          status: 'completed',
          reference: 'DEP-001',
          concept: 'Ventas del mes de octubre'
        },
        {
          id: 3,
          type: 'cheque',
          date: '2024-10-20',
          description: 'Pago de nómina',
          beneficiary: 'Empleados',
          amount: -45000,
          account: 'Cuenta Operativa',
          accountId: 2,
          status: 'completed',
          reference: 'CHQ-001244',
          concept: 'Nómina quincena octubre',
          checkNumber: '001244'
        },
        {
          id: 4,
          type: 'deposit',
          date: '2024-10-19',
          description: 'Transferencia recibida',
          amount: 18000,
          account: 'Cuenta Dólares',
          accountId: 3,
          status: 'pending',
          reference: 'TRF-001',
          concept: 'Transferencia internacional'
        },
        {
          id: 5,
          type: 'cheque',
          date: '2024-10-18',
          description: 'Servicios técnicos',
          beneficiary: 'Soporte IT Guatemala',
          amount: -8500,
          account: 'Cuenta Principal',
          accountId: 1,
          status: 'pending',
          reference: 'CHQ-001243',
          concept: 'Mantenimiento de sistemas',
          checkNumber: '001243'
        }
      ];
      
      setTransactions(mockTransactions);
      toast.success('Transacciones cargadas correctamente');
    } catch (error) {
      toast.error('Error al cargar las transacciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [selectedAccount, dateFrom, dateTo]);

  // Filtrar transacciones
  const filteredTransactions = transactions.filter(transaction => {
    const matchesAccount = selectedAccount === 'all' || transaction.accountId.toString() === selectedAccount;
    const matchesSearch = searchTerm === '' || 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.beneficiary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    const matchesDate = transaction.date >= dateFrom && transaction.date <= dateTo;
    
    return matchesAccount && matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  // Calcular estadísticas
  const totalIncome = filteredTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = filteredTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const netFlow = totalIncome - totalExpenses;
  const transactionCount = filteredTransactions.length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendiente</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string, amount: number) => {
    if (type === 'deposit' || amount > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    }
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const exportToCSV = () => {
    const headers = ['Fecha', 'Tipo', 'Descripción', 'Beneficiario', 'Cuenta', 'Monto', 'Estado', 'Referencia'];
    const csvData = filteredTransactions.map(t => [
      t.date,
      t.type === 'deposit' ? 'Depósito' : 'Cheque',
      t.description,
      t.beneficiary || '-',
      t.account,
      t.amount,
      t.status,
      t.reference
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transacciones_${dateFrom}_${dateTo}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Reporte CSV descargado correctamente');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => onNavigate('dashboard')}
          className="rounded-lg"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-semibold flex items-center gap-3">
            <FileText className="h-8 w-8 text-orange-500" />
            Transacciones
          </h1>
          <p className="text-muted-foreground mt-1">
            Notas y movimientos de todas las cuentas bancarias
          </p>
        </div>
        <Button
          onClick={loadTransactions}
          variant="outline"
          disabled={loading}
          className="rounded-lg"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-xl border-l-4 border-l-blue-500">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Total Movimientos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{transactionCount}</div>
            <p className="text-sm text-muted-foreground">En el período seleccionado</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-l-4 border-l-green-500">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Total Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-sm text-muted-foreground">Depósitos y abonos</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-l-4 border-l-red-500">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Total Egresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-sm text-muted-foreground">Cheques emitidos</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-l-4 border-l-purple-500">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-500" />
              Flujo Neto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netFlow)}
            </div>
            <p className="text-sm text-muted-foreground">
              {netFlow >= 0 ? 'Positivo' : 'Negativo'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
          <CardDescription>
            Configure los parámetros para personalizar la vista de transacciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Descripción, beneficiario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cuenta</Label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las cuentas</SelectItem>
                  {accounts.map(account => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="deposit">Depósitos</SelectItem>
                  <SelectItem value="cheque">Cheques</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFrom">Desde</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo">Hasta</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-lg"
              />
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button
              onClick={exportToCSV}
              variant="outline"
              className="rounded-lg"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lista de Transacciones</span>
            <Badge variant="outline" className="text-sm">
              {filteredTransactions.length} registros
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Cargando transacciones...</span>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No se encontraron transacciones</h3>
              <p className="text-muted-foreground">
                Intente ajustar los filtros o el rango de fechas
              </p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Fecha</TableHead>
                    <TableHead className="font-semibold">Tipo</TableHead>
                    <TableHead className="font-semibold">Descripción</TableHead>
                    <TableHead className="font-semibold">Cuenta</TableHead>
                    <TableHead className="font-semibold text-right">Monto</TableHead>
                    <TableHead className="font-semibold">Estado</TableHead>
                    <TableHead className="font-semibold">Referencia</TableHead>
                    <TableHead className="font-semibold w-20">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">
                        {formatDate(transaction.date)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(transaction.type, transaction.amount)}
                          <span className="capitalize">
                            {transaction.type === 'deposit' ? 'Depósito' : 'Cheque'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          {transaction.beneficiary && (
                            <p className="text-sm text-muted-foreground">
                              {transaction.beneficiary}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Wallet className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{transaction.account}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-mono font-semibold ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}
                          {formatCurrency(Math.abs(transaction.amount))}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-sm">
                          {transaction.reference}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            toast.info(`Detalles de: ${transaction.description}`);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}