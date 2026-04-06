import React, { useState, useEffect } from 'react';
import {  View, Text, TextInput, TouchableOpacity, Alert, Modal, ScrollView, ActivityIndicator} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserFormData } from '@/src/types/auth';
import { createUser, getActiveCareers } from '@/lib/api/admin';
import { AddUserFormProps, Career } from "@/src/types/auth";

const AddUserForm: React.FC<AddUserFormProps> = ({ visible, onClose, onUserCreated }) => {
    const [formData, setFormData] = useState<UserFormData>({
        name: '',
        role: 'student',
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [careers, setCareers] = useState<Career[]>([]);
    const [loadingCareers, setLoadingCareers] = useState(false);

    useEffect(() => {
        if (visible && formData.role === 'student') {
            loadCareers();
        }
    }, [visible, formData.role]);

    const loadCareers = async () => {
        try {
            setLoadingCareers(true);
            const careersData = await getActiveCareers();
            setCareers(careersData);
        } catch (error: any) {
            console.error('Error loading careers:', error);
            Alert.alert('Error', 'No se pudieron cargar las carreras');
        } finally {
            setLoadingCareers(false);
        }
    };

    const handleSubmit = async () => {
        if (formData.role === 'student' && !formData.career_id) {
            Alert.alert('Error', 'Por favor selecciona una carrera para el estudiante');
            return;
        }

        try {
            setLoading(true);
            const response = await createUser(formData);
            setFormData({ email: '', name: '', role: 'student', password: '' });
            onUserCreated();
            onClose();
        } catch (error: any) {
            console.error('Error creating user:', error);
            Alert.alert('Error', error.message || 'Error al crear el usuario');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({ email: '', name: '', role: 'student', password: '' });
        setCareers([]);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <View className="flex-1 bg-white pt-10">
                <View className="flex-row justify-between items-center px-5 pb-4 border-b border-gray-200">
                    <View style={{ width: 24 }} />
                    <Text className="text-2xl text-gray-800 font-semibold">Agregar Usuario</Text>
                    <TouchableOpacity onPress={handleClose}>
                        <Ionicons name="close-outline" size={28} color="#333" />
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                    <View className="flex w-full gap-5 mt-5">
                        <View>
                            <Text className="text-base font-medium text-gray-700 mb-2">
                                Nombre Completo *
                            </Text>
                            <TextInput
                                className="border border-gray-300 rounded-xl px-4 py-3"
                                placeholder="Nombre del usuario"
                                placeholderTextColor="#4b5563"
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                style={{
                                    fontSize: 16,
                                    lineHeight: 18,
                                    textAlignVertical: 'center',
                                }}
                            />
                        </View>

                        <View>
                            <Text className="text-base font-medium text-gray-700 mb-2">
                                Correo Electrónico *
                            </Text>
                            <TextInput
                                className="border border-gray-300 rounded-xl px-4 py-3"
                                placeholder="usuario@ejemplo.com"
                                placeholderTextColor="#4b5563"
                                value={formData.email}
                                onChangeText={(text) => setFormData({ ...formData, email: text })}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                style={{
                                    fontSize: 16,
                                    lineHeight: 18,
                                    textAlignVertical: 'center',
                                }}
                            />
                        </View>

                        <View>
                            <Text className="text-base font-medium text-gray-700 mb-2">
                                Rol *
                            </Text>
                            <View className="flex-row gap-3">
                                {(['student', 'tutor', 'admin'] as const).map((role) => (
                                    <TouchableOpacity
                                        key={role}
                                        className={`flex-1 py-3 rounded-xl border ${
                                            formData.role === role
                                                ? 'bg-transparent border-purple-500'
                                                : 'bg-gray-100 border-gray-300'
                                        }`}
                                        onPress={() => setFormData({ ...formData, role, career_id: undefined })}
                                    >
                                        <Text
                                            className={`text-center font-medium ${
                                                formData.role === role ? ' text-purple-500' : 'text-gray-700'
                                            }`}
                                        >
                                            {role === 'student' && 'Estudiante'}
                                            {role === 'tutor' && 'Tutor'}
                                            {role === 'admin' && 'Admin'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {formData.role === 'student' && (
                            <View>
                                <Text className="text-base font-medium text-gray-700 mb-2">
                                    Carrera *
                                </Text>
                                {loadingCareers ? (
                                    <View className="border border-gray-300 rounded-xl px-4 py-8 items-center">
                                        <ActivityIndicator size="small" color="#9333ea" />
                                        <Text className="text-gray-500 mt-2">Cargando carreras...</Text>
                                    </View>
                                ) : careers.length === 0 ? (
                                    <View className="border border-gray-300 rounded-xl px-4 py-8 items-center">
                                        <Ionicons name="school-outline" size={32} color="#9ca3af" />
                                        <Text className="text-gray-500 mt-2">No hay carreras activas</Text>
                                    </View>
                                ) : (
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        className="mb-3"
                                    >
                                        <View className="flex-row gap-2">
                                            {careers.map((career) => (
                                                <TouchableOpacity
                                                    key={career.id}
                                                    className={`px-4 py-3 rounded-xl border ${
                                                        formData.career_id === career.id
                                                            ? 'bg-purple-500 border-purple-500'
                                                            : 'bg-gray-100 border-gray-300'
                                                    }`}
                                                    onPress={() => setFormData({ ...formData, career_id: career.id })}
                                                >
                                                    <Text
                                                        className={`font-medium ${
                                                            formData.career_id === career.id ? 'text-white' : 'text-gray-700'
                                                        }`}
                                                    >
                                                        {career.name}
                                                    </Text>
                                                    <Text
                                                        className={`text-xs ${
                                                            formData.career_id === career.id ? 'text-white' : 'text-gray-500'
                                                        }`}
                                                    >
                                                        {career.faculty}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </ScrollView>
                                )}
                            </View>
                        )}
                        <View>
                            <Text className="text-base font-medium text-gray-700 mb-2">
                                Contraseña *
                            </Text>
                            <View className="relative">
                                <TextInput
                                    className="border border-gray-300 rounded-lg px-4 py-3 pr-12"
                                    placeholder="Mínimo 6 caracteres"
                                    placeholderTextColor="#4b5563"
                                    value={formData.password}
                                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                                    secureTextEntry={!showPassword}
                                    style={{
                                        fontSize: 16,
                                        lineHeight: 18,
                                        textAlignVertical: 'center',
                                    }}
                                />
                                <TouchableOpacity
                                    className="absolute right-3 top-3"
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color="#666"
                                    />
                                </TouchableOpacity>
                            </View>
                            <Text className="text-xs text-gray-500 mt-1">
                                La contraseña debe tener al menos 6 caracteres
                            </Text>
                        </View>
                    </View>

                    <View className="my-8">
                        <TouchableOpacity
                            className={`bg-purple-500 rounded-lg py-4 ${
                                loading ? 'opacity-50' : ''
                            }`}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white text-center font-semibold text-lg">
                                    Crear Usuario
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
};

export default AddUserForm;