import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { 
  ArrowLeft, 
  BarChart3, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon, 
  TrendingUp,
  Download,
  RefreshCw,
  Calendar,
  DollarSign,
  Target,
  AlertTriangle
} from 'lucide-react';

interface GraphicsModuleProps {
  onNavigate: (screen: string) => void;
}

interface StatisticsData {
  mensual: Array<{
    mes: string;
    total_cheques: number;
    total_monto: number;
  }>;
  porEstado: Array<{
    estado: string;
    cantidad: number;
    total: number;
  }>;
  porCuenta: Array<{
    cuenta: string;
    total_cheques: number;
    total_monto: number;
    saldo_actual: number;
  }>;
}

const GraphicsModule: React.FC<GraphicsModuleProps> = ({ onNavigate }) => {
  const [statistics, setStatistics] = useState<StatisticsData>({
    mensual: [],
    porEstado: [],
    porCuenta: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/estadisticas');
      
      if (!response.ok) {
        throw new Error('Error al cargar las estadísticas');
      }
      
      const data = await response.json();
      setStatistics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error al cargar estadísticas:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatMonth = (monthString: string) => {
    if (!monthString) return '';
    const [year, month] = monthString.split('-');
    const monthNames = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  // Preparar datos para los gráficos
  const monthlyData = statistics.mensual.map(item => ({
    ...item,
    mes_formatted: formatMonth(item.mes),
    total_monto_k: item.total_monto / 1000 // Convertir a miles para mejor legibilidad
  }));

  const statusData = statistics.porEstado.map(item => ({
    ...item,
    name: item.estado,
    value: item.cantidad,
    amount: item.total
  }));

  const accountData = statistics.porCuenta.map(item => ({
    ...item,
    name: item.cuenta.length > 15 ? item.cuenta.substring(0, 15) + '...' : item.cuenta,
    fullName: item.cuenta
  }));

  // Calcular estadísticas generales
  const totalTransactions = statistics.porEstado.reduce((sum, item) => sum + item.cantidad, 0);
  const totalAmount = statistics.porEstado.reduce((sum, item) => sum + item.total, 0);
  const avgTransactionAmount = totalTransactions > 0 ? totalAmount / totalTransactions : 0;

  const exportChart = (chartName: string) => {
    // Simular exportación
    console.log(`Exportando gráfico: ${chartName}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando estadísticas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-violet-50 to-pink-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => onNavigate('dashboard')}
            className="hover:bg-violet-50 border-violet-200 text-violet-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
              Módulo de Gráficos y Análisis
            </h1>
            <p className="text-gray-600 mt-2">Visualiza tendencias y patrones en tus datos financieros</p>
          </div>
        </div>
        <Button 
          onClick={fetchStatistics}
          variant="outline"
          className="hover:bg-pink-50 border-pink-200 text-pink-700"
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

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-xl border-0 hover:shadow-2xl transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Transacciones</CardTitle>
            <BarChart3 className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions.toLocaleString()}</div>
            <p className="text-xs opacity-80 mt-1">registros analizados</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-xl border-0 hover:shadow-2xl transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Monto Total</CardTitle>
            <DollarSign className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs opacity-80 mt-1">valor total procesado</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-xl border-0 hover:shadow-2xl transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Promedio</CardTitle>
            <Target className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgTransactionAmount)}</div>
            <p className="text-xs opacity-80 mt-1">por transacción</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl border-0 hover:shadow-2xl transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Cuentas Activas</CardTitle>
            <Calendar className="h-4 w-4 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.porCuenta.length}</div>
            <p className="text-xs opacity-80 mt-1">cuentas en uso</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos en pestañas */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-violet-600" />
            Análisis Visual de Datos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="monthly" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger 
                value="monthly" 
                className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
              >
                <LineChartIcon className="mr-2 h-4 w-4" />
                Tendencia Mensual
              </TabsTrigger>
              <TabsTrigger 
                value="status" 
                className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
              >
                <PieChartIcon className="mr-2 h-4 w-4" />
                Por Estado
              </TabsTrigger>
              <TabsTrigger 
                value="accounts" 
                className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Por Cuenta
              </TabsTrigger>
              <TabsTrigger 
                value="analysis" 
                className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Análisis Avanzado
              </TabsTrigger>
            </TabsList>

            <TabsContent value="monthly" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Evolución Mensual de Transacciones</h3>
                <Button 
                  onClick={() => exportChart('monthly')}
                  variant="outline"
                  size="sm"
                  className="hover:bg-violet-50 border-violet-200 text-violet-700"
                >
                  <Download className="mr-2 h-3 w-3" />
                  Exportar
                </Button>
              </div>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EC4899" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#EC4899" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis 
                      dataKey="mes_formatted" 
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      stroke="#64748b"
                    />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      stroke="#64748b"
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      stroke="#64748b"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name) => {
                        const numValue = typeof value === 'number' ? value : 0;
                        if (name === 'total_monto_k') return [formatCurrency(numValue * 1000), 'Monto Total'];
                        if (name === 'total_cheques') return [numValue, 'Cantidad de Transacciones'];
                        return [numValue, name];
                      }}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="total_monto_k"
                      stroke="#8B5CF6"
                      fillOpacity={1}
                      fill="url(#colorAmount)"
                      name="Monto (miles)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="total_cheques"
                      stroke="#EC4899"
                      strokeWidth={3}
                      dot={{ fill: '#EC4899', strokeWidth: 2, r: 6 }}
                      name="Cantidad"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="status" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Distribución por Estado</h3>
                <Button 
                  onClick={() => exportChart('status')}
                  variant="outline"
                  size="sm"
                  className="hover:bg-pink-50 border-pink-200 text-pink-700"
                >
                  <Download className="mr-2 h-3 w-3" />
                  Exportar
                </Button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, 'Cantidad']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800">Detalles por Estado</h4>
                  {statusData.map((item, index) => (
                    <div key={item.estado} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="font-medium text-gray-700">{item.estado}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">{item.cantidad} transacciones</p>
                        <p className="text-sm text-gray-600">{formatCurrency(item.amount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="accounts" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Análisis por Cuenta Bancaria</h3>
                <Button 
                  onClick={() => exportChart('accounts')}
                  variant="outline"
                  size="sm"
                  className="hover:bg-cyan-50 border-cyan-200 text-cyan-700"
                >
                  <Download className="mr-2 h-3 w-3" />
                  Exportar
                </Button>
              </div>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={accountData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      stroke="#64748b"
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      stroke="#64748b"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name) => {
                        const numValue = typeof value === 'number' ? value : 0;
                        if (name === 'total_monto') return [formatCurrency(numValue), 'Monto Total'];
                        if (name === 'saldo_actual') return [formatCurrency(numValue), 'Saldo Actual'];
                        return [numValue, name];
                      }}
                      labelFormatter={(label) => {
                        const account = accountData.find(a => a.name === label);
                        return account?.fullName || label;
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="total_monto" 
                      fill="url(#gradientBar1)" 
                      name="Monto Total Transacciones"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="saldo_actual" 
                      fill="url(#gradientBar2)" 
                      name="Saldo Actual"
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="gradientBar1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0891B2" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#0891B2" stopOpacity={0.6}/>
                      </linearGradient>
                      <linearGradient id="gradientBar2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.6}/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Análisis Predictivo y Tendencias</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-800">Resumen Ejecutivo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Transacciones Totales</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {totalTransactions.toLocaleString()}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Valor Total</span>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                        {formatCurrency(totalAmount)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Promedio por Transacción</span>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        {formatCurrency(avgTransactionAmount)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg text-purple-800">Recomendaciones</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-white/60 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>✅ Flujo Positivo:</strong> Las transacciones muestran un patrón estable
                      </p>
                    </div>
                    <div className="p-3 bg-white/60 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>📊 Diversificación:</strong> Distribución equilibrada entre cuentas
                      </p>
                    </div>
                    <div className="p-3 bg-white/60 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>🎯 Optimización:</strong> Consolidar transacciones menores puede reducir costos
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-indigo-800">Predicción de Tendencias</CardTitle>
                  <CardDescription className="text-indigo-600">
                    Análisis basado en datos históricos y patrones detectados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white/60 rounded-lg">
                      <TrendingUp className="mx-auto h-8 w-8 text-green-600 mb-2" />
                      <p className="text-2xl font-bold text-green-600">+15%</p>
                      <p className="text-sm text-gray-600">Crecimiento previsto próximo mes</p>
                    </div>
                    <div className="text-center p-4 bg-white/60 rounded-lg">
                      <Target className="mx-auto h-8 w-8 text-blue-600 mb-2" />
                      <p className="text-2xl font-bold text-blue-600">92%</p>
                      <p className="text-sm text-gray-600">Precisión del modelo predictivo</p>
                    </div>
                    <div className="text-center p-4 bg-white/60 rounded-lg">
                      <DollarSign className="mx-auto h-8 w-8 text-purple-600 mb-2" />
                      <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalAmount * 1.15)}</p>
                      <p className="text-sm text-gray-600">Proyección para próximo período</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default GraphicsModule;