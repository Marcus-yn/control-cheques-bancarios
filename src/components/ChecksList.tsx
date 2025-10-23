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
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { getBankIcon } from './ui/smart-icons';

interface ChecksListProps {
  onNavigate: (screen: string) => void;
}

export function ChecksList({ onNavigate }: ChecksListProps) {
  const [limit, setLimit] = useState(10);
  const [checks, setChecks] = useState<Cheque[]>([]);

  React.useEffect(() => {
    const fetchChecks = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/cheques');
        if (res.ok) {
          const data = await res.json();
          setChecks(Array.isArray(data) ? data : []);
        } else {
          toast.error('No se pudieron cargar los cheques');
        }
      } catch {
        toast.error('Error de conexión al backend');
      }
    };
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
            ⏰ Esperando
          </Badge>
        );
      case 'cobrado':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1 text-sm font-bold">
            ✅ Pagado
          </Badge>
        );
      case 'anulado':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 px-3 py-1 text-sm font-bold">
            ❌ Cancelado
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendiente':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'cobrado':
        return <CheckCheck className="h-5 w-5 text-green-600" />;
      case 'anulado':
        return <XCircle className="h-5 w-5 text-red-600" />;
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
          'anulado': '❌ Cheque anulado correctamente',
          'pendiente': '⏰ Cheque marcado como pendiente'
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
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const exportToCSV = () => {
    const headers = ['Número', 'Fecha', 'Beneficiario', 'Monto', 'Concepto', 'Estado'];
    const csvContent = [
      headers.join(','),
      ...filteredChecks.map(check => [
        check.number,
        check.date,
        `"${check.beneficiary}"`,
        check.amount,
        `"${check.concept}"`,
        check.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `cheques_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('📊 Reporte exportado correctamente');
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
                    <SelectItem value="anulado">Anulado</SelectItem>
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
                <Download className="w-5 h-5 mr-2 animate-spin" /> Exportar CSV
              </Button>
            </div>
            {/* Tabla/lista de cheques */}
            <div className="overflow-x-auto rounded-2xl shadow-lg bg-white text-gray-900 cheques-table">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-100 to-indigo-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Número</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700">Fecha</th>
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
                      <td colSpan={7} className="text-center py-8 text-gray-500">No hay cheques registrados.</td>
                    </tr>
                  ) : (
                    filteredChecks.map(check => (
                      <tr key={check.id} className="hover:bg-blue-50 transition-all">
                        <td className="px-4 py-3 font-mono font-bold bg-white text-black">{check.number}</td>
                        <td className="px-4 py-3 bg-white text-black">
                          {check.date ? new Date(check.date).toLocaleDateString('es-GT', { year: 'numeric', month: '2-digit', day: '2-digit' }) : ''}
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
                                disabled={check.status === 'cobrado' || check.status === 'anulado'}
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
                                onClick={() => handleStatusChange(check.id, 'anulado')}
                                className="rounded-full bg-red-100 hover:bg-red-300 text-red-700 shadow-md transition-all duration-200 scale-100 hover:scale-110 animate-in fade-in"
                                disabled={check.status === 'cobrado' || check.status === 'anulado'}
                              >
                                <XCircle className="h-5 w-5 animate-bounce" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Anular</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusChange(check.id, 'pendiente')}
                                className="rounded-full bg-yellow-100 hover:bg-yellow-300 text-yellow-700 shadow-md transition-all duration-200 scale-100 hover:scale-110 animate-in fade-in"
                                disabled={check.status === 'pendiente' || check.status === 'cobrado' || check.status === 'anulado'}
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