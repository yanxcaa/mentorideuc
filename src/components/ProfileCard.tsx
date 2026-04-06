import React, { useState, useEffect } from 'react';
import {Ionicons} from "@expo/vector-icons";
import {View, Text, Alert, TouchableOpacity, FlatList, ScrollView, Image} from 'react-native';
import useAuth from "@/src/components/Auth";
import {router} from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import AddUserForm from '@/src/components/AddUserForm';
import AddCareerForm from '@/src/components/AddCareerForm';


interface ProfileCardProps {
    item: {
        id: string;
        name?: string;
        email?: string;
        avatar_url?: string;
        created_at?: string;
        role?: string;
        updated_at?: string;
    };
    onEditProfile?: (item: any) => void;
    onCleanHistory?: (item: any) => void;
    onClearCache?: (item: any) => void;
    onSignOut?: () => void;
    currentUserId?: string;
    options: {
        isAdmin?: boolean,
        showArrow?: boolean;
    }
}

const ProfileCard: React.FC<ProfileCardProps> = ({
                                                    item,
                                                    onEditProfile,
                                                    onCleanHistory,
                                                    onClearCache,
                                                    onSignOut,
                                                    options = {}
                                                 }) => {
    const [showUserForm, setShowUserForm] = useState(false);
    const [showCareerForm, setShowCareerForm] = useState(false);
    const { signOut } = useAuth();

    const handleEditProfile = () => {
        if (onEditProfile) onEditProfile(item);
        else {
            Alert.alert("Edit", "Edit the profile")
        }
    }

    const handleCleanHistory = () => {
        if (onCleanHistory) onCleanHistory(item);
        else {
            Alert.alert("Clean History", "Your trying to delete the user's history")
        }
    }

    const handleSessions = () => {
        // @ts-ignore
        router.push(`/(${item?.role})/sessions`);
    }

    const handleClearCache = () => {
        if (onClearCache) onClearCache(item);
        else {
            Alert.alert("Clear Cache", "Your trying to delete the user's cache")
        }
    }

    const getColorEdit = (data: string) => {
        switch (data){
            case 'admin':
                return "bg-purple-500";
            case 'student':
                return "bg-blue-500";
            case 'tutor':
                return "bg-green-600";
            default:
                return "bg-gray-500";
        }
    }

    const handleSignOut = async () => {
        if (onSignOut) onSignOut();
        else {
            try {
                await signOut();
                // @ts-ignore
                router.replace('/Login');
            } catch (error) {
                console.error('Error signing out:', error);
            }
        }
    };

    return (
        <View className="flex-1 gap-10 bg-white pt-20 pb-5 px-5">
            <View className="flex justify-between flex-row items-center">
                {options.showArrow === true && (
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back-outline" color="#333333" size={24}/>
                    </TouchableOpacity>
                )
                }
                <Text className="font-bold text-xl text-gray-800">
                    Mi perfil
                </Text>
                <TouchableOpacity onPress={handleEditProfile}>
                    <Ionicons name="settings-outline" color="#333333" size={24} />
                </TouchableOpacity>
            </View>
            <View className="flex flex-row items-center gap-5">
                <View className="w-36 h-36 bg-gray-400 rounded-full">
                    <Image
                        source={
                            item?.avatar_url
                                ? { uri: item.avatar_url }
                                : require("@/assets/images/user.png")
                        }
                        className="w-36 h-36 rounded-full"
                    />
                </View>
                <View className="flex flex-col items-start gap-5">
                    <View>
                        <Text className="text-xl font-semibold text-gray-800">{item.name}</Text>
                        <Text
                            className="text-md font-semibold text-gray-800"
                            numberOfLines={2}
                            ellipsizeMode="tail"
                            style={{ flexShrink: 1, flexWrap: 'wrap', maxWidth: 180 }}
                        >
                            {item.email}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleEditProfile}
                        className={`${getColorEdit(item.role as string)} rounded-xl px-7 py-3`}
                    >
                        <Text className="text-white font-semibold">Editar Perfil</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <ScrollView>
                <View className="flex flex-col gap-5">
                    {options.isAdmin === true && (
                        <>
                            <TouchableOpacity
                                className="flex gap-3 justify-between flex-row"
                                onPress={() => setShowUserForm(true)}
                            >
                                <View className="flex flex-row gap-5 items-center">
                                    <Feather name="user" color="#111827" size={24} />
                                    <Text className="font-medium text-gray-700 text-xl">
                                        Agregar Usuario
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward-outline" color="#111827" size={24} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex gap-3 justify-between flex-row"
                                onPress={() => setShowCareerForm(true)}
                            >
                                <View className="flex flex-row gap-5 items-center">
                                    <Feather name="book" color="#111827" size={24} />
                                    <Text className="font-medium text-gray-700 text-xl">
                                        Agregar Carrera
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward-outline" color="#111827" size={24} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex gap-3 justify-between flex-row"
                                onPress={handleSignOut}
                            >
                                <View className="flex flex-row gap-5 items-center">
                                    <Feather name="log-out" color="#ef4444" size={24} />
                                    <Text className="font-medium text-red-500 text-xl">
                                        Salir
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward-outline" color="#ef4444" size={24} />
                            </TouchableOpacity>
                        </>
                    ) || (
                        <>
                            <TouchableOpacity
                                className="flex gap-3 justify-between flex-row"
                                onPress={() => handleSessions()}
                            >
                                <View className="flex flex-row gap-5 items-center">
                                    <Feather name="book-open" color="#111827" size={24} />
                                    <Text className="font-medium text-gray-700 text-xl">
                                        Sesiones
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward-outline" color="#111827" size={24} />
                            </TouchableOpacity>
                            <View className="border border-solid border-gray-400"></View>
                            <TouchableOpacity
                                className="flex gap-3  justify-between flex-row"
                                onPress={handleClearCache}
                            >
                                <View className="flex flex-row gap-5 items-center">
                                    <Feather name="trash-2" color="#111827" size={24} />
                                    <Text className="font-medium text-gray-700 text-xl">
                                        Limpiar cache
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward-outline" color="#111827" size={24} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex gap-3 justify-between flex-row"
                                onPress={handleCleanHistory}
                            >
                                <View className="flex flex-row gap-5 items-center">
                                    <Feather name="clock" color="#111827" size={24} />
                                    <Text className="font-medium text-gray-700 text-xl">
                                        Limpiar historial
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward-outline" color="#111827" size={24} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex gap-3 justify-between flex-row"
                                onPress={handleSignOut}
                            >
                                <View className="flex flex-row gap-5 items-center">
                                    <Feather name="log-out" color="#ef4444" size={24} />
                                    <Text className="font-medium text-red-500 text-xl">
                                        Salir
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward-outline" color="#ef4444" size={24} />
                            </TouchableOpacity>
                        </>
                    )}

                    <AddUserForm
                        visible={showUserForm}
                        onClose={() => setShowUserForm(false)}
                        onUserCreated={() => {
                            console.log('User created');
                        }}
                    />

                    <AddCareerForm
                        visible={showCareerForm}
                        onClose={() => setShowCareerForm(false)}
                        onCareerCreated={() => {
                            console.log('Career created');
                        }}
                    />
                </View>
            </ScrollView>
        </View>
    );
};

export default ProfileCard;