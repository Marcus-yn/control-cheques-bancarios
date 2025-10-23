import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Download,
  ArrowLeft,
  Calculator,
  RefreshCw,
  Eye,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckSquare,
  Clock,
  Banknote
} from 'lucide-react';
import { toast } from 'sonner';

interface ReviewModuleProps {
  onNavigate: (screen: string) => void;
}

interface PendingCheck {
  id: number;
  number: string;
  date: string;
  beneficiary: string;
  amount: number;
  concept: string;
  selected: boolean;
  status: 'pending' | 'processing' | 'cleared';
  daysOld: number;
}

interface BankMovement {
  id: number;
  date: string;
  description: string;
  amount: number;
  reference: string;
  matched: boolean;
  checkId?: number;
}

interface Account {
  id: number;
  name: string;
  number: string;
  bank: string;
  bookBalance: number;
  bankBalance: number;
  currency: string;
}

const mockAccounts: Account[] = [
  { 
    id: 1, 
    name: 'Cuenta Principal', 
    number: 'BAM-12345678', 
    bank: 'BANCO AGROMERCANTIL', 
    bookBalance: 387500, 
    bankBalance: 395000,
    currency: 'GTQ'
  },
  { 
    id: 2, 
    name: 'Cuenta Operativa', 
    number: 'BI-87654321', 
    bank: 'BANCO INDUSTRIAL', 
    bookBalance: 125000, 
    bankBalance: 120000,
    currency: 'GTQ'
  }
];

export function ReviewModule({ onNavigate }: ReviewModuleProps) {
  const [selectedAccount, setSelectedAccount] = useState<string>('1');
  const [pendingChecks, setPendingChecks] = useState<PendingCheck[]>([]);
  const [bankMovements, setBankMovements] = useState<BankMovement[]>([]);
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoMatching, setAutoMatching] = useState(false);
  const [reconciliationProgress, setReconciliationProgress] = useState(0);

  const currentAccount = accounts.find(acc => acc.id.toString() === selectedAccount);
  const difference = currentAccount ? currentAccount.bankBalance - currentAccount.bookBalance : 0;

  const formatCurrency = (amount: number, currency: string = 'GTQ') => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  const loadPendingChecks = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockPendingChecks: PendingCheck[] = [
        {
          id: 1,
          number: '001245',
          date: '2024-10-15',
          beneficiary: 'Proveedores Guatemala S.A.',
          amount: 15000,
          concept: 'Compra de materiales',
          selected: false,
          status: 'pending',
          daysOld: 8
        },
        {
          id: 2,
          number: '001241',
          date: '2024-10-11',
          beneficiary: 'Suministros de Oficina',
          amount: 1200,
          concept: 'Papelería y útiles',
          selected: false,
          status: 'processing',
          daysOld: 12
        },
        {
          id: 3,
          number: '001240',
          date: '2024-10-10',
          beneficiary: 'Servicios Técnicos',
          amount: 8500,
          concept: 'Mantenimiento equipos',
          selected: false,
          status: 'pending',
          daysOld: 13
        }
      ];
      
      setPendingChecks(mockPendingChecks);
    } catch (error) {
      toast.error('Error al cargar cheques pendientes');
    } finally {
      setLoading(false);
    }
  };

  const loadBankMovements = async () => {
    const mockBankMovements: BankMovement[] = [
      { 
        id: 1, 
        date: '2024-10-22', 
        description: 'CHQ 001245 PROVEEDORES GUATEMALA', 
        amount: -15000, 
        reference: '001245',
        matched: false,
        checkId: 1
      },
      { 
        id: 2, 
        date: '2024-10-21', 
        description: 'DEPOSITO EFECTIVO', 
        amount: 25000, 
        reference: 'DEP001',
        matched: true
      },
      { 
        id: 3, 
        date: '2024-10-20', 
        description: 'CHQ 001243 NOMINA EMPLEADOS', 
        amount: -45000, 
        reference: '001243',
        matched: true
      },
      { 
        id: 4, 
        date: '2024-10-19', 
        description: 'TRANSFERENCIA RECIBIDA', 
        amount: 18000, 
        reference: 'TRF001',
        matched: true
      },
      { 
        id: 5, 
        date: '2024-10-18', 
        description: 'CHQ 001240 SERVICIOS TECNICOS', 
        amount: -8500, 
        reference: '001240',
        matched: false,
        checkId: 3
      }
    ];
    setBankMovements(mockBankMovements);
  };

  useEffect(() => {
    loadPendingChecks();
    loadBankMovements();
  }, [selectedAccount]);

  const handleCheckSelection = (checkId: number, selected: boolean) => {
    setPendingChecks(prev => 
      prev.map(check => 
        check.id === checkId ? { ...check, selected } : check
      )
    );
  };

  const selectAllChecks = (selected: boolean) => {
    setPendingChecks(prev => prev.map(check => ({ ...check, selected })));
  };

  const selectedChecks = pendingChecks.filter(check => check.selected);
  const selectedAmount = selectedChecks.reduce((sum, check) => sum + check.amount, 0);

  const performAutoMatching = async () => {
    setAutoMatching(true);
    setReconciliationProgress(0);
    
    try {
      // Simular proceso de matching automático
      for (let i = 0; i <= 100; i += 10) {
        setReconciliationProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Marcar movimientos como matched
      setBankMovements(prev => prev.map(movement => ({
        ...movement,
        matched: movement.checkId ? true : movement.matched
      })));
      
      // Marcar cheques como cleared
      setPendingChecks(prev => prev.map(check => {
        const hasMovement = bankMovements.find(m => m.checkId === check.id);
        return hasMovement ? { ...check, status: 'cleared' as const } : check;
      }));
      
      toast.success('Conciliación automática completada');
    } catch (error) {
      toast.error('Error en la conciliación automática');
    } finally {
      setAutoMatching(false);
      setReconciliationProgress(0);
    }
  };

  const processReconciliation = async () => {
    if (selectedChecks.length === 0) {
      toast.error('Debe seleccionar al menos un cheque para conciliar');
      return;
    }

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Marcar cheques seleccionados como cleared
      setPendingChecks(prev => prev.map(check => 
        check.selected ? { ...check, status: 'cleared' as const, selected: false } : check
      ));
      
      toast.success(`${selectedChecks.length} cheques marcados como cobrados`);
      
    } catch (error) {
      toast.error('Error al procesar la conciliación');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast.error('Solo se permiten archivos CSV');
        return;
      }
      setUploadedFile(file);
      toast.success('Archivo CSV cargado correctamente');
    }
  };

  const downloadTemplate = () => {
    const csvContent = [
      'Fecha,Descripción,Monto,Referencia',
      '2024-10-22,CHQ 001245 PROVEEDORES GUATEMALA,-15000,001245',
      '2024-10-21,DEPOSITO EFECTIVO,25000,DEP001',
      '2024-10-20,CHQ 001243 NOMINA EMPLEADOS,-45000,001243'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_conciliacion.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Plantilla descargada correctamente');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'cleared':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Cobrado</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Procesando</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendiente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUrgencyLevel = (daysOld: number) => {
    if (daysOld > 15) return { level: 'high', color: 'text-red-600', icon: AlertTriangle };
    if (daysOld > 7) return { level: 'medium', color: 'text-yellow-600', icon: Clock };
    return { level: 'low', color: 'text-green-600', icon: CheckCircle2 };
  };

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
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            Revisar Todo
          </h1>
          <p className="text-muted-foreground mt-1">
            Conciliar mis cuentas y verificar el estado de los cheques
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={performAutoMatching}
            disabled={autoMatching}
            className="bg-purple-600 hover:bg-purple-700 rounded-lg"
          >
            {autoMatching ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CheckSquare className="h-4 w-4 mr-2" />
                Auto-Conciliar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Progress Bar for Auto Matching */}
      {autoMatching && (
        <Card className="rounded-xl border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Conciliación automática en progreso...</span>
                <span>{reconciliationProgress}%</span>
              </div>
              <Progress value={reconciliationProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger className="rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {accounts.map(account => (
                  <SelectItem key={account.id} value={account.id.toString()}>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{account.name}</span>
                      <span className="text-sm text-muted-foreground">{account.number}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-l-4 border-l-blue-500">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-blue-600 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Saldo Libro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-mono font-semibold">
              {currentAccount && formatCurrency(currentAccount.bookBalance, currentAccount.currency)}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-l-4 border-l-green-500">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-green-600 flex items-center gap-2">
              <Banknote className="h-5 w-5" />
              Saldo Banco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-mono font-semibold">
              {currentAccount && formatCurrency(currentAccount.bankBalance, currentAccount.currency)}
            </p>
          </CardContent>
        </Card>

        <Card className={`rounded-xl border-l-4 ${
          difference === 0 ? 'border-l-green-500' : 
          difference > 0 ? 'border-l-yellow-500' : 'border-l-red-500'
        }`}>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Diferencia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-mono font-semibold ${
              difference === 0 ? 'text-green-600' : 
              difference > 0 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {currentAccount && formatCurrency(difference, currentAccount.currency)}
            </p>
            {difference === 0 && (
              <Badge className="mt-2 bg-green-100 text-green-800">¡Cuadrado!</Badge>
            )}
            {difference !== 0 && (
              <Badge variant="outline" className="mt-2">Requiere revisión</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="manual" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 rounded-lg">
          <TabsTrigger value="manual" className="rounded-lg">Conciliación Manual</TabsTrigger>
          <TabsTrigger value="csv" className="rounded-lg">Importar CSV</TabsTrigger>
          <TabsTrigger value="analysis" className="rounded-lg">Análisis</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Checks */}
            <Card className="rounded-xl">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Cheques Pendientes
                    </CardTitle>
                    <CardDescription>
                      Marque los cheques que aparecen cobrados en el estado de cuenta
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => selectAllChecks(true)}
                      className="text-xs"
                    >
                      Seleccionar Todo
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => selectAllChecks(false)}
                      className="text-xs"
                    >
                      Desmarcar Todo
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-muted-foreground">Cargando...</span>
                    </div>
                  ) : (
                    pendingChecks.map((check) => {
                      const urgency = getUrgencyLevel(check.daysOld);
                      const UrgencyIcon = urgency.icon;
                      
                      return (
                        <div key={check.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/30">
                          <Checkbox
                            id={`check-${check.id}`}
                            checked={check.selected}
                            onCheckedChange={(checked: boolean) =>
                              handleCheckSelection(check.id, checked)
                            }
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">#{check.number}</p>
                                  {getStatusBadge(check.status)}
                                </div>
                                <p className="text-sm text-muted-foreground truncate">
                                  {check.beneficiary}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(check.date)}
                                </p>
                                <div className="flex items-center gap-1">
                                  <UrgencyIcon className={`h-3 w-3 ${urgency.color}`} />
                                  <span className={`text-xs ${urgency.color}`}>
                                    {check.daysOld} días pendiente
                                  </span>
                                </div>
                              </div>
                              <p className="font-mono text-sm font-semibold">
                                {formatCurrency(check.amount)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  
                  {!loading && pendingChecks.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay cheques pendientes</p>
                      <p className="text-sm">¡Todas las transacciones están al día!</p>
                    </div>
                  )}
                </div>

                {selectedChecks.length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-medium">
                        {selectedChecks.length} cheques seleccionados
                      </span>
                      <span className="font-mono">
                        {formatCurrency(selectedAmount)}
                      </span>
                    </div>
                    <Button
                      onClick={processReconciliation}
                      disabled={loading}
                      className="w-full bg-green-600 hover:bg-green-700 rounded-lg"
                    >
                      {loading ? 'Procesando...' : 'Marcar como Cobrados'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bank Movements */}
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Movimientos del Banco
                </CardTitle>
                <CardDescription>
                  Últimos movimientos según estado de cuenta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bankMovements.map((movement) => (
                    <div key={movement.id} className={`flex justify-between items-center p-3 rounded-lg border ${
                      movement.matched ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
                    }`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{movement.description}</p>
                          {movement.matched ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(movement.date)} • {movement.reference}
                        </p>
                        {movement.matched && (
                          <Badge variant="outline" className="mt-1 text-xs bg-green-100 text-green-800">
                            Conciliado
                          </Badge>
                        )}
                      </div>
                      <span className={`font-mono text-sm font-semibold ${
                        movement.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(movement.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="csv" className="space-y-6">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Importar Estado de Cuenta
              </CardTitle>
              <CardDescription>
                Suba el archivo CSV descargado desde su banco para conciliación automática
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="rounded-lg border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  El archivo CSV debe contener las columnas: Fecha, Descripción, Monto, Referencia
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="csv-file">Archivo CSV del Banco</Label>
                    <Input
                      id="csv-file"
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="rounded-lg"
                    />
                  </div>

                  {uploadedFile && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-800">
                          {uploadedFile.name}
                        </span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        Archivo cargado correctamente ({(uploadedFile.size / 1024).toFixed(1)} KB)
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={() => {
                      if (!uploadedFile) {
                        toast.error('Debe cargar un archivo CSV primero');
                        return;
                      }
                      performAutoMatching();
                    }}
                    disabled={!uploadedFile || autoMatching}
                    className="w-full bg-purple-600 hover:bg-purple-700 rounded-lg"
                  >
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Procesar Conciliación Automática
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">¿No tienes el formato correcto?</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Descarga nuestra plantilla de ejemplo para ver el formato requerido.
                    </p>
                    <Button
                      variant="outline"
                      onClick={downloadTemplate}
                      className="w-full rounded-lg"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar Plantilla CSV
                    </Button>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h5 className="font-medium text-sm mb-2">Formato del archivo:</h5>
                    <div className="text-xs font-mono space-y-1 bg-black text-green-400 p-3 rounded">
                      <p>Fecha,Descripción,Monto,Referencia</p>
                      <p>2024-10-22,"CHQ 001245",-15000,001245</p>
                      <p>2024-10-21,"DEPOSITO",25000,DEP001</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg">Estadísticas de Conciliación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {bankMovements.filter(m => m.matched).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Conciliados</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">
                      {bankMovements.filter(m => !m.matched).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Pendientes</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-3">Porcentaje de Conciliación</h4>
                  <Progress 
                    value={(bankMovements.filter(m => m.matched).length / bankMovements.length) * 100} 
                    className="h-3"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    {Math.round((bankMovements.filter(m => m.matched).length / bankMovements.length) * 100)}% completado
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg">Alertas de Antigüedad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingChecks.filter(c => c.daysOld > 7).map(check => {
                  const urgency = getUrgencyLevel(check.daysOld);
                  const UrgencyIcon = urgency.icon;
                  
                  return (
                    <div key={check.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <UrgencyIcon className={`h-5 w-5 ${urgency.color}`} />
                      <div className="flex-1">
                        <p className="font-medium text-sm">#{check.number}</p>
                        <p className="text-xs text-muted-foreground">
                          {check.daysOld} días pendiente
                        </p>
                      </div>
                      <span className="font-mono text-sm">
                        {formatCurrency(check.amount)}
                      </span>
                    </div>
                  );
                })}
                
                {pendingChecks.filter(c => c.daysOld > 7).length === 0 && (
                  <div className="text-center py-4">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <p className="text-sm text-muted-foreground">
                      No hay cheques con retraso
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={performAutoMatching}
                  disabled={autoMatching}
                  className="w-full rounded-lg"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Recargar Datos
                </Button>
                
                <Button
                  onClick={() => toast.info('Funcionalidad próximamente')}
                  className="w-full rounded-lg"
                  variant="outline"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generar Reporte
                </Button>
                
                <Button
                  onClick={() => toast.info('Funcionalidad próximamente')}
                  className="w-full rounded-lg"
                  variant="outline"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Historial
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}