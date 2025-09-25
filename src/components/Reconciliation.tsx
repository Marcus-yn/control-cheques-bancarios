import { useState } from 'react';
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
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Download,
  ArrowLeft,
  Calculator
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ReconciliationProps {
  onNavigate: (screen: string) => void;
}

const mockPendingChecks = [
  {
    id: 1,
    number: '001245',
    date: '2024-01-15',
    beneficiary: 'Proveedores Guatemala S.A.',
    amount: 15000,
    concept: 'Compra de materiales',
    selected: false
  },
  {
    id: 2,
    number: '001241',
    date: '2024-01-11',
    beneficiary: 'Suministros de Oficina',
    amount: 1200,
    concept: 'Papelería y útiles',
    selected: false
  },
  {
    id: 3,
    number: '001240',
    date: '2024-01-10',
    beneficiary: 'Servicios Técnicos',
    amount: 8500,
    concept: 'Mantenimiento equipos',
    selected: false
  }
];

const mockBankMovements = [
  { id: 1, date: '2024-01-15', description: 'CHQ 001245 PROVEEDORES GUATEMALA', amount: -15000, reference: '001245' },
  { id: 2, date: '2024-01-14', description: 'DEPOSITO EFECTIVO', amount: 25000, reference: 'DEP001' },
  { id: 3, date: '2024-01-13', description: 'CHQ 001243 NOMINA EMPLEADOS', amount: -45000, reference: '001243' },
  { id: 4, date: '2024-01-12', description: 'TRANSFERENCIA RECIBIDA', amount: 18000, reference: 'TRF001' },
  { id: 5, date: '2024-01-11', description: 'CHQ 001240 SERVICIOS TECNICOS', amount: -8500, reference: '001240' }
];

export function Reconciliation({ onNavigate }: ReconciliationProps) {
  const [selectedAccount, setSelectedAccount] = useState('1');
  const [pendingChecks, setPendingChecks] = useState(mockPendingChecks);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [bankBalance, setBankBalance] = useState('395000');
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(amount);
  };

  const handleCheckSelection = (checkId: number, selected: boolean) => {
    setPendingChecks(prev => 
      prev.map(check => 
        check.id === checkId ? { ...check, selected } : check
      )
    );
  };

  const selectedChecks = pendingChecks.filter(check => check.selected);
  const selectedAmount = selectedChecks.reduce((sum, check) => sum + check.amount, 0);

  const bookBalance = 387500; // Mock book balance
  const difference = parseFloat(bankBalance) - bookBalance;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv') {
        toast.error('Solo se permiten archivos CSV');
        return;
      }
      setUploadedFile(file);
      toast.success('Archivo CSV cargado correctamente');
    }
  };

  const processReconciliation = async () => {
    if (selectedChecks.length === 0) {
      toast.error('Debe seleccionar al menos un cheque para conciliar');
      return;
    }

    setLoading(true);

    // Simulate processing
    setTimeout(() => {
      toast.success(`${selectedChecks.length} cheques marcados como cobrados`);
      setPendingChecks(prev => prev.filter(check => !check.selected));
      setLoading(false);
    }, 2000);
  };

  const downloadTemplate = () => {
    const csvContent = [
      'Fecha,Descripción,Monto,Referencia',
      '2024-01-15,CHQ 001245 PROVEEDORES GUATEMALA,-15000,001245',
      '2024-01-14,DEPOSITO EFECTIVO,25000,DEP001',
      '2024-01-13,CHQ 001243 NOMINA EMPLEADOS,-45000,001243'
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
          <h1 className="text-3xl font-semibold">Conciliación Bancaria</h1>
          <p className="text-muted-foreground mt-1">
            Compare los movimientos del libro con el estado de cuenta bancario
          </p>
        </div>
      </div>

      {/* Account Selection & Summary */}
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
                <SelectItem value="1">Cuenta Principal - BAM</SelectItem>
                <SelectItem value="2">Cuenta Operativa - BI</SelectItem>
                <SelectItem value="3">Cuenta Dólares - BAM</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-l-4 border-l-primary">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-primary">Saldo Libro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-mono font-semibold">
              {formatCurrency(bookBalance)}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-l-4 border-l-secondary">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-secondary">Saldo Banco</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="number"
              value={bankBalance}
              onChange={(e) => setBankBalance(e.target.value)}
              className="text-xl font-mono font-semibold border-0 p-0 h-auto bg-transparent"
              placeholder="0.00"
            />
          </CardContent>
        </Card>

        <Card className={`rounded-xl border-l-4 ${difference === 0 ? 'border-l-green-500' : 'border-l-accent'}`}>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Diferencia</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-mono font-semibold ${
              difference === 0 ? 'text-green-600' : 
              difference > 0 ? 'text-accent' : 'text-red-600'
            }`}>
              {formatCurrency(difference)}
            </p>
            {difference === 0 && (
              <Badge className="mt-2 bg-green-100 text-green-800">Cuadrado</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="manual" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 rounded-lg">
          <TabsTrigger value="manual" className="rounded-lg">Conciliación Manual</TabsTrigger>
          <TabsTrigger value="csv" className="rounded-lg">Importar CSV</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Checks */}
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Cheques Pendientes
                </CardTitle>
                <CardDescription>
                  Marque los cheques que aparecen cobrados en el estado de cuenta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingChecks.map((check) => (
                    <div key={check.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={`check-${check.id}`}
                        checked={check.selected}
                        onCheckedChange={(checked) => 
                          handleCheckSelection(check.id, checked as boolean)
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">#{check.number}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {check.beneficiary}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(check.date).toLocaleDateString('es-GT')}
                            </p>
                          </div>
                          <p className="font-mono text-sm">
                            {formatCurrency(check.amount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {pendingChecks.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay cheques pendientes</p>
                    </div>
                  )}
                </div>

                {selectedChecks.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
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
                      className="w-full bg-primary hover:bg-primary/90 rounded-lg"
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
                  <Calculator className="h-5 w-5" />
                  Movimientos del Banco
                </CardTitle>
                <CardDescription>
                  Últimos movimientos según estado de cuenta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockBankMovements.map((movement) => (
                    <div key={movement.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{movement.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(movement.date).toLocaleDateString('es-GT')} • {movement.reference}
                        </p>
                      </div>
                      <span className={`font-mono text-sm ${
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
              <Alert className="rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  El archivo CSV debe contener las columnas: Fecha, Descripción, Monto, Referencia
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          {uploadedFile.name}
                        </span>
                      </div>
                      <p className="text-xs text-green-700 mt-1">
                        Archivo cargado correctamente
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={() => {
                      if (!uploadedFile) {
                        toast.error('Debe cargar un archivo CSV primero');
                        return;
                      }
                      toast.success('Conciliación automática procesada');
                    }}
                    disabled={!uploadedFile}
                    className="w-full bg-secondary hover:bg-secondary/90 rounded-lg"
                  >
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
                    <div className="text-xs font-mono space-y-1">
                      <p>Fecha,Descripción,Monto,Referencia</p>
                      <p>2024-01-15,"CHQ 001245",-15000,001245</p>
                      <p>2024-01-14,"DEPOSITO",25000,DEP001</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}