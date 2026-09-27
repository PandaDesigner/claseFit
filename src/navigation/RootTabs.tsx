import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { UpcomingClassesScreen } from '@features/class-booking/presentation/screens/UpcomingClassesScreen';
import { MyBookingsScreen } from '@features/class-booking/presentation/screens/MyBookingsScreen';
import { FloatingTabBar } from './components/FloatingTabBar';

const Tab = createBottomTabNavigator();

export function RootTabs() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => <FloatingTabBar {...props} />}
      >
        <Tab.Screen name="Clases" component={UpcomingClassesScreen} />
        <Tab.Screen name="Mis reservas" component={MyBookingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
