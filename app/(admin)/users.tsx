import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {supabase} from "@/lib/supabase";

export default function AdminUsers() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Admin Users</Text>
            <TouchableOpacity
                className="bg-blue-600 mt-8 rounded-lg p-4"
                onPress={() => supabase.auth.signOut()}
            >
                <Text className="text-white text-center font-semibold text-lg">Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
}