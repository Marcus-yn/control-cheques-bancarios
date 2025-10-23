import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { AlertCircle, Download, Filter, Search, TrendingUp, DollarSign, CreditCard, Activity, ArrowLeft, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from "./ui/alert";

interface TransactionsModuleProps {
  onNavigate: (screen: string) => void;
}

interface Transaction {
  id: number;
  numero_cheque: string;
  cuenta: string;
  beneficiario: string;
  monto: number;
  fecha_emision: string;
  estado: string;
  concepto: string;
  tipo: 'Cheque' | 'Depósito';
}

const TransactionsModule: React.FC<TransactionsModuleProps> = ({ onNavigate }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar transacciones desde la API
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3001/api/transacciones', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setTransactions(data);
        setFilteredTransactions(data);
      } else {
        throw new Error('Formato de datos inválido recibido del servidor');
      }
    } catch (err) {
      console.error('Error al cargar transacciones:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar transacciones');
      
      // Cargar datos de ejemplo si falla la API
      const mockData = [
        {
          id: 1,
          numero_cheque: 'CHK-001',
          cuenta: 'Cuenta Principal',
          beneficiario: 'Proveedor ABC',
          monto: 15000,
          fecha_emision: new Date().toISOString(),
          estado: 'Emitido',
          concepto: 'Pago de servicios',
          tipo: 'Cheque' as const
        }
      ];
      setTransactions(mockData);
      setFilteredTransactions(mockData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.beneficiario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.numero_cheque.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.cuenta.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.concepto.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(transaction => 
        transaction.estado.toLowerCase() === filterStatus.toLowerCase()
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(transaction => 
        transaction.tipo.toLowerCase() === filterType.toLowerCase()
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, filterStatus, filterType]);

  // Calcular estadísticas
  const statistics = {
    total: filteredTransactions.length,
    totalAmount: filteredTransactions.reduce((sum, t) => sum + parseFloat(t.monto.toString()), 0),
    pendingAmount: filteredTransactions
      .filter(t => t.estado === 'Emitido' || t.estado === 'Pendiente')
      .reduce((sum, t) => sum + parseFloat(t.monto.toString()), 0),
    completedAmount: filteredTransactions
      .filter(t => t.estado === 'Cobrado' || t.estado === 'Completado')
      .reduce((sum, t) => sum + parseFloat(t.monto.toString()), 0)
  };

  const exportToCSV = () => {
    const headers = ['Número', 'Cuenta', 'Beneficiario', 'Monto', 'Fecha', 'Estado', 'Concepto', 'Tipo'];
    const csvData = filteredTransactions.map(t => [
      t.numero_cheque,
      t.cuenta,
      t.beneficiario,
      t.monto,
      t.fecha_emision,
      t.estado,
      t.concepto,
      t.tipo
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transacciones_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'Emitido': 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-300',
      'Pendiente': 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300',
      'Cobrado': 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-300',
      'Completado': 'bg-green-100 text-green-800 hover:bg-green-200 border-green-300',
      'Anulado': 'bg-red-100 text-red-800 hover:bg-red-200 border-red-300',
      'Cancelado': 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300'
    };

    return (
      <Badge 
        variant="outline"
        className={`${colors[status] || 'bg-gray-100 text-gray-800'} font-medium transition-colors duration-200`}
      >
        {status}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      'Cheque': 'bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-300',
      'Depósito': 'bg-teal-100 text-teal-800 hover:bg-teal-200 border-teal-300'
    };

    return (
      <Badge 
        variant="outline"
        className={`${colors[type] || ''} font-medium transition-colors duration-200`}
      >
        {type}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando transacciones...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => onNavigate('dashboard')}
            className="hover:bg-blue-50 border-blue-200 text-blue-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Módulo de Transacciones
            </h1>
            <p className="text-gray-600 mt-2">Gestiona y analiza todas las transacciones bancarias</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={fetchTransactions}
            variant="outline"
            className="hover:bg-blue-50 border-blue-200 text-blue-700"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
          <Button 
            onClick={exportToCSV} 
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg transition-all duration-200"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Transacciones</CardTitle>
            <Activity className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total}</div>
            <p className="text-xs opacity-80 mt-1">transacciones registradas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Monto Total</CardTitle>
            <DollarSign className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${statistics.totalAmount.toLocaleString()}</div>
            <p className="text-xs opacity-80 mt-1">en todas las transacciones</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xl border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Pendientes</CardTitle>
            <TrendingUp className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${statistics.pendingAmount.toLocaleString()}</div>
            <p className="text-xs opacity-80 mt-1">en transacciones pendientes</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Completadas</CardTitle>
            <CreditCard className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${statistics.completedAmount.toLocaleString()}</div>
            <p className="text-xs opacity-80 mt-1">en transacciones completadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">Filtros y Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar transacciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="emitido">Emitido</option>
              <option value="pendiente">Pendiente</option>
              <option value="cobrado">Cobrado</option>
              <option value="completado">Completado</option>
              <option value="anulado">Anulado</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">Todos los tipos</option>
              <option value="cheque">Cheques</option>
              <option value="depósito">Depósitos</option>
            </select>

            <Button 
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterType('all');
              }}
              variant="outline"
              className="hover:bg-gray-50"
            >
              <Filter className="mr-2 h-4 w-4" />
              Limpiar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de transacciones */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Lista de Transacciones ({filteredTransactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto max-h-[600px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold text-gray-700">Número</TableHead>
                  <TableHead className="font-semibold text-gray-700">Tipo</TableHead>
                  <TableHead className="font-semibold text-gray-700">Cuenta</TableHead>
                  <TableHead className="font-semibold text-gray-700">Beneficiario</TableHead>
                  <TableHead className="font-semibold text-gray-700">Monto</TableHead>
                  <TableHead className="font-semibold text-gray-700">Fecha</TableHead>
                  <TableHead className="font-semibold text-gray-700">Estado</TableHead>
                  <TableHead className="font-semibold text-gray-700">Concepto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow 
                    key={transaction.id} 
                    className="hover:bg-blue-50/50 transition-colors duration-150"
                  >
                    <TableCell className="font-medium text-blue-700">
                      {transaction.numero_cheque}
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(transaction.tipo)}
                    </TableCell>
                    <TableCell className="text-gray-700">{transaction.cuenta}</TableCell>
                    <TableCell className="text-gray-700">{transaction.beneficiario}</TableCell>
                    <TableCell className="font-semibold text-green-700">
                      ${parseFloat(transaction.monto.toString()).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {formatDate(transaction.fecha_emision)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(transaction.estado)}
                    </TableCell>
                    <TableCell className="text-gray-600 max-w-xs truncate">
                      {transaction.concepto}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredTransactions.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg">No se encontraron transacciones</p>
                <p className="text-gray-400 text-sm">Intenta ajustar los filtros de búsqueda</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionsModule;