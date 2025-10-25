// Función segura para obtener el ícono del banco
function safeBankIcon(bank: string) {
  const Icon = getBankIcon(bank);
  if (typeof Icon === 'function') {
    return Icon;
  }
  // Ícono por defecto si getBankIcon falla
  return (props: any) => <CreditCard {...props} />;
}
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { AlertCircle, Calculator, FileText, ArrowLeft, Save, X, Users, CreditCard, Calendar, DollarSign, Hash, Zap, CheckCircle2, TrendingDown, Wallet, Sparkles, Banknote, Target, Home, List, Plus, Receipt, PieChart } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner';
import { getBankIcon } from './ui/smart-icons';
import { motion } from 'motion/react';

interface NewCheckFormProps {
  onNavigate: (screen: string) => void;
}

export function NewCheckForm({ onNavigate }: NewCheckFormProps) {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [checkbooks, setCheckbooks] = useState<any[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<string[]>([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedCheckbook, setSelectedCheckbook] = useState('');
  const [checkNumber, setCheckNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [beneficiary, setBeneficiary] = useState('');
  const [amount, setAmount] = useState('');
  const [concept, setConcept] = useState('');
  const [autoCheckNumber, setAutoCheckNumber] = useState(true);
  const [useCustomNumber, setUseCustomNumber] = useState(false);
  const [customCheckNumber, setCustomCheckNumber] = useState('');
  const [availableNumber, setAvailableNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState<string[]>([]);
  const [showBeneficiaryDropdown, setShowBeneficiaryDropdown] = useState(false);

  // Colores vibrantes y brillantes para bancos - igual que tu navigation
  const bankColors: Record<string, { 
    primary: string; 
    secondary: string; 
    gradient: string;
    light: string;
    border: string;
    text: string;
  }> = {
    'BANCO AGROMERCANTIL (BAM)': {
      primary: 'bg-[#0055A4]',
      secondary: 'bg-[#0055A4]/20',
      gradient: 'from-[#0055A4] to-[#003366]',
      light: 'bg-[#0055A4]/10',
      border: 'border-[#0055A4]',
      text: 'text-[#0055A4]'
    },
    'BANCO INDUSTRIAL': {
      primary: 'bg-[#00A859]',
      secondary: 'bg-[#00A859]/20',
      gradient: 'from-[#00A859] to-[#008040]',
      light: 'bg-[#00A859]/10',
      border: 'border-[#00A859]',
      text: 'text-[#00A859]'
    },
    'BAC CREDOMATIC': {
      primary: 'bg-[#E4002B]',
      secondary: 'bg-[#E4002B]/20',
      gradient: 'from-[#E4002B] to-[#B30021]',
      light: 'bg-[#E4002B]/10',
      border: 'border-[#E4002B]',
      text: 'text-[#E4002B]'
    },
    'BANRURAL': {
      primary: 'bg-[#FF6B00]',
      secondary: 'bg-[#FF6B00]/20',
      gradient: 'from-[#FF6B00] to-[#CC5500]',
      light: 'bg-[#FF6B00]/10',
      border: 'border-[#FF6B00]',
      text: 'text-[#FF6B00]'
    },
    'BANCO G&T CONTINENTAL': {
      primary: 'bg-[#FFD100]',
      secondary: 'bg-[#FFD100]/20',
      gradient: 'from-[#FFD100] to-[#CCAA00]',
      light: 'bg-[#FFD100]/10',
      border: 'border-[#FFD100]',
      text: 'text-[#FFD100]'
    },
    'BANCO PROMERICA': {
      primary: 'bg-[#8B5CF6]',
      secondary: 'bg-[#8B5CF6]/20',
      gradient: 'from-[#8B5CF6] to-[#7C3AED]',
      light: 'bg-[#8B5CF6]/10',
      border: 'border-[#8B5CF6]',
      text: 'text-[#8B5CF6]'
    },
    'BANCO INTERNACIONAL': {
      primary: 'bg-[#06B6D4]',
      secondary: 'bg-[#06B6D4]/20',
      gradient: 'from-[#06B6D4] to-[#0891B2]',
      light: 'bg-[#06B6D4]/10',
      border: 'border-[#06B6D4]',
      text: 'text-[#06B6D4]'
    },
    'VIVIBANCO': {
      primary: 'bg-[#EC4899]',
      secondary: 'bg-[#EC4899]/20',
      gradient: 'from-[#EC4899] to-[#DB2777]',
      light: 'bg-[#EC4899]/10',
      border: 'border-[#EC4899]',
      text: 'text-[#EC4899]'
    },
  };

  const selectedAccountObj = accounts.find((acc: any) => acc.id === selectedAccount);
  const currentAccount = accounts.find(acc => acc.id === selectedAccount);
  const currentCheckbook = checkbooks.find(cb => cb.id === selectedCheckbook);
  const bankStyle = selectedAccountObj && selectedAccountObj.bank && bankColors[selectedAccountObj.bank]
    ? bankColors[selectedAccountObj.bank]
    : bankColors['BANCO INDUSTRIAL'];

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [accountsRes, checkbooksRes, beneficiariesRes] = await Promise.all([
          fetch('http://localhost:3001/api/cuentas'),
          fetch('http://localhost:3001/api/chequeras'),
          fetch('http://localhost:3001/api/beneficiarios')
        ]);

        const accountsData = await accountsRes.json();
        const checkbooksData = await checkbooksRes.json();
        const beneficiariesData = await beneficiariesRes.json();

        setAccounts(Array.isArray(accountsData) ? accountsData.map(acc => ({
          ...acc,
          balance: typeof acc.saldo_actual === 'number' && !isNaN(acc.saldo_actual) ? acc.saldo_actual : 0,
          currency: acc.moneda || 'GTQ',
          name: acc.nombre
        })) : []);

        setCheckbooks(Array.isArray(checkbooksData) ? checkbooksData.map(cb => ({
          ...cb,
          accountId: String(cb.cuenta_id || cb.accountId),
          bank: cb.banco || '',
          name: cb.id ? `Chequera #${cb.id}` : (cb.name || ''),
          startNumber: cb.numero_inicial || cb.startNumber,
          endNumber: cb.numero_final || cb.endNumber,
          nextNumber: cb.siguiente_numero || cb.nextNumber
        })) : []);

        setBeneficiaries(Array.isArray(beneficiariesData) ? beneficiariesData : []);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const availableCheckbooks = checkbooks.filter(cb => cb.accountId === String(selectedAccount));

  // Auto-asignar número de cheque cuando se selecciona chequera
  useEffect(() => {
    if (selectedCheckbook && autoCheckNumber && !useCustomNumber) {
      const checkbook = checkbooks.find(cb => cb.id === selectedCheckbook);
      if (checkbook) {
        // Obtener el siguiente número disponible desde la API
        fetchAvailableNumber(selectedCheckbook);
      }
    }
  }, [selectedCheckbook, autoCheckNumber, useCustomNumber, checkbooks]);

  // Función para obtener el siguiente número disponible
  const fetchAvailableNumber = async (checkbookId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/chequeras/${checkbookId}/siguiente-numero`);
      const data = await response.json();
      
      if (data.siguiente_numero) {
        setCheckNumber(data.siguiente_numero.toString().padStart(6, '0'));
        setAvailableNumber(data.siguiente_numero);
      } else {
        setCheckNumber('');
        setAvailableNumber(null);
        if (data.chequera_agotada) {
          toast.error('La chequera está agotada');
        }
      }
    } catch (error) {
      console.error('Error al obtener siguiente número:', error);
      toast.error('Error al obtener el siguiente número disponible');
    }
  };

  // Función para verificar si un número está disponible
  const verifyCustomNumber = async (number: string) => {
    if (!selectedCheckbook || !number) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/chequeras/${selectedCheckbook}/verificar-numero/${number}`);
      const data = await response.json();
      
      if (!data.disponible) {
        toast.error(`Número no disponible: ${data.razon}`);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error al verificar número:', error);
      toast.error('Error al verificar el número');
      return false;
    }
  };

  // Manejar cambio de numeración manual
  const handleCustomNumberChange = async (value: string) => {
    setCustomCheckNumber(value);
    if (value && selectedCheckbook) {
      await verifyCustomNumber(value);
    }
  };

  // Autocompletado de beneficiarios
  useEffect(() => {
    if (beneficiary) {
      const filtered = beneficiaries.filter(b => 
        b.toLowerCase().includes(beneficiary.toLowerCase())
      );
      setFilteredBeneficiaries(filtered);
      setShowBeneficiaryDropdown(filtered.length > 0);
    } else {
      setFilteredBeneficiaries([]);
      setShowBeneficiaryDropdown(false);
    }
  }, [beneficiary, beneficiaries]);

  const formatCurrency = (amount: number, currency: string = 'GTQ') => {
    const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: currency
    }).format(safeAmount);
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
    try {
      // Validar que el número de cheque no esté repetido si es manual
      if (!autoCheckNumber && selectedCheckbook) {
        const checkbook = checkbooks.find(cb => cb.id === selectedCheckbook);
        if (checkbook) {
          const res = await fetch('http://localhost:3001/api/cheques');
          const cheques = await res.json();
          const existe = cheques.some((chq: { checkbook: number|string, number: number }) => 
            chq.checkbook === checkbook.id && chq.number === parseInt(checkNumber)
          );
          if (existe) {
            toast.error('Ya existe un cheque con ese número en la chequera seleccionada.');
            setLoading(false);
            return;
          }
        }
      }

      // Verificar número personalizado si se está usando
      if (useCustomNumber && customCheckNumber) {
        const isValid = await verifyCustomNumber(customCheckNumber);
        if (!isValid) {
          setLoading(false);
          return;
        }
      }

      const res = await fetch('http://localhost:3001/api/cheques', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: selectedAccount,
          checkbookId: selectedCheckbook,
          date,
          beneficiary,
          amount: parseFloat(amount),
          concept,
          useCustomNumber,
          customNumber: useCustomNumber ? customCheckNumber : undefined
        })
      });

      if (res.ok) {
        toast.success('✅ Cheque registrado correctamente');
        // Actualizar datos locales
        const updatedAccounts = await fetch('http://localhost:3001/api/cuentas').then(res => res.json());
        setAccounts(updatedAccounts.map((acc: any) => ({
          ...acc,
          balance: typeof acc.saldo_actual === 'number' && !isNaN(acc.saldo_actual) ? acc.saldo_actual : 0,
          currency: acc.moneda || 'GTQ',
          name: acc.nombre
        })));

        // Refrescar cheques para "Mis Cheques"
        await fetch('http://localhost:3001/api/cheques');

        setTimeout(() => {
          onNavigate('checks');
        }, 1500);
      } else if (res.status === 409) {
        toast.error('❌ Ya existe un cheque con ese número en la chequera seleccionada.');
      } else {
        toast.error('❌ Error al registrar el cheque');
      }
    } catch {
      toast.error('❌ Error de conexión al backend');
    } finally {
      setLoading(false);
    }
  };

  const newBalance = calculateNewBalance();
  const formErrors = validateForm();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Super Colorido - Estilo igual a tu Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 via-teal-400 to-yellow-400 rounded-3xl p-8 text-white shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="ghost" 
                  onClick={() => onNavigate('dashboard')}
                  className="rounded-2xl border-2 border-white/30 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  🏠 Volver al Dashboard
                </Button>
              </motion.div>
              <div>
                <motion.h1 
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="text-5xl font-black drop-shadow-lg"
                >
                  ✍️ Escribir Cheque
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-white/90 text-xl mt-3 font-medium"
                >
                  ¡Todo súper fácil! - Completa la información del cheque a emitir
                </motion.p>
              </div>
            </div>
            
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Formulario Principal - Super Colorido */}
          <div className="xl:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="rounded-3xl shadow-2xl border-4 border-white bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">
                <CardHeader className={`${bankStyle.primary} text-white rounded-t-3xl pb-6 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                  <div className="relative z-10">
                    <CardTitle className="flex items-center gap-4 text-3xl font-black drop-shadow-lg">
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="p-3 bg-white/30 rounded-2xl backdrop-blur-sm"
                      >
                        <FileText className="h-8 w-8" />
                      </motion.div>
                      <div>
                        📄 Información del Cheque
                        <CardDescription className="text-white/95 text-lg mt-2 font-medium">
                          💫 Todos los campos marcados con * son obligatorios
                        </CardDescription>
                      </div>
                    </CardTitle>
                  </div>
                </CardHeader>
                
                <CardContent className="p-8 space-y-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Cuenta y Chequera */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Selector de Cuenta */}
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-4"
                      >
                        <Label htmlFor="selectedAccount" className="text-lg font-bold flex items-center gap-3 text-gray-800">
                          <div className="p-2 bg-blue-100 rounded-xl">
                            <Banknote className="h-6 w-6 text-blue-600" />
                          </div>
                          💳 Cuenta Bancaria *
                        </Label>
                        <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                          <SelectTrigger 
                            id="selectedAccount" 
                            className={`rounded-2xl h-14 border-3 text-lg font-semibold transition-all duration-300 shadow-lg bg-white select-black`}
                            style={selectedAccount ? {
                              borderColor: bankStyle.border.replace('border-[','').replace(']',''),
                            } : {
                              borderColor: '#d1d5db',
                            }}
                          >
                            <SelectValue 
                              placeholder={
                                <div className="flex items-center gap-3 select-black">
                                  <Banknote className="h-5 w-5" />
                                  Seleccionar cuenta bancaria
                                </div>
                              }
                              className="select-black"
                            />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-0 shadow-2xl bg-white">
                            {loading && (
                              <div className="px-4 py-4 text-gray-500 flex items-center gap-3">
                                <motion.div 
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="rounded-full h-5 w-5 border-b-2 border-blue-500"
                                />
                                Cargando cuentas...
                              </div>
                            )}
                            {!loading && accounts.length === 0 && (
                              <div className="px-4 py-4 text-gray-500 text-center">
                                No hay cuentas disponibles
                              </div>
                            )}
                            {!loading && accounts.length > 0 && accounts.map((account, index) => {
                              const BankIcon = safeBankIcon(account.bank);
                              const accountStyle = bankColors[account.bank] || bankColors['BANCO INDUSTRIAL'];
                              return (
                                <motion.div
                                  key={account.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                >
                                  <SelectItem 
                                    value={account.id}
                                    className="rounded-xl mb-2 last:mb-0 focus:bg-gray-50 border-2 border-transparent hover:border-gray-200 transition-all duration-200"
                                  >
                                    <div className="flex items-center gap-4 w-full py-3">
                                      <div className={`p-3 rounded-xl ${accountStyle.secondary}`}>
                                        <BankIcon className="h-6 w-6 text-gray-800" />
                                      </div>
                                      <div className="flex flex-col flex-1 min-w-0">
                                        <span className="font-bold text-gray-900 truncate">{account.name}</span>
                                        <span className="text-sm text-gray-600 font-medium">
                                          Saldo: {formatCurrency(account.balance, account.currency)}
                                        </span>
                                        <span className="text-xs text-gray-500">{account.numero}</span>
                                      </div>
                                      <Badge className={`${accountStyle.primary} text-white border-0 font-bold px-3 py-1`}>
                                        {account.currency}
                                      </Badge>
                                    </div>
                                  </SelectItem>
                                </motion.div>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </motion.div>

                      {/* Selector de Chequera */}
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-4"
                      >
                        <Label htmlFor="selectedCheckbook" className="text-lg font-bold flex items-center gap-3 text-gray-800">
                          <div className="p-2 bg-purple-100 rounded-xl">
                            <Wallet className="h-6 w-6 text-purple-600" />
                          </div>
                          📋 Chequera *
                        </Label>
                        <Select 
                          value={selectedCheckbook} 
                          onValueChange={setSelectedCheckbook}
                          disabled={!selectedAccount}
                        >
                          <SelectTrigger 
                            id="selectedCheckbook" 
                            className={`rounded-2xl h-14 border-3 text-lg font-semibold transition-all duration-300 shadow-lg bg-white select-black ${!selectedAccount ? 'opacity-50 cursor-not-allowed' : ''}`}
                            style={{
                              color: '#111',
                              borderColor: selectedCheckbook ? bankStyle.border.replace('border-[','').replace(']','') : '#d1d5db',
                            }}
                          >
                            <SelectValue 
                              placeholder={
                                <div className="flex items-center gap-3 select-black">
                                  <Wallet className="h-5 w-5" />
                                  {selectedAccount ? 'Seleccionar chequera' : 'Primero selecciona una cuenta'}
                                </div>
                              }
                              className="select-black"
                              style={{ color: '#111' }}
                            />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-0 shadow-2xl bg-white">
                            {loading && (
                              <div className="px-4 py-4 text-gray-500 flex items-center gap-3">
                                <motion.div 
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="rounded-full h-5 w-5 border-b-2 border-purple-500"
                                />
                                Cargando chequeras...
                              </div>
                            )}
                            {!loading && availableCheckbooks.length === 0 && (
                              <div className="px-4 py-4 text-gray-500 text-center">
                                {selectedAccount ? 'No hay chequeras disponibles' : 'Selecciona una cuenta primero'}
                              </div>
                            )}
                            {!loading && availableCheckbooks.length > 0 && availableCheckbooks.map((checkbook, index) => {
                              const BankIcon = safeBankIcon(checkbook.bank);
                              const checkbookStyle = bankColors[checkbook.bank] || bankColors['BANCO INDUSTRIAL'];
                              return (
                                <motion.div
                                  key={checkbook.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                >
                                  <SelectItem 
                                    value={checkbook.id}
                                    className="rounded-xl mb-2 last:mb-0 focus:bg-gray-50 border-2 border-transparent hover:border-gray-200 transition-all duration-200"
                                  >
                                    <div className="flex items-center gap-4 w-full py-3">
                                      <div className={`p-3 rounded-xl ${checkbookStyle.secondary}`}>
                                        <BankIcon className="h-6 w-6 text-gray-800" />
                                      </div>
                                      <div className="flex flex-col flex-1 min-w-0">
                                        <span className="font-bold text-gray-900 truncate">{checkbook.name}</span>
                                        <span className="text-sm text-gray-600 font-medium">
                                          Cheques: {checkbook.startNumber} - {checkbook.endNumber}
                                        </span>
                                      </div>
                                      <Badge className="bg-green-500 text-white border-0 font-bold px-3 py-1">
                                        #{checkbook.nextNumber.toString().padStart(6, '0')}
                                      </Badge>
                                    </div>
                                  </SelectItem>
                                </motion.div>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </motion.div>
                    </div>

                    {/* Número de Cheque y Fecha */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Número de Cheque */}
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-4"
                      >
                        <Label htmlFor="checkNumber" className="text-lg font-bold flex items-center gap-3 text-gray-800">
                          <div className="p-2 bg-green-100 rounded-xl">
                            <Hash className="h-6 w-6 text-green-600" />
                          </div>
                          🔢 Número de Cheque *
                        </Label>
                        
                        {/* Selector de tipo de numeración */}
                        <div className="flex gap-2 p-2 bg-gray-100 rounded-xl">
                          <Button
                            type="button"
                            variant={!useCustomNumber ? "default" : "ghost"}
                            onClick={() => {
                              setUseCustomNumber(false);
                              if (selectedCheckbook) {
                                fetchAvailableNumber(selectedCheckbook);
                              }
                            }}
                            className={`flex-1 rounded-lg transition-all duration-300 ${
                              !useCustomNumber 
                                ? `${bankStyle.primary} text-white shadow-md` 
                                : 'text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            Automático
                          </Button>
                          <Button
                            type="button"
                            variant={useCustomNumber ? "default" : "ghost"}
                            onClick={() => {
                              setUseCustomNumber(true);
                              setCheckNumber('');
                              setCustomCheckNumber('');
                            }}
                            className={`flex-1 rounded-lg transition-all duration-300 ${
                              useCustomNumber 
                                ? `${bankStyle.primary} text-white shadow-md` 
                                : 'text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <Hash className="h-4 w-4 mr-2" />
                            Manual
                          </Button>
                        </div>

                        {/* Campo de número */}
                        <div className="relative">
                          <Input
                            id="checkNumber"
                            value={useCustomNumber ? customCheckNumber : checkNumber}
                            onChange={(e) => {
                              if (useCustomNumber) {
                                handleCustomNumberChange(e.target.value);
                              } else {
                                setCheckNumber(e.target.value);
                              }
                            }}
                            placeholder={useCustomNumber ? "Ingrese número manual" : "Número automático"}
                            className={`font-mono rounded-2xl h-14 border-3 text-xl text-center font-bold transition-all duration-300 bg-white text-black ${
                              !useCustomNumber ? 'bg-gray-50' : ''
                            }`}
                            disabled={!useCustomNumber && !selectedCheckbook}
                          />
                          {!useCustomNumber && (
                            <div className="absolute inset-y-0 right-4 flex items-center">
                              <Zap className="h-5 w-5 text-green-500 animate-pulse" />
                            </div>
                          )}
                        </div>
                        
                        {/* Información del rango */}
                        {selectedCheckbook && (
                          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-xl">
                            {availableCheckbooks.length > 0 && (() => {
                              const checkbook = availableCheckbooks.find(cb => cb.id === selectedCheckbook);
                              return checkbook ? (
                                <div className="flex items-center justify-between">
                                  <span>Rango: {checkbook.startNumber} - {checkbook.endNumber}</span>
                                  {!useCustomNumber && availableNumber && (
                                    <span className="font-semibold text-green-600">
                                      Siguiente: {availableNumber}
                                    </span>
                                  )}
                                </div>
                              ) : null;
                            })()}
                          </div>
                        )}
                      </motion.div>
                        {currentCheckbook && (
                          <p className="text-sm text-gray-600 flex items-center gap-2 font-medium">
                            <Zap className="h-4 w-4 text-green-500" />
                            Próximo disponible: <strong className="text-green-600">{currentCheckbook.nextNumber.toString().padStart(6, '0')}</strong>
                          </p>
                        )}
                      </motion.div>

                      {/* Fecha */}
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="space-y-4"
                      >
                        <Label htmlFor="date" className="text-lg font-bold flex items-center gap-3 text-gray-800">
                          <div className="p-2 bg-orange-100 rounded-xl">
                            <Calendar className="h-6 w-6 text-orange-600" />
                          </div>
                          📅 Fecha *
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="rounded-2xl h-14 border-3 bg-white text-black text-lg font-semibold transition-all duration-300"
                        />
                      </motion.div>
                    </div>

                    {/* Beneficiario */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="space-y-4"
                    >
                      <Label htmlFor="beneficiary" className="text-lg font-bold flex items-center gap-3 text-gray-800">
                        <div className="p-2 bg-pink-100 rounded-xl">
                          <Users className="h-6 w-6 text-pink-600" />
                        </div>
                        👥 Beneficiario *
                      </Label>
                      <div className="relative">
                        <Input
                          id="beneficiary"
                          value={beneficiary}
                          onChange={(e) => setBeneficiary(e.target.value)}
                          onFocus={() => setShowBeneficiaryDropdown(filteredBeneficiaries.length > 0)}
                          placeholder="Ingrese el nombre del beneficiario"
                          className="rounded-2xl h-14 border-3 bg-white text-black text-lg font-semibold transition-all duration-300 pr-12"
                        />
                        <Users className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        
                        {/* Dropdown de beneficiarios */}
                        {showBeneficiaryDropdown && filteredBeneficiaries.length > 0 && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute z-20 w-full mt-3 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl max-h-48 overflow-y-auto"
                          >
                            {filteredBeneficiaries.map((b, index) => (
                              <motion.button
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                type="button"
                                className="w-full text-left px-6 py-4 hover:bg-pink-50 border-b border-gray-100 last:border-b-0 transition-all duration-200 flex items-center gap-4 group"
                                onClick={() => {
                                  setBeneficiary(b);
                                  setShowBeneficiaryDropdown(false);
                                }}
                              >
                                <Users className="h-4 w-4 text-gray-400 group-hover:text-pink-500" />
                                <span className="font-semibold text-gray-800 group-hover:text-pink-600">{b}</span>
                              </motion.button>
                            ))}
                          </motion.div>
                        )}
                      </div>
                      {beneficiaries.length > 0 && (
                        <p className="text-sm text-gray-600 font-medium">
                          {filteredBeneficiaries.length} sugerencia(s) disponible(s)
                        </p>
                      )}
                    </motion.div>

                    {/* Monto */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="space-y-4"
                    >
                      <Label htmlFor="amount" className="text-lg font-bold flex items-center gap-3 text-gray-800">
                        <div className="p-2 bg-yellow-100 rounded-xl">
                          <DollarSign className="h-6 w-6 text-yellow-600" />
                        </div>
                        💰 Monto *
                      </Label>
                      <div className="relative">
                        <span className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-600 text-xl font-bold">
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
                          className="pl-16 font-mono rounded-2xl h-14 border-3 border-gray-300 hover:border-yellow-400 text-xl font-bold transition-all duration-300"
                        />
                      </div>
                      {currentAccount && amount && !isNaN(parseFloat(amount)) && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`p-4 rounded-2xl border-3 transition-all duration-300 ${
                            parseFloat(amount) > currentAccount.balance 
                              ? 'bg-red-50 border-red-300' 
                              : 'bg-green-50 border-green-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-gray-800">Saldo después del cheque:</span>
                            <span className={`font-mono font-black text-xl ${
                              parseFloat(amount) > currentAccount.balance ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {newBalance !== null ? formatCurrency(newBalance, currentAccount.currency) : formatCurrency(currentAccount.balance, currentAccount.currency)}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>

                    {/* Concepto */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 }}
                      className="space-y-4"
                    >
                      <Label htmlFor="concept" className="text-lg font-bold flex items-center gap-3 text-gray-800">
                        <div className="p-2 bg-indigo-100 rounded-xl">
                          <FileText className="h-6 w-6 text-indigo-600" />
                        </div>
                        📝 Concepto *
                      </Label>
                      <Textarea
                        id="concept"
                        value={concept}
                        onChange={(e) => setConcept(e.target.value)}
                        placeholder="Describa detalladamente el motivo del pago, servicio o producto adquirido..."
                        className="rounded-2xl border-3 border-gray-300 hover:border-indigo-400 transition-all duration-300 resize-none min-h-[120px] text-lg font-medium"
                        rows={4}
                      />
                      <div className="flex justify-between text-sm text-gray-600 font-medium">
                        <span>Mínimo 10 caracteres recomendado</span>
                        <span>{concept.length}/500</span>
                      </div>
                    </motion.div>

                    {/* Botones de Acción Mejorados */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0 }}
                      className="flex gap-6 pt-8"
                    >
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                        <Button
                          type="button"
                          onClick={() => onNavigate('checks')}
                          disabled={loading}
                          className="w-full rounded-2xl h-16 text-gray-700 font-black text-lg shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-4 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 border-3 border-gray-300"
                        >
                          <X className="h-6 w-6" />
                          🚫 Cancelar
                        </Button>
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
                        <Button
                          type="submit"
                          disabled={loading || formErrors.length > 0}
                          className={`w-full rounded-2xl h-16 text-white font-black text-lg shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${bankStyle.primary} hover:shadow-3xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none bg-gradient-to-r ${bankStyle.gradient}`}
                        >
                          {loading ? (
                            <div className="flex items-center gap-3">
                              <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="rounded-full h-6 w-6 border-3 border-white border-t-transparent"
                              />
                              <span className="text-lg">⏳ Procesando Cheque...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <Save className="h-6 w-6" />
                              <span className="text-lg">✨ Registrar Cheque</span>
                            </div>
                          )}
                        </Button>
                      </motion.div>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Panel de Resumen Super Colorido */}
          <div className="space-y-6">
            {/* Resumen Dinámico */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="rounded-3xl shadow-2xl border-0 bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-4 text-2xl font-black text-gray-800">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl">
                      <Calculator className="h-7 w-7 text-white" />
                    </div>
                    📊 Resumen del Cheque
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {selectedAccountObj ? (
                    <>
                      {/* Información de la Cuenta */}
                      <div className="space-y-4">
                        <motion.div 
                          whileHover={{ scale: 1.02 }}
                          className="flex items-center justify-between p-4 bg-white rounded-2xl border-3 border-gray-200 shadow-lg"
                        >
                          <span className="text-lg font-bold text-gray-700">💳 Cuenta:</span>
                          <div className="flex items-center gap-3">
                            {safeBankIcon(selectedAccountObj.bank)({ className: "h-5 w-5 text-gray-600" })}
                            <span className="font-black text-gray-900">{selectedAccountObj.name}</span>
                          </div>
                        </motion.div>
                        
                        <motion.div 
                          whileHover={{ scale: 1.02 }}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-3 border-green-200 shadow-lg"
                        >
                          <span className="text-lg font-bold text-gray-700">💰 Saldo actual:</span>
                          <span className="font-mono font-black text-2xl text-green-600">
                            {formatCurrency(selectedAccountObj.balance, selectedAccountObj.currency)}
                          </span>
                        </motion.div>
                      </div>

                      {/* Información del Cheque */}
                      {currentCheckbook && (
                        <div className="space-y-4 pt-4">
                          <motion.div 
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center justify-between p-4 bg-white rounded-2xl border-3 border-gray-200 shadow-lg"
                          >
                            <span className="text-lg font-bold text-gray-700">📋 Chequera:</span>
                            <span className="font-black text-blue-600 text-lg">{currentCheckbook.name}</span>
                          </motion.div>
                          
                          <motion.div 
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center justify-between p-4 bg-white rounded-2xl border-3 border-gray-200 shadow-lg"
                          >
                            <span className="text-lg font-bold text-gray-700">🔢 Número:</span>
                            <Badge className="font-mono bg-blue-500 text-white text-lg font-black px-4 py-2 border-0">
                              #{checkNumber || '---'}
                            </Badge>
                          </motion.div>
                        </div>
                      )}

                      {/* Cálculo de Monto */}
                      {amount && !isNaN(parseFloat(amount)) && (
                        <div className="space-y-4 pt-4">
                          <motion.div 
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border-3 border-red-200 shadow-lg"
                          >
                            <span className="text-lg font-bold text-gray-700">💸 Monto del cheque:</span>
                            <span className="font-mono font-black text-2xl text-red-600">
                              -{formatCurrency(parseFloat(amount), selectedAccountObj.currency)}
                            </span>
                          </motion.div>
                          
                          <motion.div 
                            whileHover={{ scale: 1.02 }}
                            className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl border-3 border-gray-200 shadow-lg"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <span className="font-bold text-xl text-gray-800">🎯 Nuevo saldo:</span>
                              <span className={`font-mono font-black text-2xl ${
                                newBalance && newBalance < 0 ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {newBalance !== null ? formatCurrency(newBalance, selectedAccountObj.currency) : '---'}
                              </span>
                            </div>
                            
                            {newBalance && newBalance < 0 && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                              >
                                <Alert className="rounded-xl border-2 border-red-300 bg-red-50 mt-3">
                                  <AlertCircle className="h-5 w-5 text-red-600" />
                                  <AlertDescription className="text-red-700 font-bold">
                                    ⚠️ ¡Atención! El monto excede el saldo disponible
                                  </AlertDescription>
                                </Alert>
                              </motion.div>
                            )}
                            
                            {newBalance && newBalance >= 0 && newBalance < 1000 && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                              >
                                <Alert className="rounded-xl border-2 border-orange-300 bg-orange-50 mt-3">
                                  <TrendingDown className="h-5 w-5 text-orange-600" />
                                  <AlertDescription className="text-orange-700 font-bold">
                                    📉 Saldo bajo después de esta transacción
                                  </AlertDescription>
                                </Alert>
                              </motion.div>
                            )}
                          </motion.div>
                        </div>
                      )}
                    </>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <Calculator className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg font-medium">
                        Selecciona una cuenta y chequera para ver el resumen detallado
                      </p>
                    </motion.div>
                  )}

                  {/* Información de Chequera */}
                  {currentCheckbook && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="pt-6 border-t-2 border-gray-200"
                    >
                      <h4 className="font-black text-xl text-gray-800 mb-4 flex items-center gap-3">
                        <Wallet className="h-6 w-6 text-purple-500" />
                        📋 Información de Chequera
                      </h4>
                      <div className="space-y-3 text-base bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-4 border-3 border-purple-200 shadow-lg">
                        <div className="flex justify-between items-center py-2">
                          <span className="font-bold text-gray-700">🏷️ Código:</span>
                          <span className="font-mono font-black text-purple-600">{currentCheckbook.name}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="font-bold text-gray-700">📊 Rango de cheques:</span>
                          <span className="font-mono text-blue-600 font-bold">
                            {currentCheckbook.startNumber} - {currentCheckbook.endNumber}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="font-bold text-gray-700">🔄 Próximo cheque:</span>
                          <Badge className="font-mono bg-green-500 text-white font-black px-3 py-1 border-0 text-sm">
                            {currentCheckbook.nextNumber.toString().padStart(6, '0')}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="font-bold text-gray-700">📦 Cheques disponibles:</span>
                          <Badge className="bg-blue-500 text-white font-black px-3 py-1 border-0 text-sm">
                            {currentCheckbook.endNumber - currentCheckbook.nextNumber + 1}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Panel de Información Super Colorido */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="rounded-3xl shadow-2xl border-0 bg-gradient-to-br from-white to-orange-50/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-black flex items-center gap-3 text-gray-800">
                    <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    💡 Información Importante
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-3 border-blue-200 shadow-lg"
                  >
                    <Zap className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-black text-blue-800 text-base">⚡ Numeración Automática</p>
                      <p className="text-blue-700 text-sm mt-1 font-medium">
                        El sistema asigna automáticamente el próximo número disponible. Puedes desactivarlo para ingresar manualmente.
                      </p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-3 border-green-200 shadow-lg"
                  >
                    <Users className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-black text-green-800 text-base">👥 Beneficiarios Inteligentes</p>
                      <p className="text-green-700 text-sm mt-1 font-medium">
                        El sistema sugiere beneficiarios basándose en tu historial para mayor rapidez.
                      </p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="flex items-start gap-4 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl border-3 border-yellow-200 shadow-lg"
                  >
                    <DollarSign className="h-6 w-6 text-yellow-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-black text-yellow-800 text-base">💰 Control de Saldos</p>
                      <p className="text-yellow-700 text-sm mt-1 font-medium">
                        Verifica que el monto no exceda el saldo disponible. El sistema actualiza automáticamente los saldos.
                      </p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl border-3 border-purple-200 shadow-lg"
                  >
                    <CheckCircle2 className="h-6 w-6 text-purple-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-black text-purple-800 text-base">✅ Sin Duplicados</p>
                      <p className="text-purple-700 text-sm mt-1 font-medium">
                        El sistema valida que no existan números de cheque duplicados en la misma chequera.
                      </p>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}