import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { 
  Settings as SettingsIcon, 
  Plus, 
  Edit3, 
  Trash2, 
  Users, 
  CreditCard, 
  FileText,
  ArrowLeft,
  Save,
  Building,
  User
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface SettingsProps {
  onNavigate: (screen: string) => void;
}

const mockAccounts = [
  { 
    id: '1', 
    name: 'Cuenta Principal', 
    bank: 'Banco Agromercantil', 
    accountNumber: '3-123-456789-0', 
    balance: 387500, 
    currency: 'GTQ',
    active: true 
  },
  { 
    id: '2', 
    name: 'Cuenta Operativa', 
    bank: 'Banco Industrial', 
    accountNumber: '101-234567-8', 
    balance: 125000, 
    currency: 'GTQ',
    active: true 
  },
  { 
    id: '3', 
    name: 'Cuenta Dólares', 
    bank: 'Banco Agromercantil', 
    accountNumber: '3-789-012345-6', 
    balance: 45000, 
    currency: 'USD',
    active: true 
  }
];

const mockCheckbooks = [
  { 
    id: '1', 
    name: 'CHQ-001', 
    accountId: '1', 
    accountName: 'Cuenta Principal - BAM',
    startNumber: 1240, 
    endNumber: 1300, 
    nextNumber: 1246,
    active: true
  },
  { 
    id: '2', 
    name: 'CHQ-002', 
    accountId: '2', 
    accountName: 'Cuenta Operativa - BI',
    startNumber: 1001, 
    endNumber: 1100, 
    nextNumber: 1025,
    active: true
  },
  { 
    id: '3', 
    name: 'CHQ-USD-001', 
    accountId: '3', 
    accountName: 'Cuenta Dólares - BAM',
    startNumber: 5001, 
    endNumber: 5100, 
    nextNumber: 5012,
    active: false
  }
];

const mockUsers = [
  { 
    id: '1', 
    name: 'María González', 
    email: 'maria@empresa.com', 
    role: 'admin', 
    active: true,
    lastLogin: '2024-01-15'
  },
  { 
    id: '2', 
    name: 'Carlos López', 
    email: 'carlos@empresa.com', 
    role: 'user', 
    active: true,
    lastLogin: '2024-01-14'
  },
  { 
    id: '3', 
    name: 'Ana Rodríguez', 
    email: 'ana@empresa.com', 
    role: 'user', 
    active: false,
    lastLogin: '2024-01-10'
  }
];

export function Settings({ onNavigate }: SettingsProps) {
  const [accounts, setAccounts] = useState(mockAccounts);
  const [checkbooks, setCheckbooks] = useState(mockCheckbooks);
  const [users, setUsers] = useState(mockUsers);
  const [newAccount, setNewAccount] = useState({
    name: '',
    bank: '',
    accountNumber: '',
    currency: 'GTQ'
  });
  const [newCheckbook, setNewCheckbook] = useState({
    name: '',
    accountId: '',
    startNumber: '',
    endNumber: ''
  });
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'user'
  });

  const formatCurrency = (amount: number, currency: string = 'GTQ') => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const handleAddAccount = () => {
    if (!newAccount.name || !newAccount.bank || !newAccount.accountNumber) {
      toast.error('Complete todos los campos obligatorios');
      return;
    }

    const account = {
      id: (accounts.length + 1).toString(),
      ...newAccount,
      balance: 0,
      active: true
    };

    setAccounts([...accounts, account]);
    setNewAccount({ name: '', bank: '', accountNumber: '', currency: 'GTQ' });
    toast.success('Cuenta bancaria agregada correctamente');
  };

  const handleAddCheckbook = () => {
    if (!newCheckbook.name || !newCheckbook.accountId || !newCheckbook.startNumber || !newCheckbook.endNumber) {
      toast.error('Complete todos los campos obligatorios');
      return;
    }

    const account = accounts.find(acc => acc.id === newCheckbook.accountId);
    const checkbook = {
      id: (checkbooks.length + 1).toString(),
      ...newCheckbook,
      accountName: account?.name + ' - ' + account?.bank.split(' ')[1],
      startNumber: parseInt(newCheckbook.startNumber),
      endNumber: parseInt(newCheckbook.endNumber),
      nextNumber: parseInt(newCheckbook.startNumber),
      active: true
    };

    setCheckbooks([...checkbooks, checkbook]);
    setNewCheckbook({ name: '', accountId: '', startNumber: '', endNumber: '' });
    toast.success('Chequera agregada correctamente');
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      toast.error('Complete todos los campos obligatorios');
      return;
    }

    const user = {
      id: (users.length + 1).toString(),
      ...newUser,
      active: true,
      lastLogin: 'Nunca'
    };

    setUsers([...users, user]);
    setNewUser({ name: '', email: '', role: 'user' });
    toast.success('Usuario agregado correctamente');
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, active: !user.active } : user
    ));
    toast.success('Estado del usuario actualizado');
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
    toast.success('Usuario eliminado correctamente');
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
          <h1 className="text-3xl font-semibold">Configuración del Sistema</h1>
          <p className="text-muted-foreground mt-1">
            Gestione cuentas, chequeras y usuarios del sistema
          </p>
        </div>
      </div>

      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 rounded-lg">
          <TabsTrigger value="accounts" className="rounded-lg">Cuentas Bancarias</TabsTrigger>
          <TabsTrigger value="checkbooks" className="rounded-lg">Chequeras</TabsTrigger>
          <TabsTrigger value="users" className="rounded-lg">Usuarios</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-6">
          {/* Add Account Form */}
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Agregar Nueva Cuenta
              </CardTitle>
              <CardDescription>
                Configure una nueva cuenta bancaria para el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountName">Nombre de la Cuenta *</Label>
                  <Input
                    id="accountName"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                    placeholder="Ej: Cuenta Principal"
                    className="rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank">Banco *</Label>
                  <Select value={newAccount.bank} onValueChange={(value) => setNewAccount({...newAccount, bank: value})}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Seleccionar banco" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Banco Agromercantil">Banco Agromercantil</SelectItem>
                      <SelectItem value="Banco Industrial">Banco Industrial</SelectItem>
                      <SelectItem value="Bantrab">Bantrab</SelectItem>
                      <SelectItem value="Banco G&T Continental">Banco G&T Continental</SelectItem>
                      <SelectItem value="Banco CHN">Banco CHN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Número de Cuenta *</Label>
                  <Input
                    id="accountNumber"
                    value={newAccount.accountNumber}
                    onChange={(e) => setNewAccount({...newAccount, accountNumber: e.target.value})}
                    placeholder="Ej: 3-123-456789-0"
                    className="rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Moneda</Label>
                  <Select value={newAccount.currency} onValueChange={(value) => setNewAccount({...newAccount, currency: value})}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GTQ">Quetzales (GTQ)</SelectItem>
                      <SelectItem value="USD">Dólares (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleAddAccount}
                className="mt-4 bg-primary hover:bg-primary/90 rounded-lg"
              >
                <Save className="h-4 w-4 mr-2" />
                Agregar Cuenta
              </Button>
            </CardContent>
          </Card>

          {/* Accounts List */}
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Cuentas Registradas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Banco</TableHead>
                    <TableHead>Número de Cuenta</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          {account.name}
                        </div>
                      </TableCell>
                      <TableCell>{account.bank}</TableCell>
                      <TableCell className="font-mono">{account.accountNumber}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(account.balance, account.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={account.active ? "secondary" : "outline"}>
                          {account.active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checkbooks" className="space-y-6">
          {/* Add Checkbook Form */}
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Agregar Nueva Chequera
              </CardTitle>
              <CardDescription>
                Registre una nueva chequera y asígnela a una cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="checkbookName">Código de Chequera *</Label>
                  <Input
                    id="checkbookName"
                    value={newCheckbook.name}
                    onChange={(e) => setNewCheckbook({...newCheckbook, name: e.target.value})}
                    placeholder="Ej: CHQ-003"
                    className="rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cuenta Asociada *</Label>
                  <Select value={newCheckbook.accountId} onValueChange={(value) => setNewCheckbook({...newCheckbook, accountId: value})}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue placeholder="Seleccionar cuenta" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} - {account.bank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startNumber">Número Inicial *</Label>
                  <Input
                    id="startNumber"
                    type="number"
                    value={newCheckbook.startNumber}
                    onChange={(e) => setNewCheckbook({...newCheckbook, startNumber: e.target.value})}
                    placeholder="1301"
                    className="rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endNumber">Número Final *</Label>
                  <Input
                    id="endNumber"
                    type="number"
                    value={newCheckbook.endNumber}
                    onChange={(e) => setNewCheckbook({...newCheckbook, endNumber: e.target.value})}
                    placeholder="1400"
                    className="rounded-lg"
                  />
                </div>
              </div>

              <Button 
                onClick={handleAddCheckbook}
                className="mt-4 bg-primary hover:bg-primary/90 rounded-lg"
              >
                <Save className="h-4 w-4 mr-2" />
                Agregar Chequera
              </Button>
            </CardContent>
          </Card>

          {/* Checkbooks List */}
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Chequeras Registradas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Cuenta Asociada</TableHead>
                    <TableHead>Rango</TableHead>
                    <TableHead>Próximo Número</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checkbooks.map((checkbook) => (
                    <TableRow key={checkbook.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {checkbook.name}
                        </div>
                      </TableCell>
                      <TableCell>{checkbook.accountName}</TableCell>
                      <TableCell className="font-mono">
                        {checkbook.startNumber} - {checkbook.endNumber}
                      </TableCell>
                      <TableCell className="font-mono">{checkbook.nextNumber}</TableCell>
                      <TableCell>
                        <Badge variant={checkbook.active ? "secondary" : "outline"}>
                          {checkbook.active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {/* Add User Form */}
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Agregar Nuevo Usuario
              </CardTitle>
              <CardDescription>
                Registre un nuevo usuario y asigne sus permisos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="userName">Nombre Completo *</Label>
                  <Input
                    id="userName"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    placeholder="Ej: Juan Pérez"
                    className="rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userEmail">Correo Electrónico *</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="usuario@empresa.com"
                    className="rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Rol</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuario</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleAddUser}
                className="mt-4 bg-primary hover:bg-primary/90 rounded-lg"
              >
                <Save className="h-4 w-4 mr-2" />
                Agregar Usuario
              </Button>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Usuarios del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Correo Electrónico</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Último Acceso</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {user.name}
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? "default" : "secondary"}>
                          {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.lastLogin === 'Nunca' ? 'Nunca' : 
                         new Date(user.lastLogin).toLocaleDateString('es-GT')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={user.active}
                            onCheckedChange={() => toggleUserStatus(user.id)}
                            disabled={user.role === 'admin'}
                          />
                          <span className="text-sm">
                            {user.active ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          {user.role !== 'admin' && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción eliminará permanentemente al usuario {user.name}. 
                                    ¿Estás seguro de continuar?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="rounded-lg">Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteUser(user.id)}
                                    className="bg-destructive hover:bg-destructive/90 rounded-lg"
                                  >
                                    Eliminar Usuario
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Permissions Info */}
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>Permisos por Rol</CardTitle>
              <CardDescription>
                Descripción de los permisos asignados a cada rol
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Administrador</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Acceso completo al sistema</li>
                    <li>• Gestión de usuarios</li>
                    <li>• Configuración de cuentas y chequeras</li>
                    <li>• Generación de reportes</li>
                    <li>• Conciliación bancaria</li>
                    <li>• Registrar cheques y depósitos</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Usuario</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Ver dashboard</li>
                    <li>• Registrar cheques</li>
                    <li>• Registrar depósitos</li>
                    <li>• Ver listado de cheques</li>
                    <li>• Conciliación bancaria</li>
                    <li>• Generar reportes básicos</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}