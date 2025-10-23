import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  ArrowLeft, 
  BarChart3, 
  PieChart, 
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  DollarSign,
  Target,
  Zap,
  Eye
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Cell, 
  Pie,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts';
import { toast } from 'sonner';

interface GraphicsModuleProps {
  onNavigate: (screen: string) => void;
}

interface ChartData {
  month: string;
  cheques: number;
  depositos: number;
  totalEgresos: number;
  totalIngresos: number;
  netFlow: number;
}

interface StatusData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface BeneficiaryData {
  name: string;
  amount: number;
  count: number;
  percentage: number;
}

interface Account {
  id: number;
  name: string;
  balance: number;
  currency: string;
}

const mockAccounts: Account[] = [
  { id: 1, name: 'Cuenta Principal', balance: 387500, currency: 'GTQ' },
  { id: 2, name: 'Cuenta Operativa', balance: 125000, currency: 'GTQ' },
  { id: 3, name: 'Cuenta Dólares', balance: 45000, currency: 'USD' }
];

export function GraphicsModule({ onNavigate }: GraphicsModuleProps) {
  const [dateFrom, setDateFrom] = useState('2024-01-01');
  const [dateTo, setDateTo] = useState('2024-10-31');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [beneficiaryData, setBeneficiaryData] = useState<BeneficiaryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('amount');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const loadChartData = async () => {
    setLoading(true);
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockChartData: ChartData[] = [
        { 
          month: 'Ene', 
          cheques: 45, 
          depositos: 12, 
          totalEgresos: 180000, 
          totalIngresos: 250000,
          netFlow: 70000
        },
        { 
          month: 'Feb', 
          cheques: 52, 
          depositos: 15, 
          totalEgresos: 195000, 
          totalIngresos: 280000,
          netFlow: 85000
        },
        { 
          month: 'Mar', 
          cheques: 38, 
          depositos: 18, 
          totalEgresos: 165000, 
          totalIngresos: 320000,
          netFlow: 155000
        },
        { 
          month: 'Abr', 
          cheques: 42, 
          depositos: 14, 
          totalEgresos: 172000, 
          totalIngresos: 290000,
          netFlow: 118000
        },
        { 
          month: 'May', 
          cheques: 47, 
          depositos: 16, 
          totalEgresos: 188000, 
          totalIngresos: 310000,
          netFlow: 122000
        },
        { 
          month: 'Jun', 
          cheques: 41, 
          depositos: 13, 
          totalEgresos: 175000, 
          totalIngresos: 275000,
          netFlow: 100000
        },
        { 
          month: 'Jul', 
          cheques: 55, 
          depositos: 20, 
          totalEgresos: 210000, 
          totalIngresos: 340000,
          netFlow: 130000
        },
        { 
          month: 'Ago', 
          cheques: 48, 
          depositos: 17, 
          totalEgresos: 192000, 
          totalIngresos: 315000,
          netFlow: 123000
        },
        { 
          month: 'Sep', 
          cheques: 39, 
          depositos: 22, 
          totalEgresos: 158000, 
          totalIngresos: 380000,
          netFlow: 222000
        },
        { 
          month: 'Oct', 
          cheques: 44, 
          depositos: 19, 
          totalEgresos: 176000, 
          totalIngresos: 325000,
          netFlow: 149000
        }
      ];
      
      const mockStatusData: StatusData[] = [
        { name: 'Cobrados', value: 387, color: '#10B981', percentage: 89.4 },
        { name: 'Pendientes', value: 34, color: '#F59E0B', percentage: 7.8 },
        { name: 'Anulados', value: 12, color: '#EF4444', percentage: 2.8 }
      ];
      
      const mockBeneficiaryData: BeneficiaryData[] = [
        { name: 'Proveedores Guatemala S.A.', amount: 185000, count: 22, percentage: 28.5 },
        { name: 'Nómina Empleados', amount: 175000, count: 18, percentage: 27.0 },
        { name: 'Servicios Generales', amount: 95000, count: 35, percentage: 14.6 },
        { name: 'Transportes Unidos', amount: 85000, count: 25, percentage: 13.1 },
        { name: 'Suministros de Oficina', amount: 65000, count: 28, percentage: 10.0 },
        { name: 'Otros Beneficiarios', amount: 43000, count: 15, percentage: 6.8 }
      ];
      
      setChartData(mockChartData);
      setStatusData(mockStatusData);
      setBeneficiaryData(mockBeneficiaryData);
      
      toast.success('Datos de gráficos cargados correctamente');
    } catch (error) {
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChartData();
  }, [dateFrom, dateTo, selectedAccount]);

  // Calcular totales
  const totalMovements = chartData.reduce((sum, month) => sum + month.cheques + month.depositos, 0);
  const totalIngresos = chartData.reduce((sum, month) => sum + month.totalIngresos, 0);
  const totalEgresos = chartData.reduce((sum, month) => sum + month.totalEgresos, 0);
  const netFlow = totalIngresos - totalEgresos;
  const avgMonthlyFlow = netFlow / (chartData.length || 1);

  const exportChart = (chartType: string) => {
    toast.success(`Gráfico de ${chartType} exportado correctamente`);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${
                entry.name.includes('total') || entry.name.includes('Flow') 
                  ? formatCurrency(entry.value)
                  : entry.value
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
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
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            Ver Gráficos
          </h1>
          <p className="text-muted-foreground mt-1">
            Reportes y estadísticas visuales de todas las transacciones
          </p>
        </div>
        <Button
          onClick={loadChartData}
          variant="outline"
          disabled={loading}
          className="rounded-lg"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-xl border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-blue-100">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
              <Target className="h-5 w-5" />
              Total Movimientos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalMovements}</div>
            <p className="text-sm text-blue-600/80">En el período seleccionado</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-green-100">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-green-700">
              <TrendingUp className="h-5 w-5" />
              Total Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatNumber(totalIngresos)}
            </div>
            <p className="text-sm text-green-600/80">{formatCurrency(totalIngresos)}</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-red-100">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-red-700">
              <TrendingDown className="h-5 w-5" />
              Total Egresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {formatNumber(totalEgresos)}
            </div>
            <p className="text-sm text-red-600/80">{formatCurrency(totalEgresos)}</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-purple-100">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-purple-700">
              <Zap className="h-5 w-5" />
              Flujo Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${avgMonthlyFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatNumber(avgMonthlyFlow)}
            </div>
            <p className="text-sm text-purple-600/80">
              {formatCurrency(avgMonthlyFlow)} / mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="rounded-xl border-2 border-teal-200 bg-teal-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-teal-700">
            <Filter className="h-5 w-5" />
            Filtros de Análisis
          </CardTitle>
          <CardDescription>
            Configure el período y parámetros para personalizar los gráficos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Fecha Desde</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo">Fecha Hasta</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label>Cuenta</Label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las Cuentas</SelectItem>
                  {mockAccounts.map(account => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Métrica</Label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amount">Montos</SelectItem>
                  <SelectItem value="count">Cantidad</SelectItem>
                  <SelectItem value="flow">Flujo Neto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 rounded-lg">
          <TabsTrigger value="trends" className="rounded-lg">Tendencias</TabsTrigger>
          <TabsTrigger value="distribution" className="rounded-lg">Distribución</TabsTrigger>
          <TabsTrigger value="beneficiaries" className="rounded-lg">Beneficiarios</TabsTrigger>
          <TabsTrigger value="advanced" className="rounded-lg">Avanzados</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Flujo de Efectivo */}
            <Card className="rounded-xl">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-teal-600" />
                      Flujo de Efectivo Mensual
                    </CardTitle>
                    <CardDescription>
                      Comparación de ingresos vs egresos por mes
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => exportChart('Flujo de Efectivo')}
                    className="rounded-lg"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-80 flex items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="colorEgresos" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="month" 
                          className="text-muted-foreground"
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          className="text-muted-foreground"
                          tick={{ fontSize: 12 }}
                          tickFormatter={formatNumber}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                          type="monotone" 
                          dataKey="totalIngresos" 
                          stroke="#10B981" 
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorIngresos)"
                          name="Ingresos"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="totalEgresos" 
                          stroke="#EF4444" 
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorEgresos)"
                          name="Egresos"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cantidad de Movimientos */}
            <Card className="rounded-xl">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      Cantidad de Movimientos
                    </CardTitle>
                    <CardDescription>
                      Número de cheques y depósitos por mes
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => exportChart('Cantidad de Movimientos')}
                    className="rounded-lg"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-80 flex items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="month" 
                          className="text-muted-foreground"
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          className="text-muted-foreground"
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="cheques" fill="#3B82F6" name="Cheques" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="depositos" fill="#10B981" name="Depósitos" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Flujo Neto */}
          <Card className="rounded-xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                    Flujo Neto Mensual
                  </CardTitle>
                  <CardDescription>
                    Diferencia entre ingresos y egresos (Ingresos - Egresos)
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportChart('Flujo Neto')}
                  className="rounded-lg"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-80 flex items-center justify-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="month" 
                        className="text-muted-foreground"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        className="text-muted-foreground"
                        tick={{ fontSize: 12 }}
                        tickFormatter={formatNumber}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="netFlow" 
                        stroke="#8B5CF6" 
                        strokeWidth={3}
                        dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 5 }}
                        activeDot={{ r: 7, fill: '#8B5CF6' }}
                        name="Flujo Neto"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Estado de Cheques */}
            <Card className="rounded-xl">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-orange-600" />
                      Estado de Cheques
                    </CardTitle>
                    <CardDescription>
                      Distribución por estado actual
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => exportChart('Estado de Cheques')}
                    className="rounded-lg"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-80 flex items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          dataKey="value"
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          label={({name, percentage}) => `${name}: ${percentage}%`}
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => [value, 'Cantidad']} />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div className="flex flex-wrap gap-4 mt-4">
                  {statusData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas Radiales */}
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-indigo-600" />
                  Métricas de Rendimiento
                </CardTitle>
                <CardDescription>
                  Indicadores clave de gestión financiera
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-80 flex items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-2xl font-bold text-green-600">95.2%</p>
                        <p className="text-sm text-muted-foreground">Tasa de Cobro</p>
                        <Badge className="mt-1 bg-green-100 text-green-800">Excelente</Badge>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-2xl font-bold text-blue-600">2.3</p>
                        <p className="text-sm text-muted-foreground">Días Prom. Cobro</p>
                        <Badge className="mt-1 bg-blue-100 text-blue-800">Rápido</Badge>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-2xl font-bold text-yellow-600">1.8%</p>
                        <p className="text-sm text-muted-foreground">Cheques Anulados</p>
                        <Badge className="mt-1 bg-yellow-100 text-yellow-800">Bajo</Badge>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-2xl font-bold text-purple-600">87.4%</p>
                        <p className="text-sm text-muted-foreground">Eficiencia</p>
                        <Badge className="mt-1 bg-purple-100 text-purple-800">Alta</Badge>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-3">Resumen del Período</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Promedio Mensual:</span>
                          <Badge variant="outline">{Math.round(totalMovements / 10)} mov.</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Mayor Ingreso:</span>
                          <Badge className="bg-green-100 text-green-800">{formatCurrency(52000)}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Mayor Egreso:</span>
                          <Badge className="bg-red-100 text-red-800">{formatCurrency(45000)}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="beneficiaries" className="space-y-6">
          <Card className="rounded-xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Top Beneficiarios</CardTitle>
                  <CardDescription>
                    Clasificación por monto total de cheques emitidos
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportChart('Top Beneficiarios')}
                  className="rounded-lg"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-80 flex items-center justify-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-4">
                  {beneficiaryData.map((beneficiary, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{beneficiary.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {beneficiary.count} cheques emitidos
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-semibold text-lg">
                          {formatCurrency(beneficiary.amount)}
                        </p>
                        <Badge variant="outline" className="mt-1">
                          {beneficiary.percentage}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Análisis Predictivo */}
            <Card className="rounded-xl border-2 border-indigo-200 bg-indigo-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-700">
                  <Eye className="h-5 w-5" />
                  Análisis Predictivo
                </CardTitle>
                <CardDescription>
                  Proyecciones basadas en tendencias históricas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-white rounded-lg border border-indigo-200">
                  <h4 className="font-medium mb-2">Proyección Próximo Mes</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Ingresos Estimados:</p>
                      <p className="font-semibold text-green-600">{formatCurrency(335000)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Egresos Estimados:</p>
                      <p className="font-semibold text-red-600">{formatCurrency(185000)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-white rounded-lg border border-indigo-200">
                  <h4 className="font-medium mb-2">Tendencias Detectadas</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span>Ingresos en crecimiento (+12% vs mes anterior)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-yellow-600" />
                      <span>Egresos estables (-2% vs promedio)</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-lg border border-indigo-200">
                  <h4 className="font-medium mb-2">Recomendaciones</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>• Mantener el nivel actual de gastos</p>
                    <p>• Considerar inversión en crecimiento</p>
                    <p>• Revisar proveedores de alto volumen</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comparativas */}
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Comparativas Temporales
                </CardTitle>
                <CardDescription>
                  Comparación con períodos anteriores
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">vs Período Anterior</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Ingresos:</span>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-green-600 font-semibold">+15.2%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Egresos:</span>
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 text-red-600" />
                          <span className="text-red-600 font-semibold">+3.8%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Flujo Neto:</span>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-green-600 font-semibold">+28.4%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">vs Mismo Período Año Anterior</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Crecimiento:</span>
                        <Badge className="bg-green-100 text-green-800">+22.5%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Eficiencia:</span>
                        <Badge className="bg-blue-100 text-blue-800">+8.1%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Rentabilidad:</span>
                        <Badge className="bg-purple-100 text-purple-800">+18.7%</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}