import React, { useState, useEffect } from 'react';
import {View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Loading from '@/src/components/Loading';
import { getCareerStudents, getCareerDetails } from '@/lib/api/admin';

interface Student {
    id: string;
    name: string;
    email: string;
    current_semester: number;
    enroll_date: string;
    enroll_number: string;
}

const CareerDetails = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [career, setCareer] = useState<any>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'students'>('overview');
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = () => {
        setRefreshing(true);
        loadCareerData();
    };

    const loadCareerData = async () => {
        try {
            setLoading(true);
            const careerData = await getCareerDetails(id as string);
            const studentsData = await getCareerStudents(id as string);

            setCareer(careerData);
            setStudents(studentsData || []);
        } catch (error) {
            console.error('Error loading career details:', error);
            Alert.alert('Error', 'No se pudieron cargar los detalles de la carrera');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (id) {
            loadCareerData();
        }
    }, [id]);

    if (loading && !refreshing) {
        return <Loading />;
    }

    if (!career) {
        return (
            <View className="flex-1 bg-white pt-20 items-center justify-center">
                <Text className="text-lg text-gray-600">Carrera no encontrada</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white pt-20">
            <View className="px-5 pb-4 ">
                <View className="flex w-full flex-row justify-between items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="chevron-back" size={28} color="#333" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-xl text-center font-bold text-gray-800">{career.name}</Text>
                        <Text className="text-gray-600 text-center ">{career.code}</Text>
                    </View>
                    <View style={{width: 24}}></View>
                </View>
            </View>

            <View className="flex-row border-b border-gray-200">
                <TouchableOpacity
                    className={`flex-1 py-3 items-center ${activeTab === 'overview' ? 'border-b-2 border-purple-500' : ''}`}
                    onPress={() => setActiveTab('overview')}
                >
                    <Text className={`font-medium ${activeTab === 'overview' ? 'text-purple-500' : 'text-gray-600'}`}>
                        Resumen
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className={`flex-1 py-3 items-center ${activeTab === 'students' ? 'border-b-2 border-purple-500' : ''}`}
                    onPress={() => setActiveTab('students')}
                >
                    <Text className={`font-medium ${activeTab === 'students' ? 'text-purple-500' : 'text-gray-600'}`}>
                        Estudiantes ({students.length})
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1 px-5"
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#10B981']}
                        tintColor={'#10B981'}
                    />
                }
            >
                {activeTab === 'overview' ? (
                    <View className="py-6">
                        <View className="bg-gray-50 rounded-xl p-4 mb-6">
                            <Text className="text-lg font-semibold text-gray-800 mb-3">
                                Información General
                            </Text>
                            <View className="flex flex-col gap-3">
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-600">Facultad:</Text>
                                    <Text className="font-medium">{career.faculty}</Text>
                                </View>
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-600">Duración:</Text>
                                    <Text className="font-medium">{career.duration_semesters} semestres</Text>
                                </View>
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-600">Estado:</Text>
                                    <View className={`px-2 py-1 rounded-full ${career.is_active ? 'bg-green-100' : 'bg-red-100'}`}>
                                        <Text className={`text-xs font-medium ${career.is_active ? 'text-green-800' : 'text-red-800'}`}>
                                            {career.is_active ? 'Activa' : 'Inactiva'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View className="bg-white border border-gray-200 rounded-xl p-4">
                            <Text className="text-lg font-semibold text-gray-800 mb-3">
                                Estadísticas
                            </Text>
                            <View className="flex-row justify-around">
                                <View className="items-center">
                                    <Text className="text-2xl font-bold text-blue-600">{students.length}</Text>
                                    <Text className="text-sm text-gray-600">Estudiantes</Text>
                                </View>
                                <View className="items-center">
                                    <Text className="text-2xl font-bold text-green-600">
                                        {students.filter(s => s.current_semester >= career.duration_semesters).length}
                                    </Text>
                                    <Text className="text-sm text-gray-600">Graduados</Text>
                                </View>
                                <View className="items-center">
                                    <Text className="text-2xl font-bold text-orange-600">
                                        {Math.round(students.reduce((acc, s) => acc + s.current_semester, 0) / (students.length || 1))}
                                    </Text>
                                    <Text className="text-sm text-gray-600">Promedio sem.</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                ) : (
                    <View className="py-6">
                        <Text className="text-lg font-semibold text-gray-800 mb-4">
                            Estudiantes Inscritos
                        </Text>

                        {students.length === 0 ? (
                            <View className="justify-center pt-20 items-center">
                                <Ionicons name="people-outline" size={48} color="#9CA3AF" />
                                <Text className="text-gray-500 mt-2">No hay estudiantes inscritos</Text>
                            </View>
                        ) : (
                            students.map((student) => (
                                <TouchableOpacity
                                    key={student.id}
                                    className="bg-white border border-gray-200 rounded-xl p-4 mb-3"
                                    disabled={true}
                                >
                                    <View className="flex-row justify-between items-center">
                                        <View className="flex-1">
                                            <Text className="font-semibold text-gray-800">{student.name}</Text>
                                            <Text className="text-sm text-gray-600">{student.email}</Text>
                                        </View>
                                        <View className="items-end">
                                            <Text className="text-sm font-medium text-gray-700">
                                                Semestre {student.current_semester}
                                            </Text>
                                            <Text className="text-xs text-gray-500">
                                                {student.enroll_number}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default CareerDetails;