import React, { useEffect, useState } from "react";
import {View, Text, FlatList, ActivityIndicator, Alert, TouchableOpacity, RefreshControl} from "react-native";
import { router } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { supabase } from "@/lib/supabase";
import {useCurrentUser} from "@/lib/hooks";
import {formatDateTime} from "@/src/utils/date";
import SearchFilter from "@/src/components/Search";
import Entypo from "@expo/vector-icons/Entypo";
import SessionCard from "@/src/components/SessionCard";
import {cancelEvent} from "@/lib/api/caledar";
import Loading from "@/src/components/Loading";

export default function SessionsListScreen() {
    const { profile } = useCurrentUser();
    const [repositories, setRepositories] = useState<any[]>([]);
    const [filteredRepositories, setFilteredRepositories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (profile?.id) {
            loadRepositories();
        }
    }, [profile?.id]);

    const onRefresh = () => {
        setRefreshing(true);
        loadRepositories();
    };

    async function loadRepositories() {
        try {
            setLoading(true);

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
                .eq("student_id", profile?.id as string)
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
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    async function handleDeleteSession(eventId: string, profile: string) {
        try {
            setLoading(true);
            console.log(eventId, profile);
            await cancelEvent(eventId, profile);
            Alert.alert("Sesion eliminada");
            loadRepositories();
        } catch (error: any) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const handleCardPress = (item: any) => {
        if (item.status === 'booked' && item.repository?.id) {
            router.push(`/(student)/sessions/${item.repository.id}`);
        } else {
            Alert.alert("Información", `Esta sesión está ${item.status}`);
        }
    };

    const handleLongPress = (item: any) => {
        Alert.alert(
            "Opciones de Sesión",
            `¿Qué quieres hacer con "${item.title}"?`,
            [
                { text: "Salir", style: "cancel" },
                { text: "Ver Detalles", onPress: () => {
                        if (item.status === 'booked' && item.repository?.id) {
                            handleCardPress(item);
                        }
                }}
            ]
        );
    }

    if (loading && !refreshing) {
        return <Loading />
    }

    return (
        <View className="flex-1 pt-20 pb-5 bg-white px-5">
            <Text className="text-2xl text-center font-semibold text-gray-900 mb-5">Mis Tutorias</Text>
            <SearchFilter
                data={repositories}
                onFilteredDataChange={setFilteredRepositories}
                searchFields={["title", "description", "student.name"]}
                filterConfig={{
                    repositoryStatus: true,
                    sessionStatus: true
                }}
                placeholder="Buscar sesiones..."
                emptyMessage="No se encontraron sesiones"
            />
            <FlatList
                contentContainerStyle={{
                    flexGrow: 1,
                }}
                data={filteredRepositories}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#10B981']}
                        tintColor={'#10B981'}
                    />
                }
                renderItem={({ item }) => (
                    <SessionCard
                        item={item}
                        onPress={handleCardPress}
                        onLongPress={handleLongPress}
                        currentUserId={profile?.id}
                        showStudentInfo={true}
                        variant="default"
                    />
                )}
                ListEmptyComponent={
                    <View className="flex-1 items-center justify-center py-10 px-6">
                        <Entypo name="emoji-sad" size={38} color="#9CA3AF" />
                        <Text className="mt-3 text-gray-500">No se encontraron tutorias</Text>
                    </View>
                }
            />
            <View style={{paddingBottom: 75}}></View>
        </View>
    );
}