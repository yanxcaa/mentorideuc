import React from 'react';
import { TouchableOpacity, View, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDate, formatDateTime } from '@/src/utils/date';
import { getSessionColor} from "@/src/utils/tagColors";

interface SessionCardProps {
    item: {
        id: string;
        title?: string;
        description?: string;
        status: string;
        start_time?: string;
        end_time?: string;
        student?: { name: string };
        repository?: { id: string };
    };
    onPress?: (item: any) => void;
    onLongPress?: (item: any) => void;
    onDelete?: (sessionId: string, userId: string) => void;
    currentUserId?: string;
    showStudentInfo?: boolean;
    showStatusBadge?: boolean;
    variant?: 'default' | 'compact';
}

const SessionCard: React.FC<SessionCardProps> = ({
                                                     item,
                                                     onPress,
                                                     onLongPress,
                                                     onDelete,
                                                     currentUserId,
                                                     showStudentInfo = true,
                                                     showStatusBadge = true,
                                                     variant = 'default'
                                                 }) => {
    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'booked': return 'Reservada';
            case 'available': return 'Disponible';
            case 'canceled': return 'Cancelada';
            default: return status;
        }
    };

    const handlePress = () => {
        if (onPress) {
            onPress(item);
        } else {
            if (item.status === 'booked' && item.repository?.id) {
                Alert.alert("Navegar", "Ir al repositorio");
            } else {
                Alert.alert(
                    "Información",
                    item.status === 'available'
                        ? "Esta sesión está disponible para ser reservada"
                        : "Esta sesión no tiene repositorio asociado"
                );
            }
        }
    };

    const handleLongPress = () => {
        if (onLongPress) {
            onLongPress(item);
        } else {
            Alert.alert(
                "Opciones de Sesión",
                `¿Qué quieres hacer con "${item.title}"?`,
                [
                    { text: "Salir", style: "cancel" },
                    { text: "Ver Detalles", onPress: () => {
                            if (item.status === 'booked' && item.repository?.id) {
                                Alert.alert("Navegar", "Ir al repositorio");
                            }
                        }},
                    { text: "Cancelar Sesión", style: "destructive", onPress: () =>
                            onDelete && currentUserId && onDelete(item.id, currentUserId)
                    },
                ]
            );
        }
    };

    const getCardStyle = () => {
        const baseStyle = "bg-white p-4 rounded shadow shadow-gray-200 border border-solid border-gray-200 mb-3";

        if (variant === 'compact') {
            return `${baseStyle} p-3`;
        }

        return baseStyle;
    };

    return (
        <TouchableOpacity
            className={getCardStyle()}
            onPress={handlePress}
            onLongPress={handleLongPress}
            delayLongPress={500}
            activeOpacity={0.7}
        >
            <Text className={`font-semibold ${variant === 'compact' ? 'text-xl' : 'text-2xl'}`}>
                {item?.title || "Sesión"}
            </Text>

            {showStudentInfo && item.status === 'booked' && item.student?.name && (
                <View className="flex-row my-3 items-center">
                    <Ionicons name="person-outline" size={17} color="#6B7280" />
                    <Text className="text-gray-600 ml-2">
                        Estudiante: {item.student.name}
                    </Text>
                </View>
            )}

            {item.status === 'available' && (
                <View className="flex-row my-3 items-center bg-blue-50 rounded-lg p-2">
                    <Ionicons name="information-circle-outline" size={17} color="#3B82F6" />
                    <Text className="text-blue-600 ml-2 text-sm">
                        Sesión disponible para reservar
                    </Text>
                </View>
            )}
            {variant !== 'compact' && (
                <Text className="text-gray-500 text-sm mb-3">
                    {item?.description || "No descripción"}
                </Text>
            )}

            <View className="flex flex-row justify-end gap-3 items-center">
                <View className="flex flex-row items-center gap-2">
                    <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                    <Text className="text-gray-600 text-sm">
                        {item?.start_time ? formatDate(item.start_time, true) : "Sin fecha"}
                    </Text>
                </View>
                <View className="flex flex-row items-center gap-2">
                    <Ionicons name="time-outline" size={16} color="#6B7280" />
                    <Text className="text-gray-600 text-sm">
                        {(item?.start_time && item?.end_time)
                            ? formatDateTime(item.start_time, item.end_time)
                            : "Sin horario"
                        }
                    </Text>
                </View>
            </View>

            {showStatusBadge && item?.status && (
                <View className={`flex flex-row items-center justify-end mt-3`}>
                    <View className={`rounded-md px-2 py-1 ${getSessionColor(item.status)}`}>
                        <Text className="text-white text-xs">
                            {getStatusLabel(item.status)}
                        </Text>
                    </View>
                </View>
            )}
        </TouchableOpacity>
    );
};

export default SessionCard;