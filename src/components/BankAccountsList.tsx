import React, { useEffect, useState } from 'react';
import NewBankAccountForm from './NewBankAccountForm';
import { jsPDF } from 'jspdf';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Edit, Trash2, Save, Banknote, Info } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { toast } from 'sonner';

const bancosGT = [
  'BANRURAL', 'BANCO INDUSTRIAL', 'BANCO G&T CONTINENTAL', 'BANCO AGROMERCANTIL (BAM)', 'BAC CREDOMATIC', 'BANCO PROMERICA', 'BANCO INTERNACIONAL', 'VIVIBANCO'
];

type Cuenta = {
  id: number;
  nombre: string;
  banco: string;
  numero: string;
  moneda: string;
  titular: string;
  tipo_cuenta: string;
  saldo_inicial: number;
  saldo_actual: number;
};

interface BankAccountsListProps {
  onNavigate?: (screen: string) => void;
}

export default function BankAccountsList({ onNavigate }: BankAccountsListProps) {
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Cuenta>>({});
  const [loading, setLoading] = useState(false);

  // Obtener cuentas del backend
  const fetchCuentas = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/cuentas');
      const data = await res.json();
      setCuentas(data);
    } catch {
      toast.error('No se pudo cargar las cuentas');
    }
  };

  useEffect(() => {
    fetchCuentas();
  }, []);

  // Recargar cuentas después de agregar una nueva
  const handleAccountAdded = () => {
    fetchCuentas();
  };

  // Editar cuenta
  const handleEdit = (cuenta: Cuenta) => {
    setEditId(cuenta.id);
    setEditForm({ ...cuenta });
  };

  // Guardar edición
  const handleSaveEdit = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/cuentas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        toast.success('Cuenta actualizada');
        setEditId(null);
        fetchCuentas();
      } else {
        toast.error('Error al actualizar');
      }
    } catch {
      toast.error('Error de conexión');
    }
    setLoading(false);
  };

  // Eliminar cuenta
  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/cuentas/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success('Cuenta eliminada');
        fetchCuentas();
      } else {
        toast.error('Error al eliminar');
      }
    } catch {
      toast.error('Error de conexión');
    }
    setLoading(false);
  };

  // Descargar PDF de la cuenta
  const handleDownloadPDF = (cuenta: Cuenta) => {
    const doc = new jsPDF();
    // Colores por banco
    const bancoColors: Record<string, string> = {
      'BANRURAL': '#006837',
      'BANCO INDUSTRIAL': '#0033A0',
      'BANCO G&T CONTINENTAL': '#FFD600',
      'BANCO AGROMERCANTIL (BAM)': '#E30613',
      'BAC CREDOMATIC': '#E30613',
      'BANCO PROMERICA': '#009540',
      'BANCO INTERNACIONAL': '#0033A0',
      'VIVIBANCO': '#6A1B9A',
    };
    const bgColor = bancoColors[cuenta.banco as keyof typeof bancoColors] || '#F5F5F5';
    doc.setFillColor(bgColor);
    doc.rect(0, 0, 210, 297, 'F'); // Fondo color banco
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(bgColor === '#FFD600' ? '#222' : '#fff');
    doc.setFontSize(20);
    doc.text('Información de la Cuenta Bancaria', 15, 20);
    doc.setFontSize(12);
    doc.text(`Nombre: ${cuenta.nombre}`, 15, 35);
    doc.text(`Banco: ${cuenta.banco}`, 15, 45);
    doc.text(`Número: ${cuenta.numero}`, 15, 55);
    doc.text(`Moneda: ${cuenta.moneda}`, 15, 65);
    doc.text(`Titular: ${cuenta.titular}`, 15, 75);
    doc.text(`Tipo de cuenta: ${cuenta.tipo_cuenta}`, 15, 85);
    doc.text(`Saldo inicial: Q${cuenta.saldo_inicial}`, 15, 95);
    doc.text(`Saldo actual: Q${cuenta.saldo_actual}`, 15, 105);
    doc.save(`Cuenta_${cuenta.numero}.pdf`);
  };

  return (
    <div className="space-y-8">
      {/* Título y botón para crear cuenta */}
      <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-r from-primary via-secondary to-accent text-white">
        <CardHeader>
          <div className="flex items-center gap-4 mb-2">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 animate-bounce">
              <Banknote className="h-8 w-8 text-white" />
            </span>
            <h2 className="text-3xl font-bold">Mis cuentas bancarias</h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-5 w-5 text-pink-200 cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent side="top">
                <span>Administra todas tus cuentas bancarias, edita y elimina fácilmente.</span>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-white/90 text-lg">Visualiza, edita y elimina tus cuentas bancarias de Guatemala</p>
        </CardHeader>
        <CardContent>
          <div className="mb-8 flex justify-end">
            <Button
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-all"
              onClick={() => onNavigate && onNavigate('new-account')}
            >
              <span className="flex items-center gap-2"><Banknote className="w-5 h-5" /> Crear cuenta bancaria</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Lista de cuentas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 mt-8">
        {cuentas.map((cuenta, idx) => (
          <Card key={cuenta.id} className={`rounded-3xl border-0 shadow-2xl p-0 bg-gradient-to-br ${
            cuenta.banco === 'BANRURAL' ? 'from-green-100 to-green-600 border-l-green-600' :
            cuenta.banco === 'BANCO INDUSTRIAL' ? 'from-blue-100 to-blue-700 border-l-blue-700' :
            cuenta.banco === 'BANCO G&T CONTINENTAL' ? 'from-red-100 to-red-600 border-l-red-600' :
            cuenta.banco === 'BANCO AGROMERCANTIL (BAM)' ? 'from-orange-100 to-orange-500 border-l-orange-500' :
            cuenta.banco === 'BAC CREDOMATIC' ? 'from-red-100 to-red-700 border-l-red-700' :
            cuenta.banco === 'BANCO PROMERICA' ? 'from-green-50 to-green-400 border-l-green-400' :
            cuenta.banco === 'BANCO INTERNACIONAL' ? 'from-blue-50 to-blue-400 border-l-blue-400' :
            cuenta.banco === 'VIVIBANCO' ? 'from-purple-100 to-purple-600 border-l-purple-600' :
            'from-card to-primary border-l-accent'
          } text-foreground transition-all duration-300 hover:scale-[1.03] border-l-4`}>
            <CardContent className="p-8 flex flex-col justify-between h-full">
              {editId === cuenta.id ? (
                <form className="space-y-5" onSubmit={e => { e.preventDefault(); handleSaveEdit(cuenta.id); }}>
                  <input value={editForm.nombre || ''} onChange={e => setEditForm({ ...editForm, nombre: e.target.value })} required className="text-2xl font-bold bg-card text-primary rounded-xl p-2 border border-primary placeholder-primary" />
                  <div className="text-xl font-bold bg-card text-secondary rounded-xl p-2 border border-secondary">Banco: {cuenta.banco}</div>
                  <div className="text-lg font-mono font-bold bg-card text-accent rounded-xl p-2 border border-accent">N°: {cuenta.numero}</div>
                  <input value={editForm.titular || ''} onChange={e => setEditForm({ ...editForm, titular: e.target.value })} required className="text-lg font-bold bg-card text-secondary rounded-xl p-2 border border-secondary placeholder-secondary" placeholder="Titular" />
                  <select value={editForm.moneda || ''} onChange={e => setEditForm({ ...editForm, moneda: e.target.value })} required className="h-12 rounded-xl border border-accent text-lg font-bold p-2 text-accent">
                    <option value="GTQ">Quetzales (GTQ)</option>
                    <option value="USD">Dólares (USD)</option>
                  </select>
                  <select value={editForm.tipo_cuenta || 'monetaria'} onChange={e => setEditForm({ ...editForm, tipo_cuenta: e.target.value })} required className="h-12 rounded-xl border border-primary text-lg font-bold p-2 text-primary">
                    <option value="monetaria">Monetaria</option>
                    <option value="ahorro">Ahorro</option>
                  </select>
                  <div className="text-lg font-bold bg-card text-accent rounded-xl p-2 border border-accent">Saldo inicial: {cuenta.saldo_inicial}</div>
                  <div className="text-lg font-bold bg-card text-accent rounded-xl p-2 border border-accent">Saldo actual: {cuenta.saldo_actual}</div>
                  <Button type="submit" className="h-12 rounded-xl bg-primary text-primary-foreground font-bold text-xl">
                    <Save className="h-6 w-6 mr-2 animate-bounce" />Guardar
                  </Button>
                </form>
              ) : (
                <div className="space-y-3">
                  {(() => {
                    const bancoColors: Record<string, string> = {
                      'BANRURAL': '#006837',
                      'BANCO INDUSTRIAL': '#0033A0',
                      'BANCO G&T CONTINENTAL': '#FFD600',
                      'BANCO AGROMERCANTIL (BAM)': '#E30613',
                      'BAC CREDOMATIC': '#E30613',
                      'BANCO PROMERICA': '#009540',
                      'BANCO INTERNACIONAL': '#0033A0',
                      'VIVIBANCO': '#6A1B9A',
                    };
                    const bgColor = bancoColors[cuenta.banco as keyof typeof bancoColors] || '#F5F5F5';
                    const textColor = bgColor === '#FFD600' ? 'text-gray-900' : 'text-white';
                    return (
                      <div className={`rounded-2xl p-6 ${textColor}`} style={{ background: bgColor }}>
                        <div className="flex items-center gap-3 mb-2">
                          <Banknote className="h-8 w-8" />
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-5 w-5 cursor-pointer" />
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <span>Esta es la información de la cuenta bancaria registrada.</span>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <h3 className="text-2xl font-extrabold drop-shadow-lg mb-2">{cuenta.nombre}</h3>
<div>
  <span className="block text-xs">Banco</span>
  <span className="font-bold text-lg">{cuenta.banco}</span>
</div>                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <span className="block text-xs">Número</span>
                            <span className="font-mono font-bold text-lg">{cuenta.numero}</span>
                          </div>
                          <div>
                            <span className="block text-xs">Moneda</span>
                            <span className="font-mono font-bold text-lg">{cuenta.moneda}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <span className="block text-xs">Titular</span>
                            <span className="font-bold">{cuenta.titular}</span>
                          </div>
                          <div>
                            <span className="block text-xs">Tipo</span>
                            <span className="font-bold">{cuenta.tipo_cuenta}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <span className="block text-xs">Saldo inicial</span>
                            <span className="font-bold">{cuenta.saldo_inicial}</span>
                          </div>
                          <div>
                            <span className="block text-xs">Saldo actual</span>
                            <span className="font-bold">{cuenta.saldo_actual}</span>
                          </div>
                        </div>
                        <div className="flex justify-end items-center gap-2 mt-6">
                          <Button variant="ghost" size="lg" className="bg-primary text-primary-foreground font-bold text-lg px-6 py-3" onClick={() => handleEdit(cuenta)}>
                            <Edit className="h-5 w-5 mr-2" /> Editar
                          </Button>
                          <Button variant="ghost" size="lg" className="bg-destructive text-destructive-foreground font-bold text-lg px-6 py-3" onClick={() => handleDelete(cuenta.id)}>
                            <Trash2 className="h-5 w-5 mr-2" /> Eliminar
                          </Button>
                          <Button variant="ghost" size="lg" className="bg-accent text-accent-foreground font-bold text-lg px-6 py-3" onClick={() => handleDownloadPDF(cuenta)}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-8m0 8l-4-4m4 4l4-4m-8 8h8a2 2 0 002-2V7a2 2 0 00-2-2H8a2 2 0 00-2 2v11a2 2 0 002 2z" /></svg>
                            PDF
                          </Button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
