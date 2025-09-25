import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { AlertCircle, Calculator, FileText, ArrowLeft, Save } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner@2.0.3';
import { getBankIcon } from './ui/smart-icons';

interface NewCheckFormProps {
  onNavigate: (screen: string) => void;
}

const mockAccounts = [
  { id: '1', name: 'Cuenta Principal - Banco Agromercantil (BAM)', balance: 387500, currency: 'GTQ', bank: 'BAM' },
  { id: '2', name: 'Cuenta Operativa - Banco Industrial (BI)', balance: 125000, currency: 'GTQ', bank: 'BI' },
  { id: '3', name: 'Cuenta Dólares - BAC Credomatic', balance: 45000, currency: 'USD', bank: 'BAC' },
  { id: '4', name: 'Cuenta Nómina - Banrural', balance: 98750, currency: 'GTQ', bank: 'BANRURAL' },
  { id: '5', name: 'Cuenta Comercial - G&T Continental', balance: 256300, currency: 'GTQ', bank: 'GYT' },
  { id: '6', name: 'Cuenta USD - Banco Promerica', balance: 78200, currency: 'USD', bank: 'PROMERICA' },
  { id: '7', name: 'Cuenta Empresarial - Banco Internacional', balance: 145600, currency: 'GTQ', bank: 'INTERNACIONAL' },
  { id: '8', name: 'Cuenta Microempresa - Vivibanco', balance: 89400, currency: 'GTQ', bank: 'VIVIBANCO' }
];

const mockCheckbooks = [
  { id: '1', name: 'CHQ-BAM-001', accountId: '1', startNumber: 1240, endNumber: 1300, nextNumber: 1246, bank: 'BAM' },
  { id: '2', name: 'CHQ-BI-002', accountId: '2', startNumber: 1001, endNumber: 1100, nextNumber: 1025, bank: 'BI' },
  { id: '3', name: 'CHQ-BAC-USD-001', accountId: '3', startNumber: 5001, endNumber: 5100, nextNumber: 5012, bank: 'BAC' },
  { id: '4', name: 'CHQ-BANRURAL-003', accountId: '4', startNumber: 2050, endNumber: 2150, nextNumber: 2078, bank: 'BANRURAL' },
  { id: '5', name: 'CHQ-GYT-004', accountId: '5', startNumber: 3200, endNumber: 3300, nextNumber: 3245, bank: 'GYT' },
  { id: '6', name: 'CHQ-PROM-USD-002', accountId: '6', startNumber: 6001, endNumber: 6100, nextNumber: 6023, bank: 'PROMERICA' },
  { id: '7', name: 'CHQ-INT-005', accountId: '7', startNumber: 4100, endNumber: 4200, nextNumber: 4156, bank: 'INTERNACIONAL' },
  { id: '8', name: 'CHQ-VIVI-006', accountId: '8', startNumber: 7500, endNumber: 7600, nextNumber: 7534, bank: 'VIVIBANCO' }
];

const mockBeneficiaries = [
  'Proveedores Guatemala S.A.',
  'Servicios Generales Ltda.',
  'Transportes Rápidos',
  'Suministros de Oficina',
  'Nómina Empleados',
  'Servicios Públicos',
  'Mantenimiento Industrial'
];

export function NewCheckForm({ onNavigate }: NewCheckFormProps) {
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedCheckbook, setSelectedCheckbook] = useState('');
  const [checkNumber, setCheckNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [beneficiary, setBeneficiary] = useState('');
  const [amount, setAmount] = useState('');
  const [concept, setConcept] = useState('');
  const [autoCheckNumber, setAutoCheckNumber] = useState(true);
  const [loading, setLoading] = useState(false);
  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState<string[]>([]);

  const availableCheckbooks = mockCheckbooks.filter(cb => cb.accountId === selectedAccount);
  const currentAccount = mockAccounts.find(acc => acc.id === selectedAccount);
  const currentCheckbook = mockCheckbooks.find(cb => cb.id === selectedCheckbook);

  useEffect(() => {
    if (selectedCheckbook && autoCheckNumber) {
      const checkbook = mockCheckbooks.find(cb => cb.id === selectedCheckbook);
      if (checkbook) {
        setCheckNumber(checkbook.nextNumber.toString().padStart(6, '0'));
      }
    }
  }, [selectedCheckbook, autoCheckNumber]);

  useEffect(() => {
    if (beneficiary) {
      const filtered = mockBeneficiaries.filter(b => 
        b.toLowerCase().includes(beneficiary.toLowerCase())
      );
      setFilteredBeneficiaries(filtered);
    } else {
      setFilteredBeneficiaries([]);
    }
  }, [beneficiary]);

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
    return currentAccount.balance - numAmount;
  };

  const validateForm = () => {
    const errors = [];
    
    if (!selectedAccount) errors.push('Debe seleccionar una cuenta');
    if (!selectedCheckbook) errors.push('Debe seleccionar una chequera');
    if (!checkNumber) errors.push('Debe ingresar el número de cheque');
    if (!beneficiary) errors.push('Debe ingresar el beneficiario');
    if (!amount || parseFloat(amount) <= 0) errors.push('El monto debe ser mayor a 0');
    if (!concept) errors.push('Debe ingresar el concepto');
    
    const numAmount = parseFloat(amount);
    if (currentAccount && numAmount > currentAccount.balance) {
      errors.push('El monto excede el saldo disponible');
    }
    
    const numCheckNumber = parseInt(checkNumber);
    if (currentCheckbook && (numCheckNumber < currentCheckbook.startNumber || numCheckNumber > currentCheckbook.endNumber)) {
      errors.push(`El número de cheque debe estar entre ${currentCheckbook.startNumber} y ${currentCheckbook.endNumber}`);
    }
    
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
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Cheque registrado correctamente');
      setLoading(false);
      onNavigate('checks');
    }, 1500);
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
          <h1 className="text-3xl font-semibold">Registrar Nuevo Cheque</h1>
          <p className="text-muted-foreground mt-1">
            Complete la información del cheque a emitir
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Información del Cheque
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
                        {mockAccounts.map((account) => {
                          const BankIcon = getBankIcon(account.bank);
                          return (
                            <SelectItem key={account.id} value={account.id}>
                              <div className="flex items-center gap-3 w-full">
                                <BankIcon className="h-5 w-5 text-primary flex-shrink-0" />
                                <div className="flex flex-col flex-1 min-w-0">
                                  <span className="truncate">{account.name}</span>
                                  <span className="text-sm text-muted-foreground">
                                    Saldo: {formatCurrency(account.balance, account.currency)}
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="checkbook">Chequera *</Label>
                    <Select 
                      value={selectedCheckbook} 
                      onValueChange={setSelectedCheckbook}
                      disabled={!selectedAccount}
                    >
                      <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder="Seleccionar chequera" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCheckbooks.map((checkbook) => {
                          const BankIcon = getBankIcon(checkbook.bank);
                          return (
                            <SelectItem key={checkbook.id} value={checkbook.id}>
                              <div className="flex items-center gap-3 w-full">
                                <BankIcon className="h-5 w-5 text-secondary flex-shrink-0" />
                                <div className="flex flex-col flex-1 min-w-0">
                                  <span className="truncate">{checkbook.name}</span>
                                  <span className="text-sm text-muted-foreground">
                                    Rango: {checkbook.startNumber} - {checkbook.endNumber}
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="checkNumber">Número de Cheque *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="checkNumber"
                        value={checkNumber}
                        onChange={(e) => setCheckNumber(e.target.value)}
                        placeholder="001246"
                        className="font-mono rounded-lg"
                        disabled={autoCheckNumber}
                      />
                      <Button
                        type="button"
                        variant={autoCheckNumber ? "default" : "outline"}
                        onClick={() => setAutoCheckNumber(!autoCheckNumber)}
                        className="rounded-lg px-4 whitespace-nowrap"
                        size="default"
                      >
                        <span className="text-sm font-medium">Auto</span>
                      </Button>
                    </div>
                    {currentCheckbook && (
                      <p className="text-sm text-muted-foreground">
                        Próximo disponible: {currentCheckbook.nextNumber.toString().padStart(6, '0')}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="beneficiary">Beneficiario *</Label>
                  <div className="relative">
                    <Input
                      id="beneficiary"
                      value={beneficiary}
                      onChange={(e) => setBeneficiary(e.target.value)}
                      placeholder="Nombre del beneficiario"
                      className="rounded-lg"
                    />
                    {filteredBeneficiaries.length > 0 && beneficiary && (
                      <div className="absolute z-10 w-full mt-1 bg-card border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                        {filteredBeneficiaries.map((b, index) => (
                          <button
                            key={index}
                            type="button"
                            className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                            onClick={() => {
                              setBeneficiary(b);
                              setFilteredBeneficiaries([]);
                            }}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Monto *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      {currentAccount?.currency === 'USD' ? '$' : 'Q'}
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

                <div className="space-y-2">
                  <Label htmlFor="concept">Concepto *</Label>
                  <Textarea
                    id="concept"
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    placeholder="Describe el motivo del pago"
                    className="rounded-lg resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onNavigate('checks')}
                    className="flex-1 rounded-lg"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || validateForm().length > 0}
                    className="flex-1 bg-primary hover:bg-primary/90 rounded-lg"
                  >
                    {loading ? (
                      'Guardando...'
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Cheque
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
                      {formatCurrency(currentAccount.balance, currentAccount.currency)}
                    </span>
                  </div>
                  
                  {amount && !isNaN(parseFloat(amount)) && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Monto cheque:</span>
                        <span className="font-mono text-red-600">
                          -{formatCurrency(parseFloat(amount), currentAccount.currency)}
                        </span>
                      </div>
                      
                      <div className="border-t pt-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Saldo después:</span>
                          <span className={`font-mono ${newBalance && newBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {newBalance !== null && formatCurrency(newBalance, currentAccount.currency)}
                          </span>
                        </div>
                      </div>
                      
                      {newBalance && newBalance < 0 && (
                        <Alert className="rounded-lg border-red-200 bg-red-50">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-red-700">
                            El monto excede el saldo disponible en la cuenta
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  )}
                </>
              )}

              {currentCheckbook && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Información de Chequera</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Código:</span>
                      <span className="font-mono">{currentCheckbook.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rango:</span>
                      <span className="font-mono">
                        {currentCheckbook.startNumber} - {currentCheckbook.endNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Próximo:</span>
                      <Badge variant="outline" className="font-mono">
                        {currentCheckbook.nextNumber.toString().padStart(6, '0')}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg">Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">
                  El número de cheque se asigna automáticamente. Puedes cambiarlo manualmente si es necesario.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">
                  Los beneficiarios se autocompletan basándose en el historial.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">
                  Verifica que el monto no exceda el saldo disponible antes de guardar.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}