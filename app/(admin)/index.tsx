import React, {useState, useEffect} from "react";
import {Alert, View, Text, FlatList} from "react-native";
import { getUsers, createUser, updateUser, deleteUser } from '@/lib/api/admin';
import Loading from "@/src/components/Loading";
import { useCurrentUser } from "@/lib/hooks";
import {DashboardHeader} from "@/src/components/Header";
import EnhancedAdminDashboard from "@/src/components/DataAnalysisAdmin";
import SimpleAdminDashboard from "@/src/components/DataAnalysisAdmin";
import VisualAdminDashboard from "@/src/components/DataAnalysisAdmin";
import UserCard from "@/src/components/UserCardAdmin";

export default function Home() {
    const { profile } = useCurrentUser();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);


    const loadUsers = async () => {
        try {
            setLoading(true);
            const usersData = await getUsers();
            setUsers(usersData);
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    if (loading) {
        return <Loading />
    }

    return (
        <View className="flex-1 bg-white pt-12">
            <DashboardHeader
                name={profile?.name as string}
                role={profile?.role as string}
            />
            <VisualAdminDashboard />
        </View>
    )
}