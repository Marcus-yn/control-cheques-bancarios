import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';

const bancosGT: string[] = [
  'BANRURAL',
  'BANCO INDUSTRIAL',
  'BANCO G&T CONTINENTAL',
  'BANCO AGROMERCANTIL (BAM)',
  'BAC CREDOMATIC',
  'BANCO PROMERICA',
  'BANCO INTERNACIONAL',
  'VIVIBANCO'
];

const bancoColores: Record<string, {from: string, to: string, text: string, border: string, button: string, buttonText: string}> = {
  'BANRURAL': {
    from: 'from-green-700', to: 'to-yellow-400', text: 'text-green-900', border: 'border-green-700', button: 'bg-gradient-to-r from-green-700 to-yellow-400', buttonText: 'text-green-900',
  },
  'BANCO INDUSTRIAL': {
    from: 'from-blue-900', to: 'to-yellow-300', text: 'text-blue-900', border: 'border-blue-900', button: 'bg-gradient-to-r from-blue-900 to-yellow-300', buttonText: 'text-blue-900',
  },
  'BANCO G&T CONTINENTAL': {
    from: 'from-yellow-700', to: 'to-blue-900', text: 'text-yellow-900', border: 'border-yellow-700', button: 'bg-gradient-to-r from-yellow-700 to-blue-900', buttonText: 'text-yellow-900',
  },
  'BANCO AGROMERCANTIL (BAM)': {
    from: 'from-red-700', to: 'to-gray-900', text: 'text-red-900', border: 'border-red-700', button: 'bg-gradient-to-r from-red-700 to-gray-900', buttonText: 'text-red-900',
  },
  'BAC CREDOMATIC': {
    from: 'from-red-700', to: 'to-blue-700', text: 'text-red-900', border: 'border-red-700', button: 'bg-gradient-to-r from-red-700 to-blue-700', buttonText: 'text-red-900',
  },
  'BANCO PROMERICA': {
    from: 'from-green-700', to: 'to-gray-300', text: 'text-green-900', border: 'border-green-700', button: 'bg-gradient-to-r from-green-700 to-gray-300', buttonText: 'text-green-900',
  },
  'BANCO INTERNACIONAL': {
    from: 'from-blue-900', to: 'to-gray-300', text: 'text-blue-900', border: 'border-blue-900', button: 'bg-gradient-to-r from-blue-900 to-gray-300', buttonText: 'text-blue-900',
  },
  'VIVIBANCO': {
    from: 'from-purple-700', to: 'to-pink-400', text: 'text-purple-900', border: 'border-purple-700', button: 'bg-gradient-to-r from-purple-700 to-pink-400', buttonText: 'text-purple-900',
  },
};

function generarNumeroCuenta(banco: string) {
  const prefijos: Record<string, string> = {
    'BANRURAL': 'BR',
    'BANCO INDUSTRIAL': 'BI',
    'BANCO G&T CONTINENTAL': 'GT',
    'BANCO AGROMERCANTIL (BAM)': 'BAM',
    'BAC CREDOMATIC': 'BAC',
    'BANCO PROMERICA': 'PRO',
    'BANCO INTERNACIONAL': 'INT',
    'VIVIBANCO': 'VIV'
  };
  const prefijo = prefijos[banco] || 'GT';
  return `${prefijo}-${Math.floor(10000000 + Math.random() * 90000000)}`;
}

interface NewBankAccountFormProps {
  onAccountAdded?: () => void;
}

export default function NewBankAccountForm({ onAccountAdded }: NewBankAccountFormProps) {
  const [nombre, setNombre] = useState('');
  const [banco, setBanco] = useState(bancosGT[0]);
  const [numero, setNumero] = useState(generarNumeroCuenta(bancosGT[0]));
  const [moneda, setMoneda] = useState('GTQ');
  const [titular, setTitular] = useState('');
  const [tipoCuenta, setTipoCuenta] = useState('monetaria');
  const [saldoInicial, setSaldoInicial] = useState('');
  // Colores sólidos por banco seleccionado
  const bancoSolidColors: Record<string, string> = {
    'BANRURAL': '#006837',
    'BANCO INDUSTRIAL': '#0033A0',
    'BANCO G&T CONTINENTAL': '#FFD600',
    'BANCO AGROMERCANTIL (BAM)': '#E30613',
    'BAC CREDOMATIC': '#E30613',
    'BANCO PROMERICA': '#009540',
    'BANCO INTERNACIONAL': '#0033A0',
    'VIVIBANCO': '#6A1B9A',
  };
  const solidBg = bancoSolidColors[banco] || '#F5F5F5';
  // Restaurar variable colores para los estilos de texto y bordes
  const colores = bancoColores[banco] || bancoColores['BANCO INDUSTRIAL'];

  useEffect(() => {
    setNumero(generarNumeroCuenta(banco));
  }, [banco]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !banco || !titular) {
      toast.error('Nombre, banco y titular son obligatorios');
      return;
    }
    try {
      const res = await fetch('http://localhost:3001/api/cuentas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          banco,
          numero,
          moneda,
          tipo_cuenta: tipoCuenta,
          titular,
          saldo_inicial: saldoInicial ? parseFloat(saldoInicial) : 0
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Cuenta registrada correctamente');
        setNombre('');
        setBanco(bancosGT[0]);
        setMoneda('GTQ');
        setTitular('');
        setTipoCuenta('monetaria');
        setSaldoInicial('');
        setNumero(generarNumeroCuenta(bancosGT[0]));
        if (onAccountAdded) onAccountAdded();
      } else {
        toast.error(data.error || 'Error al registrar la cuenta');
      }
    } catch (err) {
      toast.error('Error de conexión al backend');
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 mb-12 rounded-3xl shadow-2xl border-4 bg-white">
      <div className="p-8">
  <div className="rounded-2xl border-0 shadow-lg bg-gradient-to-r from-primary via-secondary to-accent text-white mb-12 p-8">
          <div className="flex items-center gap-4 mb-2">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 animate-bounce">
              <svg xmlns='http://www.w3.org/2000/svg' className='h-8 w-8 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 10h18M3 6h18M3 14h18M3 18h18' /></svg>
            </span>
            <h2 className="text-3xl font-bold">Registrar nueva cuenta bancaria</h2>
          </div>
        </div>
  <div className="mb-2"></div>
  <div className={`rounded-2xl p-8 mb-8 mt-10 ${solidBg === '#FFD600' ? 'text-gray-900' : 'text-white'} transition-all duration-300`} style={{ background: solidBg }}>
          <div className="flex items-center gap-3 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18M3 14h18M3 18h18" /></svg>
            <span className="font-bold text-lg">Así se verá tu cuenta:</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="inline-block animate-bounce">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V5a1 1 0 00-1-1H9a1 1 0 00-1 1v6M12 17v2m-6-6h12" /></svg>
              </span>
              <span className="block text-xs">Banco</span>
              <span className="font-bold text-lg">{banco || <span className="italic text-sm">Selecciona banco</span>}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block animate-bounce">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a5 5 0 00-10 0v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2z" /></svg>
              </span>
              <span className="block text-xs">Número</span>
              <span className="font-mono font-bold text-lg">{numero || <span className="italic text-sm">Se generará</span>}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="inline-block animate-bounce">
                {moneda === 'USD' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" /><text x="7" y="19" fontSize="14" fill="currentColor">$</text></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" /><text x="7" y="19" fontSize="14" fill="currentColor">Q</text></svg>
                )}
              </span>
              <span className="block text-xs">Moneda</span>
              <span className="font-bold text-lg">{moneda || <span className="italic text-sm">Selecciona moneda</span>}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block animate-bounce">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              </span>
              <span className="block text-xs">Tipo</span>
              <span className="font-bold text-lg">{tipoCuenta || <span className="italic text-sm">Selecciona tipo</span>}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="inline-block animate-bounce">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </span>
              <span className="block text-xs">Titular</span>
              <span className="font-bold text-lg">{titular ? titular : <span className="italic text-sm">Escribe el titular</span>}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block animate-bounce">
                {moneda === 'USD' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" /><text x="7" y="19" fontSize="14" fill="currentColor">$</text></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" /><text x="7" y="19" fontSize="14" fill="currentColor">Q</text></svg>
                )}
              </span>
              <span className="block text-xs">Saldo inicial</span>
              <span className="font-bold text-lg">{saldoInicial ? saldoInicial : <span className="italic text-sm">0.00</span>}</span>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="nombre" className={`text-sm font-bold ${colores.text}`}>Nombre de la Cuenta *</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Ej: Cuenta Principal"
                className={`rounded-xl ${colores.text} text-lg font-bold ${colores.border} border-2 placeholder-gray-400`}
                required
              />
            </div>
            <div>
              <Label htmlFor="titular" className={`text-sm font-bold ${colores.text}`}>Titular *</Label>
              <Input
                id="titular"
                value={titular}
                onChange={e => setTitular(e.target.value)}
                placeholder="Nombre del titular"
                className={`rounded-xl ${colores.text} text-lg font-bold ${colores.border} border-2 placeholder-gray-400`}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="banco" className={`text-sm font-bold ${colores.text}`}>Banco *</Label>
              <Select value={banco} onValueChange={setBanco}>
                <SelectTrigger className={`rounded-xl ${colores.border} border-2 placeholder-gray-400`}>
                  <SelectValue placeholder="Seleccionar banco" className={colores.text} />
                </SelectTrigger>
                <SelectContent>
                  {bancosGT.map(b => (
                    <SelectItem key={b} value={b} className={colores.text}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="numero" className={`text-sm font-bold ${colores.text}`}>Número de Cuenta *</Label>
              <Input
                id="numero"
                value={numero}
                readOnly
                className={`rounded-lg font-mono bg-white ${colores.text} font-bold text-lg ${colores.border} border-2 placeholder-gray-400`}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="moneda" className={`text-sm font-bold ${colores.text}`}>Moneda</Label>
              <Select value={moneda} onValueChange={setMoneda}>
                <SelectTrigger className={`rounded-xl ${colores.border} border-2 placeholder-gray-400`}>
                  <SelectValue className={colores.text} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GTQ" className={colores.text}>Quetzales (GTQ)</SelectItem>
                  <SelectItem value="USD" className={colores.text}>Dólares (USD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tipoCuenta" className={`text-sm font-bold ${colores.text}`}>Tipo de Cuenta</Label>
              <Select value={tipoCuenta} onValueChange={setTipoCuenta}>
                <SelectTrigger className={`rounded-xl ${colores.border} border-2 placeholder-gray-400`}>
                  <SelectValue className={colores.text} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monetaria" className={colores.text}>Monetaria</SelectItem>
                  <SelectItem value="ahorro" className={colores.text}>Ahorro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="saldoInicial" className={`text-sm font-bold ${colores.text}`}>Saldo Inicial</Label>
              <Input
                id="saldoInicial"
                type="number"
                min="0"
                step="0.01"
                value={saldoInicial}
                onChange={e => setSaldoInicial(e.target.value.replace(/^0+(?=\d)/, ''))}
                placeholder="0.00"
                className={`rounded-xl ${colores.text} text-lg font-bold ${colores.border} border-2 placeholder-gray-400`}
              />
            </div>
          </div>
          <Button type="submit" className={`col-span-2 mt-8 h-14 rounded-2xl font-bold text-xl shadow-xl`} style={{ background: solidBg, color: solidBg === '#FFD600' ? '#222' : '#fff' }}>
            Registrar Cuenta
          </Button>
        </form>
      </div>
    </div>
  );
}
