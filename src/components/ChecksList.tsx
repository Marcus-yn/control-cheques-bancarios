interface Cheque {
  id: number;
  number: string;
  date: string;
  beneficiary: string;
  amount: number;
  concept: string;
  status: string;
  account: string;
  checkbook: string;
  bank: string;
  currency: string;
  account_name: string;
}

import { useState } from 'react';
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { 
  Search, 
  Filter, 
  Eye, 
  XCircle, 
  CheckCircle2, 
  Plus,
  CalendarDays,
  Download,
  FileText,
  Wallet,
  Clock,
  CheckCheck,
  Info,
  FileSpreadsheet
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { getBankIcon } from './ui/smart-icons';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ChecksListProps {
  onNavigate: (screen: string) => void;
}

export function ChecksList({ onNavigate }: ChecksListProps) {
  const [limit, setLimit] = useState(10);
  const [checks, setChecks] = useState<Cheque[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchChecks = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/cheques');
      if (res.ok) {
        const data = await res.json();
        setChecks(Array.isArray(data) ? data : []);
        toast.success('✅ Cheques actualizados correctamente');
      } else {
        toast.error('No se pudieron cargar los cheques');
      }
    } catch {
      toast.error('Error de conexión al backend');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchChecks();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedCheck, setSelectedCheck] = useState<any>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendiente':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 px-3 py-1 text-sm font-bold">
            ⏰ Pendiente
          </Badge>
        );
      case 'cobrado':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1 text-sm font-bold">
            ✅ Cobrado
          </Badge>
        );
      case 'emitido':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1 text-sm font-bold">
            📄 Emitido
          </Badge>
        );
      case 'cancelado':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 px-3 py-1 text-sm font-bold">
            ❌ Cancelado
          </Badge>
        );
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const handleStatusChange = async (checkId: number, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/cheques/${checkId}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setChecks(prev => prev.map(check => 
          check.id === checkId ? { ...check, status: newStatus } : check
        ));
        const statusMessages = {
          'cobrado': '✅ Cheque marcado como cobrado',
          'cancelado': '❌ Cheque cancelado correctamente',
          'pendiente': '⏰ Cheque marcado como pendiente',
          'emitido': '📄 Cheque marcado como emitido'
        };
        toast.success(statusMessages[newStatus as keyof typeof statusMessages] || 'Estado actualizado');
      } else {
        toast.error('No se pudo actualizar el estado');
      }
    } catch {
      toast.error('Error de conexión al backend');
    }
  };

  // Eliminar duplicados por número y chequera
  const uniqueChecks = Object.values(
    checks.reduce((acc, check) => {
      const key = `${check.number}-${check.checkbook}`;
      if (!acc[key]) acc[key] = check;
      return acc;
    }, {} as Record<string, Cheque>)
  );

  // Ordenar por fecha descendente
  const sortedChecks = uniqueChecks.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredChecks = sortedChecks.filter(check => {
    const matchesSearch = 
      String(check.number).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (check.beneficiary ? check.beneficiary.toLowerCase().includes(searchTerm.toLowerCase()) : false);
    
    const matchesStatus = statusFilter === 'todos' || check.status === statusFilter;
    
    const matchesDate = (!dateFrom || check.date >= dateFrom) && 
                       (!dateTo || check.date <= dateTo);
    
    return matchesSearch && matchesStatus && matchesDate;
  }).slice(0, limit);

  const formatCurrency = (amount: number, currency: string = 'GTQ') => {
    if (currency === 'USD') {
      return `$${amount.toFixed(2)}`;
    }
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatCurrencyForPDF = (amount: number, currency: string = 'GTQ') => {
    if (currency === 'USD') {
      return `$${amount.toFixed(2)}`;
    } else {
      return `Q${amount.toFixed(2)}`;
    }
  };

  const formatDateForPDF = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-GT', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  const exportToCSV = () => {
    // Crear un CSV con colores y formato visual atractivo
    const separator = ';'; // Usar punto y coma para mejor separación
    const lineBreak = '\n';
    
    // Crear encabezado profesional con emojis y colores
    const reportInfo = [
      ['🏦', 'SISTEMA DE CONTROL', 'DE CHEQUES', 'BANCARIOS 🏦'],
      ['═════════════════════════════════════════════════════════════════════════════', '', '', ''],
      ['', '', '', ''],
      ['📊 INFORMACIÓN', 'DEL REPORTE', '💼', ''],
      ['📅 Fecha de Generación', new Date().toLocaleDateString('es-GT'), '', ''],
      ['⏰ Hora de Generación', new Date().toLocaleTimeString('es-GT'), '', ''],
      ['📈 Total de Cheques', `${filteredChecks.length.toString()} cheques`, '', ''],
      ['💰 Monto Total', `💰 ${formatCurrencyForPDF(filteredChecks.reduce((sum, check) => sum + check.amount, 0))}`, '', ''],
      ['', '', '', ''],
      ['═════════════════════════════════════════════════════════════════════════════', '', '', ''],
      ['', '', '', '']
    ];
    
    // Encabezados de la tabla principal con emojis y colores
    const headers = [
      '🔢 Número',
      '📅 Fecha', 
      '🏦 Banco',
      '💳 Cuenta',
      '👤 Beneficiario',
      '💰 Monto',
      '💱 Moneda',
      '📝 Concepto',
      '📊 Estado'
    ];
    
    // Crear filas de datos con colores y emojis por estado
    const dataRows = filteredChecks.map(check => {
      const getStatusWithEmoji = (status: string) => {
        switch (status) {
          case 'pendiente': return '⏳ PENDIENTE';
          case 'emitido': return '📤 EMITIDO';
          case 'cobrado': return '✅ COBRADO';
          case 'cancelado': return '❌ CANCELADO';
          default: return `📋 ${status.toUpperCase()}`;
        }
      };
      
      const getCurrencyWithEmoji = (currency: string) => {
        return currency === 'USD' ? '💵 USD ($)' : '💰 GTQ (Q)';
      };
      
      const getAmountWithStyle = (amount: number) => {
        if (amount > 10000) return `💰 ${amount.toFixed(2)} (ALTO)`;
        if (amount > 5000) return `� ${amount.toFixed(2)} (MEDIO)`;
        if (amount > 1000) return `💰 ${amount.toFixed(2)} (NORMAL)`;
        return `💰 ${amount.toFixed(2)}`;
      };
      
      const getBankWithIcon = (bank: string) => {
        const bankIcons: Record<string, string> = {
          'BANCO INDUSTRIAL': '🏭 BI',
          'BANRURAL': '🌾 BANRURAL', 
          'BAC CREDOMATIC': '💳 BAC',
          'BANCO G&T CONTINENTAL': '🌟 G&T',
          'BANCO AGROMERCANTIL': '🌱 BAM',
          'BANCO PROMERICA': '🚀 PROMERICA',
          'BANCO INTERNACIONAL': '🌍 INTERNACIONAL',
          'VIVIBANCO': '💎 VIVIBANCO'
        };
        return bankIcons[bank] || `🏦 ${bank}`;
      };
      
      return [
        `📋 ${check.number}`,
        `📅 ${formatDateForPDF(check.date)}`,
        getBankWithIcon(check.bank),
        `💳 ${check.account_name}`,
        `👤 ${check.beneficiary}`,
        getAmountWithStyle(check.amount),
        getCurrencyWithEmoji(check.currency),
        `📝 ${check.concept}`,
        getStatusWithEmoji(check.status)
      ];
    });
    
    // Estadísticas finales
    const estadisticas = filteredChecks.reduce((acc, check) => {
      acc[check.status] = (acc[check.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const summaryRows = [
      [''],
      ['═════════════════════════════════════════════════════════════════════════════'],
      ['📊 RESUMEN ESTADÍSTICO', 'POR ESTADO', '🎯', ''],
      [''],
      ['⏳ Cheques Pendientes', `${(estadisticas.pendiente || 0).toString()} cheques`],
      ['📤 Cheques Emitidos', `${(estadisticas.emitido || 0).toString()} cheques`],
      ['✅ Cheques Cobrados', `${(estadisticas.cobrado || 0).toString()} cheques`],
      ['❌ Cheques Cancelados', `${(estadisticas.cancelado || 0).toString()} cheques`],
      [''],
      ['💯 TOTAL GENERAL', `🎯 ${filteredChecks.length.toString()} cheques`],
      [''],
      ['💰 ANÁLISIS', 'FINANCIERO', '📈', ''],
      ['💲 Monto Total Procesado', `💰 ${formatCurrencyForPDF(filteredChecks.reduce((sum, check) => sum + check.amount, 0))}`],
      ['⏳ Monto Pendiente', `� ${formatCurrencyForPDF(filteredChecks.filter(c => c.status === 'pendiente').reduce((sum, check) => sum + check.amount, 0))}`],
      ['✅ Monto Cobrado', `💰 ${formatCurrencyForPDF(filteredChecks.filter(c => c.status === 'cobrado').reduce((sum, check) => sum + check.amount, 0))}`],
      ['📤 Monto Emitido', `💰 ${formatCurrencyForPDF(filteredChecks.filter(c => c.status === 'emitido').reduce((sum, check) => sum + check.amount, 0))}`],
      [''],
      ['═════════════════════════════════════════════════════════════════════════════'],
      ['🏦 Sistema de Control', 'de Cheques Bancarios', '© 2025', '💼'],
      [`📧 Reporte generado`, `automáticamente el`, `${new Date().toLocaleString('es-GT')}`, '⏰'],
      ['🔥 ¡Gracias por usar', 'nuestro sistema!', '🚀', '']
    ];
    
    // Combinar todas las filas
    const allRows = [
      ...reportInfo,
      headers,
      ['═══════════════════════════════════════════════════════════════════════════'],
      ...dataRows,
      ...summaryRows
    ];
    
    // Convertir a CSV con separación clara
    const csvContent = allRows.map(row => 
      row.map(cell => {
        // Escapar comillas dobles y envolver en comillas si contiene separador
        const cellStr = String(cell);
        if (cellStr.includes(separator) || cellStr.includes('"') || cellStr.includes('\n')) {
          const escapedCell = cellStr.replace(/"/g, '""');
          return `"${escapedCell}"`;
        }
        return cellStr;
      }).join(separator)
    ).join(lineBreak);

    // Crear y descargar el archivo con BOM para UTF-8 y soporte completo de emojis
    const BOM = '\uFEFF'; // BOM para UTF-8 con soporte de emojis
    const blob = new Blob([BOM + csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Cheques_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('📊 CSV exportado exitosamente');
  };  const exportToPDF = () => {
    try {
      // Verificar que jsPDF esté disponible
      if (typeof jsPDF === 'undefined') {
        toast.error('❌ Error: Librería PDF no disponible');
        return;
      }

      const doc = new jsPDF();
      
      // Encabezado con color de fondo
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, 210, 35, 'F');
      
      // Título principal
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Reporte de Cheques', 20, 20);
      
      // Fecha de generación
      doc.setFontSize(10);
      const fechaTexto = new Date().toLocaleDateString('es-GT');
      doc.text(`Generado: ${fechaTexto}`, 140, 28);
      
      // Estadísticas
      const totalCheques = filteredChecks.length;
      const estadisticas = filteredChecks.reduce((acc, check) => {
        acc[check.status] = (acc[check.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Caja de estadísticas
      doc.setFillColor(248, 250, 252);
      doc.rect(15, 40, 180, 20, 'F');
      
      doc.setTextColor(51, 65, 85);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumen:', 20, 50);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Total: ${totalCheques}`, 20, 55);
      doc.text(`Pendientes: ${estadisticas.pendiente || 0}`, 60, 55);
      doc.text(`Cobrados: ${estadisticas.cobrado || 0}`, 110, 55);
      doc.text(`Cancelados: ${estadisticas.cancelado || 0}`, 150, 55);
      
      // Preparar datos para la tabla
      const tableData = filteredChecks.map(check => [
        check.number,
        formatDateForPDF(check.date),
        check.bank,
        check.beneficiary,
        formatCurrencyForPDF(check.amount, check.currency),
        check.concept.length > 30 ? check.concept.substring(0, 27) + '...' : check.concept,
        check.status.toUpperCase()
      ]);
      
      // Usar autoTable correctamente
      autoTable(doc, {
        head: [['Número', 'Fecha', 'Banco', 'Beneficiario', 'Monto', 'Concepto', 'Estado']],
        body: tableData,
        startY: 70,
        margin: { left: 15, right: 15 },
        styles: {
          fontSize: 8,
          cellPadding: 3,
          font: 'helvetica'
        },
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          textColor: [51, 65, 85]
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { cellWidth: 18, halign: 'center' },
          1: { cellWidth: 25, halign: 'center' },
          2: { cellWidth: 30, halign: 'left' },
          3: { cellWidth: 35, halign: 'left' },
          4: { cellWidth: 25, halign: 'right' },
          5: { cellWidth: 40, halign: 'left' },
          6: { cellWidth: 27, halign: 'center' }
        },
        didParseCell: function(data: any) {
          if (data.column.index === 6) {
            const estado = data.cell.text[0];
            switch (estado) {
              case 'PENDIENTE':
                data.cell.styles.fillColor = [254, 240, 138];
                data.cell.styles.textColor = [146, 64, 14];
                break;
              case 'COBRADO':
                data.cell.styles.fillColor = [220, 252, 231];
                data.cell.styles.textColor = [22, 101, 52];
                break;
              case 'CANCELADO':
                data.cell.styles.fillColor = [254, 226, 226];
                data.cell.styles.textColor = [153, 27, 27];
                break;
              case 'EMITIDO':
                data.cell.styles.fillColor = [219, 234, 254];
                data.cell.styles.textColor = [30, 64, 175];
                break;
            }
          }
          
          // Resaltar montos altos
          if (data.column.index === 4) {
            const montoText = data.cell.text[0];
            const monto = parseFloat(montoText.replace(/[Q$,]/g, ''));
            if (monto > 2000) {
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.textColor = [220, 38, 38];
            }
          }
        },
        didDrawPage: function(data: any) {
          // Pie de página
          const pageCount = (doc as any).internal.getNumberOfPages();
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height || pageSize.getHeight();
          
          doc.setFontSize(8);
          doc.setTextColor(107, 114, 128);
          doc.text(`Página ${data.pageNumber} de ${pageCount}`, 15, pageHeight - 15);
          doc.text('🏦 Sistema de Control de Cheques © 2025', 100, pageHeight - 15);
          
          // Línea decorativa
          doc.setDrawColor(37, 99, 235);
          doc.setLineWidth(0.5);
          doc.line(15, pageHeight - 20, 195, pageHeight - 20);
        }
      });
      
      // Generar nombre de archivo
      const fileName = `Reporte_Cheques_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Guardar el PDF
      doc.save(fileName);
      toast.success('✅ PDF exportado exitosamente');
      
    } catch (error) {
      console.error('Error detallado al generar PDF:', error);
      toast.error(`❌ Error al generar PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  return (
    <TooltipProvider>
      <style>{`
        .cheques-table td {
          color: #111 !important;
        }
        .cheques-table ::selection {
          background: #2563eb;
          color: #111;
        }
      `}</style>
      <div className="space-y-8">
        {/* Encabezado animado y visual tipo notificación */}
        <div className="relative overflow-hidden rounded-2xl shadow-lg bg-gradient-to-r from-blue-600 via-teal-400 to-yellow-400 p-6 flex items-center gap-4 animate-in fade-in slide-in-from-top duration-700">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/30 rounded-2xl flex items-center justify-center animate-bounce">
              <Wallet className="h-8 w-8 text-white drop-shadow-lg" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="inline-block align-middle">💼</span>
                Mi Chequera
              </h2>
              <p className="text-gray-800 text-base font-medium mt-1">¡Todo súper fácil!</p>
            </div>
          </div>
          <button
            className="absolute top-3 right-3 text-gray-700 hover:text-red-500 transition-colors text-xl font-bold bg-white/40 rounded-full p-1 shadow-md focus:outline-none"
            aria-label="Cerrar notificación"
            onClick={() => onNavigate('dashboard')}
          >
            ×
          </button>
        </div>
        <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white mt-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-4 text-3xl font-bold">
              <span className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center animate-bounce">
                <Wallet className="h-6 w-6 text-white" />
              </span>
              <span className="text-white drop-shadow-md">Mis cheques</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-6 w-6 text-pink-200 cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent side="top">
                  <span>Consulta, filtra y exporta tus cheques registrados.</span>
                </TooltipContent>
              </Tooltip>
              <div className="ml-auto">
                <Button
                  onClick={fetchChecks}
                  disabled={loading}
                  className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 rounded-xl transition-all duration-300"
                >
                  {loading ? (
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {loading ? 'Cargando...' : 'Actualizar'}
                </Button>
              </div>
            </CardTitle>
            <p className="text-white/90 text-lg mt-2">Visualiza todos tus cheques, cambia su estado y exporta reportes.</p>
          </CardHeader>
          <CardContent>
            {/* Filtros de búsqueda, estado y cantidad */}
            <div className="flex flex-wrap gap-4 mb-6 items-end">
              <div>
                <Label htmlFor="limit" className="text-white font-semibold">Mostrar</Label>
                <Select value={String(limit)} onValueChange={(v: string) => setLimit(Number(v))}>
                  <SelectTrigger className="w-32 bg-white/80 text-gray-900 font-bold border-2 border-blue-300 focus:border-blue-600 rounded-xl shadow-sm">
                    <SelectValue placeholder="Cantidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Últimos 5</SelectItem>
                    <SelectItem value="10">Últimos 10</SelectItem>
                    <SelectItem value="50">Últimos 50</SelectItem>
                    <SelectItem value="100">Últimos 100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="search" className="text-white font-semibold">Buscar</Label>
                <Input id="search" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Número o beneficiario" className="w-48 bg-white/80 text-gray-900 font-bold border-2 border-blue-300 focus:border-blue-600 rounded-xl shadow-sm" />
              </div>
              <div>
                <Label htmlFor="status" className="text-white font-semibold">Estado</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 bg-white/80 text-gray-900 font-bold border-2 border-blue-300 focus:border-blue-600 rounded-xl shadow-sm">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="cobrado">Cobrado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                    <SelectItem value="emitido">Emitido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dateFrom" className="text-white font-semibold">Desde</Label>
                <Input id="dateFrom" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-36 bg-white/80 text-gray-900 font-bold border-2 border-blue-300 focus:border-blue-600 rounded-xl shadow-sm" />
              </div>
              <div>
                <Label htmlFor="dateTo" className="text-white font-semibold">Hasta</Label>
                <Input id="dateTo" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-36 bg-white/80 text-gray-900 font-bold border-2 border-blue-300 focus:border-blue-600 rounded-xl shadow-sm" />
              </div>
              <Button className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:scale-110 hover:bg-gradient-to-r hover:from-green-500 hover:to-blue-500 transition-all duration-300 animate-pulse" onClick={exportToCSV}>
                <FileSpreadsheet className="w-5 h-5 mr-2 animate-spin" /> Exportar CSV
              </Button>
              <Button className="bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:scale-110 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 transition-all duration-300 animate-pulse" onClick={exportToPDF}>
                <FileText className="w-5 h-5 mr-2 animate-bounce" /> Exportar PDF
              </Button>
            </div>
            {/* Tabla/lista de cheques */}
            <div className="overflow-x-auto rounded-2xl shadow-lg bg-white text-gray-900 cheques-table">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-100 to-indigo-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Número</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Cuenta/Banco</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Beneficiario</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Monto</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Concepto</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChecks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-500">No hay cheques registrados.</td>
                    </tr>
                  ) : (
                    filteredChecks.map(check => (
                      <tr key={check.id} className="hover:bg-blue-50 transition-all">
                        <td className="px-4 py-3 font-mono font-bold bg-white text-black">{check.number}</td>
                        <td className="px-4 py-3 bg-white text-black">
                          {check.date ? new Date(check.date).toLocaleDateString('es-GT', { year: 'numeric', month: '2-digit', day: '2-digit' }) : ''}
                        </td>
                        <td className="px-4 py-3 bg-white text-black">
                          <div className="flex flex-col">
                            <span className="font-semibold text-blue-600">{check.account_name}</span>
                            <span className="text-xs text-gray-500">{check.bank}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 bg-white text-black">{check.beneficiary}</td>
                        <td className="px-4 py-3 font-bold bg-white text-black">{formatCurrency(check.amount, check.currency)}</td>
                        <td className="px-4 py-3 bg-white text-black">{check.concept}</td>
                        <td className="px-4 py-3 bg-white text-black">{getStatusBadge(check.status)}</td>
                        <td className="px-4 py-3 flex gap-2 bg-white">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusChange(check.id, 'cobrado')}
                                className="rounded-full bg-green-100 hover:bg-green-300 text-green-700 shadow-md transition-all duration-200 scale-100 hover:scale-110 animate-in fade-in"
                                disabled={check.status === 'cobrado' || check.status === 'cancelado'}
                              >
                                <CheckCircle2 className="h-5 w-5 animate-bounce" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Cobrar</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusChange(check.id, 'cancelado')}
                                className="rounded-full bg-red-100 hover:bg-red-300 text-red-700 shadow-md transition-all duration-200 scale-100 hover:scale-110 animate-in fade-in"
                                disabled={check.status === 'cobrado' || check.status === 'cancelado'}
                              >
                                <XCircle className="h-5 w-5 animate-bounce" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Cancelar</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusChange(check.id, 'pendiente')}
                                className="rounded-full bg-yellow-100 hover:bg-yellow-300 text-yellow-700 shadow-md transition-all duration-200 scale-100 hover:scale-110 animate-in fade-in"
                                disabled={check.status === 'pendiente' || check.status === 'cobrado' || check.status === 'cancelado'}
                              >
                                <Clock className="h-5 w-5 animate-bounce" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Pendiente</TooltipContent>
                          </Tooltip>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}