import React, {useEffect, useState} from "react";
import {Alert, FlatList, Modal, Platform, Text, TouchableOpacity, View} from "react-native";
import {cancelEvent, createEvent} from "@/lib/api/caledar";
import {supabase} from "@/lib/supabase";
import {useCurrentUser} from "@/lib/hooks";
import {EventStatus} from "@/src/types/auth";
import Entypo from "@expo/vector-icons/Entypo";
import {formatDate, formatDateTime} from "@/src/utils/date";
import Loading from "@/src/components/Loading";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from "@expo/vector-icons";

export default function MyCalendarScreen() {
    const [loading, setLoading] = useState(false);
    const [events, setEvents] = useState<any[]>([])
    const { profile, loading: sessionLoading } = useCurrentUser();

    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [pickingStart, setPickingStart] = useState(true);

    useEffect(() => {
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

        setStartDate(now);
        setEndDate(oneHourLater);
    }, []);

    const openDatePicker = (isStart: boolean) => {
        setPickingStart(isStart);
        setShowDatePicker(true);
    };

    const openTimePicker = (isStart: boolean) => {
        setPickingStart(isStart);
        setShowTimePicker(true);
    };

    const handleDateChange = (event:any, selectedDate:any) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const updatedDate = new Date(selectedDate);
            updatedDate.setHours(startDate.getHours());
            updatedDate.setMinutes(startDate.getMinutes());
            setStartDate(updatedDate);
            setEndDate(new Date(updatedDate.getTime() + 60 * 60 * 1000));
        }
    };

    const handleTimeChange = (event: any, selectedTime?: Date) => {
        setShowTimePicker(false);
        if (selectedTime) {
            const currentDate = pickingStart ? startDate : endDate;
            const updatedDate = new Date(currentDate);
            updatedDate.setHours(selectedTime.getHours());
            updatedDate.setMinutes(selectedTime.getMinutes());

            if (pickingStart) {
                setStartDate(updatedDate);
                // Auto-adjust end time if it becomes invalid
                if (endDate < updatedDate) {
                    const newEndDate = new Date(updatedDate.getTime() + 60 * 60 * 1000);
                    setEndDate(newEndDate);
                }
            } else {
                setEndDate(updatedDate);
            }
        }
    };

    const formatDisplayDate = (date: Date) => {
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatDisplayTime = (date: Date) => {
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    async function loadEvents() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("calendar_events")
                .select("*")
                .eq("tutor_id", profile?.id)
                .eq("status", EventStatus.AVAILABLE)
                .order("start_time");

            if (error) throw error;
            setEvents(data || []);
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (profile?.id && profile.role === "tutor") {
            loadEvents();
        }
    }, [profile?.id])

    async function addEvent() {
        try {
            if (!profile?.id) {
                Alert.alert("Error", "Profile not loaded");
                return;
            }

            if (startDate >= endDate) {
                Alert.alert("Error", "La hora de fin debe ser después de la hora de inicio");
                return;
            }

            setLoading(true);
            await createEvent(profile.id, startDate.toISOString(), endDate.toISOString());
            Alert.alert("Éxito", "Evento creado correctamente");
            loadEvents();
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleCancel(eventId: string, profileId: string) {
        try {
            if (!profile?.id) {
                Alert.alert("Error", "Profile not loaded");
                return;
            }

            Alert.alert(
                "Eliminar",
                `¿Seguro que quieres cancelar esta sesión?`,
                [
                    { text: "Salir", style: "cancel" },
                    { text: "Cancelar Sesión", style: "destructive", onPress: async () => {
                            setLoading(true);
                            await cancelEvent(eventId, profileId);
                            loadEvents();
                        }},
                ]
            );
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    }

    if (loading || sessionLoading) {
        return <Loading />;
    }

    return (
        <View className="flex-1 bg-white pt-20 px-5">
            {profile?.role === "tutor" && (
                <View className="mb-6">
                    <Text className="text-2xl font-bold text-center text-gray-900 mb-6">Agregar Nueva Sesión</Text>

                    <View className="mb-6">
                        <Text className="text-lg font-semibold text-gray-800 mb-3">Selecciona el dia</Text>

                        <View className="flex-row">
                            <TouchableOpacity
                                className="flex-1 border-2 border-gray-300 rounded-xl p-4 bg-white flex-row items-center justify-between"
                                onPress={() => openDatePicker(true)}
                            >
                                <View className="flex-row items-center">
                                    <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                                    <Text className="text-gray-700 text-base ml-2">
                                        {formatDisplayDate(startDate)}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-down" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="mb-6">
                        <View className="flex-row gap-3">
                            <View className="flex-1">
                                <Text className="text-lg font-semibold text-gray-800 mb-3">Hora de inicio</Text>
                                <TouchableOpacity
                                    className="border-2 border-gray-300 rounded-xl p-4 bg-white flex-row items-center justify-between"
                                    onPress={() => openTimePicker(true)}
                                >
                                    <View className="flex-row items-center">
                                        <Ionicons name="time-outline" size={20} color="#6B7280" />
                                        <Text className="text-gray-700 text-base ml-2">
                                            {formatDisplayTime(startDate)}
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-down" size={20} color="#6B7280" />
                                </TouchableOpacity>
                            </View>
                            <View className="flex-1">
                                <Text className="text-lg font-semibold text-gray-800 mb-3">Hora de fin</Text>
                                <TouchableOpacity
                                    className="border-2 border-gray-300 rounded-xl p-4 bg-white flex-row items-center justify-between"
                                    onPress={() => openTimePicker(false)}
                                >
                                    <View className="flex-row items-center">
                                        <Ionicons name="time-outline" size={20} color="#6B7280" />
                                        <Text className="text-gray-700 text-base ml-2">
                                            {formatDisplayTime(endDate)}
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-down" size={20} color="#6B7280" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <Modal
                        visible={showDatePicker}
                        transparent={true}
                        animationType="fade"
                    >
                        <View className="flex-1 justify-center items-center bg-black/50">
                            <View className="bg-gray-950 rounded-2xl p-6 mx-4 w-11/12">
                                <Text className="text-xl font-bold text-white mb-4 text-center">
                                    Seleccionar Fecha
                                </Text>
                                <View className="flex-grow items-center justify-center py-2">
                                    <DateTimePicker
                                        value={pickingStart ? startDate : endDate}
                                        mode="date"
                                        display={Platform.OS === "ios" ? "inline" : "calendar"}
                                        minimumDate={new Date()}
                                        onChange={handleDateChange}
                                        style={{
                                            backgroundColor: '#030712',
                                            borderRadius: 8,
                                        }}
                                    />
                                </View>
                                <TouchableOpacity
                                    className="bg-white rounded-xl p-4 mt-4"
                                    onPress={() => setShowDatePicker(false)}
                                >
                                    <Text className="text-gray-950 text-center font-bold text-lg">
                                        Cerrar
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>

                    <Modal
                        visible={showTimePicker}
                        transparent={true}
                        animationType="fade"
                    >
                        <View className="flex-1 justify-center items-center bg-black/50">
                            <View className="bg-gray-950 rounded-2xl mx-4 w-11/12">
                                <Text className="text-xl font-bold p-6 text-white text-center">
                                    Seleccionar Hora
                                </Text>
                                <View className="flex-grow items-center justify-center py-2">
                                    <DateTimePicker
                                        value={pickingStart ? startDate : endDate}
                                        mode="time"
                                        display="spinner"
                                        onChange={handleTimeChange}
                                        style={{
                                            backgroundColor: '#030712',
                                            borderRadius: 8,
                                        }}
                                    />
                                </View>
                                <View className="p-6">
                                    <TouchableOpacity
                                        className="bg-white rounded-xl p-4"
                                        onPress={() => setShowTimePicker(false)}
                                    >
                                        <Text className="text-gray-950 text-center font-bold text-lg">
                                            Cerrar
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    <TouchableOpacity
                        className="bg-blue-600 rounded-xl p-4"
                        onPress={addEvent}
                        disabled={loading}
                    >
                        <Text className="text-white text-center font-bold text-lg">
                            {loading ? "Creando..." : "Agregar"}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            <View className="flex-1">
                <Text className="text-xl font-bold text-gray-900 mb-4">Mis Horarios Disponibles</Text>
                <FlatList
                    data={events}
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingBottom: 20,
                    }}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View className="bg-white p-4 rounded-xl mb-3 border border-gray-200 shadow-sm">
                            <View className="flex-row justify-between items-start">
                                <View className="flex-1">
                                    <View className="flex-row items-center mb-2">
                                        <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                                        <Text className="text-gray-800 font-semibold text-lg ml-2">
                                            {item?.start_time ? formatDate(item?.start_time, true) : ""}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Ionicons name="time-outline" size={16} color="#6B7280" />
                                        <Text className="text-gray-600 text-base ml-2">
                                            {(item?.start_time && item?.end_time) ?
                                                formatDateTime(item?.start_time, item?.end_time) : "Sin horario"
                                            }
                                        </Text>
                                    </View>
                                </View>

                                <View className="items-end">
                                    <View className="py-1 rounded-full mb-2">
                                        <Text className="text-blue-700 font-semibold text-xs">
                                            {item?.status === EventStatus.AVAILABLE ? "Disponible" : "Ocupado"}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        className="bg-red-500 rounded-lg px-4 py-2 flex-row items-center"
                                        onPress={() => handleCancel(item.id, profile?.id as string)}
                                    >
                                        <Text className="font-semibold text-white text-sm ml-1">Cancelar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center py-10 px-6">
                            <Entypo name="calendar" size={48} color="#9CA3AF" />
                            <Text className="mt-4 text-gray-500 text-lg text-center">
                                No tienes horarios disponibles
                            </Text>
                            <Text className="text-gray-400 text-center mt-2">
                                Agrega horarios para que los estudiantes puedan reservar
                            </Text>
                        </View>
                    }
                    showsVerticalScrollIndicator={false}
                />
            </View>
            <View style={{paddingBottom: 75}}></View>
        </View>
    )
}