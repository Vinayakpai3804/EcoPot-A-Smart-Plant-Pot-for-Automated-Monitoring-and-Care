import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ImageBackground, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  initializeApp 
} from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';

// Firebase configuration
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

const MyPlantsScreen = ({ navigation }) => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mark plant as watered
  const markAsWatered = async (plantId) => {
    try {
      const plantRef = doc(db, 'plants', plantId);
      await updateDoc(plantRef, {
        lastWatered: serverTimestamp()
      });
      
      Alert.alert('Success', 'Plant marked as watered!');
    } catch (error) {
      console.error('Error updating plant:', error);
      Alert.alert('Error', 'Failed to update watering status');
    }
  };

  // Confirmation dialog for watering
  const confirmWatering = (plantId, plantName) => {
    Alert.alert(
      'Mark as Watered',
      `Did you water ${plantName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes, Watered',
          onPress: () => markAsWatered(plantId),
          style: 'default',
        },
      ]
    );
  };

  // Fetch plants from Firebase
  const fetchPlants = async () => {
    try {
      const plantsCollection = collection(db, 'plants');
      const plantsQuery = query(plantsCollection, orderBy('dateAdded', 'desc'));
      const plantsSnapshot = await getDocs(plantsQuery);
      
      const plantsData = plantsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Calculate days until watering based on frequency and last watered
        daysUntilWatering: calculateDaysUntilWatering(doc.data()),
        // Determine health status
        health: determineHealthStatus(doc.data())
      }));
      
      setPlants(plantsData);
    } catch (error) {
      console.error('Error fetching plants:', error);
      Alert.alert('Error', 'Failed to load plants from database');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Calculate days until next watering
  const calculateDaysUntilWatering = (plantData) => {
    if (!plantData.lastWatered) {
      return 0; // Needs watering immediately if never watered
    }

    const lastWateredDate = new Date(plantData.lastWatered.seconds * 1000);
    const today = new Date();
    const daysSinceWatered = Math.floor((today - lastWateredDate) / (1000 * 60 * 60 * 24));
    
    const wateringIntervals = {
      'Daily': 1,
      'Weekly': 7,
      'Bi-weekly': 14,
      'Monthly': 30
    };
    
    const interval = wateringIntervals[plantData.wateringFrequency] || 7;
    const daysUntilWatering = interval - daysSinceWatered;
    
    return Math.max(0, daysUntilWatering);
  };

  // Determine plant health status
  const determineHealthStatus = (plantData) => {
    const daysUntilWatering = calculateDaysUntilWatering(plantData);
    
    if (daysUntilWatering <= 0) {
      return 'danger'; // Needs water now
    } else if (daysUntilWatering <= 1) {
      return 'warning'; // Needs water soon
    } else {
      return 'good'; // Healthy
    }
  };

  // Set up real-time listener
  useEffect(() => {
    const plantsCollection = collection(db, 'plants');
    const plantsQuery = query(plantsCollection, orderBy('dateAdded', 'desc'));
    
    const unsubscribe = onSnapshot(plantsQuery, (snapshot) => {
      const plantsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        daysUntilWatering: calculateDaysUntilWatering(doc.data()),
        health: determineHealthStatus(doc.data())
      }));
      
      setPlants(plantsData);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to plants:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Refresh function for pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchPlants();
  };

  // Calculate statistics
  const getStats = () => {
    const needWater = plants.filter(plant => plant.daysUntilWatering <= 1).length;
    const needCare = plants.filter(plant => plant.health === 'warning' || plant.health === 'danger').length;
    
    return {
      totalPlants: plants.length,
      needWater,
      needCare
    };
  };

  const stats = getStats();
  
  const getHealthColor = (health) => {
    switch(health) {
      case 'good': return '#4CAF50';
      case 'warning': return '#FFC107';
      case 'danger': return '#F44336';
      default: return '#4CAF50';
    }
  };

  // Render water button with different states
  const renderWaterButton = (item) => {
    const isUrgent = item.daysUntilWatering <= 0;
    const isRecentlyWatered = item.daysUntilWatering >= 5;
    
    let buttonStyle = styles.actionButton;
    let iconName = "water";
    
    if (isUrgent) {
      buttonStyle = [styles.actionButton, styles.urgentActionButton];
      iconName = "water";
    } else if (isRecentlyWatered) {
      buttonStyle = [styles.actionButton, styles.wateredRecentlyButton];
      iconName = "checkmark-circle";
    }
    
    return (
      <TouchableOpacity 
        style={buttonStyle}
        onPress={() => confirmWatering(item.id, item.name)}
      >
        <Ionicons name={iconName} size={18} color="white" />
      </TouchableOpacity>
    );
  };

  const renderPlantItem = ({ item }) => (
    <TouchableOpacity style={styles.plantCard}>
      <Image 
        source={item.imageUri ? { uri: item.imageUri } : require('./plant8.jpg')} 
        style={styles.plantImage}
        defaultSource={require('./plant8.jpg')}
      />
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
        style={styles.plantImageOverlay}
      />
      <View style={styles.plantInfo}>
        <View style={styles.plantNameRow}>
          <Text style={styles.plantName}>{item.name || 'Unknown Plant'}</Text>
          <View style={[styles.healthIndicator, {backgroundColor: getHealthColor(item.health)}]} />
        </View>
        <Text style={styles.plantSpecies}>{item.species || 'Unknown Species'}</Text>
        <View style={styles.wateringRow}>
          <Ionicons name="water-outline" size={16} color="#2196F3" style={styles.waterIcon} />
          <Text style={styles.wateringInfo}>
            {item.daysUntilWatering <= 0 ? (
              <Text style={[styles.wateringDays, {color: '#F44336'}]}>Needs water now!</Text>
            ) : (
              <>Next watering: <Text style={styles.wateringDays}>{item.daysUntilWatering} days</Text></>
            )}
          </Text>
        </View>
        <View style={styles.plantDetails}>
          <Text style={styles.plantDetailText}>
            Watering: {item.wateringFrequency || 'Weekly'}
          </Text>
          {item.dateAdded && (
            <Text style={styles.plantDetailText}>
              Added: {new Date(item.dateAdded.seconds * 1000).toLocaleDateString()}
            </Text>
          )}
          {item.lastWatered && (
            <Text style={styles.plantDetailText}>
              Last watered: {new Date(item.lastWatered.seconds * 1000).toLocaleDateString()}
            </Text>
          )}
        </View>
        <View style={styles.plantActions}>
          {renderWaterButton(item)}
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="sunny-outline" size={18} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="leaf-outline" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="leaf-outline" size={64} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No Plants Yet</Text>
      <Text style={styles.emptyStateText}>
        Start building your plant collection by adding your first plant!
      </Text>
      <TouchableOpacity 
        style={styles.emptyStateButton}
        onPress={() => navigation.navigate('AddPlant')}
      >
        <LinearGradient
          colors={['#4CAF50', '#2E7D32']}
          style={styles.emptyStateButtonGradient}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.emptyStateButtonText}>Add Your First Plant</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading your plants...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={require('./plantt.jpg')} 
        style={styles.headerBackground}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(46,125,50,0.9)']}
          style={styles.headerGradient}
        >
          <View style={styles.headerTopRow}>
            <View style={styles.logoContainer}>
              <Ionicons name="leaf" size={32} color="white" />
              <Text style={styles.appName}>EcoPot</Text>
            </View>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="search-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.welcomeText}>My Plant Collection</Text>
            <Text style={styles.tagline}>Keep track of all your green friends</Text>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
        </LinearGradient>
      </ImageBackground>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalPlants}</Text>
          <Text style={styles.statLabel}>Plants</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.needWater}</Text>
          <Text style={styles.statLabel}>Need Water</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.needCare}</Text>
          <Text style={styles.statLabel}>Need Care</Text>
        </View>
      </View>

      <FlatList
        data={plants}
        renderItem={renderPlantItem}
        keyExtractor={item => item.id}
        contentContainerStyle={plants.length === 0 ? styles.emptyListContainer : styles.plantList}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={renderEmptyState}
      />

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('AddPlant')}
      >
        <LinearGradient
          colors={['#4CAF50', '#2E7D32']}
          style={styles.addButtonGradient}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>Add New Plant</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  headerBackground: {
    height: 180,
    width: '100%',
  },
  headerGradient: {
    height: '100%',
    width: '100%',
    justifyContent: 'space-between',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  iconButton: {
    marginLeft: 16,
  },
  headerContent: {
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  dateText: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    margin: 15,
    marginTop: -25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    height: 30,
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  plantList: {
    padding: 15,
  },
  emptyListContainer: {
    flex: 1,
    padding: 15,
  },
  plantCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  plantImage: {
    width: '100%',
    height: 150,
  },
  plantImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  plantInfo: {
    padding: 15,
  },
  plantNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  plantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  healthIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  plantSpecies: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  wateringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  waterIcon: {
    marginRight: 5,
  },
  wateringInfo: {
    fontSize: 14,
    color: '#666',
  },
  wateringDays: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  plantDetails: {
    marginBottom: 15,
  },
  plantDetailText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  plantActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  urgentActionButton: {
    backgroundColor: '#F44336',
    elevation: 4,
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  wateredRecentlyButton: {
    backgroundColor: '#2196F3',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  emptyStateButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptyStateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyStateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  addButton: {
    margin: 15,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default MyPlantsScreen;
