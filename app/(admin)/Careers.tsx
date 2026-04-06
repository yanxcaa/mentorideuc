import React, { useState, useEffect } from 'react';
import {View, Text, FlatList, RefreshControl, Alert} from 'react-native';
import Loading from "@/src/components/Loading";
import {getCareers, deleteCareer, softDeleteCareer} from "@/lib/api/admin";
import CareersCard from "@/src/components/CareersCard";
import SearchFilter from "@/src/components/Search";
import Entypo from "@expo/vector-icons/Entypo";
import {router} from "expo-router";
import EditCareerModal from '@/src/components/EditCareer';
import { CareerProps } from "@/src/types/auth";

const Careers = () => {
    const [careers, setCareers] = useState<CareerProps[]>([]);
    const [loading, setLoading] = useState(true);
    const [filteredCareers, setFilteredCareers] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false); // Add this state
    const [selectedCareer, setSelectedCareer] = useState<CareerProps | null>(null); // Add this state

    const onRefresh = () => {
        setRefreshing(true);
        loadCareers();
    };

    const loadCareers = async () => {
        try {
            const response = await getCareers();
            setCareers(response || []);
        } catch (error: any) {
            console.log(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    const handleLongPress = async (career: CareerProps) => {
        Alert.alert(
            "Opciones",
            `¿Qué quieres hacer con la carrera "${career.name}"?`,
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Ver Detalles", onPress: () => handleRedirect(career.id)},
                {
                    text: "Editar",
                    style: "destructive",
                    onPress: () => {
                        setSelectedCareer(career);
                        setEditModalVisible(true);
                    }
                }]
        );
    }

    const handleRedirect = (careerId: string) => {
        // @ts-ignore
        router.push(`/career-details/${careerId}`);
    }

    const handleCareerUpdated = () => {
        loadCareers();
    }

    useEffect(() => {
        loadCareers();
    }, []);

    if (loading && !refreshing) {
        return <Loading />;
    }

    return (
        <View className="flex-1 bg-white pt-20 px-5">
            <Text className="text-2xl text-center font-semibold text-gray-900 mb-5">Carreras</Text>
            <SearchFilter
                data={careers}
                onFilteredDataChange={setFilteredCareers}
                searchFields={["name", "faculty", "code"]}
                filterConfig={{
                    repositoryStatus: false,
                    sessionStatus: false
                }}
                placeholder="Buscar carreras..."
                emptyMessage="No se encontraron sesiones"
            />
            <FlatList
                data={filteredCareers}
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
                    <CareersCard
                        data={item}
                        onPress={(career) => handleRedirect(career.id)}
                        onLongPress={(career) => handleLongPress(career)}
                    />
                )}
                ListEmptyComponent={
                    <View className="flex-1 items-center justify-center py-10 px-6">
                        <Entypo name="emoji-sad" size={38} color="#9CA3AF" />
                        <Text className="mt-3 text-gray-500">No se encontraron carreras</Text>
                    </View>
                }
            />
            <EditCareerModal
                visible={editModalVisible}
                career={selectedCareer}
                onClose={() => {
                    setEditModalVisible(false);
                    setSelectedCareer(null);
                }}
                onCareerUpdated={handleCareerUpdated}
            />
            <View style={{paddingBottom: 75}}></View>
        </View>
    )
};

export default Careers;