import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from '@expo/vector-icons/Ionicons';

// Import your screen components
import HomeScreen from './HomeScreen';
import MyPlantsScreen from './MyPlantsScreen';
import AddPlantScreen from './AddPlantScreen';
import CareLibraryScreen from './CareLibraryScreen';
import SettingsScreen from './SettingsScreen';
import AIDiseaseFinderScreen from './AIDiseaseFinderScreen';
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';
import NotificationsScreen from './NotificationsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const MainStack = createStackNavigator();

function MainNavigator() {
  return (
    <MainStack.Navigator initialRouteName="Login">
      <MainStack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ headerShown: false }}
      />
      <MainStack.Screen 
        name="Signup" 
        component={SignupScreen} 
        options={{ headerShown: false }}
      />
      <MainStack.Screen 
        name="MainApp" 
        component={TabNavigator} 
        options={{ headerShown: false }}
      />
    </MainStack.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="NotificationsScreen" 
        component={NotificationsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function MyPlantsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MyPlantsMain" 
        component={MyPlantsScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddPlant" 
        component={AddPlantScreen}
        options={{
          title: 'Add New Plant',
          headerStyle: { backgroundColor: '#4CAF50' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
    </Stack.Navigator>
  );
}

function SettingsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="SettingsMain" 
        component={SettingsScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AIDiseaseFinderScreen" 
        component={AIDiseaseFinderScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function CareLibraryStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="CareLibraryMain" 
        component={CareLibraryScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AIDiseaseFinderScreen" 
        component={AIDiseaseFinderScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'My Plants') {
            iconName = focused ? 'leaf' : 'leaf-outline';
          } else if (route.name === 'Care Library') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="My Plants" component={MyPlantsStack} />
      <Tab.Screen name="Care Library" component={CareLibraryStack} />
      <Tab.Screen name="Settings" component={SettingsStack} />
    </Tab.Navigator>
  );
}

export default function App() {
  return <MainNavigator />;
}