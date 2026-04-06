import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, Alert, ScrollView, RefreshControl} from 'react-native';
import {supabase} from "@/lib/supabase";
import {useCurrentUser} from "@/lib/hooks";
import Loading from "@/src/components/Loading";
import {DashboardHeader} from "@/src/components/Header";
import { getTutorStats} from '@/lib/api/caledar';
import SessionCard from "@/src/components/SessionCard";
import Entypo from "@expo/vector-icons/Entypo";
import {InfoCard} from "@/src/components/InfoCards";
import {EventStatus, UserStats} from "@/src/types/auth";
import {formatDate, formatDateTime} from "@/src/utils/date";
import {Ionicons} from "@expo/vector-icons";
import {respondToBooking} from "@/lib/api/caledar";

interface InfoCard {
    title: string;
    value: string | number;
    subtitle: string;
    icon: string;
}

export default function TutorDashboard() {
    const { profile } = useCurrentUser();
    const [pendingSessions, setPendingSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [repositories, setRepositories] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = () => {
        setRefreshing(true);
        loadRepositories();
        getPendingSession()
    };

    useEffect(() => {
        if (profile?.id) {
            getPendingSession();
            loadRepositories();
        }
    }, [profile?.id]);

    async function loadRepositories() {
        try {
            setLoading(true);

            const tutorStats = await getTutorStats(profile?.id as string);
            const { data: events, error: eventsError } = await supabase
                .from("calendar_events")
                .select(`
                    id,
                    title,
                    description,
                    status,  
                    start_time,
                    end_time,
                    student:profiles!calendar_events_student_id_fkey(name)
                `)
                .eq("tutor_id", profile?.id as string)
                .eq("status", EventStatus.BOOKED)
                .order("created_at", { ascending: false });

            if (eventsError) throw eventsError;

            const eventIds = events.map(event => event.id);
            const { data: repositories, error: reposError } = await supabase
                .from("repository")
                .select("id, status, booking_id")
                .in("booking_id", eventIds);

            if (reposError) throw reposError;

            const eventsWithRepos = events.map(event => ({
                ...event,
                repository: repositories?.find(repo => repo.booking_id === event.id) || []
            }));

            setRepositories(eventsWithRepos || []);
            setStats(tutorStats);
            console.warn(stats)
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    const getPendingSession = async () => {
        try {
            const { data, error } = await supabase
                .from("calendar_events")
                .select("*")
                .eq("tutor_id", profile?.id)
                .eq("status", EventStatus.PENDING)
                .order("created_at", {ascending: false});

            if (error) throw error;
            setPendingSessions(data || []);
        } catch (error: any) {
            console.log(error);
        } finally {
            setLoading(false);
            setRefreshing(false)
        }
    }

    const handlePending = async (eventId: string, accept: boolean) => {
        try {
            if (!profile?.id) {
                Alert.alert("Error", "User profile not found");
                return;
            }

            setLoading(true);

            const response = await respondToBooking(eventId, accept);

            if (accept) {
                Alert.alert("Exito", "Haz reservado con exito la sesion");
            } else {
                Alert.alert("Exito", "Haz eliminado la sesion");
            }

            getPendingSession();
        } catch (error: any) {

        } finally {
            setLoading(false);
        }
    }


    const handleOnPress = (item: any) => {
        Alert.alert("Informacion", `Ve a la seccion 'Agenda' para ver la informacion '${item.title}'`)
    }

    const handleOnLongPress = () => {
        Alert.alert("Informacion", "Ve a la seccion 'Agenda' para ver todas las opciones")
    }

    if (loading && !refreshing) {
        return <Loading />
    }


    const tutorCards = stats ? [
        {
            title: "Tutorías Programadas",
            value: stats.scheduledSessions || 0,
            subtitle: "Reservadas",
            icon: "calendar" as const
        },
        {
            title: "Estudiantes Activos",
            value: stats.activeStudents || 0,
            subtitle: "",
            icon: "book" as const
        },
        {
            title: "Horas de tutoría",
            value: stats.weeklyHours || 0,
            subtitle: "+1 hora esta semana",
            icon: "clock" as const
        }
    ] : [];


    return (
        <View className="flex-1 pt-12 bg-white">
            <DashboardHeader
                name={profile?.name as string}
                role={profile?.role as string}
            />
            <ScrollView
                className="p-5"
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#10B981']}
                        tintColor={'#10B981'}
                    />
                }
            >
                <View>
                    {tutorCards.map((card, index) => (
                        <InfoCard
                            key={index}
                            title={card.title}
                            value={card.value}
                            subtitle={card.subtitle}
                            icon={card.icon}
                        />
                    ))}
                </View>
                <View>
                    <Text className="text-2xl mb-6 font-bold text-gray-900">
                        Solicitudes pendientes
                    </Text>
                    {pendingSessions.length > 0 ? (
                        pendingSessions.slice(0,3).map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                className="bg-white p-4 rounded-lg mb-3 border border-gray-200"
                                onPress={() => {}}
                                onLongPress={() => {}}
                                delayLongPress={500}
                            >
                                <Text className="font-semibold text-xl">
                                    {item?.title || "Session"}
                                </Text>
                                <Text className="text-gray-500 text-sm mt-2 mb-5">
                                    {item?.description || "No descripcion"}
                                </Text>
                                <View className="flex flex-row w-full justify-end gap-3 items-center">
                                    <View className="flex flex-row items-center gap-2 ">
                                        <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                                        <Text className="text-gray-600">
                                            {item?.start_time ?
                                                formatDate(item?.start_time) :
                                                "No date"
                                            }
                                        </Text>
                                    </View>
                                    <View className="flex flex-row items-center gap-2 ">
                                        <Ionicons name="time-outline" size={16} color="#6B7280" />
                                        <Text className="text-gray-600">
                                            {(item?.start_time && item?.end_time) ?
                                                formatDateTime(item?.start_time, item?.end_time) :
                                                "No date"
                                            }
                                        </Text>
                                    </View>
                                </View>
                                <View className="flex mt-5 flex-row gap-5">
                                    <TouchableOpacity
                                        className="rounded-xl p-3 grow bg-white border border-solid border-green-500"
                                        onPress={() => handlePending(item.id, false)}
                                    >
                                        <Text className="text-green-600 font-semibold text-center text-base">Cancelar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className="rounded-xl p-3 grow bg-green-600"
                                        onPress={() => handlePending(item.id, true)}
                                    >
                                        <Text className="text-white text-center font-semibold text-base">Reservar</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <>
                            <View className="flex-1 items-center justify-center py-10 px-6">
                                <Entypo name="emoji-sad" size={38} color="#9CA3AF" />
                                <Text className="mt-3 text-gray-500">No tienes sesiones pendientes</Text>
                            </View>
                        </>
                    )}
                </View>
                <View>
                    <Text className="text-2xl mb-6 font-bold text-gray-900">
                        Mi agenda
                    </Text>
                    {repositories.length > 0 ? (
                        repositories.slice(0,3).map((item) => (
                            <SessionCard
                                key={item.id}
                                item={item}
                                onPress={handleOnPress}
                                onLongPress={handleOnLongPress}
                                currentUserId={profile?.id}
                                showStudentInfo={true}
                                variant="default"
                            />
                        ))
                    ) : (
                        <View className="flex-1 items-center justify-center py-10 px-6">
                            <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
                            <Text className="text-gray-500 max-w-60 mt-2 text-center">
                                {repositories.length === 0
                                    ? "No hay sesiones programadas"
                                    : "No se encontraron sesiones con los filtros aplicados"
                                }
                            </Text>
                        </View>
                    )}
                </View>
                <View style={{paddingBottom: 85}}></View>
            </ScrollView>
        </View>
    );
}