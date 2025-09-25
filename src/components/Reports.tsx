import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Download, 
  FileText, 
  TrendingUp, 
  Calendar,
  ArrowLeft,
  BarChart3,
  PieChart
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';
import { toast } from 'sonner@2.0.3';

interface ReportsProps {
  onNavigate: (screen: string) => void;
}

const mockReportData = {
  monthly: [
    { month: 'Ene', cheques: 45, depositos: 12, totalEgresos: 180000, totalIngresos: 250000 },
    { month: 'Feb', cheques: 52, depositos: 15, totalEgresos: 195000, totalIngresos: 280000 },
    { month: 'Mar', cheques: 38, depositos: 18, totalEgresos: 165000, totalIngresos: 320000 },
    { month: 'Abr', cheques: 42, depositos: 14, totalEgresos: 172000, totalIngresos: 290000 },
    { month: 'May', cheques: 47, depositos: 16, totalEgresos: 188000, totalIngresos: 310000 },
    { month: 'Jun', cheques: 41, depositos: 13, totalEgresos: 175000, totalIngresos: 275000 }
  ],
  byBeneficiary: [
    { name: 'Proveedores Guatemala S.A.', amount: 85000, count: 12, percentage: 32 },
    { name: 'Nómina Empleados', amount: 75000, count: 8, percentage: 28 },
    { name: 'Servicios Generales', amount: 45000, count: 15, percentage: 17 },
    { name: 'Transportes', amount: 35000, count: 10, percentage: 13 },
    { name: 'Otros', amount: 25000, count: 8, percentage: 10 }
  ],
  statusDistribution: [
    { name: 'Cobrados', value: 156, color: '#1AA7A7' },
    { name: 'Pendientes', value: 12, color: '#F2B61D' },
    { name: 'Anulados', value: 3, color: '#E23E57' }
  ]
};

export function Reports({ onNavigate }: ReportsProps) {
  const [dateFrom, setDateFrom] = useState('2024-01-01');
  const [dateTo, setDateTo] = useState('2024-06-30');
  const [reportType, setReportType] = useState('general');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(amount);
  };

  const generateReport = async (format: 'csv' | 'pdf') => {
    setLoading(true);
    
    // Simulate report generation
    setTimeout(() => {
      const filename = `reporte_${reportType}_${dateFrom}_${dateTo}.${format}`;
      toast.success(`Reporte ${format.toUpperCase()} generado: ${filename}`);
      setLoading(false);
    }, 2000);
  };

  const totalMovements = mockReportData.monthly.reduce((sum, month) => sum + month.cheques + month.depositos, 0);
  const totalEgresos = mockReportData.monthly.reduce((sum, month) => sum + month.totalEgresos, 0);
  const totalIngresos = mockReportData.monthly.reduce((sum, month) => sum + month.totalIngresos, 0);
  const netFlow = totalIngresos - totalEgresos;

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
        <div>
          <h1 className="text-3xl font-semibold">Reportes y Análisis</h1>
          <p className="text-muted-foreground mt-1">
            Genere reportes detallados y visualice estadísticas de movimientos
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Parámetros del Reporte
          </CardTitle>
          <CardDescription>
            Configure el período y tipo de reporte a generar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
              <Label>Tipo de Reporte</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Reporte General</SelectItem>
                  <SelectItem value="cheques">Solo Cheques</SelectItem>
                  <SelectItem value="depositos">Solo Depósitos</SelectItem>
                  <SelectItem value="conciliacion">Conciliación</SelectItem>
                  <SelectItem value="beneficiarios">Por Beneficiario</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cuenta</Label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las Cuentas</SelectItem>
                  <SelectItem value="1">Cuenta Principal - BAM</SelectItem>
                  <SelectItem value="2">Cuenta Operativa - BI</SelectItem>
                  <SelectItem value="3">Cuenta Dólares - BAM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button
                onClick={() => generateReport('csv')}
                disabled={loading}
                variant="outline"
                className="flex-1 rounded-lg"
              >
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button
                onClick={() => generateReport('pdf')}
                disabled={loading}
                className="flex-1 bg-primary hover:bg-primary/90 rounded-lg"
              >
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-xl border-l-4 border-l-primary">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Total Movimientos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{totalMovements}</div>
            <p className="text-sm text-muted-foreground">En el período seleccionado</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-l-4 border-l-red-500">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Total Egresos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {formatCurrency(totalEgresos)}
            </div>
            <p className="text-sm text-muted-foreground">Cheques emitidos</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-l-4 border-l-green-500">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Total Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(totalIngresos)}
            </div>
            <p className="text-sm text-muted-foreground">Depósitos recibidos</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-l-4 border-l-accent">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Flujo Neto</CardTitle>
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

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 rounded-lg">
          <TabsTrigger value="trends" className="rounded-lg">Tendencias</TabsTrigger>
          <TabsTrigger value="distribution" className="rounded-lg">Distribución</TabsTrigger>
          <TabsTrigger value="beneficiaries" className="rounded-lg">Beneficiarios</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Flujo de Efectivo Mensual
                </CardTitle>
                <CardDescription>
                  Comparación de ingresos vs egresos por mes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockReportData.monthly}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="month" 
                        className="text-muted-foreground"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        className="text-muted-foreground"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `Q${value/1000}k`}
                      />
                      <Tooltip 
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
                        dataKey="totalIngresos" 
                        stroke="var(--secondary)" 
                        strokeWidth={3}
                        name="Ingresos"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="totalEgresos" 
                        stroke="var(--destructive)" 
                        strokeWidth={3}
                        name="Egresos"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Cantidad de Movimientos
                </CardTitle>
                <CardDescription>
                  Número de cheques y depósitos por mes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockReportData.monthly}>
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
                      <Tooltip 
                        labelStyle={{ color: 'var(--foreground)' }}
                        contentStyle={{ 
                          backgroundColor: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="cheques" fill="var(--primary)" name="Cheques" />
                      <Bar dataKey="depositos" fill="var(--secondary)" name="Depósitos" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Estado de Cheques
                </CardTitle>
                <CardDescription>
                  Distribución por estado actual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        dataKey="value"
                        data={mockReportData.statusDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({name, percentage}) => `${name}: ${percentage}%`}
                      >
                        {mockReportData.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-4 mt-4">
                  {mockReportData.statusDistribution.map((item) => (
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

            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>Estadísticas Generales</CardTitle>
                <CardDescription>
                  Métricas clave del período
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Promedio Mensual</p>
                    <p className="text-xl font-semibold">
                      {Math.round(totalMovements / 6)} mov.
                    </p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Monto Promedio</p>
                    <p className="text-xl font-semibold">
                      {formatCurrency((totalEgresos + totalIngresos) / totalMovements)}
                    </p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Mayor Egreso</p>
                    <p className="text-xl font-semibold text-red-600">
                      {formatCurrency(45000)}
                    </p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Mayor Ingreso</p>
                    <p className="text-xl font-semibold text-green-600">
                      {formatCurrency(52000)}
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Métricas de Rendimiento</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tasa de Cobro</span>
                      <Badge className="bg-green-100 text-green-800">95.2%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Cheques Anulados</span>
                      <Badge variant="outline">1.8%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tiempo Prom. Cobro</span>
                      <Badge variant="secondary">2.3 días</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="beneficiaries" className="space-y-6">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>Top Beneficiarios</CardTitle>
              <CardDescription>
                Clasificación por monto total de cheques emitidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockReportData.byBeneficiary.map((beneficiary, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-medium">
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
                      <p className="font-mono font-semibold">
                        {formatCurrency(beneficiary.amount)}
                      </p>
                      <Badge variant="outline">
                        {beneficiary.percentage}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}