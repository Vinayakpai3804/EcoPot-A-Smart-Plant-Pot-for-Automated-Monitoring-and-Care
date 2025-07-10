import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ImageBackground, KeyboardAvoidingView, Platform, Alert, ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import Modal from 'react-native-modal';

const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);

  const handleSignup = () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    setModalVisible(true); // Show success modal
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ImageBackground 
        source={require('./plantt.jpg')} 
        style={styles.backgroundImage}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.5)', 'rgba(46,125,50,0.9)']}
          style={styles.gradient}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            
            {/* Logo Section */}
            <Animatable.View animation="fadeInDown" style={styles.logoContainer}>
              <Ionicons name="leaf" size={70} color="white" />
              <Text style={styles.appName}>GreenThumb</Text>
              <Text style={styles.tagline}>Your Personal Plant Care Assistant</Text>
            </Animatable.View>

            {/* Form Section */}
            <Animatable.View animation="fadeInUp" style={styles.formContainer}>
              <Text style={styles.welcomeText}>Create an Account</Text>

              {/* Input Fields */}
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={22} color="#4CAF50" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="#666"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={22} color="#4CAF50" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#666"
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
                  placeholderTextColor="#666"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={22} color="#4CAF50" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor="#666"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>

              {/* Signup Button */}
              <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
                <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.signupButtonGradient}>
                  <Text style={styles.signupButtonText}>Sign Up</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Login Redirect */}
              <View style={styles.loginRedirect}>
                <Text style={{ color: '#666' }}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginText}>Log In</Text>
                </TouchableOpacity>
              </View>
            </Animatable.View>
          </ScrollView>
        </LinearGradient>
      </ImageBackground>

      {/* Success Modal */}
      <Modal isVisible={isModalVisible} animationIn="zoomIn" animationOut="zoomOut">
        <View style={styles.modalContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
          <Text style={styles.modalTitle}>Success!</Text>
          <Text style={styles.modalText}>Your account has been created successfully.</Text>
          <TouchableOpacity style={styles.modalButton} onPress={() => {
            setModalVisible(false);
            navigation.replace("MainApp");
          }}>
            <Text style={styles.modalButtonText}>Continue</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 34,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
    textShadowColor:'#333',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    paddingVertical: 25,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  signupButton: {
    marginTop: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  signupButtonGradient: {
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginRedirect: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  loginText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 10,
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 15,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SignupScreen;
