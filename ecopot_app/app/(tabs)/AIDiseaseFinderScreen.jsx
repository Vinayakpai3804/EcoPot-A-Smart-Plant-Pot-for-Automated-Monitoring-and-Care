import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Image, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  ActivityIndicator,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

const AIDiseaseFinderScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hello! I'm your AI plant disease assistant. Upload a photo of your plant or describe symptoms, and I'll help diagnose diseases and provide care advice.", 
      isUser: false 
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef();

  // API Keys
  //const PLANT_ID_API_KEY = 'c9czeCIkpELnEvQRyVRIc1arB47tCp7HLjAa67PyYvNNg3kxPh';
 // const GROQ_API_KEY = 'yor_api_key';

  // Enhanced permission request
  React.useEffect(() => {
    (async () => {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required', 
          'This app needs access to your photo library to analyze plant images. Please enable camera roll permissions in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
      }

      // Also request camera permissions for taking photos
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus.status !== 'granted') {
        console.log('Camera permission not granted');
      }
    })();
  }, []);

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

  // Plant disease detection using Plant.id API
  const detectPlantDisease = async (imageUri) => {
    try {
      const base64Image = await convertImageToBase64(imageUri);
      
      const requestData = {
        images: [base64Image],
        modifiers: ["crops_fast", "similar_images", "health_all"],
        plant_details: ["common_names", "url", "name_authority", "wiki_description", "taxonomy"],
        disease_details: ["common_names", "url", "description", "treatment", "classification", "cause"]
      };

      const response = await fetch('https://api.plant.id/v2/health_assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': PLANT_ID_API_KEY,
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Plant disease detection error:', error);
      throw error;
    }
  };

  // Chat with Groq AI for plant care questions
  const chatWithAI = async (userMessage) => {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile", // Updated model
          messages: [
            {
              role: "system",
              content: "You are an expert plant pathologist and horticulturist. Provide accurate, practical advice about plant diseases, care, watering, fertilizing, pest control, and general plant health. Keep responses concise but informative, focusing on actionable solutions."
            },
            {
              role: "user",
              content: userMessage
            }
          ],
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      return result.choices[0].message.content;
    } catch (error) {
      console.error('Groq chat error:', error);
      throw error;
    }
  };

  // Format disease detection results
  const formatDiseaseResults = (result) => {
    if (!result.health_assessment) {
      return "I couldn't detect any specific diseases in this image. The plant appears healthy, but if you're concerned about specific symptoms, please describe them and I'll help you further.";
    }

    const { health_assessment } = result;
    const diseases = health_assessment.diseases || [];
    
    if (diseases.length === 0) {
      return "Good news! I don't detect any diseases in your plant. It appears to be healthy. Continue with regular care and monitoring.";
    }

    let response = "🔍 **Disease Analysis Results:**\n\n";
    
    diseases.slice(0, 3).forEach((disease, index) => {
      const probability = Math.round(disease.probability * 100);
      response += `**${index + 1}. ${disease.name}** (${probability}% confidence)\n`;
      
      if (disease.disease_details) {
        if (disease.disease_details.description) {
          response += `📋 Description: ${disease.disease_details.description}\n`;
        }
        if (disease.disease_details.treatment && disease.disease_details.treatment.biological) {
          response += `💊 Treatment: ${disease.disease_details.treatment.biological.join(', ')}\n`;
        }
      }
      response += "\n";
    });

    response += "💡 **General Recommendations:**\n";
    response += "• Remove affected leaves immediately\n";
    response += "• Improve air circulation around the plant\n";
    response += "• Avoid watering leaves directly\n";
    response += "• Monitor plant closely for changes\n";

    return response;
  };

  // Show image selection options
  const showImageOptions = () => {
    Alert.alert(
      'Select Image',
      'Choose how you want to add a plant photo',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Gallery', onPress: handleUploadImage },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  // Take photo with camera
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera access is required to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images', // Fixed: Use string instead of enum
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        await processSelectedImage(imageUri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  // Handle image upload from gallery
  const handleUploadImage = async () => {
    try {
      console.log('Starting image picker...');
      
      // Check permissions first
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert('Permission Denied', 'Camera roll access is required to upload plant photos.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images', // Fixed: Use string instead of enum
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      console.log('Image picker result:', result);

      if (result.canceled) {
        console.log('User canceled image picker');
        return;
      }

      if (!result.assets || result.assets.length === 0) {
        throw new Error('No image selected');
      }

      const imageUri = result.assets[0].uri;
      console.log('Selected image URI:', imageUri);

      // Validate the image URI
      if (!imageUri) {
        throw new Error('Invalid image URI');
      }

      await processSelectedImage(imageUri);
      
    } catch (error) {
      console.error('Detailed image picker error:', error);
      Alert.alert(
        'Image Selection Failed', 
        `Error: ${error.message}\n\nPlease check your permissions and try again.`
      );
      setIsLoading(false);
    }
  };

  // Process selected image (common function for camera and gallery)
  const processSelectedImage = async (imageUri) => {
    try {
      // Add user message with image
      const userMessage = {
        id: Date.now(),
        text: "I've uploaded a photo for disease analysis.",
        isUser: true,
        hasImage: true,
        imageUri: imageUri
      };
      
      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);

      // Detect plant disease
      const diseaseResult = await detectPlantDisease(imageUri);
      const analysisText = formatDiseaseResults(diseaseResult);
      
      // Add AI response
      const aiMessage = {
        id: Date.now() + 1,
        text: analysisText,
        isUser: false
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('Disease detection error:', error);
      // Fallback response if API fails
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm having trouble analyzing the image right now. Could you describe the symptoms you're seeing? I can still help diagnose the issue based on your description.",
        isUser: false
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle text messages and AI chat
  const handleSend = async () => {
    if (inputText.trim() === '') return;
    
    const userMessage = {
      id: Date.now(),
      text: inputText,
      isUser: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Get AI response using Groq
      const aiResponse = await chatWithAI(inputText);
      
      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        isUser: false
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      // Fallback responses for common plant care questions
      const fallbackResponse = generateFallbackResponse(inputText);
      
      const aiMessage = {
        id: Date.now() + 1,
        text: fallbackResponse,
        isUser: false
      };
      
      setMessages(prev => [...prev, aiMessage]);
    }
    
    setIsLoading(false);
  };

  // Fallback responses when API is unavailable
  const generateFallbackResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('water')) {
      return "💧 **Watering Tips:**\n• Check soil moisture with your finger\n• Water when top inch is dry\n• Ensure good drainage\n• Water in the morning\n• Avoid overwatering - it's the #1 cause of plant problems!";
    }
    
    if (input.includes('yellow') || input.includes('yellowing')) {
      return "🍃 **Yellow Leaves:**\n• Often caused by overwatering\n• Could be natural aging (lower leaves)\n• Check for pests\n• Ensure adequate light\n• Consider nutrient deficiency";
    }
    
    if (input.includes('brown') || input.includes('spot')) {
      return "🟤 **Brown Spots/Leaves:**\n• May indicate fungal disease\n• Remove affected leaves\n• Improve air circulation\n• Avoid getting leaves wet\n• Consider fungicide treatment";
    }
    
    if (input.includes('pest') || input.includes('bug')) {
      return "🐛 **Pest Control:**\n• Inspect leaves regularly\n• Use neem oil for treatment\n• Isolate affected plants\n• Increase humidity for spider mites\n• Consider beneficial insects";
    }
    
    return "🌱 I'd be happy to help with your plant care question! For the most accurate advice, could you provide more specific details about the symptoms you're observing? You can also upload a photo for visual analysis.";
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#8E24AA', '#5E35B1']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Disease Finder</Text>
        <View style={styles.headerRight} />
      </LinearGradient>

      {/* Chat Messages */}
      <ScrollView 
        style={styles.messagesContainer}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map(message => (
          <View 
            key={message.id} 
            style={[
              styles.messageBubble, 
              message.isUser ? styles.userMessage : styles.aiMessage
            ]}
          >
            {!message.isUser && (
              <View style={styles.aiAvatar}>
                <Ionicons name="leaf" size={16} color="white" />
              </View>
            )}
            <View style={[
              styles.messageContent,
              message.isUser ? styles.userMessageContent : styles.aiMessageContent
            ]}>
              {message.hasImage && message.imageUri && (
                <Image 
                  source={{ uri: message.imageUri }} 
                  style={styles.messageImage} 
                />
              )}
              <Text style={[
                styles.messageText,
                message.isUser ? styles.userMessageText : styles.aiMessageText
              ]}>
                {message.text}
              </Text>
            </View>
          </View>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <View style={[styles.messageBubble, styles.aiMessage]}>
            <View style={styles.aiAvatar}>
              <Ionicons name="leaf" size={16} color="white" />
            </View>
            <View style={styles.loadingMessage}>
              <ActivityIndicator size="small" color="#8E24AA" />
              <Text style={styles.loadingText}>Analyzing...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inputContainer}
      >
        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={showImageOptions}
          disabled={isLoading}
        >
          <Ionicons name="camera" size={24} color={isLoading ? "#ccc" : "#8E24AA"} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Ask about plant care or describe symptoms..."
          value={inputText}
          onChangeText={setInputText}
          multiline
          editable={!isLoading}
        />
        <TouchableOpacity 
          style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={isLoading}
        >
          <Ionicons name="send" size={24} color="white" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 30,
  },
  messagesContainer: {
    flex: 1,
    padding: 15,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 15,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  aiMessage: {
    alignSelf: 'flex-start',
  },
  aiAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#8E24AA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 5,
  },
  messageContent: {
    borderRadius: 18,
    padding: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  userMessageContent: {
    backgroundColor: '#8E24AA',
  },
  aiMessageContent: {
    backgroundColor: 'white',
  },
  userMessageText: {
    color: 'white',
  },
  aiMessageText: {
    color: '#333',
    lineHeight: 20,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 10,
    marginBottom: 8,
  },
  loadingMessage: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  uploadButton: {
    padding: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    maxHeight: 100,
    marginHorizontal: 5,
  },
  sendButton: {
    backgroundColor: '#8E24AA',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});

export default AIDiseaseFinderScreen;
