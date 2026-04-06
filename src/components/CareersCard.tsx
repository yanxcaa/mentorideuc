import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface CareerProps {
    id: string;
    name: string;
    code: string;
    faculty: string;
    duration_semesters: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface CareersCardProps {
    data: CareerProps;
    onPress?: (career: CareerProps) => void;
    onLongPress?: (career: CareerProps) => void;
}

const CareersCard: React.FC<CareersCardProps> = ({ data, onPress, onLongPress }) => {
    const router = useRouter();

    const handlePress = () => {
        if (onPress) {
            onPress(data);
        } else {
            // @ts-ignore
            router.push(`/career-details/${data.id}`);
        }
    };

    const handleOnLongPress = () => {
        if (onLongPress) {
            onLongPress(data);
        } else {
            Alert.alert(
                "Opciones",
                `¿Qué quieres hacer con la carrera "${data.name}"?`,
                [
                    { text: "Salir", style: "cancel" },
                    { text: "Ver Detalles", onPress: () => Alert.alert("Detalles", "Carrera detalles")},
                    { text: "Editar", style: "destructive", onPress: () => Alert.alert("Editar", "Editar Carrera")}
                ]
            );
        }
    }

    return (
        <TouchableOpacity
            onPress={handlePress}
            onLongPress={handleOnLongPress}
            delayLongPress={500}
            className="bg-white p-4 rounded-lg shadow-sm shadow-gray-50 border border-gray-200 mb-3"
        >
            <View className="flex-row justify-between  items-start mb-2">
                <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-800 mb-1">
                        {data.name}
                    </Text>
                    <Text className="text-sm text-gray-600 mb-2">
                        Código: {data.code}
                    </Text>
                </View>
                <View className={`px-2 py-1 rounded-full ${data.is_active ? 'bg-green-500' : 'bg-red-500'}`}>
                    <Text className="text-xs text-white font-medium">
                        {data.is_active ? 'Activa' : 'Inactiva'}
                    </Text>
                </View>
            </View>

            <View className="flex-row items-center mb-2">
                <Ionicons name="business-outline" size={16} color="#6B7280" />
                <Text className="text-sm text-gray-600 ml-2">
                    {data.faculty}
                </Text>
            </View>

            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                    <Text className="text-sm text-gray-600 ml-2">
                        {data.duration_semesters} semestres
                    </Text>
                </View>

                <View className="flex-row items-center">
                    <Ionicons name="people-outline" size={16} color="#6B7280" />
                    <Text className="text-sm text-gray-600 ml-1">
                        Ver estudiantes
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default CareersCard;