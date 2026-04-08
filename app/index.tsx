import React from 'react';
import { View } from 'react-native';
import AuthController from '@/src/components/AuthController';

// New debug
export default function App() {
    return (
        <View className="flex-1">
            <AuthController />
        </View>
    );
}