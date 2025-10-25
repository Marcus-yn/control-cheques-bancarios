import { useState, useEffect } from 'react';
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
  PieChart,
  Printer
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';
import { toast } from 'sonner';
import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface ReportsProps {
  onNavigate: (screen: string) => void;
}

// Interfaces para los datos de la API
interface MonthlyData {
  month: string;
  cheques: number;
  depositos: number;
  totalEgresos: number;
  totalIngresos: number;
}

interface BeneficiaryData {
  name: string;
  amount: number;
  count: number;
  percentage: number;
}

interface StatusData {
  name: string;
  value: number;
  color: string;
}

interface GeneralStats {
  totalMovimientos: number;
  totalEgresos: number;
  totalIngresos: number;
  mayorEgreso: number;
  mayorIngreso: number;
  montoPromedio: number;
  tasaCobro: number;
  porcentajeAnulados: number;
}

interface Account {
  id: number;
  nombre: string;
  banco: string;
  numero: string;
  saldo_actual: number;
}

export function Reports({ onNavigate }: ReportsProps) {
  const [dateFrom, setDateFrom] = useState('2023-01-01');
  const [dateTo, setDateTo] = useState('2025-12-31');
  const [reportType, setReportType] = useState('general');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [loading, setLoading] = useState(false);
  
  // Estados para datos de la API
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [beneficiaryData, setBeneficiaryData] = useState<BeneficiaryData[]>([]);
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [generalStats, setGeneralStats] = useState<GeneralStats | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Cargar datos iniciales de la API
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setApiLoading(true);
        
        // Cargar datos en paralelo
        const [monthlyResponse, beneficiaryResponse, statusResponse, statsResponse, accountsResponse] = await Promise.all([
          fetch('http://localhost:3001/api/reportes/mensuales'),
          fetch('http://localhost:3001/api/reportes/beneficiarios'),
          fetch('http://localhost:3001/api/reportes/estados'),
          fetch('http://localhost:3001/api/reportes/estadisticas'),
          fetch('http://localhost:3001/api/cuentas')
        ]);

        if (monthlyResponse.ok) {
          const monthlyJson = await monthlyResponse.json();
          setMonthlyData(monthlyJson.data || []);
        }

        if (beneficiaryResponse.ok) {
          const beneficiaryJson = await beneficiaryResponse.json();
          setBeneficiaryData(beneficiaryJson.data || []);
        }

        if (statusResponse.ok) {
          const statusJson = await statusResponse.json();
          setStatusData(statusJson.data || []);
        }

        if (statsResponse.ok) {
          const statsJson = await statsResponse.json();
          setGeneralStats(statsJson.data || null);
        }

        if (accountsResponse.ok) {
          const accountsJson = await accountsResponse.json();
          setAccounts(accountsJson.data || []);
        }

        setApiError(null);
      } catch (error) {
        console.error('Error fetching report data:', error);
        setApiError('Error al cargar datos de reportes');
        toast.error('Error al cargar datos');
      } finally {
        setApiLoading(false);
      }
    };

    fetchReportData();
  }, []);

  // 📊 ESTADÍSTICAS REACTIVAS - Aquí están las que se filtran dinámicamente
  const getFilteredStats = () => {
    if (!generalStats) return null;

    // Filtrar por tipo de reporte seleccionado
    switch (reportType) {
      case 'ingresos':
        return {
          titulo: 'ESTADÍSTICAS DE INGRESOS',
          items: [
            { label: 'Total Ingresos', value: `Q${generalStats.totalIngresos.toFixed(2)}`, color: 'text-green-600' },
            { label: 'Mayor Ingreso', value: `Q${generalStats.mayorIngreso.toFixed(2)}`, color: 'text-green-500' },
            { label: 'Promedio Ingresos', value: `Q${(generalStats.totalIngresos / (generalStats.totalMovimientos || 1)).toFixed(2)}`, color: 'text-blue-600' }
          ]
        };
      
      case 'egresos':
        return {
          titulo: 'ESTADÍSTICAS DE EGRESOS',
          items: [
            { label: 'Total Egresos', value: `Q${generalStats.totalEgresos.toFixed(2)}`, color: 'text-red-600' },
            { label: 'Mayor Egreso', value: `Q${generalStats.mayorEgreso.toFixed(2)}`, color: 'text-red-500' },
            { label: 'Promedio Egresos', value: `Q${(generalStats.totalEgresos / (generalStats.totalMovimientos || 1)).toFixed(2)}`, color: 'text-orange-600' }
          ]
        };
      
      case 'beneficiarios':
        return {
          titulo: 'ESTADÍSTICAS DE BENEFICIARIOS',
          items: [
            { label: 'Total Beneficiarios', value: beneficiaryData.length.toString(), color: 'text-purple-600' },
            { label: 'Beneficiario Top', value: beneficiaryData[0]?.name || 'N/A', color: 'text-purple-500' },
            { label: 'Monto Top', value: `Q${beneficiaryData[0]?.amount.toFixed(2) || '0.00'}`, color: 'text-indigo-600' }
          ]
        };
      
      default: // general
        return {
          titulo: 'ESTADÍSTICAS GENERALES',
          items: [
            { label: 'Total Movimientos', value: generalStats.totalMovimientos.toString(), color: 'text-blue-600' },
            { label: 'Balance Neto', value: `Q${(generalStats.totalIngresos - generalStats.totalEgresos).toFixed(2)}`, color: 'text-green-600' },
            { label: 'Monto Promedio', value: `Q${generalStats.montoPromedio.toFixed(2)}`, color: 'text-gray-600' },
            { label: 'Tasa de Cobro', value: `${generalStats.tasaCobro.toFixed(1)}%`, color: 'text-yellow-600' }
          ]
        };
    }
  };

  // 📄 PDF SIMPLE QUE SÍ FUNCIONA - Como pediste: "asi de simple y facil"
  const generateSimplePDF = () => {
    setLoading(true);
    
    try {
      const pdf = new jsPDF();
      const stats = getFilteredStats();
      
      // Header
      pdf.setFontSize(16);
      pdf.text('REPORTE DE CHEQUES BANCARIOS', 20, 20);
      
      pdf.setFontSize(12);
      pdf.text(`Tipo: ${reportType.toUpperCase()}`, 20, 35);
      pdf.text(`Periodo: ${dateFrom} al ${dateTo}`, 20, 45);
      pdf.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 20, 55);
      
      // Estadísticas reactivas
      if (stats) {
        pdf.setFontSize(14);
        pdf.text(stats.titulo, 20, 75);
        
        pdf.setFontSize(11);
        stats.items.forEach((item, index) => {
          pdf.text(`${item.label}: ${item.value}`, 25, 90 + (index * 10));
        });
      }
      
      // Estados de cheques
      if (statusData.length > 0) {
        pdf.text('DISTRIBUCION POR ESTADO:', 20, 140);
        statusData.forEach((status, index) => {
          pdf.text(`${status.name}: ${status.value}`, 25, 155 + (index * 8));
        });
      }
      
      // Beneficiarios (solo si es el reporte de beneficiarios)
      if (reportType === 'beneficiarios' && beneficiaryData.length > 0) {
        pdf.text('TOP BENEFICIARIOS:', 20, 200);
        beneficiaryData.slice(0, 10).forEach((beneficiary, index) => {
          pdf.text(`${index + 1}. ${beneficiary.name}: Q${beneficiary.amount.toFixed(2)}`, 25, 215 + (index * 8));
        });
      }
      
      // Guardar con nombre descriptivo
      const fileName = `reporte_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast.success('✅ PDF generado correctamente');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('❌ Error al generar PDF');
    } finally {
      setLoading(false);
    }
  };

  // Función para exportar a Excel
  const exportToExcel = () => {
    try {
      const stats = getFilteredStats();
      const workbook = XLSX.utils.book_new();
      
      // Hoja de estadísticas
      const statsData = stats?.items.map(item => ({
        'Concepto': item.label,
        'Valor': item.value
      })) || [];
      
      const statsSheet = XLSX.utils.json_to_sheet(statsData);
      XLSX.utils.book_append_sheet(workbook, statsSheet, 'Estadisticas');
      
      // Hoja de beneficiarios si aplica
      if (reportType === 'beneficiarios' && beneficiaryData.length > 0) {
        const beneficiarySheet = XLSX.utils.json_to_sheet(beneficiaryData);
        XLSX.utils.book_append_sheet(workbook, beneficiarySheet, 'Beneficiarios');
      }
      
      // Hoja de datos mensuales
      if (monthlyData.length > 0) {
        const monthlySheet = XLSX.utils.json_to_sheet(monthlyData);
        XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Mensuales');
      }
      
      const fileName = `reporte_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      toast.success('✅ Excel generado correctamente');
    } catch (error) {
      console.error('Error generating Excel:', error);
      toast.error('❌ Error al generar Excel');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(amount);
  };

  const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

  if (apiLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">📊 Reportes</h1>
          <Button onClick={() => onNavigate('dashboard')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">📊 Reportes</h1>
          <Button onClick={() => onNavigate('dashboard')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        <div className="text-center py-8 text-red-500">
          <p>❌ {apiError}</p>
        </div>
      </div>
    );
  }

  const stats = getFilteredStats();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📊 Reportes</h1>
        <Button onClick={() => onNavigate('dashboard')} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Configuración de Reportes</CardTitle>
          <CardDescription>Selecciona los filtros para generar reportes personalizados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="reportType">Tipo de Reporte</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">📊 General</SelectItem>
                  <SelectItem value="ingresos">💰 Solo Ingresos</SelectItem>
                  <SelectItem value="egresos">💸 Solo Egresos</SelectItem>
                  <SelectItem value="beneficiarios">👥 Beneficiarios</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="account">Cuenta Bancaria</Label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🏦 Todas las cuentas</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.nombre} - {account.banco}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateFrom">Fecha Inicio</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="dateTo">Fecha Fin</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          {/* Botones de exportación */}
          <div className="flex gap-2 mt-4">
            <Button onClick={generateSimplePDF} disabled={loading} variant="default">
              <Printer className="h-4 w-4 mr-2" />
              {loading ? 'Generando...' : 'Generar PDF'}
            </Button>
            
            <Button onClick={exportToExcel} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas Reactivas */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>{stats.titulo}</CardTitle>
            <CardDescription>Datos que se actualizan según el filtro seleccionado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.items.map((item, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">{item.label}</div>
                    <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráficos y Reportes */}
      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="charts">📈 Gráficos</TabsTrigger>
          <TabsTrigger value="beneficiaries">👥 Beneficiarios</TabsTrigger>
          <TabsTrigger value="status">📊 Estados</TabsTrigger>
        </TabsList>

        <TabsContent value="charts">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de línea mensual */}
            <Card>
              <CardHeader>
                <CardTitle>📈 Tendencia Mensual</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [`Q${value}`, '']} />
                    <Line type="monotone" dataKey="totalIngresos" stroke="#82ca9d" strokeWidth={2} name="Ingresos" />
                    <Line type="monotone" dataKey="totalEgresos" stroke="#ff7300" strokeWidth={2} name="Egresos" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de barras */}
            <Card>
              <CardHeader>
                <CardTitle>📊 Comparación Mensual</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [`Q${value}`, '']} />
                    <Bar dataKey="totalIngresos" fill="#82ca9d" name="Ingresos" />
                    <Bar dataKey="totalEgresos" fill="#ff7300" name="Egresos" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="beneficiaries">
          <Card>
            <CardHeader>
              <CardTitle>👥 Top Beneficiarios</CardTitle>
              <CardDescription>Los beneficiarios con mayor cantidad de movimientos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {beneficiaryData.slice(0, 10).map((beneficiary, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{index + 1}</Badge>
                      <div>
                        <div className="font-medium">{beneficiary.name}</div>
                        <div className="text-sm text-muted-foreground">{beneficiary.count} movimientos</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(beneficiary.amount)}</div>
                      <div className="text-sm text-muted-foreground">{beneficiary.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de pie */}
            <Card>
              <CardHeader>
                <CardTitle>🥧 Distribución por Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Lista de estados */}
            <Card>
              <CardHeader>
                <CardTitle>📊 Estados Detallados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {statusData.map((status, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: status.color || CHART_COLORS[index % CHART_COLORS.length] }}
                        ></div>
                        <span className="font-medium">{status.name}</span>
                      </div>
                      <Badge variant="secondary">{status.value}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Reports;
