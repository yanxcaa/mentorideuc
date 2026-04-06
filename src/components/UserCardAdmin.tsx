import React from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { getUserTagColor } from "@/src/utils/tagColors";
import { Role } from "@/src/types/auth";
import {formatDate} from "@/src/utils/date";

interface UserCardProps {
    item: {
        id: string;
        name?: string;
        email?: string;
        avatar_url?: string;
        created_at?: string;
        role?: string;
        updated_at?: string;
    };
    onPress?: (item: any) => void;
    onLongPress?: (item: any) => void;
    onDelete?: (sessionId: string, userId: string) => void;
    currentUserId?: string;
    showStudentInfo?: boolean;
    showStatusBadge?: boolean;
    variant?: 'default' | 'compact';
}

const UserCard: React.FC<UserCardProps> = ({
                                               item,
                                               onPress,
                                               onLongPress,
                                               onDelete,
                                               currentUserId,
                                               showStudentInfo,
                                               showStatusBadge,
                                               variant = 'default',
                                           }) => {
    const userLabel = [
        { value: Role.ALL, label: "Todos" },
        { value: Role.STUDENT, label: "Estudiante" },
        { value: Role.TUTOR, label: "Tutor" },
        { value: Role.ADMIN, label: "Administrador" },
    ];

    const handlePress = () => {
        if (onPress) {
            onPress(item);
        } else {
            Alert.alert("Navegar", "Ir al repositorio");
        }
    };

    const handleLongPress = () => {
        if (onLongPress) {
            onLongPress(item);
        } else {
            Alert.alert(
                "Opciones de Sesión",
                `¿Qué quieres hacer con "${item.name}"?`,
                [
                    { text: "Salir", style: "cancel" },
                    {
                        text: "Cuenta",
                        onPress: () => {
                            Alert.alert("Navegar", "Ir al repositorio");
                        }
                    },
                    {
                        text: "Eliminar",
                        style: "destructive",
                        onPress: () => onDelete && currentUserId && onDelete(item.id, currentUserId)
                    },
                ]
            );
        }
    };

    const getCardStyle = () => {
        const baseStyle = "bg-white p-4 rounded-lg border border-gray-200 mb-3";

        if (variant === 'compact') {
            return `${baseStyle} p-3`;
        }

        return baseStyle;
    };

    const getUserRoleLabel = () => {
        const foundRole = userLabel.find(option => option.value === item.role);
        return foundRole?.label || "Sin rol";
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            onLongPress={handleLongPress}
            className={getCardStyle()}
            delayLongPress={500}
            activeOpacity={0.7}
        >
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-800 mb-1">
                        {item.name || "Sin nombre"}
                    </Text>
                    <Text className="text-sm text-gray-600 mb-2">
                        {item.email || "Sin email"}
                    </Text>
                </View>
                <View>
                    <Text className={`text-xs font-semibold px-2 py-1 rounded-lg ${getUserTagColor(item.role as string)}`}>
                        {getUserRoleLabel()}
                    </Text>
                </View>
            </View>

            <View>
                <View className="mb-2">
                    <Text className="text-base font-semibold text-gray-700">
                        Carrera
                    </Text>
                    <Text className="text-sm text-gray-600">
                        Ingeniería
                    </Text>
                </View>
                <View>
                    <Text className="text-base font-semibold text-gray-700">
                        Fecha de ingreso
                    </Text>
                    <Text className="text-sm text-gray-600">
                        {formatDate(item?.created_at as string)}
                    </Text>
                </View>
                {showStudentInfo && (
                    <View>
                        <Text className="text-sm font-semibold text-gray-700 mb-1">
                            Información adicional
                        </Text>
                        <Text className="text-sm text-gray-600">
                            Información del estudiante...
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

export default UserCard;