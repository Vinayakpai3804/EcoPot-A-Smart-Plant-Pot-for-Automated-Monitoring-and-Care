import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ImageBackground, KeyboardAvoidingView, Platform, Modal, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const handleLogin = () => {
    // Show success message
    setShowSuccess(true);
    
    // Animate the success message
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    // Navigate to MainApp after a delay
    setTimeout(() => {
      setShowSuccess(false);
      navigation.navigate('MainApp');
    }, 2000);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ImageBackground 
        source={require('./plant8.jpg')} 
        style={styles.backgroundImage}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'rgba(46,125,50,0.9)']}
          style={styles.gradient}
        >
          <View style={styles.logoContainer}>
            <Ionicons name="leaf" size={50} color="white" />
            <Text style={styles.appName}>EcoPot</Text>
            <Text style={styles.tagline}>Your Personal Plant Care Assistant</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.instructionText}>Sign in to continue</Text>

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={22} color="#4CAF50" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={22} color="#4CAF50" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={22} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <LinearGradient
                colors={['#4CAF50', '#2E7D32']}
                style={styles.loginButtonGradient}
              >
                <Text style={styles.loginButtonText}>Login</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-google" size={24} color="#DB4437" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-facebook" size={24} color="#4267B2" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-apple" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
               <Text style={styles.signupLink}>Sign Up</Text>
               </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.dateText}>Sunday, March 30, 2025, 1:29 PM IST</Text>
        </LinearGradient>
      </ImageBackground>

      {/* Success Message Modal */}
      <Modal
        transparent={true}
        visible={showSuccess}
        animationType="fade"
        onRequestClose={() => setShowSuccess(false)}
      >
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.successModal, { opacity: fadeAnim }]}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={70} color="#4CAF50" />
            </View>
            <Text style={styles.successTitle}>Welcome Back!</Text>
            <Text style={styles.successMessage}>
              Login successful. Taking you to your plants...
            </Text>
          </Animated.View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 55,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#4CAF50',
    fontSize: 14,
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    marginBottom: 20,
  },
  loginButtonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666',
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupText: {
    color: '#666',
    fontSize: 14,
  },
  signupLink: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 14,
  },
  dateText: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  successModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    elevation: 5,
    width: '80%',
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default LoginScreen;
