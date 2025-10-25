import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { AlertCircle, Download, Filter, Search, TrendingUp, DollarSign, CreditCard, Activity, ArrowLeft, Calendar, FileText, Printer } from 'lucide-react';
import { Alert, AlertDescription } from "./ui/alert";
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
  tipo: string;
  moneda: string;
  descripcion: string;
}

const TransactionsModule: React.FC<TransactionsModuleProps> = ({ onNavigate }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [periodFilter, setPeriodFilter] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar transacciones desde la API
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/transacciones');
        
        if (!response.ok) {
          throw new Error('Error al cargar las transacciones');
        }
        
        const data = await response.json();
        setTransactions(data);
        setFilteredTransactions(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        console.error('Error al cargar transacciones:', err);
        toast.error('Error al cargar las transacciones');
      } finally {
        setLoading(false);
      }
    };

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

    // Filtros por fecha
    if (dateFrom) {
      filtered = filtered.filter(transaction => 
        new Date(transaction.fecha_emision) >= new Date(dateFrom)
      );
    }

    if (dateTo) {
      filtered = filtered.filter(transaction => 
        new Date(transaction.fecha_emision) <= new Date(dateTo)
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, filterStatus, filterType, dateFrom, dateTo]);

  // Funciones de formato
  const formatCurrency = (amount: number, currency: string = 'GTQ') => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getTransactionSign = (tipo: string) => {
    return tipo.toLowerCase().includes('deposito') || tipo.toLowerCase().includes('ingreso') ? '+' : '-';
  };

  const getAmountColor = (tipo: string) => {
    return tipo.toLowerCase().includes('deposito') || tipo.toLowerCase().includes('ingreso') 
      ? 'text-green-600' 
      : 'text-red-600';
  };

  // Función para exportar a CSV hermoso
  const exportToCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.error('❌ No hay datos para exportar');
      return;
    }

    // Crear encabezado del sistema
    const systemHeader = [
      "🏦 SISTEMA DE CONTROL DE CHEQUES BANCARIOS 🏦",
      "",
      `📊 INFORME: TRANSACCIONES COMPLETAS`,
      `📅 Fecha de: ${new Date().toLocaleDateString('es-GT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
      `👤 Hora de: ${new Date().toLocaleTimeString('es-GT')}`,
      `📋 Total de: ${filteredTransactions.length} transacciones`,
      `💰 Ingresos: ${formatCurrency(filteredTransactions.filter(t => t.tipo === 'DEPOSITO').reduce((sum, t) => sum + parseFloat(t.monto.toString()), 0), 'GTQ')}`,
      `💸 Egresos: ${formatCurrency(filteredTransactions.filter(t => t.tipo === 'CHEQUE').reduce((sum, t) => sum + parseFloat(t.monto.toString()), 0), 'GTQ')}`,
      "",
      ""
    ];

    // Encabezados de columnas organizados
    const headers = [
      '📋 Número',
      '📝 Tipo',
      '🏦 Cuenta',
      '👥 Beneficiario',
      '💰 Monto',
      '💱 Moneda',
      '📅 Fecha',
      '🔖 Estado',
      '📄 Concepto'
    ];

    // Datos formateados
    const rows = filteredTransactions.map(transaction => [
      transaction.numero_cheque || 'N/A',
      transaction.tipo === 'DEPOSITO' ? '💰 INGRESO' : '💸 EGRESO',
      `"${transaction.cuenta}"`,
      `"${transaction.beneficiario}"`,
      `${getTransactionSign(transaction.tipo)}${parseFloat(transaction.monto.toString()).toLocaleString('es-GT', {minimumFractionDigits: 2})}`,
      transaction.moneda || 'GTQ',
      formatDate(transaction.fecha_emision),
      transaction.estado === 'COMPLETADO' ? '✅ COMPLETADO' : 
      transaction.estado === 'PENDIENTE' ? '⏰ PENDIENTE' : 
      transaction.estado === 'ANULADO' ? '❌ ANULADO' : transaction.estado,
      `"${transaction.concepto || transaction.descripcion || 'Sin concepto'}"`
    ]);

    // Combinar todo el contenido
    const csvContent = [
      ...systemHeader,
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Crear y descargar archivo
    const BOM = '\uFEFF'; // Byte Order Mark para UTF-8
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Transacciones_2025-10-25.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('📊 ¡Reporte CSV exportado exitosamente!');
  };

  // Función para exportar a PDF real
  const exportToPDF = () => {
    if (filteredTransactions.length === 0) {
      toast.error('❌ No hay datos para exportar');
      return;
    }

    // Crear PDF real con jsPDF
    const pdf = new jsPDF('landscape');
    
    // Configuración de fuentes y estilos
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    
    // Título del reporte
    pdf.text('💰 TRANSACCIONES BANCARIAS', 20, 25);
    
    // Información del reporte
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`📅 Fecha del reporte: ${new Date().toLocaleDateString('es-GT')}`, 20, 35);
    pdf.text(`📋 Total de transacciones: ${filteredTransactions.length}`, 20, 43);
    
    const totalIngresos = filteredTransactions.filter(t => t.tipo === 'DEPOSITO').reduce((sum, t) => sum + parseFloat(t.monto.toString()), 0);
    const totalEgresos = filteredTransactions.filter(t => t.tipo === 'CHEQUE').reduce((sum, t) => sum + parseFloat(t.monto.toString()), 0);
    
    pdf.text(`💰 Total ingresos: ${formatCurrency(totalIngresos, 'GTQ')}`, 20, 51);
    pdf.text(`💸 Total egresos: ${formatCurrency(totalEgresos, 'GTQ')}`, 150, 51);
    
    // Preparar datos para la tabla
    const tableData = filteredTransactions.slice(0, 50).map(transaction => [
      formatDate(transaction.fecha_emision),
      transaction.numero_cheque || 'N/A',
      transaction.tipo === 'DEPOSITO' ? 'INGRESO' : 'EGRESO',
      transaction.cuenta.substring(0, 25),
      transaction.beneficiario.substring(0, 20),
      `${getTransactionSign(transaction.tipo)}${formatCurrency(parseFloat(transaction.monto.toString()), transaction.moneda || 'GTQ')}`,
      transaction.estado,
      (transaction.concepto || transaction.descripcion || 'Sin concepto').substring(0, 25)
    ]);
    
    // Generar tabla con autoTable
    (pdf as any).autoTable({
      head: [['Fecha', 'Número', 'Tipo', 'Cuenta', 'Beneficiario', 'Monto', 'Estado', 'Concepto']],
      body: tableData,
      startY: 60,
      theme: 'striped',
      headStyles: {
        fillColor: [5, 150, 105],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 7,
        cellPadding: 2
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      styles: {
        overflow: 'linebreak',
        fontSize: 7
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 20 },
        2: { cellWidth: 20 },
        3: { cellWidth: 60 },
        4: { cellWidth: 45 },
        5: { cellWidth: 30 },
        6: { cellWidth: 25 },
        7: { cellWidth: 50 }
      }
    });
    
    // Agregar estadísticas al final
    const finalY = (pdf as any).lastAutoTable.finalY || 60;
    if (finalY < 150) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('� Resumen Estadístico:', 20, finalY + 20);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total de transacciones: ${filteredTransactions.length}`, 25, finalY + 30);
      pdf.text(`Balance neto: ${formatCurrency(totalIngresos - totalEgresos, 'GTQ')}`, 25, finalY + 38);
      pdf.text(`Periodo analizado: ${periodFilter}`, 25, finalY + 46);
    }
    
    // Agregar pie de página
    const pageCount = (pdf as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(100);
      pdf.text(`Página ${i} de ${pageCount}`, (pdf as any).internal.pageSize.width - 30, (pdf as any).internal.pageSize.height - 10);
      pdf.text(`Generado: ${new Date().toLocaleString('es-GT')}`, 20, (pdf as any).internal.pageSize.height - 10);
    }
    
    // Descargar PDF
    const fileName = `Reporte_Transacciones_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
    toast.success('📄 ¡Reporte PDF generado exitosamente!');
  };

  // Función para imprimir directamente
  const printList = () => {
    if (filteredTransactions.length === 0) {
      toast.error('❌ No hay datos para imprimir');
      return;
    }

    window.print();
    toast.success('🖨️ Enviando a la impresora...');
  };

  // Función para obtener badge de estado con colores vibrantes
  const getStatusBadge = (status: string) => {
    const statusColors = {
      'completado': 'bg-green-500 text-black border-green-600',
      'completada': 'bg-green-500 text-black border-green-600',
      'cobrado': 'bg-orange-500 text-black border-orange-600',
      'pendiente': 'bg-yellow-500 text-black border-yellow-600',
      'anulado': 'bg-red-500 text-white border-red-600',
      'emitido': 'bg-blue-500 text-white border-blue-600'
    };
    
    const normalizedStatus = status.toLowerCase();
    const colorClass = statusColors[normalizedStatus as keyof typeof statusColors] || 'bg-gray-500 text-white border-gray-600';
    
    return (
      <Badge className={`${colorClass} font-bold px-3 py-1 text-xs shadow-md`}>
        {(normalizedStatus === 'completado' || normalizedStatus === 'completada') && '✅ COMPLETADA'}
        {normalizedStatus === 'cobrado' && '💰 COBRADO'}
        {normalizedStatus === 'pendiente' && '⏰ PENDIENTE'}
        {normalizedStatus === 'anulado' && '❌ ANULADO'}
        {normalizedStatus === 'emitido' && '🚀 EMITIDO'}
        {!['completado', 'completada', 'cobrado', 'pendiente', 'anulado', 'emitido'].includes(normalizedStatus) && status.toUpperCase()}
      </Badge>
    );
  };

  // Función para obtener badge de tipo con colores vibrantes
  const getTypeBadge = (type: string) => {
    const typeColors = {
      'deposito': 'bg-emerald-500 text-white border-emerald-600',
      'cheque': 'bg-rose-500 text-white border-rose-600',
      'ingreso': 'bg-green-500 text-white border-green-600',
      'egreso': 'bg-red-500 text-white border-red-600'
    };
    
    const normalizedType = type.toLowerCase();
    const colorClass = typeColors[normalizedType as keyof typeof typeColors] || 'bg-gray-500 text-white border-gray-600';
    
    return (
      <Badge className={`${colorClass} font-bold px-3 py-1 text-xs shadow-md`}>
        {normalizedType === 'deposito' && '💰 INGRESO'}
        {normalizedType === 'cheque' && '💸 EGRESO'}
        {normalizedType === 'ingreso' && '💰 INGRESO'}
        {normalizedType === 'egreso' && '💸 EGRESO'}
        {!['deposito', 'cheque', 'ingreso', 'egreso'].includes(normalizedType) && type.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-xl font-semibold text-blue-800">⏳ Cargando transacciones...</p>
          <p className="text-blue-600">Por favor espera un momento</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-6">
        <Alert className="max-w-2xl mx-auto bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            ❌ <strong>Error:</strong> {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => onNavigate('dashboard')}
            className="bg-white hover:bg-gray-50 border border-gray-200 rounded-xl shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">💰 Transacciones</h1>
            <p className="text-gray-600 text-lg">Estado de cuenta completo • {filteredTransactions.length} registros</p>
          </div>
        </div>
        
        {/* Botones de exportación en la parte superior */}
        <div className="flex gap-3">
          <Button
            onClick={exportToCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg px-6 py-3"
          >
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button
            onClick={exportToPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg px-6 py-3"
          >
            <FileText className="h-4 w-4 mr-2" />
            Descargar HTML
          </Button>
          <Button
            onClick={printList}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg px-6 py-3"
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Filtros mejorados */}
      <Card className="mb-8 bg-white/80 backdrop-blur shadow-xl rounded-2xl border-0">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-2xl">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Filter className="h-5 w-5" />
            🔍 Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Búsqueda por texto */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                🔍 Buscar
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar transacciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 text-lg"
                />
              </div>
            </div>

            {/* Filtro por período */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                📅 Período
              </Label>
              <Select value={periodFilter} onValueChange={(value: string) => {
                setPeriodFilter(value);
                const today = new Date();
                const formatDate = (date: Date) => date.toISOString().split('T')[0];
                
                switch(value) {
                  case 'semana':
                    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    setDateFrom(formatDate(weekAgo));
                    setDateTo(formatDate(today));
                    break;
                  case 'mes':
                    const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
                    setDateFrom(formatDate(monthAgo));
                    setDateTo(formatDate(today));
                    break;
                  case 'trimestre':
                    const quarterAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
                    setDateFrom(formatDate(quarterAgo));
                    setDateTo(formatDate(today));
                    break;
                  case 'año':
                    const yearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
                    setDateFrom(formatDate(yearAgo));
                    setDateTo(formatDate(today));
                    break;
                  case 'año-actual':
                    const yearStart = new Date(today.getFullYear(), 0, 1);
                    setDateFrom(formatDate(yearStart));
                    setDateTo(formatDate(today));
                    break;
                  case 'personalizado':
                    // No cambiar fechas, dejar que el usuario las configure manualmente
                    break;
                  case 'todos':
                  default:
                    setDateFrom('');
                    setDateTo('');
                    break;
                }
              }}>
                <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 text-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="todos" className="text-lg py-3">🗓️ Todos los períodos</SelectItem>
                  <SelectItem value="semana" className="text-lg py-3">📅 Última semana</SelectItem>
                  <SelectItem value="mes" className="text-lg py-3">📆 Último mes</SelectItem>
                  <SelectItem value="trimestre" className="text-lg py-3">📊 Último trimestre</SelectItem>
                  <SelectItem value="año" className="text-lg py-3">🗓️ Último año</SelectItem>
                  <SelectItem value="año-actual" className="text-lg py-3">📅 Año actual</SelectItem>
                  <SelectItem value="personalizado" className="text-lg py-3">⚙️ Período personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por estado */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                🔖 Estado
              </Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 text-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all" className="text-lg py-3">📋 Todos los estados</SelectItem>
                  <SelectItem value="completado" className="text-lg py-3">✅ Completado</SelectItem>
                  <SelectItem value="pendiente" className="text-lg py-3">⏰ Pendiente</SelectItem>
                  <SelectItem value="anulado" className="text-lg py-3">❌ Anulado</SelectItem>
                  <SelectItem value="emitido" className="text-lg py-3">🚀 Emitido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por tipo */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                📝 Tipo
              </Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 text-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all" className="text-lg py-3">📄 Todos los tipos</SelectItem>
                  <SelectItem value="deposito" className="text-lg py-3">💰 Ingresos</SelectItem>
                  <SelectItem value="cheque" className="text-lg py-3">💸 Egresos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filtros de fecha personalizados */}
          {periodFilter === 'personalizado' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200">
              <div className="space-y-3">
                <Label htmlFor="dateFrom" className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                  📅 Desde
                </Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 text-lg"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="dateTo" className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                  📅 Hasta
                </Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 text-lg"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumen de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl shadow-xl border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">💰 Total Ingresos</p>
                <p className="text-2xl font-bold">
                  +{formatCurrency(filteredTransactions.filter(t => t.tipo === 'DEPOSITO').reduce((sum, t) => sum + parseFloat(t.monto.toString()), 0), 'GTQ')}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-2xl shadow-xl border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">💸 Total Egresos</p>
                <p className="text-2xl font-bold">
                  -{formatCurrency(filteredTransactions.filter(t => t.tipo === 'CHEQUE').reduce((sum, t) => sum + parseFloat(t.monto.toString()), 0), 'GTQ')}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-xl border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">📋 Total Transacciones</p>
                <p className="text-2xl font-bold">{filteredTransactions.length.toLocaleString('es-GT')}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white rounded-2xl shadow-xl border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">🔄 Balance Neto</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    filteredTransactions.filter(t => t.tipo === 'DEPOSITO').reduce((sum, t) => sum + parseFloat(t.monto.toString()), 0) -
                    filteredTransactions.filter(t => t.tipo === 'CHEQUE').reduce((sum, t) => sum + parseFloat(t.monto.toString()), 0),
                    'GTQ'
                  )}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de transacciones */}
      <Card className="bg-white/90 backdrop-blur shadow-2xl rounded-2xl border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white p-6">
          <CardTitle className="text-2xl font-bold">
            📊 Lista de Transacciones
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 border-b border-slate-200">
                  <TableHead className="font-bold text-slate-700 py-4 px-6">📅 Fecha</TableHead>
                  <TableHead className="font-bold text-slate-700 py-4 px-6">📋 Número</TableHead>
                  <TableHead className="font-bold text-slate-700 py-4 px-6">📝 Tipo</TableHead>
                  <TableHead className="font-bold text-slate-700 py-4 px-6">🏦 Cuenta</TableHead>
                  <TableHead className="font-bold text-slate-700 py-4 px-6">👥 Beneficiario</TableHead>
                  <TableHead className="font-bold text-slate-700 py-4 px-6">💰 Monto</TableHead>
                  <TableHead className="font-bold text-slate-700 py-4 px-6">🔖 Estado</TableHead>
                  <TableHead className="font-bold text-slate-700 py-4 px-6">📄 Concepto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction, index) => (
                  <TableRow 
                    key={transaction.id} 
                    className={`hover:bg-slate-50 transition-colors duration-200 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-25'
                    }`}
                  >
                    <TableCell className="py-4 px-6 font-medium text-slate-700">
                      {formatDate(transaction.fecha_emision)}
                    </TableCell>
                    <TableCell className="py-4 px-6 font-mono font-bold text-blue-600">
                      {transaction.numero_cheque || 'N/A'}
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      {getTypeBadge(transaction.tipo)}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-sm text-slate-600 max-w-xs truncate">
                      {transaction.cuenta}
                    </TableCell>
                    <TableCell className="py-4 px-6 font-medium text-slate-700">
                      {transaction.beneficiario}
                    </TableCell>
                    <TableCell className={`py-4 px-6 font-bold font-mono text-lg ${getAmountColor(transaction.tipo)}`}>
                      {getTransactionSign(transaction.tipo)}{formatCurrency(parseFloat(transaction.monto.toString()), transaction.moneda || 'GTQ')}
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      {getStatusBadge(transaction.estado)}
                    </TableCell>
                    <TableCell className="py-4 px-6 text-sm text-slate-600 max-w-xs truncate">
                      {transaction.concepto || transaction.descripcion || 'Sin concepto'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">📭 No hay transacciones que coincidan con los filtros</p>
              <p className="text-gray-400 mt-2">Intenta ajustar los criterios de búsqueda</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionsModule;