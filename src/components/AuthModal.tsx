import React, { useState } from 'react';
import { auth, db, googleProvider } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, ShieldCheck, X, Eye, EyeOff, Loader2, ArrowRight, UserCheck } from 'lucide-react';
import { Language, UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: Language;
  onAuthSuccess: (profile: UserProfile, isNewUser: boolean) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  currentLanguage,
  onAuthSuccess
}: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [initialRole, setInitialRole] = useState<'organizer' | 'client'>('client');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auth translations
  const tAuth: Record<Language, Record<string, string>> = {
    es: {
      titleLogin: 'Bienvenido de nuevo',
      subLogin: 'Ingresa a tu cuenta para gestionar y participar en rifas.',
      titleRegister: 'Crea tu cuenta',
      subRegister: 'Regístrate hoy para empezar a organizar o comprar boletos.',
      fullName: 'Nombre Completo',
      fullNamePlace: 'Ej. Juan Pérez',
      email: 'Correo Electrónico',
      emailPlace: 'nombre@ejemplo.com',
      password: 'Contraseña',
      passwordPlace: 'Mínimo 6 caracteres',
      roleSelect: 'Perfil Inicial',
      roleClient: 'Comprador (Participar en Sorteos)',
      roleOrganizer: 'Organizador (Crear y Sorteos SaaS)',
      btnSubmitLogin: 'Iniciar Sesión',
      btnSubmitRegister: 'Registrarse Gratis',
      switchLogin: '¿Ya tienes una cuenta? Inicia sesión',
      switchRegister: '¿No tienes cuenta? Registrate gratis aquí',
      errorEmpty: 'Por favor, completa todos los campos requeridos.',
      errorShortPass: 'La contraseña debe tener al menos 6 caracteres.',
      successCreated: '¡Cuenta creada con éxito! Sincronizando con la base de datos de Firebase...',
      successLogged: '¡Sesión iniciada con éxito! Cargando perfil...',
      btnGoogle: 'Continuar con Google'
    },
    en: {
      titleLogin: 'Welcome Back',
      subLogin: 'Log in to your account to manage and join raffles.',
      titleRegister: 'Create Your Account',
      subRegister: 'Register today to start organizing or purchasing tickets.',
      fullName: 'Full Name',
      fullNamePlace: 'e.g. John Doe',
      email: 'Email Address',
      emailPlace: 'name@example.com',
      password: 'Password',
      passwordPlace: 'Min 6 characters',
      roleSelect: 'Initial Profile',
      roleClient: 'Buyer (Join Raffles)',
      roleOrganizer: 'Organizer (Create & Admin SaaS)',
      btnSubmitLogin: 'Sign In',
      btnSubmitRegister: 'Sign Up Free',
      switchLogin: 'Already have an account? Sign in',
      switchRegister: 'Don\'t have an account? Create one for free',
      errorEmpty: 'Please fill in all required fields.',
      errorShortPass: 'Password must be at least 6 characters long.',
      successCreated: 'Account created successfully! Syncing with Firebase Database...',
      successLogged: 'Logged in successfully! Loading profile...',
      btnGoogle: 'Continue with Google'
    },
    pt: {
      titleLogin: 'Bem-vindo de volta',
      subLogin: 'Faça login na sua conta para gerenciar e participar de rifas.',
      titleRegister: 'Crie sua conta',
      subRegister: 'Cadastre-se hoje para começar a organizar ou comprar bilhetes.',
      fullName: 'Nome Completo',
      fullNamePlace: 'Ex. Silva Santos',
      email: 'Endereço de E-mail',
      emailPlace: 'nome@exemplo.com',
      password: 'Senha',
      passwordPlace: 'Mínimo 6 caracteres',
      roleSelect: 'Perfil Inicial',
      roleClient: 'Comprador (Participar de Sorteios)',
      roleOrganizer: 'Organizador (Criar e Administrar SaaS)',
      btnSubmitLogin: 'Entrar na Conta',
      btnSubmitRegister: 'Cadastrar Grátis',
      switchLogin: 'Já tem uma conta? Entre aqui',
      switchRegister: 'Não tem uma conta? Registre-se grátis',
      errorEmpty: 'Por favor, preencha todos os campos obrigatórios.',
      errorShortPass: 'A senha deve conter pelo menos 6 caracteres.',
      successCreated: 'Conta criada com sucesso! Sincronizando com banco de dados Firebase...',
      successLogged: 'Login realizado com sucesso! Carregando perfil...',
      btnGoogle: 'Continuar com o Google'
    }
  };

  const currentT = tAuth[currentLanguage] || tAuth.es;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validate inputs
    if (!email || !password || (!isLogin && !fullName)) {
      setErrorMsg(currentT.errorEmpty);
      return;
    }

    if (password.length < 6) {
      setErrorMsg(currentT.errorShortPass);
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Firebase Login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Fetch additional user profile properties from Firestore if they exist
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        let profileData: UserProfile;

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          profileData = {
            name: data.name || user.displayName || 'Usuario',
            email: user.email || email,
            avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.uid)}`,
            tier: data.tier || 'Free',
            rafflesJoinedCount: data.rafflesJoinedCount || 0,
            ticketsPurchasedCount: data.ticketsPurchasedCount || 0,
            role: data.role || data.initialRolePreference || 'client'
          };
        } else {
          // Fallback if auth exists but no firestore document
          profileData = {
            name: user.displayName || 'Usuario',
            email: user.email || email,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.uid)}`,
            tier: 'Free',
            rafflesJoinedCount: 0,
            ticketsPurchasedCount: 0,
            role: 'client'
          };
          // Save database backup for integrity
          await setDoc(userDocRef, profileData);
        }

        setSuccessMsg(currentT.successLogged);
        setTimeout(() => {
          onAuthSuccess(profileData, false);
          onClose();
          setLoading(false);
        }, 1200);

      } else {
        // Firebase Registration
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Set Auth Display Name
        await updateProfile(user, { displayName: fullName });

        // Generate profile data
        const avatarSeed = user.uid;
        const profileData: UserProfile = {
          name: fullName,
          email: email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(avatarSeed)}`,
          tier: 'Free',
          rafflesJoinedCount: 0,
          ticketsPurchasedCount: 0,
          role: initialRole
        };

        // Write user profile to Firebase Firestore
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, profileData);

        setSuccessMsg(currentT.successCreated);
        setTimeout(() => {
          onAuthSuccess({
            name: profileData.name,
            email: profileData.email,
            avatar: profileData.avatar,
            tier: profileData.tier,
            rafflesJoinedCount: profileData.rafflesJoinedCount,
            ticketsPurchasedCount: profileData.ticketsPurchasedCount,
            role: profileData.role
          }, true);
          onClose();
          setLoading(false);
        }, 1500);
      }
    } catch (err: any) {
      console.error('Firebase Auth error:', err);
      // Friendly messages for common Firebase exceptions
      let friendlyError = err.message;
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        friendlyError = currentLanguage === 'es' 
          ? 'Credenciales inválidas. Por favor, verifica tu correo y contraseña.' 
          : currentLanguage === 'pt' 
          ? 'Credenciais inválidas. Verifique seu e-mail e senha.' 
          : 'Invalid credentials. Please verify your email and password.';
      } else if (err.code === 'auth/email-already-in-use') {
        friendlyError = currentLanguage === 'es'
          ? 'El correo electrónico ya está registrado por otro usuario.'
          : currentLanguage === 'pt'
          ? 'Este endereço de e-mail já está sendo utilizado por outra conta.'
          : 'This email address is already in use by another account.';
      } else if (err.code === 'auth/invalid-email') {
        friendlyError = currentLanguage === 'es'
          ? 'Dirección de correo electrónico inválida.'
          : currentLanguage === 'pt'
          ? 'O endereço de e-mail inserido é inválido.'
          : 'The email address is invalid.';
      }
      setErrorMsg(friendlyError);
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      let profileData: UserProfile;
      let isNew = false;

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        profileData = {
          name: data.name || user.displayName || 'Usuario',
          email: user.email || '',
          avatar: data.avatar || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.uid)}`,
          tier: data.tier || 'Free',
          rafflesJoinedCount: data.rafflesJoinedCount || 0,
          ticketsPurchasedCount: data.ticketsPurchasedCount || 0,
          role: data.role || data.initialRolePreference || 'client'
        };
      } else {
        isNew = true;
        profileData = {
          name: user.displayName || 'Usuario',
          email: user.email || '',
          avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.uid)}`,
          tier: 'Free',
          rafflesJoinedCount: 0,
          ticketsPurchasedCount: 0,
          role: initialRole || 'client'
        };
        await setDoc(userDocRef, profileData);
      }

      setSuccessMsg(isNew ? currentT.successCreated : currentT.successLogged);
      setTimeout(() => {
        onAuthSuccess(profileData, isNew);
        onClose();
        setLoading(false);
      }, 1200);

    } catch (err: any) {
      console.error('Google Auth Error:', err);
      // user closed popup or other error
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMsg(err.message);
      }
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Background Dim Backdrop */}
      <div 
        id="auth-backdrop"
        onClick={() => !loading && onClose()} 
        className="absolute inset-0 bg-black/55 backdrop-blur-xs cursor-pointer" 
      />

      {/* Main Panel Box */}
      <div 
        id="auth-panel"
        className="relative bg-white w-full max-w-md rounded-2xl border border-gray-100 shadow-2xl p-6 sm:p-8 overflow-hidden z-20 font-sans"
      >
        {/* Close Button Decor */}
        <button
          id="auth-close-btn"
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header Tab Toggle layout */}
        <div className="flex gap-2 p-1 bg-gray-50 rounded-lg max-w-xs mx-auto mb-6 border border-gray-100">
          <button
            id="auth-toggle-login"
            onClick={() => { setIsLogin(true); setErrorMsg(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              isLogin ? 'bg-emerald-700 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {currentLanguage === 'es' ? 'Iniciar Sesión' : currentLanguage === 'pt' ? 'Entrar' : 'Login'}
          </button>
          <button
            id="auth-toggle-register"
            onClick={() => { setIsLogin(false); setErrorMsg(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              !isLogin ? 'bg-emerald-700 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {currentLanguage === 'es' ? 'Registrarse' : currentLanguage === 'pt' ? 'Cadastrar' : 'Sign Up'}
          </button>
        </div>

        {/* Form Title & Subtitle */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center justify-center gap-1.5">
            <ShieldCheck className="text-emerald-700 shrink-0" size={22} />
            {isLogin ? currentT.titleLogin : currentT.titleRegister}
          </h2>
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
            {isLogin ? currentT.subLogin : currentT.subRegister}
          </p>
        </div>

        {/* Feedback Banners */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-red-50 border-l-4 border-red-500 text-red-800 p-3.5 rounded-r-lg text-xs font-medium mb-4"
            >
              {errorMsg}
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-emerald-50 border-l-4 border-emerald-600 text-emerald-800 p-3.5 rounded-r-lg text-xs font-medium mb-4 flex items-center gap-1.5"
            >
              <UserCheck size={16} className="text-emerald-700 shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Forms */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name (Sign Up Only) */}
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {currentT.fullName} *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User size={16} />
                </span>
                <input
                  id="auth-input-fullname"
                  type="text"
                  required
                  placeholder={currentT.fullNamePlace}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Email field */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {currentT.email} *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={16} />
              </span>
              <input
                id="auth-input-email"
                type="email"
                required
                placeholder={currentT.emailPlace}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-colors"
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-gray-700">
                {currentT.password} *
              </label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={16} />
              </span>
              <input
                id="auth-input-password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder={currentT.passwordPlace}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10 pl-9 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-colors"
              />
              <button
                id="auth-toggle-password-visibility"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* User Role Preference select (Sign up only) */}
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {currentT.roleSelect}
              </label>
              <select
                id="auth-select-role"
                value={initialRole}
                onChange={(e) => setInitialRole(e.target.value as 'organizer' | 'client')}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-colors cursor-pointer"
              >
                <option value="client">{currentT.roleClient}</option>
                <option value="organizer">{currentT.roleOrganizer}</option>
              </select>
            </div>
          )}

          {/* Primary Submit Button */}
          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-emerald-700 text-white font-semibold text-sm rounded-lg hover:bg-emerald-800 transition-colors shadow-xs hover:shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:pointer-events-none mt-6"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{currentLanguage === 'es' ? 'Validando...' : 'Verifying...'}</span>
              </>
            ) : (
              <>
                <span>{isLogin ? currentT.btnSubmitLogin : currentT.btnSubmitRegister}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Separator */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-150" />
          </div>
          <span className="relative px-3 bg-white text-gray-400 text-[10px] tracking-wider uppercase font-medium">
            {currentLanguage === 'es' ? 'O BIEN' : currentLanguage === 'pt' ? 'OU ENTÃO' : 'OR'}
          </span>
        </div>

        {/* Google Button */}
        <button
          type="button"
          disabled={loading}
          onClick={handleGoogleAuth}
          className="w-full py-2.5 px-4 bg-white text-gray-700 font-semibold text-sm rounded-lg border border-gray-200 hover:bg-gray-50 hover:shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>{currentT.btnGoogle}</span>
        </button>

        {/* Switch Link toggle */}
        <div className="text-center mt-6">
          <button
            id="auth-switch-mode-btn"
            disabled={loading}
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className="text-xs text-emerald-700 hover:text-emerald-800 hover:underline font-semibold cursor-pointer focus:outline-hidden disabled:opacity-50"
          >
            {isLogin ? currentT.switchRegister : currentT.switchLogin}
          </button>
        </div>

      </div>
    </div>
  );
}
