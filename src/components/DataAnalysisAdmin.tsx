import React, { useState, useEffect } from 'react';
import {View, Text, ScrollView, TouchableOpacity, RefreshControl, Dimensions, Alert} from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import {getDashboardStats, getTopTutors, getPopularCareers, getUsers} from '@/lib/api/admin';
import Loading from "@/src/components/Loading";
import UserCard from "@/src/components/UserCardAdmin";
import {useSafeAreaInsets} from "react-native-safe-area-context";
const screenWidth = Dimensions.get('window').width;

const VisualAdminDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const insets = useSafeAreaInsets();
    const [topTutors, setTopTutors] = useState<any[]>([]);
    const [popularCareers, setPopularCareers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [users, setUsers] = useState<any[]>([]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [statsData, tutorsData, careersData, usersData] = await Promise.all([
                getDashboardStats('all'),
                getTopTutors(),
                getPopularCareers(),
                getUsers()
            ]);

            setStats(statsData);
            setTopTutors(tutorsData);
            setPopularCareers(careersData);
            setUsers(usersData);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadDashboardData();
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    if (loading && !refreshing) {
        return <Loading />
    }

    const userDistributionData = stats ? [
        {
            name: 'Estudiantes',
            population: stats.totalStudents,
            color: '#10B981',
            legendFontColor: '#6B7280',
            legendFontSize: 12,
        },
        {
            name: 'Tutores',
            population: stats.totalTutors,
            color: '#F59E0B',
            legendFontColor: '#6B7280',
            legendFontSize: 12,
        },
        {
            name: 'Admins',
            population: stats.totalAdmins,
            color: '#8B5CF6',
            legendFontColor: '#6B7280',
            legendFontSize: 12,
        },
    ] : [];

    const handleCardPress = () => {
        Alert.alert("Informacion", "Para ver las acciones ve al apartado 'usuarios'")
    }

    const handleLongPress = () => {
        Alert.alert("Informacion", "Para ver las acciones ve al apartado 'usuarios'")
    }

    const sessionActivityData = stats ? {
        labels: ['Completadas', 'Próximas'],
        datasets: [
            {
                data: [stats.completedSessions, stats.upcomingSessions],
            },
        ],
    } : { labels: [], datasets: [] };

    return (
        <ScrollView
            className="flex-1 bg-white pt-5"
            contentContainerStyle={{
                paddingBottom: insets.bottom + 55
            }}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#9333ea']}
                    tintColor={'#9333ea'}
                />
            }
        >
            {stats && (
                <View className="px-5">
                    <View className="flex-row flex-wrap -mx-1">
                        <StatCard
                            title="Total Usuarios"
                            value={stats.totalUsers}
                            icon="people"
                            color="blue"
                        />
                        <StatCard
                            title="Estudiantes"
                            value={stats.totalStudents}
                            icon="school"
                            color="green"
                        />
                        <StatCard
                            title="Tutores"
                            value={stats.totalTutors}
                            icon="person"
                            color="orange"
                        />
                        <StatCard
                            title="Carreras"
                            value={stats.totalCareers}
                            icon="library"
                            color="purple"
                        />
                        <StatCard
                            title="Sesiones"
                            value={stats.totalSessions}
                            icon="calendar"
                            color="indigo"
                        />
                        <StatCard
                            title="Envíos"
                            value={stats.totalSubmissions}
                            icon="document-text"
                            color="red"
                        />
                    </View>
                </View>
            )}

            <View className="px-5 mt-6">
                {stats && userDistributionData.some(item => item.population > 0) && (
                    <View className="bg-white rounded-xl p-4 mb-4">
                        <Text className="text-lg font-semibold text-gray-800 mb-3 text-center">
                            Usuarios
                        </Text>
                        <PieChart
                            data={userDistributionData}
                            width={screenWidth - 40}
                            height={160}
                            chartConfig={{
                                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            }}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft="15"
                            absolute
                        />
                    </View>
                )}

                {stats && stats.totalSessions > 0 && (
                    <View className="bg-white rounded-xl p-4 mb-4">
                        <Text className="text-lg font-semibold text-gray-800 mb-3 text-center">
                            Actividad de Sesiones
                        </Text>
                        <SessionActivityChart
                            completed={stats.completedSessions}
                            upcoming={stats.upcomingSessions}
                        />
                    </View>
                )}

                <View className="bg-white rounded-xl p-4 mb-4">
                    <Text className="text-lg font-semibold text-gray-800 mb-3 text-center">
                        Tutores mas activos
                    </Text>
                    {topTutors.length === 0 ? (
                        <Text className="text-gray-500 text-center py-4">No hay datos de tutores</Text>
                    ) : (
                        <TutorsVerticalBarChart data={topTutors.slice(0, 5)} />
                    )}
                </View>

                <View className="bg-white rounded-xl p-4 mb-4">
                    <Text className="text-lg font-semibold text-gray-800 mb-3 text-center">
                        Carreras mas buscadas
                    </Text>
                    {popularCareers.length === 0 ? (
                        <Text className="text-gray-500 text-center py-4">No hay datos de carreras</Text>
                    ) : (
                        <CareersBarChart data={popularCareers.slice(0, 5)} />
                    )}
                </View>

                <View>
                    <Text className="text-lg font-semibold  text-center text-gray-800 mb-3">Usuarios Recientes</Text>
                    {users.slice(0,3).map((user) => (
                        <UserCard
                            key={user.id}
                            item={user}
                            onPress={handleCardPress}
                            onLongPress={handleLongPress}
                            variant="default"
                        />
                    ))}
                </View>
            </View>
        </ScrollView>
    );
};

const CareersBarChart = ({ data }: { data: any[] }) => {
    const maxStudents = Math.max(...data.map(item => item.count));

    return (
        <View className="flex flex-col gap-3">
            {data.map((career, index) => {
                const percentage = (career.count / maxStudents) * 100;

                return (
                    <View key={career.career_id} className="space-y-1">
                        <View className="flex-row justify-between items-center">
                            <View className="flex-row items-center flex-1">
                                <View className="w-6 h-6 bg-green-100 rounded-full items-center mb-1 justify-center mr-2">
                                    <Text className="text-green-600 text-xs font-bold">{index + 1}</Text>
                                </View>
                                <Text className="text-gray-700 text-sm flex-1" numberOfLines={1}>
                                    {career.name}
                                </Text>
                            </View>
                            <Text className="text-gray-600 text-sm font-medium ml-2">
                                {career.count}
                            </Text>
                        </View>
                        <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
                            <View
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${percentage}%` }}
                            />
                        </View>
                    </View>
                );
            })}
        </View>
    );
};

const TutorsVerticalBarChart = ({ data }: { data: any[] }) => {
    const maxSessions = Math.max(...data.map(item => item.count));
    const chartHeight = 120;

    return (
        <View className="flex-row items-end justify-between pt-4">
            {data.map((tutor, index) => {
                const height = (tutor.count / maxSessions) * chartHeight;

                return (
                    <View key={tutor.tutor_id} className="items-center flex-1">
                        <View className="items-center mb-1">
                            <View
                                className="w-6 bg-purple-500 rounded-t-lg"
                                style={{ height: Math.max(height, 8) }} // Minimum height for visibility
                            />
                        </View>
                        <Text className="text-xs text-gray-600 text-center" numberOfLines={2}>
                            {tutor.name.split(' ')[0]} {/* Show only first name */}
                        </Text>
                        <Text className="text-xs font-bold text-purple-600 mt-1">
                            {tutor.count}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
};

const SessionActivityChart = ({ completed, upcoming }: { completed: number; upcoming: number }) => {
    const total = completed + upcoming;
    const completedPercentage = total > 0 ? (completed / total) * 100 : 0;
    const upcomingPercentage = total > 0 ? (upcoming / total) * 100 : 0;

    return (
        <View className="flex flex-col gap-3">
            <View className="flex flex-col gap-3">
                <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                        <View className="w-3 h-3 bg-green-500 rounded-full mr-2" />
                        <Text className="text-gray-700 font-medium">Completadas</Text>
                    </View>
                    <Text className="text-gray-600 font-bold">{completed}</Text>
                </View>
                <View className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <View
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${completedPercentage}%` }}
                    />
                </View>
            </View>

            <View className="flex flex-col gap-3">
                <View className="flex-row gap-3 justify-between items-center">
                    <View className="flex-row items-center">
                        <View className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
                        <Text className="text-gray-700 font-medium">Próximas</Text>
                    </View>
                    <Text className="text-gray-600 font-bold">{upcoming}</Text>
                </View>
                <View className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <View
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${upcomingPercentage}%` }}
                    />
                </View>
            </View>

            <View className="pt-2 border-t border-gray-200">
                <View className="flex-row justify-between items-center">
                    <Text className="text-gray-700 font-semibold">Total Sesiones</Text>
                    <Text className="text-gray-800 font-bold text-lg">{total}</Text>
                </View>
            </View>
        </View>
    );
};

const StatCard = ({ title, value, icon, color, onPress }: any) => {
    const colorClasses = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        orange: 'bg-orange-500',
        purple: 'bg-purple-500',
        indigo: 'bg-indigo-500',
        red: 'bg-red-500'
    };

    return (
        <TouchableOpacity
            className="w-1/2 px-1 mb-2"
            onPress={onPress}
        >
            <View className="bg-white rounded-xl p-4 shadow-sm">
                {/*// @ts-ignore*/}
                <View className={`w-10 h-10 ${colorClasses[color]} rounded-lg items-center justify-center mb-2`}>
                    <Ionicons name={icon} size={20} color="white" />
                </View>
                <Text className="text-2xl font-bold text-gray-800">{value}</Text>
                <Text className="text-sm text-gray-600">{title}</Text>
            </View>
        </TouchableOpacity>
    );
};


export default VisualAdminDashboard;