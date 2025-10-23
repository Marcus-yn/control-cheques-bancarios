import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  ArrowLeft, 
  Save, 
  CreditCard, 
  Calculator,
  Wallet,
  DollarSign,
  Calendar,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Banknote,
  Building,
  ArrowUpCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface DepositModuleProps {
  onNavigate: (screen: string) => void;
}

interface Account {
  id: number;
  name: string;
  number: string;
  bank: string;
  balance: number;
  currency: string;
  type: string;
}

interface DepositType {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresReference: boolean;
}

const mockAccounts: Account[] = [
  { 
    id: 1, 
    name: 'Cuenta Principal', 
    number: 'BAM-12345678', 
    bank: 'BANCO AGROMERCANTIL', 
    balance: 387500, 
    currency: 'GTQ',
    type: 'corriente'
  },
  { 
    id: 2, 
    name: 'Cuenta Operativa', 
    number: 'BI-87654321', 
    bank: 'BANCO INDUSTRIAL', 
    balance: 125000, 
    currency: 'GTQ',
    type: 'corriente'
  },
  { 
    id: 3, 
    name: 'Cuenta Dólares', 
    number: 'BAM-USD-11111', 
    bank: 'BANCO AGROMERCANTIL', 
    balance: 45000, 
    currency: 'USD',
    type: 'ahorro'
  }
];

const depositTypes: DepositType[] = [
  { 
    id: 'efectivo', 
    name: 'Depósito en Efectivo', 
    description: 'Depósito directo en ventanilla del banco',
    icon: Banknote,
    requiresReference: true
  },
  { 
    id: 'cheque', 
    name: 'Depósito de Cheque', 
    description: 'Depósito de cheques de terceros',
    icon: FileText,
    requiresReference: true
  },
  { 
    id: 'transferencia', 
    name: 'Transferencia Bancaria', 
    description: 'Transferencia desde otra cuenta bancaria',
    icon: Building,
    requiresReference: true
  },
  { 
    id: 'abono', 
    name: 'Abono Directo', 
    description: 'Abonos automáticos (nómina, pensiones)',
    icon: ArrowUpCircle,
    requiresReference: false
  },
  { 
    id: 'otros', 
    name: 'Otros Ingresos', 
    description: 'Intereses, comisiones, dividendos',
    icon: DollarSign,
    requiresReference: false
  }
];

export function DepositModule({ onNavigate }: DepositModuleProps) {
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [concept, setConcept] = useState('');
  const [depositType, setDepositType] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [recentDeposits, setRecentDeposits] = useState<any[]>([]);

  const currentAccount = accounts.find(acc => acc.id.toString() === selectedAccount);
  const currentDepositType = depositTypes.find(type => type.id === depositType);

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
    return currentAccount.balance + numAmount;
  };

  const validateForm = () => {
    const errors = [];
    
    if (!selectedAccount) errors.push('Debe seleccionar una cuenta');
    if (!amount || parseFloat(amount) <= 0) errors.push('El monto debe ser mayor a 0');
    if (!depositType) errors.push('Debe seleccionar el tipo de depósito');
    if (!concept.trim()) errors.push('Debe ingresar el concepto');
    if (currentDepositType?.requiresReference && !reference.trim()) {
      errors.push('Este tipo de depósito requiere número de referencia');
    }
    
    return errors;
  };

  const loadRecentDeposits = async () => {
    // Simular carga de depósitos recientes
    const mockRecentDeposits = [
      {
        id: 1,
        date: '2024-10-20',
        amount: 25000,
        type: 'Transferencia',
        account: 'Cuenta Principal'
      },
      {
        id: 2,
        date: '2024-10-18',
        amount: 15000,
        type: 'Efectivo',
        account: 'Cuenta Operativa'
      },
      {
        id: 3,
        date: '2024-10-15',
        amount: 8500,
        type: 'Cheque',
        account: 'Cuenta Principal'
      }
    ];
    setRecentDeposits(mockRecentDeposits);
  };

  useEffect(() => {
    loadRecentDeposits();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }
    
    setLoading(true);
    
    try {
      // Simular llamada a la API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Actualizar el saldo de la cuenta
      setAccounts(prev => prev.map(acc => 
        acc.id.toString() === selectedAccount 
          ? { ...acc, balance: acc.balance + parseFloat(amount) }
          : acc
      ));
      
      toast.success('¡Depósito registrado correctamente!');
      
      // Limpiar formulario
      setAmount('');
      setReference('');
      setConcept('');
      setDepositType('');
      
      // Actualizar lista de depósitos recientes
      loadRecentDeposits();
      
    } catch (error) {
      toast.error('Error al registrar el depósito');
    } finally {
      setLoading(false);
    }
  };

  const newBalance = calculateNewBalance();
  const errors = validateForm();

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
        <div className="flex-1">
          <h1 className="text-3xl font-semibold flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            Depositar Dinero
          </h1>
          <p className="text-muted-foreground mt-1">
            Registrar un depósito en cualquiera de sus cuentas bancarias
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-xl border-2 border-dashed border-orange-200 bg-orange-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <CreditCard className="h-5 w-5" />
                Información del Depósito
              </CardTitle>
              <CardDescription>
                Complete todos los campos requeridos (*) para registrar el depósito
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Account Selection */}
                <div className="space-y-2">
                  <Label htmlFor="account" className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Cuenta Bancaria *
                  </Label>
                  <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                    <SelectTrigger className="rounded-lg border-2 focus:border-orange-400">
                      <SelectValue placeholder="Seleccionar cuenta de destino" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{account.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {account.currency}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {account.number} • {account.bank}
                            </div>
                            <div className="text-sm font-medium text-green-600">
                              Saldo: {formatCurrency(account.balance, account.currency)}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Deposit Type */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Tipo de Depósito *
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {depositTypes.map((type) => {
                      const IconComponent = type.icon;
                      return (
                        <div
                          key={type.id}
                          onClick={() => setDepositType(type.id)}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                            depositType === type.id 
                              ? 'border-orange-400 bg-orange-50' 
                              : 'border-gray-200 hover:border-orange-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              depositType === type.id ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                            }`}>
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{type.name}</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {type.description}
                              </p>
                              {type.requiresReference && (
                                <Badge variant="outline" className="mt-2 text-xs">
                                  Requiere referencia
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Date */}
                  <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fecha de Depósito *
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="rounded-lg"
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  {/* Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Monto *
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-semibold">
                        {currentAccount?.currency === 'USD' ? '$' : 'Q'}
                      </span>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="pl-8 font-mono text-lg rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Reference */}
                {currentDepositType?.requiresReference && (
                  <div className="space-y-2">
                    <Label htmlFor="reference" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Número de Referencia *
                    </Label>
                    <Input
                      id="reference"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="Ej: Boleta, número de transferencia, cheque..."
                      className="rounded-lg"
                    />
                    <p className="text-sm text-muted-foreground">
                      Ingrese el número de boleta, referencia de transferencia u otro identificador
                    </p>
                  </div>
                )}

                {/* Concept */}
                <div className="space-y-2">
                  <Label htmlFor="concept" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Concepto del Depósito *
                  </Label>
                  <Textarea
                    id="concept"
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    placeholder="Describa el origen o motivo del depósito..."
                    className="rounded-lg resize-none"
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground">
                    Proporcione una descripción clara del origen de estos fondos
                  </p>
                </div>

                {/* Form Actions */}
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
                    disabled={loading || errors.length > 0}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 rounded-lg text-white"
                  >
                    {loading ? (
                      'Registrando...'
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <Card className="rounded-xl border-2 border-green-200 bg-green-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Calculator className="h-5 w-5" />
                Resumen del Movimiento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentAccount ? (
                <>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Cuenta:</span>
                      <div className="text-right">
                        <p className="font-medium text-sm">{currentAccount.name}</p>
                        <p className="text-xs text-muted-foreground">{currentAccount.number}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Saldo actual:</span>
                      <span className="font-mono font-semibold">
                        {formatCurrency(currentAccount.balance, currentAccount.currency)}
                      </span>
                    </div>
                    
                    {amount && !isNaN(parseFloat(amount)) && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Monto depósito:</span>
                          <span className="font-mono text-green-600 font-semibold">
                            +{formatCurrency(parseFloat(amount), currentAccount.currency)}
                          </span>
                        </div>
                        
                        <div className="border-t pt-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Nuevo saldo:</span>
                            <span className="font-mono text-green-600 font-bold text-lg">
                              {newBalance !== null && formatCurrency(newBalance, currentAccount.currency)}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {errors.length > 0 && (
                    <Alert className="border-yellow-200 bg-yellow-50">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800">
                        <div className="space-y-1">
                          {errors.map((error, index) => (
                            <p key={index} className="text-sm">• {error}</p>
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {errors.length === 0 && amount && parseFloat(amount) > 0 && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Formulario completo y listo para enviar
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Seleccione una cuenta para ver el resumen
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Deposits */}
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg">Depósitos Recientes</CardTitle>
              <CardDescription>Últimos movimientos registrados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentDeposits.map((deposit) => (
                  <div key={deposit.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{deposit.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(deposit.date).toLocaleDateString('es-GT')}
                      </p>
                      <p className="text-xs text-muted-foreground">{deposit.account}</p>
                    </div>
                    <span className="font-mono text-green-600 font-semibold">
                      +{formatCurrency(deposit.amount)}
                    </span>
                  </div>
                ))}
                
                {recentDeposits.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-4">
                    No hay depósitos recientes
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Help Tips */}
          <Card className="rounded-xl border-blue-200 bg-blue-50/30">
            <CardHeader>
              <CardTitle className="text-lg text-blue-700">💡 Consejos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-blue-800">
              <div>
                <p className="font-medium">Referencia</p>
                <p>Siempre guarde el comprobante físico del depósito</p>
              </div>
              <div>
                <p className="font-medium">Concepto</p>
                <p>Sea específico para facilitar la conciliación bancaria</p>
              </div>
              <div>
                <p className="font-medium">Moneda</p>
                <p>Verifique que esté depositando en la moneda correcta</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}