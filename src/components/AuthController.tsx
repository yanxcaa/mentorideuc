import React, {useEffect} from 'react';
import {View, ActivityIndicator, Text, Alert} from 'react-native';
import {useSession,  useProfile} from "@/lib/hooks";

import Account from '@/app/Account';
import LoginScreen from "@/app/(auth)/Login";
import AdminTabs from "@/app/(admin)/tabs";
import TutorTabs from "@/app/(tutor)/tabs";
import StudentTabs from "@/app/(student)/tabs";
import {supabase} from "@/lib/supabase";
import Loading from "@/src/components/Loading";

export default function AuthController() {
    const { session, loading: sessionLoading, error: sessionError } = useSession();
    const { profile, loading: profileLoading, error: profileError } = useProfile(session?.user?.id);

    useEffect(() => {
        if (sessionError) {
            console.error("Auth error:", sessionError);

            if (sessionError.message.includes('Invalid Refresh Token')) {
                supabase.auth.signOut();
                Alert.alert("Session Expired", "Please sign in again");
            }
        }
    }, [sessionError]);

    const loading = sessionLoading || (session && profileLoading);

    if (loading) {
        return <Loading />;
    }

    if (profileError) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text className="text-red-500">Error loading profile</Text>
            </View>
        );
    }

    if (!session) {
        return <LoginScreen />;
    }

    if (profile?.role === 'admin') return <AdminTabs />;
    if (profile?.role === 'tutor') return <TutorTabs />;
    if (profile?.role === 'student') return <StudentTabs />;

    return <Account session={session} />;
}
