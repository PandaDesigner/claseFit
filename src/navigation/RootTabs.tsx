import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Text } from 'react-native';
import { UpcomingClassesScreen } from '@features/class-booking/presentation/screens/UpcomingClassesScreen';
import { MyBookingsScreen } from '@features/class-booking/presentation/screens/MyBookingsScreen';
import { messages } from '@features/class-booking/presentation/copy/messages';

const Tab = createBottomTabNavigator();

export function RootTabs() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#191B1D',
          tabBarInactiveTintColor: '#51565C',
          headerShown: false,
        }}
      >
        <Tab.Screen
          name={messages.classesTab}
          component={UpcomingClassesScreen}
          options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📅</Text> }}
        />
        <Tab.Screen
          name={messages.myBookingsTab}
          component={MyBookingsScreen}
          options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📋</Text> }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
