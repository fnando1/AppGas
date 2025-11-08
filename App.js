import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- CHAVES DE ARMAZENAMENTO ---
const LAST_ORDER_KEY = '@LastGasOrder';
const USER_TYPE_KEY = '@UserType';
const IS_LOGGED_IN_KEY = '@IsloggedIn';
const CLIENT_EMAIL_KEY = '@ClientEmail';
const CLIENT_DATA_KEY = '@ClientData';
const PENDING_ORDERS_KEY = '@PendingOrders';
const API_URL = 'http://localhost:3000/orders'; // ajuste conforme ambiente

// --- DADOS FIXOS ---
const CLIENT_CREDENTIALS = { user: 'cliente@gasonline.com', pass: '123456' };
const gasOptions = [
  { id: 'p13', name: 'Gás de Cozinha (P13)', price: 105.00, weight: '13kg' },
  { id: 'p45', name: 'Gás Industrial (P45)', price: 380.00, weight: '45kg' },
];
const GAS_SIZES = ['13kg', '7kg', '5kg', '45kg'];

// --- STYLES ---
const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
  container: { flex: 1, backgroundColor: '#F5F5F5', paddingTop: 40 },
  header: { fontSize: 24, fontWeight: '700', color: '#D90000', textAlign: 'center', marginBottom: 20, paddingHorizontal: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, marginHorizontal: 20, marginBottom: 15, padding: 15, elevation: 3 },
  title: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 5 },
  subtitle: { fontSize: 16, fontWeight: 'bold', color: '#D90000', marginBottom: 10 },
  priceText: { fontSize: 22, fontWeight: '800', color: '#007BFF', marginTop: 5 },
  button: { backgroundColor: '#D90000', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  backButton: { marginTop: 20, backgroundColor: '#6C757D' },
  input: { backgroundColor: '#F0F0F0', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: '#CCC' },
  label: { fontSize: 14, color: '#555', marginBottom: 5, fontWeight: '500' },
  paymentOptionContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 15 },
  paymentOption: { width: '48%', padding: 10, borderRadius: 8, borderWidth: 2, borderColor: '#CCC', alignItems: 'center', marginBottom: 10 },
  paymentSelected: { borderColor: '#D90000', backgroundColor: '#FFEEEE' },
  paymentText: { fontSize: 14, fontWeight: '600', color: '#333' },
  trocoInput: { borderColor: '#D90000', marginBottom: 15 },
  userCard: { padding: 30, alignItems: 'center', marginBottom: 20 },
  userTitle: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 10 },
  userDescription: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 15 },
  backToMenuButton: { backgroundColor: '#6C757D', padding: 10, borderRadius: 8, alignItems: 'center', marginHorizontal: 20, marginBottom: 15 },
  loginContainer: { flex: 1, justifyContent: 'center', padding: 20 },
  registerLink: { alignItems: 'center', marginTop: 20 },
  registerLinkText: { color: '#007BFF', fontSize: 16, fontWeight: '600' }
});

// --- COMPONENTE: Tela de Cadastro (Registro) ---
const RegisterScreen = ({ onRegisterSuccess, onBackToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegisterAttempt = useCallback(() => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }
    onRegisterSuccess({ name, email: email.toLowerCase(), password });
  }, [name, email, password, confirmPassword, onRegisterSuccess]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.loginContainer}>
      <Text style={styles.header}>Criar Conta Cliente</Text>
      <Text style={styles.label}>Nome Completo</Text>
      <TextInput style={styles.input} placeholder="Seu nome" value={name} onChangeText={setName} />
      <Text style={styles.label}>E-mail</Text>
      <TextInput style={styles.input} placeholder="Seu e-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Text style={styles.label}>Senha (mín. 6 caracteres)</Text>
      <TextInput style={styles.input} placeholder="Sua senha" value={password} onChangeText={setPassword} secureTextEntry />
      <Text style={styles.label}>Confirmar Senha</Text>
      <TextInput style={styles.input} placeholder="Confirme sua senha" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={handleRegisterAttempt}><Text style={styles.buttonText}>Cadastrar</Text></TouchableOpacity>
      <TouchableOpacity style={styles.registerLink} onPress={onBackToLogin}><Text style={styles.registerLinkText}>Já tem conta? Fazer Login</Text></TouchableOpacity>
    </ScrollView>
  );
};


// --- COMPONENTE: Tela de Login ---
const LoginScreen = ({ onLogin, onBackToSelection, onNavigateToRegister, registeredUsers }) => {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginAttempt = useCallback(() => {
    const userLower = user.toLowerCase();
    const foundUser = registeredUsers.find(c => c.email === userLower && c.password === password);
    if (foundUser) onLogin(userLower);
    else Alert.alert('Erro de Login', 'Usuário ou senha inválidos. Tente novamente.');
  }, [user, password, onLogin, registeredUsers]);

  return (
    <View style={[styles.container, styles.loginContainer]}>
      <Text style={styles.header}>Acesso do Cliente</Text>
      <Text style={styles.subtitle}>Use: {CLIENT_CREDENTIALS.user} / {CLIENT_CREDENTIALS.pass} ou seu cadastro</Text>
      <Text style={styles.label}>E-mail</Text>
      <TextInput style={styles.input} placeholder="Seu e-mail" value={user} onChangeText={setUser} keyboardType="email-address" autoCapitalize="none" />
      <Text style={styles.label}>Senha</Text>
      <TextInput style={styles.input} placeholder="Sua senha" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={handleLoginAttempt}><Text style={styles.buttonText}>Entrar</Text></TouchableOpacity>
      <TouchableOpacity style={styles.registerLink} onPress={onNavigateToRegister}><Text style={styles.registerLinkText}>Ainda não tem conta? Cadastre-se</Text></TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.backButton, { marginTop: 10 }]} onPress={onBackToSelection}><Text style={styles.buttonText}>Voltar para Seleção de Perfil</Text></TouchableOpacity>
    </View>
  );
};


// --- Componente: Seleção de Tipo de Conta (MANTIDO) ---
const UserSelectionScreen = ({ onSelectUser }) => {
  const userTypes = [
    { key: 'Cliente', name: 'Cliente', description: 'Realize pedidos, rastreie entregas e avalie o serviço.', color: '#007BFF' },
    { key: 'Entregador', name: 'Entregador', description: 'Receba e gerencie pedidos, acompanhe rotas e visualize ganhos.', color: '#28A745' },
    { key: 'Administrador', name: 'Administrador', description: 'Gerencie pedidos, usuários e acesse relatórios de análise.', color: '#6C757D' },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Bem-vindo! Selecione seu Perfil</Text>
      {userTypes.map(u => (
        <View key={u.key} style={styles.card}>
          <View style={styles.userCard}>
            <Text style={[styles.userTitle, { color: u.color }]}>{u.name}</Text>
            <Text style={styles.userDescription}>{u.description}</Text>
            <TouchableOpacity style={[styles.button, { backgroundColor: u.color, marginTop: 10 }]} onPress={() => onSelectUser(u.key)}><Text style={styles.buttonText}>Entrar como {u.name}</Text></TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

// --- SelectProductScreen ---
const SelectProductScreen = ({ onProductSelect, onLogout, clientEmail }) => (
  <ScrollView style={styles.container}>
    <Text style={styles.header}>Escolha o seu Gás</Text>
    {clientEmail && (
      <View style={{ marginHorizontal: 20, marginBottom: 15 }}>
        <Text style={styles.label}>Logado como:</Text>
        <Text style={[styles.subtitle, { color: '#007BFF' }]}>{clientEmail}</Text>
      </View>
    )}
    {gasOptions.map(option => (
      <View key={option.id} style={styles.card}>
        <Text style={styles.title}>{option.name}</Text>
        <Text style={styles.subtitle}>Peso: {option.weight}</Text>
        <Text style={styles.priceText}>R$ {option.price.toFixed(2).replace('.', ',')}</Text>
        <TouchableOpacity style={styles.button} onPress={() => onProductSelect(option)}><Text style={styles.buttonText}>Pedir Agora</Text></TouchableOpacity>
      </View>
    ))}
    <TouchableOpacity style={styles.backToMenuButton} onPress={onLogout}><Text style={styles.buttonText}>Trocar de Perfil / Sair</Text></TouchableOpacity>
  </ScrollView>
);

// --- CheckoutScreen ---
const CheckoutScreen = ({ product, onBack, onPlaceOrder, lastAddress, lastPayment }) => {
  const [address, setAddress] = useState(lastAddress || '');
  const [paymentType, setPaymentType] = useState(lastPayment || 'Dinheiro');
  const [trocoAmount, setTrocoAmount] = useState('');
  const [notes, setNotes] = useState('');
  const paymentOptions = [{ key: 'Dinheiro', label: 'Em Espécie', icon: '💰' }, { key: 'Cartão', label: 'Cartão (Máquina)', icon: '💳' }, { key: 'PIX', label: 'PIX', icon: '📱' }];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Finalizar Pedido</Text>
      <View style={styles.card}>
        <Text style={styles.title}>Item Selecionado:</Text>
        <Text style={[styles.subtitle, { color: '#D90000' }]}>{product.name}</Text>
        <Text style={styles.priceText}>Total: R$ {product.price.toFixed(2).replace('.', ',')}</Text>
      </View>

      <View style={[styles.card, { padding: 20 }]}>
        <Text style={styles.title}>Detalhes da Entrega</Text>
        <Text style={styles.label}>Endereço Completo</Text>
        <TextInput style={styles.input} placeholder="Rua, Número, Bairro, Ponto de Referência" value={address} onChangeText={setAddress} multiline />
        <Text style={styles.label}>Forma de Pagamento</Text>
        <View style={styles.paymentOptionContainer}>
          {paymentOptions.map(opt => (
            <TouchableOpacity key={opt.key} style={[styles.paymentOption, paymentType === opt.key && styles.paymentSelected]} onPress={() => setPaymentType(opt.key)}>
              <Text style={styles.paymentText}>{opt.icon} {opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {paymentType === 'Dinheiro' && (
          <View>
            <Text style={styles.label}>Precisa de Troco? (Opcional)</Text>
            <TextInput style={[styles.input, styles.trocoInput]} placeholder={`Ex: 150,00 (Valor total: R$ ${product.price.toFixed(2).replace('.', ',')})`} keyboardType="numeric" value={trocoAmount} onChangeText={setTrocoAmount} />
          </View>
        )}

        <Text style={styles.label}>Observações (opcional)</Text>
        <TextInput style={styles.input} placeholder="Ex: Deixar na área de serviço" value={notes} onChangeText={setNotes} multiline />

        <TouchableOpacity style={styles.button} onPress={() => onPlaceOrder({ product: product.name, price: product.price, address, payment: paymentType, notes, trocoAmount })}><Text style={styles.buttonText}>Confirmar Pedido</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.backButton]} onPress={onBack}><Text style={styles.buttonText}>Voltar e Alterar</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// --- COMPONENTE: Tela de visualização do "banco de dados" de usuários e estoque ---
const UsersDatabaseScreen = ({ users, onBack }) => (
  <ScrollView style={styles.container}>
    <Text style={styles.header}>Banco de Usuários - Estoque</Text>
    {users.length === 0 && <View style={styles.card}><Text>Nenhum usuário cadastrado.</Text></View>}
    {users.map((u, idx) => {
      const inv = u.inventory || { '13kg': 0, '7kg': 0, '5kg': 0, '45kg': 0 };
      return (
        <View key={u.email + idx} style={styles.card}>
          <Text style={styles.title}>{u.name || u.email}</Text>
          <Text style={styles.label}>Usuário: <Text style={{ fontWeight: '600' }}>{u.email}</Text></Text>
          <View style={{ marginTop: 8 }}>
            {GAS_SIZES.map(size => (<Text key={size} style={{ fontSize: 14, marginBottom: 4 }}>{size}: <Text style={{ fontWeight: '700' }}>{inv[size] ?? 0}</Text></Text>))}
          </View>
        </View>
      );
    })}
    <TouchableOpacity style={[styles.button, styles.backButton, { marginHorizontal: 20 }]} onPress={onBack}><Text style={styles.buttonText}>Voltar</Text></TouchableOpacity>
  </ScrollView>
);

// --- Componente Principal (Com Integração AsyncStorage, Perfil, Login e Cadastro) ---
const App = () => {
  const [screen, setScreen] = useState('userSelect');
  const [userType, setUserType] = useState(null);
  const [isClientLoggedIn, setIsClientLoggedIn] = useState(false);
  const [clientEmail, setClientEmail] = useState(null);
  const initialClients = [{ name: 'Cliente Padrão', email: CLIENT_CREDENTIALS.user, password: CLIENT_CREDENTIALS.pass }];
  const [registeredClients, setRegisteredClients] = useState(initialClients);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [lastAddress, setLastAddress] = useState('');
  const [lastPayment, setLastPayment] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedUserType = await AsyncStorage.getItem(USER_TYPE_KEY);
        const loggedInStatus = await AsyncStorage.getItem(IS_LOGGED_IN_KEY);
        const savedClientEmail = await AsyncStorage.getItem(CLIENT_EMAIL_KEY);
        const savedClientData = await AsyncStorage.getItem(CLIENT_DATA_KEY);
        if (savedUserType) setUserType(savedUserType);
        if (loggedInStatus === 'true') setIsClientLoggedIn(true);
        if (savedClientEmail) setClientEmail(savedClientEmail);
        if (savedClientData) {
          const parsed = JSON.parse(savedClientData);
          const combined = [...initialClients];
          parsed.forEach(sc => { if (sc.email !== CLIENT_CREDENTIALS.user) combined.push(sc); });
          setRegisteredClients(combined);
        }
        const jsonValue = await AsyncStorage.getItem(LAST_ORDER_KEY);
        if (jsonValue) {
          const lastOrder = JSON.parse(jsonValue);
          setLastAddress(lastOrder.address || '');
          setLastPayment(lastOrder.payment || '');
        }
      } catch (e) {
        console.error('Erro ao carregar dados do AsyncStorage:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleClientRegister = useCallback(async (newClient) => {
    if (registeredClients.some(c => c.email === newClient.email)) {
      Alert.alert('Erro no Cadastro', 'Este e-mail já está cadastrado.');
      return;
    }
    const clientWithInventory = { ...newClient, inventory: { '13kg': 0, '7kg': 0, '5kg': 0, '45kg': 0 } };
    const newClientsList = [...registeredClients, clientWithInventory];
    setRegisteredClients(newClientsList);
    const dataToSave = newClientsList.filter(c => c.email !== CLIENT_CREDENTIALS.user);
    await AsyncStorage.setItem(CLIENT_DATA_KEY, JSON.stringify(dataToSave));
    Alert.alert('Sucesso!', 'Cadastro realizado com sucesso! Faça login para continuar.');
    setScreen('login');
  }, [registeredClients]);

  const handleSelectUser = useCallback(async (type) => {
    setUserType(type);
    await AsyncStorage.setItem(USER_TYPE_KEY, type);
    if (type === 'Cliente') setScreen(isClientLoggedIn ? 'home' : 'login');
    else setScreen('home');
  }, [isClientLoggedIn]);

  const handleClientLogin = useCallback(async (userEmail) => {
    setIsClientLoggedIn(true);
    setClientEmail(userEmail);
    await AsyncStorage.setItem(IS_LOGGED_IN_KEY, 'true');
    await AsyncStorage.setItem(CLIENT_EMAIL_KEY, userEmail);
    setScreen('home');
  }, []);

  const handleProductSelect = useCallback((product) => { setSelectedProduct(product); setScreen('checkout'); }, []);
  const handleBack = useCallback(() => setScreen('home'), []);
  const handleLogout = useCallback(async () => {
    setUserType(null); setIsClientLoggedIn(false); setClientEmail(null); setSelectedProduct(null); setScreen('userSelect');
    await AsyncStorage.removeItem(USER_TYPE_KEY); await AsyncStorage.removeItem(IS_LOGGED_IN_KEY); await AsyncStorage.removeItem(CLIENT_EMAIL_KEY);
  }, []);

  const sendOrderToApi = useCallback(async (order) => {
    try {
      const resp = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(order) });
      return resp.ok;
    } catch (e) {
      console.error('Erro ao enviar pedido para API:', e);
      return false;
    }
  }, []);

  const enqueueOrder = useCallback(async (order) => {
    try {
      const sent = await sendOrderToApi(order);
      if (sent) return true;
      const raw = await AsyncStorage.getItem(PENDING_ORDERS_KEY);
      const pending = raw ? JSON.parse(raw) : [];
      pending.push({ ...order, createdAt: Date.now() });
      await AsyncStorage.setItem(PENDING_ORDERS_KEY, JSON.stringify(pending));
      return false;
    } catch (e) {
      console.error('Erro ao enfileirar pedido:', e);
      return false;
    }
  }, [sendOrderToApi]);

  const processPendingOrders = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(PENDING_ORDERS_KEY);
      const pending = raw ? JSON.parse(raw) : [];
      if (!pending.length) return;
      const remaining = [];
      for (const o of pending) {
        const ok = await sendOrderToApi(o);
        if (!ok) remaining.push(o);
      }
      if (remaining.length) await AsyncStorage.setItem(PENDING_ORDERS_KEY, JSON.stringify(remaining));
      else await AsyncStorage.removeItem(PENDING_ORDERS_KEY);
    } catch (e) { console.error('Erro ao processar fila de pedidos:', e); }
  }, [sendOrderToApi]);

  useEffect(() => { if (!isLoading) processPendingOrders(); }, [isLoading, processPendingOrders]);

  const handlePlaceOrder = useCallback(async (orderDetails) => {
    try {
      const paymentText = (orderDetails.payment || '').toString().toLowerCase();
      let simplePaymentType = 'Dinheiro';
      if (paymentText.includes('máquina') || paymentText.includes('cartão') || paymentText.includes('maquina')) simplePaymentType = 'Cartão';
      else if (paymentText.includes('pix')) simplePaymentType = 'PIX';
      else if (paymentText.includes('dinheiro')) simplePaymentType = 'Dinheiro';

      const dataToSave = { address: orderDetails.address, payment: simplePaymentType };
      await AsyncStorage.setItem(LAST_ORDER_KEY, JSON.stringify(dataToSave));
      setLastAddress(orderDetails.address); setLastPayment(simplePaymentType);

      const apiPayload = { product: orderDetails.product, price: orderDetails.price, address: orderDetails.address, payment: simplePaymentType, notes: orderDetails.notes || '', trocoAmount: orderDetails.trocoAmount || '', clientEmail, createdAt: new Date().toISOString() };
      const sentNow = await enqueueOrder(apiPayload);
      if (!sentNow) Alert.alert('Pedido em fila', 'Seu pedido foi salvo e será enviado automaticamente quando houver conexão.');
      else Alert.alert('Sucesso!', 'Pedido enviado com sucesso.');
    } catch (e) {
      console.error('Erro no processamento do pedido:', e);
      Alert.alert('Erro', 'Ocorreu um problema ao processar seu pedido.');
    }
    setSelectedProduct(null); setScreen('home');
  }, [enqueueOrder, clientEmail]);

  // --- RENDERIZAÇÃO PRINCIPAL BASEADA NO ESTADO ---

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D90000" />
        <Text style={{ marginTop: 10 }}>Carregando dados...</Text>
      </View>
    );
  }
  
  // 1. SELEÇÃO DE PERFIL
  if (screen === 'userSelect' || !userType) {
    return <UserSelectionScreen onSelectUser={handleSelectUser} />;
  }
  
  let currentContent;

  if (userType === 'Cliente') {
    // 2. TELA DE CADASTRO
    if (screen === 'register') {
        return <RegisterScreen 
            onRegisterSuccess={handleClientRegister} 
            onBackToLogin={() => setScreen('login')} 
        />;
    }
      
    // 3. TELA DE LOGIN DO CLIENTE
    if (screen === 'login' && !isClientLoggedIn) {
        return <LoginScreen 
            onLogin={handleClientLogin} 
            onBackToSelection={handleLogout}
            onNavigateToRegister={() => setScreen('register')}
            registeredUsers={registeredClients}
        />;
    }
    
    // 4. FLUXO DO CLIENTE (APÓS LOGIN)
    if (screen === 'home' || (screen === 'checkout' && selectedProduct)) {
      if (screen === 'home') {
        currentContent = (
          <SelectProductScreen 
            onProductSelect={handleProductSelect} 
            onLogout={handleLogout}
            clientEmail={clientEmail}
          />
        );
      } else {
        currentContent = (
          <CheckoutScreen
            product={selectedProduct}
            onBack={handleBack}
            onPlaceOrder={handlePlaceOrder}
            lastAddress={lastAddress}
            lastPayment={lastPayment}
          />
        );
      }
      return <View style={{ flex: 1 }}>{currentContent}</View>;
    }    
  } else {
    // 5. DASHBOARD SIMULADO (Entregador / Administrador)
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Dashboard do {userType}</Text>
        <View style={styles.card}>
          <Text style={styles.title}>Função: {userType}</Text>
          <Text style={styles.subtitle}>Tela de visualização de acordo com o perfil.</Text>
          <Text style={{ marginTop: 10 }}>
            {userType === 'Entregador' ? 'Aqui o Entregador veria "Receber Pedidos" e "Acompanhar Rota".' : ''}
            {userType === 'Administrador' ? 'Aqui o Administrador veria "Gestão de Pedidos" e "Relatórios".' : ''}
          </Text>
        </View>

        {userType === 'Administrador' && (
          <TouchableOpacity style={[styles.button, { marginHorizontal: 20 }]} onPress={() => setScreen('usersDb')}>
            <Text style={styles.buttonText}>Ver Banco de Usuários / Estoque</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.button, styles.backButton, { marginHorizontal: 20, marginTop: 12 }]} onPress={handleLogout}>
          <Text style={styles.buttonText}>Trocar de Perfil / Sair</Text>
        </TouchableOpacity>
      </View>
    );
  }
};

export default App;