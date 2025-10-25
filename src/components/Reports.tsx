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
  PieChart
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
          const data = await monthlyResponse.json();
          setMonthlyData(data);
        }

        if (beneficiaryResponse.ok) {
          const data = await beneficiaryResponse.json();
          setBeneficiaryData(data.slice(0, 10)); // Top 10 beneficiarios
        }

        if (statusResponse.ok) {
          const data = await statusResponse.json();
          setStatusData(data);
        }

        if (statsResponse.ok) {
          const data = await statsResponse.json();
          setGeneralStats(data);
        }

        if (accountsResponse.ok) {
          const data = await accountsResponse.json();
          setAccounts(data);
        }

        setApiError(null);
      } catch (err) {
        setApiError(err instanceof Error ? err.message : 'Error desconocido');
        console.error('Error al cargar datos de reportes:', err);
      } finally {
        setApiLoading(false);
      }
    };

    fetchReportData();
  }, []);

  // useEffect para actualizar datos cuando cambia el tipo de reporte o filtros
  useEffect(() => {
    const updateReportData = async () => {
      if (reportType) {
        setApiLoading(true);
        try {
          let filteredData = [];
          
          if (reportType === 'beneficiarios') {
            const response = await fetch('http://localhost:3001/api/reportes/beneficiarios');
            const data = await response.json();
            setBeneficiaryData(data);
            toast.success('📊 Reporte de beneficiarios actualizado');
          } else {
            // Obtener todas las transacciones
            const response = await fetch('http://localhost:3001/api/transacciones');
            const allData = await response.json();
            
            // Filtrar por tipo
            if (reportType === 'cheques') {
              filteredData = allData.filter((t: any) => t.tipo === 'CHEQUE');
            } else if (reportType === 'depositos') {
              filteredData = allData.filter((t: any) => t.tipo === 'DEPOSITO');
            } else {
              filteredData = allData; // general
            }
            
            // Filtrar por fechas
            filteredData = filteredData.filter((t: any) => {
              const fechaTransaccion = t.fecha_emision || t.fecha_transaccion;
              if (!fechaTransaccion) return false;
              
              const fecha = new Date(fechaTransaccion);
              const desde = new Date(dateFrom);
              const hasta = new Date(dateTo);
              
              return fecha >= desde && fecha <= hasta;
            });
            
            console.log('Datos después de filtrar por fechas:', filteredData.length);
            
            // Filtrar por cuenta si se seleccionó una específica
            if (selectedAccount !== 'all') {
              filteredData = filteredData.filter((t: any) => 
                t.cuenta_id && t.cuenta_id.toString() === selectedAccount
              );
            }
            
            console.log('Datos finales después de filtros:', filteredData.length);
            
            // Actualizar estadísticas según los datos filtrados
            const totalEgresos = filteredData.filter((t: any) => t.tipo === 'CHEQUE' || t.tipo === 'RETIRO').reduce((sum: number, t: any) => sum + parseFloat(t.monto), 0);
            const totalIngresos = filteredData.filter((t: any) => t.tipo === 'DEPOSITO').reduce((sum: number, t: any) => sum + parseFloat(t.monto), 0);
            
            const stats = {
              totalMovimientos: filteredData.length,
              totalEgresos,
              totalIngresos,
              mayorEgreso: filteredData.filter((t: any) => t.tipo === 'CHEQUE').length > 0 ? 
                Math.max(...filteredData.filter((t: any) => t.tipo === 'CHEQUE').map((t: any) => parseFloat(t.monto))) : 0,
              mayorIngreso: filteredData.filter((t: any) => t.tipo === 'DEPOSITO').length > 0 ? 
                Math.max(...filteredData.filter((t: any) => t.tipo === 'DEPOSITO').map((t: any) => parseFloat(t.monto))) : 0,
              montoPromedio: filteredData.length > 0 ? 
                filteredData.reduce((sum: number, t: any) => sum + parseFloat(t.monto), 0) / filteredData.length : 0,
              tasaCobro: 0,
              porcentajeAnulados: 0
            };
            setGeneralStats(stats);
            
            toast.success(`� Reporte actualizado: ${filteredData.length} registros encontrados`);
          }
        } catch (err) {
          console.error('Error al actualizar reporte:', err);
          toast.error('Error al actualizar el reporte');
        } finally {
          setApiLoading(false);
        }
      }
    };

    updateReportData();
  }, [reportType, dateFrom, dateTo, selectedAccount]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(amount);
  };

  const generateReport = async (format: 'excel' | 'pdf') => {
    setLoading(true);
    
    try {
      console.log('Generando reporte:', { reportType, dateFrom, dateTo, selectedAccount });
      
      // Obtener datos filtrados según la selección
      let filteredData = [];
      
      if (reportType === 'beneficiarios') {
        const response = await fetch('http://localhost:3001/api/reportes/beneficiarios');
        if (!response.ok) throw new Error('Error al obtener beneficiarios');
        filteredData = await response.json();
      } else {
        // Obtener todas las transacciones
        const response = await fetch('http://localhost:3001/api/transacciones');
        if (!response.ok) throw new Error('Error al obtener transacciones');
        const allData = await response.json();
        
        console.log('Total transacciones obtenidas:', allData.length);
        
        // Filtrar por tipo
        if (reportType === 'cheques') {
          filteredData = allData.filter((t: any) => t.tipo === 'CHEQUE');
        } else if (reportType === 'depositos') {
          filteredData = allData.filter((t: any) => t.tipo === 'DEPOSITO');
        } else {
          filteredData = allData; // general
        }
        
        console.log('Después de filtrar por tipo:', filteredData.length);
        
        // Filtrar por fechas
        filteredData = filteredData.filter((t: any) => {
          const fechaTransaccion = t.fecha_emision || t.fecha_transaccion;
          if (!fechaTransaccion) return false;
          
          const fecha = new Date(fechaTransaccion);
          const desde = new Date(dateFrom);
          const hasta = new Date(dateTo);
          
          return fecha >= desde && fecha <= hasta;
        });
        
        console.log('Después de filtrar por fechas:', filteredData.length);
        
        // Filtrar por cuenta si se seleccionó una específica
        if (selectedAccount !== 'all') {
          filteredData = filteredData.filter((t: any) => 
            t.cuenta_id && t.cuenta_id.toString() === selectedAccount
          );
        }
        
        console.log('Después de filtrar por cuenta:', filteredData.length);
      }

      if (filteredData.length === 0) {
        toast.error('No se encontraron datos para los filtros seleccionados');
        setLoading(false);
        return;
      }

      if (format === 'excel') {
        // Crear Excel profesional con XLSX
        const workbook = XLSX.utils.book_new();
        
        // Datos para la hoja principal
        let excelData = [];
        
        if (reportType === 'beneficiarios') {
          excelData = [
            ['REPORTE DE BENEFICIARIOS'],
            [`Fecha: ${new Date().toLocaleDateString('es-GT')}`],
            [`Período: ${dateFrom} al ${dateTo}`],
            [`Total registros: ${filteredData.length}`],
            [],
            ['Beneficiario', 'Monto Total', 'Cantidad de Transacciones', 'Porcentaje'],
            ...filteredData.map((item: any) => [
              item.name,
              parseFloat(item.amount),
              item.count,
              parseFloat(item.percentage)
            ])
          ];
        } else {
          const totalEgresos = filteredData.filter((t: any) => t.tipo === 'CHEQUE').reduce((sum: number, t: any) => sum + parseFloat(t.monto), 0);
          const totalIngresos = filteredData.filter((t: any) => t.tipo === 'DEPOSITO').reduce((sum: number, t: any) => sum + parseFloat(t.monto), 0);
          
          excelData = [
            [`REPORTE DE ${reportType.toUpperCase()}`],
            [`Fecha: ${new Date().toLocaleDateString('es-GT')}`],
            [`Período: ${dateFrom} al ${dateTo}`],
            [`Total registros: ${filteredData.length}`],
            [`Total Ingresos: Q${totalIngresos.toLocaleString('es-GT', {minimumFractionDigits: 2})}`],
            [`Total Egresos: Q${totalEgresos.toLocaleString('es-GT', {minimumFractionDigits: 2})}`],
            [`Balance Neto: Q${(totalIngresos - totalEgresos).toLocaleString('es-GT', {minimumFractionDigits: 2})}`],
            [],
            ['Fecha', 'Tipo', 'Número', 'Cuenta', 'Beneficiario', 'Monto', 'Estado', 'Concepto'],
            ...filteredData.map((t: any) => [
              new Date(t.fecha_emision || t.fecha_transaccion).toLocaleDateString('es-GT'),
              t.tipo,
              t.numero_cheque || 'N/A',
              t.cuenta,
              t.beneficiario,
              parseFloat(t.monto),
              t.estado,
              t.concepto || t.descripcion || ''
            ])
          ];
        }
        
        const worksheet = XLSX.utils.aoa_to_sheet(excelData);
        
        // Aplicar estilos (ancho de columnas)
        const columnWidths = reportType === 'beneficiarios' 
          ? [{ wch: 30 }, { wch: 15 }, { wch: 20 }, { wch: 15 }]
          : [{ wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 25 }, { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 30 }];
        
        worksheet['!cols'] = columnWidths;
        
        // Agregar la hoja al libro
        XLSX.utils.book_append_sheet(workbook, worksheet, `Reporte_${reportType}`);
        
        // Descargar el archivo
        const fileName = `Reporte_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, fileName);
        
        toast.success('📊 Reporte Excel exportado correctamente');
      } else if (format === 'pdf') {
        // Generar PDF real con jsPDF
        const pdf = new jsPDF();
        
        // Configuración de fuentes y estilos
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(20);
        
        // Título del reporte
        const title = `📊 Reporte de ${reportType.toUpperCase()}`;
        pdf.text(title, 20, 25);
        
        // Información del período
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`📅 Período: ${dateFrom} al ${dateTo}`, 20, 35);
        pdf.text(`📋 Total de registros: ${filteredData.length}`, 20, 43);
        pdf.text(`📄 Generado: ${new Date().toLocaleDateString('es-GT')}`, 20, 51);
        
        // Configurar tabla
        let tableData = [];
        let headers = [];
        
        if (reportType === 'beneficiarios') {
          headers = ['Beneficiario', 'Monto Total', 'Cantidad', 'Porcentaje'];
          tableData = filteredData.slice(0, 50).map((item: any) => [
            item.name,
            formatCurrency(item.amount),
            item.count.toString(),
            `${item.percentage}%`
          ]);
        } else {
          headers = ['Fecha', 'Tipo', 'Beneficiario', 'Monto', 'Estado'];
          tableData = filteredData.slice(0, 50).map((t: any) => [
            new Date(t.fecha_emision || t.fecha_transaccion).toLocaleDateString('es-GT'),
            t.tipo,
            t.beneficiario?.substring(0, 25) || 'N/A',
            formatCurrency(parseFloat(t.monto)),
            t.estado
          ]);
        }
        
        // Generar tabla con autoTable
        (pdf as any).autoTable({
          head: [headers],
          body: tableData,
          startY: 60,
          theme: 'striped',
          headStyles: {
            fillColor: [79, 70, 229],
            textColor: 255,
            fontSize: 10,
            fontStyle: 'bold'
          },
          bodyStyles: {
            fontSize: 9,
            cellPadding: 3
          },
          alternateRowStyles: {
            fillColor: [248, 249, 250]
          },
          styles: {
            overflow: 'linebreak',
            fontSize: 9
          },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 30 },
            2: { cellWidth: 50 },
            3: { cellWidth: 30 },
            4: { cellWidth: 25 }
          }
        });
        
        // Agregar estadísticas al final si hay espacio
        const finalY = (pdf as any).lastAutoTable.finalY || 60;
        if (finalY < 250 && generalStats) {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('📊 Estadísticas Generales:', 20, finalY + 20);
          
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Total movimientos: ${generalStats.totalMovimientos}`, 25, finalY + 30);
          pdf.text(`Total egresos: ${formatCurrency(generalStats.totalEgresos)}`, 25, finalY + 38);
          pdf.text(`Total ingresos: ${formatCurrency(generalStats.totalIngresos)}`, 25, finalY + 46);
          pdf.text(`Flujo neto: ${formatCurrency(generalStats.totalIngresos - generalStats.totalEgresos)}`, 25, finalY + 54);
        }
        
        // Descargar PDF
        const fileName = `reporte_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);
        
        toast.success('📄 Reporte PDF generado correctamente');
      }
    } catch (err) {
      console.error('Error al generar reporte:', err);
      toast.error('Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  if (apiLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-xl font-semibold text-purple-800">⏳ Cargando reportes...</p>
          <p className="text-purple-600">Preparando datos y estadísticas</p>
        </div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-6">
        <Card className="max-w-2xl mx-auto bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="text-red-600 text-6xl">❌</div>
              <h2 className="text-2xl font-bold text-red-800">Error al cargar reportes</h2>
              <p className="text-red-600">{apiError}</p>
              <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
                🔄 Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calcular valores para las tarjetas
  const totalMovements = generalStats?.totalMovimientos || 0;
  const totalEgresos = generalStats?.totalEgresos || 0;
  const totalIngresos = generalStats?.totalIngresos || 0;
  const flujoNeto = totalIngresos - totalEgresos;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      {/* Header mejorado */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          onClick={() => onNavigate('dashboard')}
          className="bg-white hover:bg-gray-50 border border-gray-200 rounded-xl shadow-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            📊 Reportes y Análisis
          </h1>
          <p className="text-gray-600 text-lg mt-1">
            🔍 Genere reportes detallados y visualice estadísticas • Datos en tiempo real
          </p>
        </div>
      </div>

      {/* Filters con colores mejorados */}
      <Card className="rounded-2xl mb-8 bg-white/80 backdrop-blur shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-2xl">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Calendar className="h-6 w-6" />
            🎯 Parámetros del Reporte
          </CardTitle>
          <CardDescription className="text-purple-100">
            Configure el período y tipo de reporte - Los cambios se aplican automáticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="space-y-3">
              <Label htmlFor="dateFrom" className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                📅 Fecha Desde
              </Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-12 rounded-xl border-2 border-gray-200 focus:border-purple-500 text-lg"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="dateTo" className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                📅 Fecha Hasta
              </Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-12 rounded-xl border-2 border-gray-200 focus:border-purple-500 text-lg"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                📊 Tipo de Reporte
              </Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 focus:border-purple-500 text-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="general" className="text-lg py-3">📋 Reporte General</SelectItem>
                  <SelectItem value="cheques" className="text-lg py-3">💸 Solo Cheques</SelectItem>
                  <SelectItem value="depositos" className="text-lg py-3">💰 Solo Depósitos</SelectItem>
                  <SelectItem value="conciliacion" className="text-lg py-3">🔄 Conciliación</SelectItem>
                  <SelectItem value="beneficiarios" className="text-lg py-3">👥 Por Beneficiario</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                🏦 Cuenta
              </Label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 focus:border-purple-500 text-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all" className="text-lg py-3">🏦 Todas las Cuentas</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()} className="text-lg py-3">
                      {account.nombre} - {account.banco}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-3">
              <Button
                onClick={() => generateReport('excel')}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg px-6 py-3 h-12"
              >
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button
                onClick={() => generateReport('pdf')}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg px-6 py-3 h-12"
              >
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards con colores simples */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border border-gray-200 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-700">
              <BarChart3 className="h-5 w-5" />
              Total Movimientos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2 text-gray-900">{totalMovements.toLocaleString('es-GT')}</div>
            <p className="text-gray-500 text-sm">En el período seleccionado</p>
          </CardContent>
        </Card>

        <Card className="border border-red-200 shadow-md bg-red-50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-red-700">
              <TrendingUp className="h-5 w-5" />
              Total Egresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2 text-red-600">
              -{formatCurrency(totalEgresos)}
            </div>
            <p className="text-red-500 text-sm">Cheques emitidos</p>
          </CardContent>
        </Card>

        <Card className="border border-green-200 shadow-md bg-green-50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-green-700">
              <TrendingUp className="h-5 w-5" />
              Total Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2 text-green-600">
              +{formatCurrency(totalIngresos)}
            </div>
            <p className="text-green-500 text-sm">Depósitos recibidos</p>
          </CardContent>
        </Card>

        <Card className={`border shadow-md ${
          flujoNeto >= 0 
            ? 'border-green-200 bg-green-50' 
            : 'border-orange-200 bg-orange-50'
        }`}>
          <CardHeader className="pb-4">
            <CardTitle className={`text-lg font-semibold flex items-center gap-2 ${
              flujoNeto >= 0 ? 'text-green-700' : 'text-orange-700'
            }`}>
              <PieChart className="h-5 w-5" />
              Flujo Neto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold mb-2 ${
              flujoNeto >= 0 ? 'text-green-600' : 'text-orange-600'
            }`}>
              {flujoNeto >= 0 ? '+' : ''}{formatCurrency(flujoNeto)}
            </div>
            <p className={`text-sm ${flujoNeto >= 0 ? 'text-green-500' : 'text-orange-500'}`}>
              {flujoNeto >= 0 ? 'Balance positivo' : 'Balance negativo'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Gráfico de tendencias mensuales */}
        <Card className="border border-gray-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">Tendencias Mensuales</CardTitle>
            <CardDescription>Evolución de ingresos y egresos por mes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), '']}
                    labelStyle={{ color: '#1e293b' }}
                    contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  />
                  <Line type="monotone" dataKey="totalIngresos" stroke="#059669" strokeWidth={3} name="Ingresos" />
                  <Line type="monotone" dataKey="totalEgresos" stroke="#dc2626" strokeWidth={3} name="Egresos" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de distribución por estado */}
        <Card className="border border-gray-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">Distribución por Estado</CardTitle>
            <CardDescription>Estados de los cheques y transacciones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value, 'Cantidad']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Beneficiarios */}
      {reportType === 'beneficiarios' && (
        <Card className="border border-gray-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">Top Beneficiarios</CardTitle>
            <CardDescription>Principales destinatarios de pagos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {beneficiaryData.slice(0, 10).map((beneficiary, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{beneficiary.name}</p>
                      <p className="text-sm text-gray-500">{beneficiary.count} transacciones</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-800">{formatCurrency(beneficiary.amount)}</p>
                    <p className="text-sm text-blue-600">{beneficiary.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}