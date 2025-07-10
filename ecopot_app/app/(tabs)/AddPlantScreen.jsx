import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Modal, Animated, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Firebase configuration (replace with your config)
const firebaseConfig = {
  apiKey: "AIzaSyABf7yYLZz65t7P8P7fmspEHbsbxBl34fs",
  authDomain: "ecopot-da403.firebaseapp.com",
  projectId: "ecopot-da403",
  storageBucket: "ecopot-da403.firebasestorage.app",
  messagingSenderId: "195600361308",
  appId: "1:195600361308:web:772180ded816e154020399",
  measurementId: "G-TFSSE1YLQF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const AddPlantScreen = ({ navigation }) => {
  const [plantName, setPlantName] = useState('');
  const [plantSpecies, setPlantSpecies] = useState('');
  const [wateringFrequency, setWateringFrequency] = useState('Weekly');
  const [showSuccess, setShowSuccess] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [plantImage, setPlantImage] = useState(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [identificationResult, setIdentificationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const PLANT_ID_API_KEY = 'c9czeCIkpELnEvQRyVRIc1arB47tCp7HLjAa67PyYvNNg3kxPh';

  // Request camera permissions
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
      }
    })();
  }, []);

  // Image picker function
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setPlantImage(result.assets[0].uri);
        // Automatically identify the plant when image is selected
        identifyPlant(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Convert image to base64
  const convertImageToBase64 = async (imageUri) => {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      throw new Error('Failed to convert image to base64');
    }
  };

  // Plant identification function
  const identifyPlant = async (imageUri) => {
    setIsIdentifying(true);
    try {
      const base64Image = await convertImageToBase64(imageUri);
      
      const requestData = {
        images: [base64Image],
        modifiers: ["crops_fast", "similar_images", "health_all"],
        plant_details: ["common_names", "url", "name_authority", "wiki_description", "taxonomy"]
      };

      const response = await fetch('https://api.plant.id/v2/identify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': PLANT_ID_API_KEY,
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();
      
      if (result.suggestions && result.suggestions.length > 0) {
        const topSuggestion = result.suggestions[0];
        setIdentificationResult(topSuggestion);
        
        // Auto-fill the form with identified plant data
        setPlantName(topSuggestion.plant_details?.common_names?.[0] || topSuggestion.plant_name);
        setPlantSpecies(topSuggestion.plant_details?.name_authority || topSuggestion.plant_name);
        
        Alert.alert(
          'Plant Identified!',
          `This appears to be: ${topSuggestion.plant_details?.common_names?.[0] || topSuggestion.plant_name}\n\nConfidence: ${Math.round(topSuggestion.probability * 100)}%`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('No Match', 'Could not identify this plant. Please enter details manually.');
      }
    } catch (error) {
      console.error('Plant identification error:', error);
      Alert.alert('Error', 'Failed to identify plant. Please try again or enter details manually.');
    } finally {
      setIsIdentifying(false);
    }
  };

  // Save plant to Firebase
  const savePlantToFirebase = async () => {
    try {
      const plantData = {
        name: plantName,
        species: plantSpecies,
        wateringFrequency: wateringFrequency,
        imageUri: plantImage,
        identificationData: identificationResult,
        dateAdded: serverTimestamp(),
        lastWatered: null,
        notes: ''
      };

      await addDoc(collection(db, 'plants'), plantData);
      return true;
    } catch (error) {
      console.error('Error saving to Firebase:', error);
      Alert.alert('Error', 'Failed to save plant to database');
      return false;
    }
  };

  // Enhanced add plant function
  const handleAddPlant = async () => {
    if (!plantName.trim()) {
      Alert.alert('Missing Information', 'Please enter a plant name');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await savePlantToFirebase();
      
      if (success) {
        // Show success message
        setShowSuccess(true);
        
        // Animate the success message
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
        
        // Navigate back after a delay
        setTimeout(() => {
          setShowSuccess(false);
          navigation.goBack();
        }, 2000);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add plant');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#4CAF50', '#2E7D32']}
        style={styles.header}
      >
        <Text style={styles.headerText}>Add New Plant</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.formContainer}>
        <View style={styles.imageContainer}>
          <Image 
            source={plantImage ? { uri: plantImage } : require('./plant8.jpg')} 
            style={styles.plantImage} 
          />
          <TouchableOpacity style={styles.changeImageButton} onPress={pickImage}>
            <Ionicons name="camera" size={20} color="white" />
          </TouchableOpacity>
          {isIdentifying && (
            <View style={styles.identifyingOverlay}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.identifyingText}>Identifying plant...</Text>
            </View>
          )}
        </View>

        {/* Plant identification result */}
        {identificationResult && (
          <View style={styles.identificationResult}>
            <Text style={styles.identificationTitle}>Plant Identified:</Text>
            <Text style={styles.identificationName}>
              {identificationResult.plant_details?.common_names?.[0] || identificationResult.plant_name}
            </Text>
            <Text style={styles.identificationConfidence}>
              Confidence: {Math.round(identificationResult.probability * 100)}%
            </Text>
          </View>
        )}
        
        <Text style={styles.label}>Plant Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter plant name"
          value={plantName}
          onChangeText={setPlantName}
        />
        
        <Text style={styles.label}>Plant Species</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter plant species"
          value={plantSpecies}
          onChangeText={setPlantSpecies}
        />
        
        <Text style={styles.label}>Watering Schedule</Text>
        <View style={styles.scheduleSelector}>
          {['Daily', 'Weekly', 'Bi-weekly', 'Monthly'].map((schedule) => (
            <TouchableOpacity 
              key={schedule}
              style={[
                styles.scheduleOption,
                wateringFrequency === schedule && styles.scheduleOptionSelected
              ]}
              onPress={() => setWateringFrequency(schedule)}
            >
              <Text style={wateringFrequency === schedule ? styles.scheduleTextSelected : styles.scheduleText}>
                {schedule}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity 
          style={[styles.addButton, isLoading && styles.addButtonDisabled]} 
          onPress={handleAddPlant}
          disabled={isLoading}
        >
          <LinearGradient
            colors={['#4CAF50', '#2E7D32']}
            style={styles.addButtonGradient}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.addButtonText}>Add Plant</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

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
              <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
            </View>
            <Text style={styles.successTitle}>Success!</Text>
            <Text style={styles.successMessage}>
              {plantName || "Your plant"} has been added successfully.
            </Text>
          </Animated.View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 40,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  formContainer: {
    padding: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  plantImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 100,
    backgroundColor: '#4CAF50',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  identifyingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 75,
  },
  identifyingText: {
    marginTop: 10,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  identificationResult: {
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  identificationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  identificationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  identificationConfidence: {
    fontSize: 12,
    color: '#666',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  scheduleSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  scheduleOption: {
    width: '48%',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  scheduleOptionSelected: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50',
  },
  scheduleText: {
    color: '#666',
  },
  scheduleTextSelected: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
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

export default AddPlantScreen;
