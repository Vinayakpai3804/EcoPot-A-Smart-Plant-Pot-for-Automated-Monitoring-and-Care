import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import styles from './HomeScreenStyles';
import { Client } from 'paho-mqtt';

const HomeScreen = ({ navigation }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  // 6 states for each sensor
  const [temperature, setTemperature] = useState('');
  const [humidity, setHumidity] = useState('');
  const [moisture, setMoisture] = useState('');
  const [light, setLight] = useState('');
  const [airQuality, setAirQuality] = useState('');
  const [waterLevel, setWaterLevel] = useState('');

  useEffect(() => {
    const client = new Client(
      '//MQTT SERVER ID',
      'webclient_' + Math.random().toString(16).substr(2, 8)
    );

    client.connect({
      userName: '//MQTT USERNAME ',
      password: '//MQTT PASSWORD ', //I used HiveMQ for hosting MQTT server
      onSuccess: () => {
        console.log('✅ Connected to MQTT');
        // Subscribe to all topics
        client.subscribe('plant/temperature');
        client.subscribe('plant/humidity');
        client.subscribe('plant/moisture');
        client.subscribe('plant/light');
        client.subscribe('plant/air');
        client.subscribe('plant/water');
      },
      onFailure: (err) => {
        console.error('❌ Connection failed:', err);
      }
    });

    client.onMessageArrived = (message) => {
      const topic = message.destinationName;
      const value = message.payloadString;

      switch (topic) {
        case 'plant/temperature':
          setTemperature(`${value}°C`);
          break;
        case 'plant/humidity':
          setHumidity(`${value}%`);
          break;
        case 'plant/moisture':
          setMoisture(`${value}%`);
          break;
        case 'plant/light':
          setLight(value); // assume it’s like "Low", "Medium", "High"
          break;
        case 'plant/air':
          setAirQuality(value); // assume something like "Good", "Poor"
          break;
        case 'plant/water':
          setWaterLevel(value); // e.g. "Optimal", "Low"
          break;
        default:
          break;
      }
    };

    return () => {
      if (client.isConnected()) {
        client.disconnect();
      }
    };
  }, []);

  const plantConditions = [
    { name: 'Moisture', value: moisture || 'Loading...', status: 'good', icon: 'water-outline' },
    { name: 'Temperature', value: temperature || 'Loading...', status: 'good', icon: 'thermometer-outline' },
    { name: 'Humidity', value: humidity || 'Loading...', status: 'warning', icon: 'water' },
    { name: 'Light', value: light || 'Loading...', status: 'good', icon: 'sunny-outline' },
    { name: 'Air Quality', value: airQuality || 'Loading...', status: 'good', icon: 'cloud-outline' },
    { name: 'Water Level', value: waterLevel || 'Loading...', status: 'good', icon: 'flask-outline' },
  ];
  
  // Sample data for alerts
  const alerts = [
    { plant: 'Rose', message: 'Water needed', icon: 'water-outline', severity: 'high', image: require('./plant2.jpg') },
    { plant: 'Snake Plant', message: 'Low light detected', icon: 'sunny-outline', severity: 'medium', image: require('./plant3.jpeg') },
    { plant: 'Monstera', message: 'Due for fertilizer', icon: 'leaf-outline', severity: 'low', image: require('./plant7.jpeg') },
  ];

  // Daily tip
  const dailyTip = {
    title: "Today's Tip",
    content: "Rotate your plants regularly to ensure even growth and prevent them from leaning toward light sources.",
    icon: "bulb-outline"
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'good': return '#4CAF50';
      case 'warning': return '#FFC107';
      case 'danger': return '#F44336';
      default: return '#4CAF50';
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return '#F44336';
      case 'medium': return '#FFC107';
      case 'low': return '#2196F3';
      default: return '#4CAF50';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Enhanced Header with App Name */}
        <View style={styles.header}>
          <ImageBackground 
            source={require('./plantt.jpg')} 
            style={styles.headerBackground}
            blurRadius={2}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.3)', 'rgba(46,125,50,0.9)']}
              style={styles.headerGradient}
            >
              <View style={styles.headerTopRow}>
                <TouchableOpacity 
                  style={styles.menuButton}
                  onPress={() => setMenuVisible(true)}
                >
                  <Ionicons name="menu-outline" size={28} color="white" />
                </TouchableOpacity>
                <View style={styles.logoContainer}>
                  <Ionicons name="leaf" size={32} color="white" />
                  <Text style={styles.appName}> EcoPot</Text>
                </View>
                <View style={styles.headerIcons}>
                  <TouchableOpacity 
                    style={styles.iconButton}
                    onPress={() => navigation && navigation.navigate('NotificationsScreen')}
                  >
                    <Ionicons name="notifications-outline" size={24} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="search-outline" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.headerContent}>
                <Text style={styles.welcomeText}>Hello, Plant Lover!</Text>
                <Text style={styles.tagline}>Your Personal Plant Care Assistant</Text>
                <Text style={styles.dateText}>Friday, March 28, 2025, 6:54 PM IST</Text>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* Daily Tip Card */}
        <View style={styles.tipCard}>
          <View style={styles.tipIconContainer}>
            <Ionicons name={dailyTip.icon} size={28} color="#4CAF50" />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>{dailyTip.title}</Text>
            <Text style={styles.tipText}>{dailyTip.content}</Text>
          </View>
        </View>

        {/* Plant Conditions Summary */}
        <View style={styles.conditionsContainer}>
          <Text style={styles.sectionTitle}>Plant Conditions</Text>
          <View style={styles.conditionsGrid}>
            {plantConditions.map((condition, index) => (
              <View key={index} style={styles.conditionCard}>
                <LinearGradient
                  colors={['#f9f9f9', '#e8f5e9']}
                  style={styles.conditionGradient}
                >
                  <Ionicons 
                    name={condition.icon} 
                    size={24} 
                    color={getStatusColor(condition.status)} 
                    style={styles.conditionIcon}
                  />
                  <Text style={styles.conditionName}>{condition.name}</Text>
                  <Text style={[styles.conditionValue, {color: getStatusColor(condition.status)}]}>
                    {condition.value}
                  </Text>
                  <View style={[styles.statusIndicator, {backgroundColor: getStatusColor(condition.status)}]} />
                </LinearGradient>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Alerts */}
        <View style={styles.alertsContainer}>
          <Text style={styles.sectionTitle}>Quick Alerts</Text>
          {alerts.map((alert, index) => (
            <View key={index} style={styles.alertCard}>
              <Image source={alert.image} style={styles.alertPlantImage} />
              <View style={[styles.alertIconContainer, {backgroundColor: getSeverityColor(alert.severity)}]}>
                <Ionicons name={alert.icon} size={24} color="white" />
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertPlantName}>{alert.plant}</Text>
                <Text style={styles.alertMessage}>{alert.message}</Text>
                <View style={styles.alertProgressContainer}>
                  <View 
                    style={[
                      styles.alertProgress, 
                      {width: alert.severity === 'high' ? '80%' : alert.severity === 'medium' ? '50%' : '30%',
                      backgroundColor: getSeverityColor(alert.severity)}
                    ]} 
                  />
                </View>
              </View>
              <TouchableOpacity style={styles.alertActionButton}>
                <Text style={styles.alertActionText}>Fix</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          <TouchableOpacity style={styles.navButton}>
            <LinearGradient
              colors={['#4CAF50', '#2E7D32']}
              style={styles.navButtonGradient}
            >
              <Ionicons name="leaf" size={24} color="white" />
              <Text style={styles.navButtonText}>View Plants</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navButton}>
            <LinearGradient
              colors={['#66BB6A', '#43A047']}
              style={styles.navButtonGradient}
            >
              <Ionicons name="add-circle" size={24} color="white" />
              <Text style={styles.navButtonText}>Add Plant</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Community Section */}
        <View style={styles.communityContainer}>
          <Text style={styles.sectionTitle}>Plant Community</Text>
          <Text style={styles.communitySubtitle}>Connect with other plant lovers</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.communityScroll}>
            <TouchableOpacity style={styles.communityCard}>
              <Image source={require('./plant3.jpeg')} style={styles.communityImage} />
              <Text style={styles.communityCardTitle}>We Love Monstera</Text>
              <Text style={styles.communityCardMembers}>1.2k members</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.communityCard}>
              <Image source={require('./plant7.jpeg')} style={styles.communityImage} />
              <Text style={styles.communityCardTitle}>Succulent Fans</Text>
              <Text style={styles.communityCardMembers}>856 members</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.communityCard}>
              <Image source={require('./plant2.jpg')} style={styles.communityImage} />
              <Text style={styles.communityCardTitle}>Urban Gardeners</Text>
              <Text style={styles.communityCardMembers}>3.4k members</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ScrollView>
      
      {/* Side Navigation Menu */}
      <Modal
        transparent={true}
        visible={menuVisible}
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.sideMenu}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setMenuVisible(false)}
            >
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
            
            <View style={styles.userSection}>
              <Image source={require('./plantt.jpg')} style={styles.userAvatar} />
              <Text style={styles.userName}>Plant Lover</Text>
              <Text style={styles.userEmail}>plantlover@example.com</Text>
            </View>
            
            <View style={styles.menuItems}>
              <TouchableOpacity style={styles.menuItem}>
                <Ionicons name="home-outline" size={24} color="#4CAF50" />
                <Text style={styles.menuItemText}>Home</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem}>
                <Ionicons name="leaf-outline" size={24} color="#4CAF50" />
                <Text style={styles.menuItemText}>My Plants</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem}>
                <Ionicons name="book-outline" size={24} color="#4CAF50" />
                <Text style={styles.menuItemText}>Care Library</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem}>
                <Ionicons name="calendar-outline" size={24} color="#4CAF50" />
                <Text style={styles.menuItemText}>Care Schedule</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem}>
                <Ionicons name="settings-outline" size={24} color="#4CAF50" />
                <Text style={styles.menuItemText}>Settings</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem}>
                <Ionicons name="help-circle-outline" size={24} color="#4CAF50" />
                <Text style={styles.menuItemText}>Help & Support</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={24} color="#F44336" />
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default HomeScreen;
