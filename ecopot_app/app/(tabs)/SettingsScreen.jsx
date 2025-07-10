import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  ScrollView, 
  TouchableOpacity, 
  ImageBackground, 
  Modal, 
  Animated, 
  Alert,
  Linking,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const SettingsScreen = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [waterRemindersEnabled, setWaterRemindersEnabled] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Handle notification toggle with feedback
  const handleNotificationToggle = (value) => {
    setNotificationsEnabled(value);
    if (value) {
      Alert.alert(
        'Notifications Enabled',
        'You will now receive plant care notifications and reminders.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Notifications Disabled',
        'You will no longer receive plant care notifications.',
        [{ text: 'OK' }]
      );
    }
  };

  // Handle dark mode toggle
  const handleDarkModeToggle = (value) => {
    setDarkModeEnabled(value);
    Alert.alert(
      'Dark Mode',
      value ? 'Dark mode enabled! (Feature coming soon)' : 'Dark mode disabled.',
      [{ text: 'OK' }]
    );
  };

  // Handle location toggle
  const handleLocationToggle = (value) => {
    setLocationEnabled(value);
    if (!value) {
      Alert.alert(
        'Location Services Disabled',
        'Weather-based plant care recommendations will be limited.',
        [{ text: 'OK' }]
      );
    }
  };

  // Handle water reminders toggle
  const handleWaterRemindersToggle = (value) => {
    setWaterRemindersEnabled(value);
    Alert.alert(
      'Watering Reminders',
      value ? 'You will receive reminders when your plants need watering.' : 'Watering reminders have been disabled.',
      [{ text: 'OK' }]
    );
  };

  // Handle profile settings
  const handleProfileSettings = () => {
    setShowProfileModal(true);
  };

  // Handle backup and restore
  const handleBackupRestore = () => {
    Alert.alert(
      'Backup & Restore',
      'Choose an option:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Backup Data', 
          onPress: () => {
            Alert.alert('Success', 'Your plant data has been backed up to the cloud.');
          }
        },
        { 
          text: 'Restore Data', 
          onPress: () => {
            Alert.alert('Restore', 'No backup data found. Add some plants first!');
          }
        }
      ]
    );
  };

  // Handle help and support
  const handleHelpSupport = () => {
    Alert.alert(
      'Help & Support',
      'How can we help you?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Plant Care Guide', 
          onPress: () => {
            Alert.alert('Plant Care Guide', 'Check the Care Library for comprehensive plant care information!');
          }
        },
        { 
          text: 'Contact Support', 
          onPress: () => {
            Alert.alert('Contact Support', 'Email: support@ecopot.com\nPhone: 777777777');
          }
        },
        { 
          text: 'Share App', 
          onPress: shareApp
        }
      ]
    );
  };

  // Share app functionality
  const shareApp = async () => {
    try {
      await Share.share({
        message: 'Check out EcoPot - the best plant care app! Download it now and keep your plants healthy! 🌱',
        title: 'EcoPot Plant Care App'
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share at this time.');
    }
  };

  // Navigate to AI Disease Finder
  const handleAIDiseaseDetection = () => {
    navigation.navigate('AIDiseaseFinderScreen');
  };

  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            setShowLogoutModal(true);
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }).start();
            
            setTimeout(() => {
              setShowLogoutModal(false);
              navigation.navigate('Login');
            }, 2000);
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
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
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.welcomeText}>Settings</Text>
            <Text style={styles.tagline}>Customize your plant care experience</Text>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
              })}
            </Text>
          </View>
        </LinearGradient>
      </ImageBackground>

      <View style={styles.settingsContainer}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications-outline" size={24} color="#4CAF50" style={styles.settingIcon} />
            <Text style={styles.settingText}>Enable Notifications</Text>
          </View>
          <Switch
            trackColor={{ false: '#767577', true: '#4CAF50' }}
            thumbColor={notificationsEnabled ? '#f4f3f4' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={handleNotificationToggle}
            value={notificationsEnabled}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="water-outline" size={24} color="#2196F3" style={styles.settingIcon} />
            <Text style={styles.settingText}>Watering Reminders</Text>
          </View>
          <Switch
            trackColor={{ false: '#767577', true: '#2196F3' }}
            thumbColor={waterRemindersEnabled ? '#f4f3f4' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={handleWaterRemindersToggle}
            value={waterRemindersEnabled}
          />
        </View>

        <Text style={styles.sectionTitle}>Appearance</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="moon-outline" size={24} color="#673AB7" style={styles.settingIcon} />
            <Text style={styles.settingText}>Dark Mode</Text>
          </View>
          <Switch
            trackColor={{ false: '#767577', true: '#673AB7' }}
            thumbColor={darkModeEnabled ? '#f4f3f4' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={handleDarkModeToggle}
            value={darkModeEnabled}
          />
        </View>

        <Text style={styles.sectionTitle}>Privacy</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="location-outline" size={24} color="#FF9800" style={styles.settingIcon} />
            <Text style={styles.settingText}>Location Services</Text>
          </View>
          <Switch
            trackColor={{ false: '#767577', true: '#FF9800' }}
            thumbColor={locationEnabled ? '#f4f3f4' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={handleLocationToggle}
            value={locationEnabled}
          />
        </View>

        <Text style={styles.sectionTitle}>Tools</Text>
        
        <TouchableOpacity style={styles.actionItem} onPress={handleAIDiseaseDetection}>
          <View style={styles.settingInfo}>
            <Ionicons name="medical-outline" size={24} color="#8E24AA" style={styles.settingIcon} />
            <Text style={styles.settingText}>AI Disease Finder</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.actionItem} onPress={handleProfileSettings}>
          <View style={styles.settingInfo}>
            <Ionicons name="person-outline" size={24} color="#333" style={styles.settingIcon} />
            <Text style={styles.settingText}>Profile Settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={handleBackupRestore}>
          <View style={styles.settingInfo}>
            <Ionicons name="cloud-upload-outline" size={24} color="#333" style={styles.settingIcon} />
            <Text style={styles.settingText}>Backup & Restore</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={handleHelpSupport}>
          <View style={styles.settingInfo}>
            <Ionicons name="help-circle-outline" size={24} color="#333" style={styles.settingIcon} />
            <Text style={styles.settingText}>Help & Support</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LinearGradient
            colors={['#F44336', '#D32F2F']}
            style={styles.logoutGradient}
          >
            <Ionicons name="log-out-outline" size={20} color="white" />
            <Text style={styles.logoutText}>Log Out</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.versionText}>EcoPot v1.0.0</Text>
      </View>

      {/* Profile Settings Modal */}
      <Modal
        transparent={true}
        visible={showProfileModal}
        animationType="slide"
        onRequestClose={() => setShowProfileModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.profileModal}>
            <View style={styles.profileHeader}>
              <Text style={styles.profileTitle}>Profile Settings</Text>
              <TouchableOpacity onPress={() => setShowProfileModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.profileContent}>
              <View style={styles.profileItem}>
                <Ionicons name="person" size={40} color="#4CAF50" />
                <Text style={styles.profileName}>Plant Lover</Text>
              </View>
              
              <TouchableOpacity style={styles.profileOption}>
                <Ionicons name="mail-outline" size={20} color="#666" />
                <Text style={styles.profileOptionText}>Change Email</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.profileOption}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" />
                <Text style={styles.profileOptionText}>Change Password</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.profileOption}>
                <Ionicons name="camera-outline" size={20} color="#666" />
                <Text style={styles.profileOptionText}>Change Profile Picture</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        transparent={true}
        visible={showLogoutModal}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.logoutModal, { opacity: fadeAnim }]}>
            <View style={styles.logoutIconContainer}>
              <Ionicons name="log-out" size={60} color="#F44336" />
            </View>
            <Text style={styles.logoutTitle}>Logging Out</Text>
            <Text style={styles.logoutMessage}>
              Thank you for using EcoPot. See you soon!
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
  settingsContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#2E7D32',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    marginBottom: 10,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    marginBottom: 10,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 15,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    color: '#999',
    marginBottom: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  profileModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '70%',
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  profileContent: {
    padding: 20,
  },
  profileItem: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  profileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginBottom: 10,
  },
  profileOptionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  logoutModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    elevation: 5,
    width: '80%',
  },
  logoutIconContainer: {
    marginBottom: 20,
  },
  logoutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  logoutMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default SettingsScreen;
