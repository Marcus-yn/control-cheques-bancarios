import React from "react";
import { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { LoginForm } from './components/LoginForm';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { ChecksList } from './components/ChecksList';
import { NewCheckForm } from './components/NewCheckForm';
import { DepositForm } from './components/DepositForm';
import { Reconciliation } from './components/Reconciliation';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import NewBankAccountForm from './components/NewBankAccountForm';
import BankAccountsList from './components/BankAccountsList';
import TransactionsModule from './components/TransactionsModule';
import DepositModule from './components/DepositModule';
import ReviewModule from './components/ReviewModule';
import GraphicsModule from './components/GraphicsModule';

interface User {
  email: string;
  role: 'admin' | 'user';
  name: string;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState('dashboard');

  // Simulate checking for existing session
  useEffect(() => {
    const savedUser = localStorage.getItem('checkbook_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (email: string, password: string) => {
    // Simulate authentication
    const user: User = {
      email,
      role: email.includes('admin') ? 'admin' : 'user',
      name: email.includes('admin') ? 'Usuario Administrador' : 'Usuario Contable'
    };
    
    setCurrentUser(user);
    localStorage.setItem('checkbook_user', JSON.stringify(user));
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('checkbook_user');
    setCurrentScreen('dashboard');
  };

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen);
  };

  // If not logged in, show login form
  if (!currentUser) {
    return (
      <>
        <LoginForm onLogin={handleLogin} />
        <Toaster 
          position="top-right" 
          richColors 
          closeButton
          toastOptions={{
            style: {
              borderRadius: '12px',
            }
          }}
        />
      </>
    );
  }

  // Main application layout
  return (
    <div className="min-h-screen bg-background flex">
      <Navigation 
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        userRole={currentUser.role}
      />
      
      <main className="flex-1 lg:ml-0">
        <div className="p-6 lg:p-8 pt-20 lg:pt-8">
          {currentScreen === 'dashboard' && (
            <Dashboard onNavigate={handleNavigate} />
          )}
          {currentScreen === 'transactions' && (
            <TransactionsModule onNavigate={handleNavigate} />
          )}
          {currentScreen === 'deposit' && (
            <DepositModule onNavigate={handleNavigate} />
          )}
          {currentScreen === 'review' && (
            <ReviewModule onNavigate={handleNavigate} />
          )}
          {currentScreen === 'graphics' && (
            <GraphicsModule onNavigate={handleNavigate} />
          )}
          {currentScreen === 'checks' && (
            <ChecksList onNavigate={handleNavigate} />
          )}
          {currentScreen === 'new-check' && (
            <NewCheckForm onNavigate={handleNavigate} />
          )}
          {currentScreen === 'new-deposit' && (
            <DepositForm onNavigate={handleNavigate} />
          )}
          {currentScreen === 'reconciliation' && (
            <Reconciliation onNavigate={handleNavigate} />
          )}
          {currentScreen === 'reports' && (
            <Reports onNavigate={handleNavigate} />
          )}
          {currentScreen === 'settings' && currentUser.role === 'admin' && (
            <Settings onNavigate={handleNavigate} />
          )}
          {currentScreen === 'new-account' && (
            <NewBankAccountForm />
          )}
          {currentScreen === 'accounts' && (
            <BankAccountsList onNavigate={handleNavigate} />
          )}
        </div>
      </main>

      <Toaster 
        position="top-right" 
        richColors 
        closeButton
        toastOptions={{
          style: {
            borderRadius: '12px',
          }
        }}
      />
    </div>
  );
}