import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const CareLibraryScreen = ({ navigation }) => {
  const careCategories = [
    { 
      title: 'Watering Guide', 
      icon: 'water-outline', 
      description: 'Learn how to water your plants effectively.',
      color: '#2196F3'
    },
    { 
      title: 'Light Requirements', 
      icon: 'sunny-outline', 
      description: 'Understand the sunlight needs of different plants.',
      color: '#FFC107'
    },
    { 
      title: 'Fertilizing Tips', 
      icon: 'leaf-outline', 
      description: 'Discover the best fertilizers for your plants.',
      color: '#4CAF50'
    },
    { 
      title: 'Pest Control', 
      icon: 'bug-outline', 
      description: 'Protect your plants from common pests and diseases.',
      color: '#F44336'
    }
  ];

  const popularPlants = [
    { name: 'Monstera', care: 'Medium', image: require('./plant3.jpeg') },
    { name: 'Snake Plant', care: 'Easy', image: require('./plant10.jpg') },
    { name: 'Fiddle Leaf Fig', care: 'Difficult', image: require('./plant8.jpg') }
  ];

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
              <Text style={styles.appName}>GreenThumb</Text>
            </View>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="search-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.welcomeText}>Plant Care Library</Text>
            <Text style={styles.tagline}>Everything you need to know about plant care</Text>
            <Text style={styles.dateText}>Friday, March 28, 2025, 5:10 PM IST</Text>
          </View>
        </LinearGradient>
      </ImageBackground>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <Text style={styles.searchPlaceholder}>Search care tips, plants...</Text>
        </View>
      </View>

      {/* AI Disease Finder Button */}
      <TouchableOpacity 
        style={styles.aiChatButton}
        onPress={() => navigation.navigate('AIDiseaseFinderScreen')}
      >
        <LinearGradient
          colors={['#8E24AA', '#5E35B1']}
          style={styles.aiChatGradient}
        >
          <View style={styles.aiChatContent}>
            <View style={styles.aiIconContainer}>
              <Ionicons name="medical" size={24} color="white" />
            </View>
            <View style={styles.aiTextContainer}>
              <Text style={styles.aiChatTitle}>AI Disease Finder</Text>
              <Text style={styles.aiChatDescription}>
                Diagnose plant diseases with our AI chatbot
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="white" />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Care Categories</Text>
        <View style={styles.categoriesGrid}>
          {careCategories.map((category, index) => (
            <TouchableOpacity key={index} style={styles.categoryCard}>
              <View style={[styles.iconContainer, {backgroundColor: `${category.color}20`}]}>
                <Ionicons name={category.icon} size={28} color={category.color} />
              </View>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <Text style={styles.categoryDescription}>{category.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.popularPlantsContainer}>
        <Text style={styles.sectionTitle}>Popular Plants</Text>
        <Text style={styles.sectionSubtitle}>Learn how to care for these common houseplants</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.plantsScroll}>
          {popularPlants.map((plant, index) => (
            <TouchableOpacity key={index} style={styles.plantCard}>
              <Image source={plant.image} style={styles.plantImage} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.plantGradient}
              >
                <Text style={styles.plantName}>{plant.name}</Text>
                <View style={styles.careLevelContainer}>
                  <Text style={styles.careLevel}>{plant.care}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.tipsContainer}>
        <Text style={styles.sectionTitle}>Seasonal Care Tips</Text>
        <View style={styles.tipCard}>
          <View style={styles.tipIconContainer}>
            <Ionicons name="sunny" size={24} color="#FFC107" />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Spring Care</Text>
            <Text style={styles.tipText}>It's time to repot and fertilize as plants enter their growth phase.</Text>
          </View>
        </View>
        
        <View style={styles.tipCard}>
          <View style={styles.tipIconContainer}>
            <Ionicons name="thermometer" size={24} color="#F44336" />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Summer Protection</Text>
            <Text style={styles.tipText}>Shield plants from intense afternoon sun and increase watering frequency.</Text>
          </View>
        </View>
      </View>
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
  searchContainer: {
    padding: 15,
    marginTop: -25,
  },
  searchBar: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchPlaceholder: {
    color: '#999',
    marginLeft: 10,
    fontSize: 14,
  },
  // AI Chat Button Styles
  aiChatButton: {
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  aiChatGradient: {
    padding: 15,
  },
  aiChatContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  aiTextContainer: {
    flex: 1,
  },
  aiChatTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  aiChatDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2E7D32',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: -10,
    marginBottom: 15,
  },
  categoriesContainer: {
    padding: 15,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  categoryDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  popularPlantsContainer: {
    padding: 15,
  },
  plantsScroll: {
    marginLeft: -5,
  },
  plantCard: {
    width: 160,
    height: 200,
    borderRadius: 12,
    marginRight: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  plantImage: {
    width: '100%',
    height: '100%',
  },
  plantGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    justifyContent: 'flex-end',
    padding: 10,
  },
  plantName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  careLevelContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  careLevel: {
    color: 'white',
    fontSize: 12,
  },
  tipsContainer: {
    padding: 15,
    marginBottom: 20,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default CareLibraryScreen;
