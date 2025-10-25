import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import React from "react";
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Save, CreditCard, Calculator } from 'lucide-react';
import { toast } from 'sonner';

interface DepositFormProps {
  onNavigate: (screen: string) => void;
}

interface Account {
  id: number;
  nombre: string;
  banco: string;
  numero: string;
  saldo_actual: number;
  moneda: string;
}

export function DepositForm({ onNavigate }: DepositFormProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [concept, setConcept] = useState('');
  const [depositType, setDepositType] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  // Cargar cuentas reales desde la API
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/cuentas');
        if (!response.ok) throw new Error('Error al cargar cuentas');
        const data = await response.json();
        setAccounts(data);
      } catch (err) {
        console.error('Error:', err);
        toast.error('Error al cargar las cuentas');
      } finally {
        setLoadingAccounts(false);
      }
    };

    fetchAccounts();
  }, []);

  const currentAccount = accounts.find(acc => acc.id.toString() === selectedAccount);

  const formatCurrency = (amount: number, currency: string = 'GTQ') => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const calculateNewBalance = () => {
    if (!currentAccount || !amount) return null;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return null;
    return currentAccount.saldo_actual + numAmount;
  };

  const validateForm = () => {
    const errors = [];
    
    if (!selectedAccount) errors.push('Debe seleccionar una cuenta');
    if (!amount || parseFloat(amount) <= 0) errors.push('El monto debe ser mayor a 0');
    if (!depositType) errors.push('Debe seleccionar el tipo de depósito');
    if (!concept) errors.push('Debe ingresar el concepto');
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }
    
    setLoading(true);
    
    try {
      const depositData = {
        cuenta_id: parseInt(selectedAccount),
        monto: parseFloat(amount),
        concepto: concept,
        depositante: reference || 'No especificado',
        tipo: depositType || 'efectivo'
      };

      console.log('Enviando depósito:', depositData);

      const response = await fetch('http://localhost:3001/api/depositos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(depositData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al registrar el depósito');
      }

      const result = await response.json();
      console.log('Resultado:', result);
      
      toast.success(`✅ Depósito de ${formatCurrency(parseFloat(amount))} registrado correctamente`);
      toast.success(`💰 Nuevo saldo: ${formatCurrency(result.data.saldo_nuevo)}`);
      
      // Limpiar formulario
      setSelectedAccount('');
      setAmount('');
      setReference('');
      setConcept('');
      setDepositType('');
      
      // Esperar un momento antes de navegar para que el usuario vea el mensaje
      setTimeout(() => {
        onNavigate('dashboard');
      }, 2000);
      
    } catch (err) {
      console.error('Error:', err);
      toast.error(`❌ ${err instanceof Error ? err.message : 'Error al registrar el depósito'}`);
    } finally {
      setLoading(false);
    }
  };

  const newBalance = calculateNewBalance();

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
          <h1 className="text-3xl font-semibold">Registrar Depósito</h1>
          <p className="text-muted-foreground mt-1">
            Complete la información del depósito o abono
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Información del Depósito
              </CardTitle>
              <CardDescription>
                Todos los campos marcados con * son obligatorios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="account">Cuenta Bancaria *</Label>
                    <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                      <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder="Seleccionar cuenta" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id.toString()}>
                            <div className="flex flex-col">
                              <span>{account.nombre} - {account.banco}</span>
                              <span className="text-sm text-muted-foreground">
                                Saldo: {formatCurrency(account.saldo_actual, account.moneda)}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="depositType">Tipo de Depósito *</Label>
                    <Select value={depositType} onValueChange={setDepositType}>
                      <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="efectivo">Depósito en Efectivo</SelectItem>
                        <SelectItem value="cheque">Depósito de Cheque</SelectItem>
                        <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                        <SelectItem value="abono">Abono Directo</SelectItem>
                        <SelectItem value="otros">Otros Ingresos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha de Depósito *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Monto *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        {currentAccount?.moneda === 'USD' ? '$' : 'Q'}
                      </span>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="pl-8 font-mono rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference">Número de Referencia</Label>
                  <Input
                    id="reference"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Ej: Boleta, número de transferencia, etc."
                    className="rounded-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    Opcional: Ingrese el número de boleta, referencia de transferencia u otro identificador
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="concept">Concepto *</Label>
                  <Textarea
                    id="concept"
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    placeholder="Describe el origen o motivo del depósito"
                    className="rounded-lg resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onNavigate('dashboard')}
                    className="flex-1 rounded-lg"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || validateForm().length > 0}
                    className="flex-1 bg-secondary hover:bg-secondary/90 rounded-lg"
                  >
                    {loading ? (
                      'Guardando...'
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Registrar Depósito
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Resumen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentAccount && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Saldo actual:</span>
                    <span className="font-mono">
                      {formatCurrency(currentAccount.saldo_actual, currentAccount.moneda)}
                    </span>
                  </div>
                  
                  {amount && !isNaN(parseFloat(amount)) && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Monto depósito:</span>
                        <span className="font-mono text-green-600">
                          +{formatCurrency(parseFloat(amount), currentAccount.moneda)}
                        </span>
                      </div>
                      
                      <div className="border-t pt-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Saldo después:</span>
                          <span className="font-mono text-green-600">
                            {newBalance !== null && formatCurrency(newBalance, currentAccount.moneda)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Types Info */}
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg">Tipos de Depósito</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium">Efectivo</p>
                <p className="text-muted-foreground">Depósito directo en ventanilla</p>
              </div>
              <div>
                <p className="font-medium">Cheque</p>
                <p className="text-muted-foreground">Depósito de cheques de terceros</p>
              </div>
              <div>
                <p className="font-medium">Transferencia</p>
                <p className="text-muted-foreground">Transferencias desde otras cuentas</p>
              </div>
              <div>
                <p className="font-medium">Abono Directo</p>
                <p className="text-muted-foreground">Abonos automáticos (nómina, etc.)</p>
              </div>
              <div>
                <p className="font-medium">Otros Ingresos</p>
                <p className="text-muted-foreground">Intereses, comisiones, etc.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}