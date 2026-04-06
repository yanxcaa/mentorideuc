import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {Ionicons} from "@expo/vector-icons";
import Home from "@/app/(admin)/index";
import Profile from "@/app/(admin)/Profile";
import UsersAdmin from "@/app/(admin)/info/index";
import Careers from "@/app/(admin)/Careers";

const Tab = createBottomTabNavigator();

export default function AdminTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: true,
                tabBarActiveTintColor: "#a855f7",
                tabBarInactiveTintColor: "#6b7280",
                tabBarStyle: {
                    backgroundColor: "#FFF",
                    borderRadius: 10,
                    marginHorizontal: 18,
                    marginBottom: 30,
                    paddingTop: 3,
                    height: 60,
                    position: "absolute",
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 5,
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

                    if (route.name === 'Inicio') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Usuarios') {
                        iconName = focused ? 'people' : 'people-outline';
                    } else if (route.name === 'Perfil') {
                        iconName = focused ? 'person' : 'person-outline';
                    } else if (route.name === 'Carreras') {
                        iconName = focused ? 'school' : 'school-outline';
                    }

                    // @ts-ignore
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Inicio" component={Home} />
            <Tab.Screen name="Usuarios" component={UsersAdmin} />
            <Tab.Screen name="Carreras" component={Careers} />
            <Tab.Screen name="Perfil" component={Profile} />
        </Tab.Navigator>
    );
}