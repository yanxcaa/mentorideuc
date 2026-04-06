import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { updateUser } from "@/lib/api/admin";
import Octicons from "@expo/vector-icons/Octicons";
import { Picker } from '@react-native-picker/picker';
import DropDownPicker from 'react-native-dropdown-picker';
import Loading from "@/src/components/Loading";


interface User {
    id: string;
    name?: string;
    email?: string;
    avatar_url?: string;
    created_at?: string;
    role?: string;
    updated_at?: string;
}

interface EditProfileFormProps {
    user: User;
    onSave?: (item: User, values: any) => void;
    onCancel?: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ user, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: user.name || '',
        role: user.role || '',
        avatar_url: user.avatar_url || '',
    });
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(formData.role || 'student');
    const [items, setItems] = useState([
        { label: 'Estudiante', value: 'student' },
        { label: 'Tutor', value: 'tutor' },
        { label: 'Administrador', value: 'admin' },
    ]);

    const handleCancel = () => {
        if (onCancel) {
            onCancel()
        } else {
            router.back();
        }
    }


    const handleSave =  () => {
        if (onSave) {
            onSave(user, formData)
        } else {
            if (!formData.name.trim() || !formData.role.trim()) {
                Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
                return;
            }

            Alert.alert("onSave", "From the component");
            try {
                setLoading(true);

                const response = updateUser(user?.id, formData);
                Alert.alert("Exito", "Usuario actualizado")
            } catch (error: any) {
                console.error(error, "Error updating the user");
            } finally {
                setLoading(false);
            }
        }
    };

    if (loading) return <Loading />

    return (
        <View className="flex-1 bg-white pt-20 pb-5 px-5">
            <View className="flex justify-between flex-row items-center mb-6">
                <TouchableOpacity onPress={onCancel}>
                    <Ionicons name="chevron-back-outline" color="#333333" size={24}/>
                </TouchableOpacity>
                <Text className="font-bold text-xl text-gray-800">
                    Editar Perfil
                </Text>
                <TouchableOpacity onPress={handleSave}>
                    <Ionicons name="checkmark" color="#333333" size={26}/>
                </TouchableOpacity>
            </View>

            <View
                className="flex-1"
            >
                <View className="flex justify-center items-center flex-row">
                    <View className="w-36 h-36 relative bg-gray-400 rounded-full">
                        <Image
                            source={
                                formData?.avatar_url
                                    ? { uri: formData.avatar_url }
                                    : require("@/assets/images/user.png")
                            }
                            className="w-36 h-36 rounded-full"
                        />
                        <TouchableOpacity className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow">
                            <Octicons name="pencil" size={20} color="black" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="gap-5">
                    <View>
                        <Text className="text-gray-700 text-xl font-semibold mb-2">Nombre</Text>
                        <TextInput
                            className="border border-gray-300 rounded-xl px-4 py-2"
                            value={formData.name}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                            placeholder="Ingresa tu nombre"
                            style={{
                                fontSize: 16,
                                height: 46,
                                lineHeight: 20,
                                textAlignVertical: 'center',
                            }}
                        />
                    </View>

                    <View>
                        <Text className="text-gray-700 text-xl font-semibold mb-2">Rol</Text>
                        <DropDownPicker
                            open={open}
                            value={value}
                            items={items}
                            setOpen={setOpen}
                            setValue={(val) => {
                                setValue(val);
                                // @ts-ignore
                                setFormData(prev => ({ ...prev, role: val()}));
                            }}
                            setItems={setItems}
                            placeholder="Selecciona un rol"
                            style={{
                                borderColor: '#d1d5db',
                                borderWidth: 1,
                                borderRadius: 12,
                            }}
                            dropDownContainerStyle={{
                                borderColor: '#d1d5db',
                            }}
                            textStyle={{
                                fontSize: 16,
                            }}
                            labelStyle={{
                                fontSize: 16,
                            }}
                            placeholderStyle={{
                                fontSize: 16,
                            }}
                            listItemLabelStyle={{
                                fontSize: 16,
                            }}
                        />
                    </View>

                </View>

                <View className="flex-row gap-5 mt-8">
                    <TouchableOpacity
                        className="grow bg-gray-400 rounded-xl py-3"
                        onPress={handleCancel}
                        disabled={loading}
                    >
                        <Text className="text-white font-semibold text-center text-base">
                            Cancelar
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="grow bg-green-600 rounded-xl py-3"
                        onPress={handleSave}
                        disabled={loading}
                    >
                        <Text className="text-white font-semibold text-center text-base">
                            {loading ? 'Guardando...' : 'Guardar'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default EditProfileForm;
