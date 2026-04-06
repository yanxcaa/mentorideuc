import useAuth from '@/src/components/Auth';
import React, { useState } from 'react';
import {View, Text, TextInput, TouchableOpacity, ActivityIndicator} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';

export default function LoginScreen () {
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const { loading, signInWithEmail} = useAuth();
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const handleSignIn = () => {
        signInWithEmail(email, password);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 px-6 pt-20">
                <View className="items-center mb-12">
                    <Text className="text-4xl font-bold text-gray-900 mb-3">
                        Mentoride
                    </Text>
                    <Text className="text-lg text-gray-600">
                        Inicia sesion con tu cuenta
                    </Text>
                </View>

                <View className="mb-6">
                    <Text className="text-xl font-bold text-gray-900 mb-3">
                        Email
                    </Text>
                    <View className="flex-row items-center bg-white border border-gray-300 rounded-2xl px-4 py-4">
                        <Mail size={24} color="#6B7280" />
                        <TextInput
                            className="flex-1 ml-3 text-gray-600"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholder="tu@email.com"
                            placeholderTextColor="#4b5563"
                            style={{
                                fontSize: 18,
                                lineHeight: 20,
                                textAlignVertical: 'center',
                            }}
                        />
                    </View>
                </View>

                <View className="mb-3">
                    <Text className="text-xl font-bold text-gray-900 mb-3">
                        Contraseña
                    </Text>
                    <View className="flex-row items-center bg-white border border-gray-300 rounded-2xl px-4 py-4">
                        <Lock size={24} color="#6B7280" />
                        <TextInput
                            className="flex-1 ml-3 text-base text-gray-600"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            placeholder="••••••••"
                            placeholderTextColor="#4b5563"
                            style={{
                                fontSize: 18,
                                lineHeight: 20,
                                textAlignVertical: 'center',
                            }}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            {showPassword ? (
                                <EyeOff size={24} color="#6B7280" />
                            ) : (
                                <Eye size={24} color="#6B7280" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="items-end mb-8">
                    <TouchableOpacity
                        disabled={true}
                    >
                        <Text className="text-purple-500 text-base">
                            Olvide la clave
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity className="bg-purple-500 rounded-xl py-4 items-center" onPress={handleSignIn}>
                    {loading ? (
                        <View className="flex-1 justify-center items-center py-3.5">
                            <ActivityIndicator size="small" color="#FFF" />
                        </View>
                    ) : (
                        <Text className="text-white text-xl font-semibold">
                            Iniciar sesion
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}