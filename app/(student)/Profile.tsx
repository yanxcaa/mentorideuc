import React, {useEffect, useState} from 'react';
import {View, Text, Alert} from 'react-native';
import ProfileCard from "@/src/components/ProfileCard";
import {useCurrentUser} from "@/lib/hooks";
import useAuth from "@/src/components/Auth";
import {cleanUserCache, cleanUserHistory, updateUser} from "@/lib/api/admin";
import Loading from "@/src/components/Loading";
import EditProfile from "@/src/components/EditProfile";

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const { profile } = useCurrentUser();
    const { signOut } = useAuth();
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (profile !== undefined) {
            setLoading(false);
        }
    }, [profile]);

    const handleSignOut = async () => {
        try {
            signOut()
        } catch (error: any){
            console.error(error);
        }
    }

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

    if (loading || !profile) {
        return <Loading />;
    }

    if (isEditing) {
        return (
            <EditProfile
                user={profile}
                onSave={handleSaveUser}
                onCancel={handleCancelEdit}
            />
        );
    }

    return (
        <ProfileCard
            item={profile}
            onEditProfile={handleOnPress}
            onCleanHistory={handleClearHistory}
            onClearCache={handleClearCache}
            onSignOut={handleSignOut}
            options ={{
                isAdmin: false,
                showArrow: false,
            }}
        />
    )
};

export default Profile;