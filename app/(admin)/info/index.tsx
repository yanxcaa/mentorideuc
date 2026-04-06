import React, {useState, useEffect} from "react";
import {Alert, View, Text, FlatList, RefreshControl} from "react-native";
import { getUsers, createUser, updateUser, deleteUser } from '@/lib/api/admin';
import Loading from "@/src/components/Loading";
import { useCurrentUser } from "@/lib/hooks";
import SearchFilter from "@/src/components/Search";
import Entypo from "@expo/vector-icons/Entypo";
import {router} from "expo-router";
import UserCard from "@/src/components/UserCardAdmin";

export default function UsersAdmin() {
    const { profile } = useCurrentUser();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [filterUsers, setFilterUsers] = useState<any>([]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const usersData = await getUsers();
            setUsers(usersData);
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadUsers();
    };

    async function handleDeleteSession(eventId: string, profile: string) {
        return;
    }

    const handleCardPress = (item: any) => {
        // @ts-ignore
        router.push(`/(admin)/info/${item.id}`);
    };

    const handleLongPress = (item: any) => {
        Alert.alert(
            "Opciones de Usuario",
            `¿Qué quieres hacer con "${item.name}"?`,
            [
                { text: "Salir", style: "cancel" },
                {
                    text: "Cuenta",
                    onPress: () => {
                        handleCardPress(item)
                    }
                },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: () => Alert.alert("Eliminado", "Eliminado"),
                },
            ]
        );
    }

    useEffect(() => {
        loadUsers();
    }, []);

    if (loading && !refreshing) {
        return <Loading />
    }

    return (
        <View className="flex-1 bg-white pt-20 pb-5 px-5">
            <Text className="text-2xl text-center font-semibold text-gray-900 mb-5">Usuarios</Text>
            <SearchFilter
                data={users}
                onFilteredDataChange={setFilterUsers}
                searchFields={['name', 'email']}
                filterConfig={{
                    repositoryStatus: false,
                    sessionStatus: false
                }}
                placeholder="Buscar Usuarios..."
                emptyMessage="No se encontraron usuarios"
            />
            <FlatList
                contentContainerStyle={{
                    flexGrow: 1,
                }}
                data={filterUsers}
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
                    <UserCard
                        item={item}
                        onPress={handleCardPress}
                        onLongPress={handleLongPress}
                        currentUserId={profile?.id}
                        variant="default"
                    />
                )}
                ListEmptyComponent={
                    <View className="flex-1 items-center justify-center py-10 px-6">
                        <Entypo name="emoji-sad" size={38} color="#9CA3AF" />
                        <Text className="mt-3 text-gray-500">No se encontraron usuarios</Text>
                    </View>
                }
            />
            <View style={{paddingBottom: 75}}></View>
        </View>
    )
}