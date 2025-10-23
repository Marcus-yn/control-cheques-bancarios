import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Progress } from './ui/progress';
import { 
  ArrowLeft, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  FileSpreadsheet,
  Target,
  Zap,
  RefreshCw,
  Download,
  Search,
  Filter
} from 'lucide-react';

interface ReviewModuleProps {
  onNavigate: (screen: string) => void;
}

interface ReconciliationItem {
  id: number;
  numero_cheque: string;
  cuenta: string;
  beneficiario: string;
  monto: number;
  fecha_emision: string;
  estado: string;
  concepto: string;
  estado_conciliacion: string;
}

const ReviewModule: React.FC<ReviewModuleProps> = ({ onNavigate }) => {
  const [items, setItems] = useState<ReconciliationItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ReconciliationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [autoMatching, setAutoMatching] = useState(false);
  const [matchingProgress, setMatchingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos de reconciliación
  useEffect(() => {
    fetchReconciliationData();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let filtered = items;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.beneficiario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.numero_cheque.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.cuenta.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.concepto.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => 
        item.estado_conciliacion.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredItems(filtered);
  }, [items, searchTerm, statusFilter]);

  const fetchReconciliationData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/reconciliacion');
      
      if (!response.ok) {
        throw new Error('Error al cargar datos de reconciliación');
      }
      
      const data = await response.json();
      setItems(data);
      setFilteredItems(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error al cargar reconciliación:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoMatch = async () => {
    setAutoMatching(true);
    setMatchingProgress(0);

    // Simular proceso de conciliación automática
    const intervals = [20, 40, 60, 80, 100];
    
    for (let i = 0; i < intervals.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setMatchingProgress(intervals[i]);
    }

    // Simular actualización de estados
    const updatedItems = items.map(item => {
      if (item.estado === 'Cobrado' && item.estado_conciliacion === 'Pendiente') {
        return { ...item, estado_conciliacion: 'Conciliado' };
      }
      return item;
    });

    setItems(updatedItems);
    setFilteredItems(updatedItems);
    setAutoMatching(false);
    setMatchingProgress(0);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simular procesamiento de archivo CSV
      console.log('Procesando archivo:', file.name);
      // Aquí iría la lógica para procesar el archivo CSV del banco
    }
  };

  const exportReconciliation = () => {
    const headers = ['Número', 'Cuenta', 'Beneficiario', 'Monto', 'Fecha', 'Estado', 'Estado Conciliación', 'Concepto'];
    const csvData = filteredItems.map(item => [
      item.numero_cheque,
      item.cuenta,
      item.beneficiario,
      item.monto,
      item.fecha_emision,
      item.estado,
      item.estado_conciliacion,
      item.concepto
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reconciliacion_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'Conciliado': 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-300',
      'Pendiente': 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-300',
      'Sin conciliar': 'bg-red-100 text-red-800 hover:bg-red-200 border-red-300'
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
      day: '2-digit'
    });
  };

  // Calcular estadísticas
  const stats = {
    total: filteredItems.length,
    conciliados: filteredItems.filter(item => item.estado_conciliacion === 'Conciliado').length,
    pendientes: filteredItems.filter(item => item.estado_conciliacion === 'Pendiente').length,
    sinConciliar: filteredItems.filter(item => item.estado_conciliacion === 'Sin conciliar').length,
    totalMonto: filteredItems.reduce((sum, item) => sum + parseFloat(item.monto.toString()), 0)
  };

  const conciliationPercentage = stats.total > 0 ? Math.round((stats.conciliados / stats.total) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando datos de reconciliación...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => onNavigate('dashboard')}
            className="hover:bg-indigo-50 border-indigo-200 text-indigo-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Módulo de Revisión y Reconciliación
            </h1>
            <p className="text-gray-600 mt-2">Concilia automáticamente los registros bancarios</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={exportReconciliation}
            variant="outline"
            className="hover:bg-purple-50 border-purple-200 text-purple-700"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button 
            onClick={fetchReconciliationData}
            variant="outline"
            className="hover:bg-indigo-50 border-indigo-200 text-indigo-700"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Estadísticas de reconciliación */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-xl border-0 hover:shadow-2xl transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Items</CardTitle>
            <Target className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs opacity-80 mt-1">registros totales</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl border-0 hover:shadow-2xl transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Conciliados</CardTitle>
            <CheckCircle2 className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conciliados}</div>
            <p className="text-xs opacity-80 mt-1">{conciliationPercentage}% del total</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xl border-0 hover:shadow-2xl transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Pendientes</CardTitle>
            <AlertTriangle className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendientes}</div>
            <p className="text-xs opacity-80 mt-1">por revisar</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white shadow-xl border-0 hover:shadow-2xl transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Sin Conciliar</CardTitle>
            <Eye className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sinConciliar}</div>
            <p className="text-xs opacity-80 mt-1">requieren atención</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-xl border-0 hover:shadow-2xl transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Monto Total</CardTitle>
            <FileSpreadsheet className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatCurrency(stats.totalMonto)}</div>
            <p className="text-xs opacity-80 mt-1">valor total</p>
          </CardContent>
        </Card>
      </div>

      {/* Herramientas de reconciliación */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center text-lg">
              <Zap className="mr-2 h-5 w-5" />
              Conciliación Automática
            </CardTitle>
            <CardDescription className="text-indigo-100">
              Encuentra coincidencias automáticamente
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {autoMatching ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3"></div>
                  <p className="text-sm text-gray-600">Procesando coincidencias...</p>
                </div>
                <Progress value={matchingProgress} className="w-full" />
                <p className="text-xs text-center text-gray-500">{matchingProgress}% completado</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Ejecuta la conciliación automática para encontrar coincidencias entre tus registros y los del banco.
                </p>
                <Button 
                  onClick={handleAutoMatch}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Iniciar Conciliación Automática
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center text-lg">
              <Upload className="mr-2 h-5 w-5" />
              Importar Estado de Cuenta
            </CardTitle>
            <CardDescription className="text-purple-100">
              Sube el archivo CSV del banco
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Importa el estado de cuenta del banco en formato CSV para realizar la conciliación automática.
              </p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors duration-200">
                <FileSpreadsheet className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">Arrastra tu archivo CSV aquí o</p>
                <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                  <Upload className="mr-2 h-4 w-4" />
                  Seleccionar archivo
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Formatos soportados: CSV. Máximo 10MB.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">Filtros y Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar en registros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="all">Todos los estados</option>
              <option value="conciliado">Conciliado</option>
              <option value="pendiente">Pendiente</option>
              <option value="sin conciliar">Sin conciliar</option>
            </select>

            <Button 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
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

      {/* Tabla de reconciliación */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Registros de Reconciliación ({filteredItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto max-h-[600px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="font-semibold text-gray-700">Número</TableHead>
                  <TableHead className="font-semibold text-gray-700">Cuenta</TableHead>
                  <TableHead className="font-semibold text-gray-700">Beneficiario</TableHead>
                  <TableHead className="font-semibold text-gray-700">Monto</TableHead>
                  <TableHead className="font-semibold text-gray-700">Fecha</TableHead>
                  <TableHead className="font-semibold text-gray-700">Estado</TableHead>
                  <TableHead className="font-semibold text-gray-700">Conciliación</TableHead>
                  <TableHead className="font-semibold text-gray-700">Concepto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow 
                    key={item.id} 
                    className="hover:bg-indigo-50/50 transition-colors duration-150"
                  >
                    <TableCell className="font-medium text-indigo-700">
                      {item.numero_cheque}
                    </TableCell>
                    <TableCell className="text-gray-700">{item.cuenta}</TableCell>
                    <TableCell className="text-gray-700">{item.beneficiario}</TableCell>
                    <TableCell className="font-semibold text-green-700">
                      {formatCurrency(parseFloat(item.monto.toString()))}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {formatDate(item.fecha_emision)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.estado === 'Cobrado' ? 'default' : 'outline'}>
                        {item.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(item.estado_conciliacion)}
                    </TableCell>
                    <TableCell className="text-gray-600 max-w-xs truncate">
                      {item.concepto}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg">No se encontraron registros</p>
                <p className="text-gray-400 text-sm">Intenta ajustar los filtros de búsqueda</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewModule;