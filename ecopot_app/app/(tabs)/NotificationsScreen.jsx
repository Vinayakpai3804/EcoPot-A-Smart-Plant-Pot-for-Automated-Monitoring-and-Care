import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native'; // Add this line
import { 
  initializeApp 
} from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  query, 
  orderBy,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  where,
  getDocs
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

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calculate days until next watering (same logic as MyPlantsScreen)
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

  // Create notification for plants that need watering
  const createWateringNotification = async (plant) => {
    try {
      // Check if notification already exists for this plant
      const notificationsRef = collection(db, 'notifications');
      const existingNotificationQuery = query(
        notificationsRef,
        where('plantId', '==', plant.id),
        where('type', '==', 'watering'),
        where('read', '==', false)
      );
      
      const existingNotifications = await getDocs(existingNotificationQuery);
      
      // Only create notification if one doesn't already exist
      if (existingNotifications.empty) {
        const notificationData = {
          plantId: plant.id,
          plantName: plant.name,
          type: 'watering',
          title: `Water your ${plant.name}`,
          message: `Your ${plant.name} needs watering today`,
          timestamp: serverTimestamp(),
          read: false,
          priority: 'high'
        };

        await addDoc(collection(db, 'notifications'), notificationData);
        console.log(`Watering notification created for ${plant.name}`);
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  // Check all plants and create notifications for those needing water
  const checkPlantsAndCreateNotifications = async () => {
    try {
      const plantsRef = collection(db, 'plants');
      const plantsSnapshot = await getDocs(plantsRef);
      
      plantsSnapshot.docs.forEach(async (plantDoc) => {
        const plantData = plantDoc.data();
        const plant = { id: plantDoc.id, ...plantData };
        const daysUntilWatering = calculateDaysUntilWatering(plantData);
        
        // Create notification if plant needs watering (0 days or overdue)
        if (daysUntilWatering <= 0) {
          await createWateringNotification(plant);
        }
      });
    } catch (error) {
      console.error('Error checking plants for notifications:', error);
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const notificationDate = new Date(timestamp.seconds * 1000);
    const now = new Date();
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return notificationDate.toLocaleDateString();
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          onPress: async () => {
            try {
              const notificationsRef = collection(db, 'notifications');
              const notificationsSnapshot = await getDocs(notificationsRef);
              
              const deletePromises = notificationsSnapshot.docs.map(doc => 
                deleteDoc(doc.ref)
              );
              
              await Promise.all(deletePromises);
              Alert.alert('Success', 'All notifications cleared');
            } catch (error) {
              console.error('Error clearing notifications:', error);
              Alert.alert('Error', 'Failed to clear notifications');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Set up real-time listener for notifications
  useEffect(() => {
    const notificationsRef = collection(db, 'notifications');
    const notificationsQuery = query(notificationsRef, orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        time: formatTimestamp(doc.data().timestamp)
      }));
      
      setNotifications(notificationsData);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to notifications:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Check plants and create notifications on component mount
  useEffect(() => {
    checkPlantsAndCreateNotifications();
    
    // Set up interval to check periodically (every hour)
    const interval = setInterval(() => {
      checkPlantsAndCreateNotifications();
    }, 60 * 60 * 1000); // 1 hour
    
    return () => clearInterval(interval);
  }, []);

  const handleNotificationPress = async (notification) => {
    // Mark as read when tapped
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Navigate to specific plant if it's a watering notification
    if (notification.type === 'watering' && notification.plantId) {
      navigation.navigate('My Plants');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'watering':
        return 'water';
      case 'fertilizer':
        return 'leaf';
      case 'light':
        return 'sunny';
      case 'health':
        return 'medical';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'high') return '#F44336';
    
    switch (type) {
      case 'watering':
        return '#2196F3';
      case 'fertilizer':
        return '#4CAF50';
      case 'light':
        return '#FF9800';
      case 'health':
        return '#F44336';
      default:
        return '#4CAF50';
    }
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.notificationItem, !item.read && styles.unreadNotification]}
      onPress={() => handleNotificationPress(item)}
    >
      {!item.read && <View style={styles.unreadDot} />}
      
      <View style={styles.notificationIconContainer}>
        <View style={[
          styles.notificationIcon, 
          { backgroundColor: getNotificationColor(item.type, item.priority) }
        ]}>
          <Ionicons 
            name={getNotificationIcon(item.type)} 
            size={20} 
            color="white" 
          />
        </View>
      </View>
      
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4CAF50', '#2E7D32']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={clearAllNotifications}
        >
          <Text style={styles.clearButtonText}>Clear All</Text>
        </TouchableOpacity>
      </LinearGradient>

      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.notificationsList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No notifications yet</Text>
          <Text style={styles.emptySubText}>
            We'll notify you when your plants need care
          </Text>
        </View>
      )}
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
  clearButton: {
    padding: 5,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
  },
  notificationsList: {
    padding: 15,
  },
  notificationItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadNotification: {
    backgroundColor: '#e8f5e9',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  unreadDot: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  notificationIconContainer: {
    marginRight: 15,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
    alignSelf: 'flex-end',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
    fontWeight: 'bold',
  },
  emptySubText: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default NotificationsScreen;
