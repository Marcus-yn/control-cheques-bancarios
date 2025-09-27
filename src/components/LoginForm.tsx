import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { LogIn, Eye, EyeOff, Wallet, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      onLogin(email, password);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 relative overflow-hidden">
      {/* Elementos decorativos animados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-10 left-10 w-20 h-20 bg-primary/10 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-10 right-10 w-32 h-32 bg-secondary/10 rounded-full"
        />
        <motion.div
          animate={{ y: [-20, 20, -20] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-20 w-16 h-16 bg-accent/10 rounded-full"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md shadow-2xl border-0 rounded-3xl bg-white/90 backdrop-blur-sm relative overflow-hidden">
          {/* Header súper visual */}
          <CardHeader className="text-center space-y-6 pb-8 bg-gradient-to-br from-primary/5 to-secondary/5">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
              className="relative mx-auto mb-4"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-primary via-secondary to-accent rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Wallet className="h-10 w-10 text-white" />
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ delay: 1, duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center"
              >
                <Sparkles className="h-4 w-4 text-white" />
              </motion.div>
            </motion.div>
            
            <div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                💼 Mi Chequera Digital
              </CardTitle>
              <CardDescription className="text-lg mt-3 text-gray-600">
                ¡Súper fácil! Solo escribe tu email y contraseña 😊
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo Email súper visual */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
              >
                <Label htmlFor="email" className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                  📧 Tu correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ej: admin@miempresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-14 rounded-xl border-2 border-gray-200 focus:border-primary text-lg px-4 bg-white/70 backdrop-blur-sm"
                />
                <p className="text-sm text-gray-500">
                  💡 Tip: Usa "admin@test.com" para ser administrador
                </p>
              </motion.div>
              
              {/* Campo Contraseña súper visual */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-3"
              >
                <Label htmlFor="password" className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                  🔒 Tu contraseña secreta
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Escribe cualquier cosa"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-14 rounded-xl border-2 border-gray-200 focus:border-primary text-lg px-4 pr-14 bg-white/70 backdrop-blur-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2 h-10 w-10 rounded-lg hover:bg-gray-100"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  💡 Tip: ¡Cualquier contraseña funciona para la demo!
                </p>
              </motion.div>
              
              {/* Botón de entrar súper visual */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full h-16 rounded-xl bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/90 hover:via-secondary/90 hover:to-accent/90 text-xl font-bold shadow-lg border-0"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                      />
                      Entrando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <LogIn className="h-6 w-6" />
                      🚀 ¡Vamos a entrar!
                    </div>
                  )}
                </Button>
              </motion.div>
              
              {/* Link olvidé contraseña */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center"
              >
                <Button
                  type="button"
                  variant="link"
                  className="text-primary hover:text-primary/80 p-0 text-lg"
                >
                  🤔 ¿Olvidaste tu contraseña?
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}