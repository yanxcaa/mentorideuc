// components/AddCareerForm.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    Modal,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CareerFormData } from '@/src/types/auth';
import { createCareer, getFaculties } from '@/lib/api/admin';

interface AddCareerFormProps {
    visible: boolean;
    onClose: () => void;
    onCareerCreated: () => void;
}

const AddCareerForm: React.FC<AddCareerFormProps> = ({ visible, onClose, onCareerCreated }) => {
    const [formData, setFormData] = useState<CareerFormData>({
        name: '',
        code: '',
        faculty: '',
        duration_semesters: 8,
        is_active: true
    });
    const [loading, setLoading] = useState(false);
    const [faculties, setFaculties] = useState<string[]>([]);

    useEffect(() => {
        loadFaculties();
    }, []);

    const loadFaculties = async () => {
        try {
            const facultiesList = await getFaculties();
            setFaculties(facultiesList);
        } catch (error) {
            console.error('Error loading faculties:', error);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.code || !formData.faculty) {
            Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
            return;
        }

        if (formData.duration_semesters < 1) {
            Alert.alert('Error', 'La duración debe ser al menos 1 semestre');
            return;
        }

        try {
            setLoading(true);
            await createCareer(formData);
            Alert.alert('Éxito', 'Carrera creada correctamente');
            setFormData({ name: '', code: '', faculty: '', duration_semesters: 8, is_active: true });
            onCareerCreated();
            onClose();
        } catch (error: any) {
            console.error('Error creating career:', error);
            Alert.alert('Error', error.message || 'Error al crear la carrera');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({ name: '', code: '', faculty: '', duration_semesters: 8, is_active: true });
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
                    <Text className="text-2xl font-semibold">Agregar Carrera</Text>
                    <TouchableOpacity onPress={handleClose}>
                        <Ionicons name="close-outline" size={24} color="#333" />
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                    <View className="flex gap-5 flex-col w-full mt-5">
                        <View>
                            <Text className="text-base font-medium text-gray-700 mb-2">
                                Nombre de la Carrera *
                            </Text>
                            <TextInput
                                className="border border-gray-300 rounded-xl px-4 py-3"
                                placeholder="Ej: Ingeniería en Computación"
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
                                Código *
                            </Text>
                            <TextInput
                                className="border border-gray-300 rounded-xl px-4 py-3 text-base"
                                placeholder="Ej: CS"
                                value={formData.code}
                                onChangeText={(text) => setFormData({ ...formData, code: text.toUpperCase() })}
                                autoCapitalize="characters"
                                style={{
                                    fontSize: 16,
                                    lineHeight: 18,
                                    textAlignVertical: 'center',
                                }}
                            />
                        </View>

                        <View>
                            <Text className="text-base font-medium text-gray-700 mb-2">
                                Facultad *
                            </Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                                <View className="flex-row gap-3">
                                    {faculties.map((faculty) => (
                                        <TouchableOpacity
                                            key={faculty}
                                            className={`px-4 py-3 rounded-xl border ${
                                                formData.faculty === faculty
                                                    ? 'border-purple-500'
                                                    : 'bg-gray-100 border-gray-300'
                                            }`}
                                            onPress={() => setFormData({ ...formData, faculty })}
                                        >
                                            <Text
                                                className={`font-medium ${
                                                    formData.faculty === faculty ? 'text-purple-500 ' : 'text-gray-700'
                                                }`}
                                            >
                                                {faculty}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                            <TextInput
                                className="border border-gray-300 rounded-xl px-4 py-3 text-base"
                                placeholder="O escribe una facultad personalizada"
                                value={formData.faculty}
                                onChangeText={(text) => setFormData({ ...formData, faculty: text })}
                                style={{
                                    fontSize: 16,
                                    lineHeight: 18,
                                    textAlignVertical: 'center',
                                }}
                            />
                        </View>

                        <View>
                            <Text className="text-base font-medium text-gray-700 mb-2">
                                Duración (Semestres) *
                            </Text>
                            <View className="flex-row items-center gap-3">
                                <TouchableOpacity
                                    className="w-10 h-10 bg-gray-200 rounded-xl items-center justify-center"
                                    onPress={() => setFormData({
                                        ...formData,
                                        duration_semesters: Math.max(1, formData.duration_semesters - 1)
                                    })}
                                >
                                    <Ionicons name="remove-outline" size={20} color="#333" />
                                </TouchableOpacity>

                                <TextInput
                                    className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-base text-center"
                                    value={formData.duration_semesters.toString()}
                                    onChangeText={(text) => {
                                        const value = parseInt(text) || 1;
                                        setFormData({ ...formData, duration_semesters: Math.max(1, value) });
                                    }}
                                    keyboardType="numeric"
                                    style={{
                                        fontSize: 16,
                                        lineHeight: 18,
                                        textAlignVertical: 'center',
                                    }}
                                />

                                <TouchableOpacity
                                    className="w-10 h-10 bg-gray-200 rounded-xl items-center justify-center"
                                    onPress={() => setFormData({
                                        ...formData,
                                        duration_semesters: formData.duration_semesters + 1
                                    })}
                                >
                                    <Ionicons name="add-outline" size={20} color="#333" />
                                </TouchableOpacity>
                            </View>
                            <Text className="text-xs text-gray-500 mt-1">
                                Duración total en semestres
                            </Text>
                        </View>

                        <View className="flex-row items-center justify-between py-3">
                            <Text className="text-base font-medium text-gray-700">
                                Carrera Activa
                            </Text>
                            <TouchableOpacity
                                className={`w-12 h-6 rounded-full ${
                                    formData.is_active ? 'bg-purple-500' : 'bg-gray-300'
                                }`}
                                onPress={() => setFormData({ ...formData, is_active: !formData.is_active })}
                            >
                                <View
                                    className={`w-5 h-5 bg-white rounded-full mt-0.5 ${
                                        formData.is_active ? 'ml-6' : 'ml-1'
                                    }`}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="my-8">
                        <TouchableOpacity
                            className={`bg-purple-500 rounded-xl py-4 ${
                                loading ? 'opacity-50' : ''
                            }`}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white text-center font-semibold text-lg">
                                    Crear Carrera
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
};

export default AddCareerForm;