import React, { useState, useEffect } from 'react';
import {View, Text, Alert} from 'react-native';
import {useCurrentUser} from "@/lib/hooks";
import Loading from "@/src/components/Loading";
import {getUserById, updateUser} from "@/lib/api/admin";
import {useLocalSearchParams} from "expo-router";
import ProfileCard from "@/src/components/ProfileCard";
import { cleanUserHistory, cleanUserCache } from "@/lib/api/admin";
import EditProfile from "@/src/components/EditProfile";

interface User {
    id: string;
    name?: string;
    email?: string;
    avatar_url?: string;
    created_at?: string;
    role?: string;
    updated_at?: string;
}

const UserInfo = () => {
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User>();
    const [isEditing, setIsEditing] = useState(false);

    const loadUserInfo = async () => {
        try {
            const response = await getUserById(id as string);
            setUser(response);
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', 'No se pudo cargar la información del usuario');
        } finally {
            setLoading(false);
        }
    }

    const handleSaveUser = (item: any, data: any) => {
        if (!data.name.trim() || !data.role.trim()) {
            Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
            return;
        }

        Alert.alert(
            "Informacion",
            `¿Seguro que quieres actualizar a ${item.name}?`,
            [
                { text: "Cancelar", style: "destructive" },
                { text: "Si, Seguro", onPress: async () => {
                        try {
                            setLoading(true);
                            await updateUser(item.id, data);
                            setIsEditing(false);
                            Alert.alert(`Se actualizado exitosamente!`);
                        } catch (error: any) {
                            throw new Error(error.message || 'Error al actualizar el usuario');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    const handleOnPress = (item: any) => {
        setIsEditing(true);
    }

    const handleClearCache = async (item: any) => {
        const confirmationText = "ELIMINAR";

        Alert.prompt(
            "Eliminar",
            `Esta acción NO se puede deshacer.\nPara eliminar TODA la información de:\n"${item.name}"\nEscribe "${confirmationText}" para confirmar:`,
            [
                { text: "Cancelar", style: "default"},
                { text: "Eliminar", style: "destructive",
                    // @ts-ignore
                    onPress: async (inputText: string) => {
                        if (!inputText || inputText.toUpperCase() !== confirmationText) {
                            Alert.alert(
                                "Cancelado",
                                `Debes escribir "${confirmationText}" para confirmar.`
                            );
                            return;
                        }

                        try {
                            setLoading(true);

                            await cleanUserCache(item.id);
                            setIsEditing(false);

                            Alert.alert("Éxito", `Se ha eliminado toda la información de ${item.name} correctamente.`);
                        } catch (error: any) {
                            console.error("Delete error:", error);
                            Alert.alert(
                                "Error",
                                error.message || 'Error al eliminar la información del usuario. Por favor intenta nuevamente.'
                            );
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ],
            'plain-text',
            '',
            {
                placeholder: `Escribe ${confirmationText}`,
                autoCapitalize: 'characters',
                autoCorrect: false
            }
        );
    };

    const handleClearHistory = async (item: any) => {
        Alert.alert(
            "Informacion",
            `¿Seguro que quieres eliminar el historial a ${item.name}?`,
            [
                { text: "Cancelar", style: "default" },
                { text: "Eliminar", style: "destructive", onPress: async () => {
                        try {
                            setLoading(true);
                            await cleanUserHistory(item.id);
                            setIsEditing(false);
                            Alert.alert("Exito", `Se ha eliminado correctamente!`);
                        } catch (error: any) {
                            throw new Error(error.message || 'Error al actualizar el usuario');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    }

    useEffect(() => {
        loadUserInfo();
    }, []);

    if (loading) {
        return <Loading />
    }

    if (!user) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text>Usuario no encontrado</Text>
            </View>
        );
    }

    if (isEditing) {
        return (
            <EditProfile
                user={user}
                onSave={handleSaveUser}
                onCancel={handleCancelEdit}
            />
        );
    }

    return (
        <ProfileCard
            item={user}
            onEditProfile={handleOnPress}
            onCleanHistory={handleClearHistory}
            onClearCache={handleClearCache}
            options ={{
                isAdmin: false,
                showArrow: true,
            }}
        />
    )

};

export default UserInfo;