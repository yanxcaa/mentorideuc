import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { StyleSheet, View, Alert } from 'react-native'
import { TextInput, Button, Text, TouchableOpacity } from "react-native";
import { Session } from '@supabase/supabase-js'

export default function Account({ session }: { session: Session }) {
    const [loading, setLoading] = useState(true)
    const [name, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [role, setRole] = useState('')
    const [avatarUrl, setAvatarUrl] = useState('')

    useEffect(() => {
        if (session) getProfile()
    }, [session])

    async function getProfile() {
        try {
            setLoading(true)
            if (!session?.user) throw new Error('Sin usuario para la secion!')

            const { data, error, status } = await supabase
                .from('profiles')
                .select(`name, role, email, avatar_url`)
                .eq('id', session?.user.id)
                .single()
            if (error && status !== 406) {
                throw error
            }

            if (data) {
                setUsername(data.name)
                setEmail(data.email)
                setRole(data.role)
                setAvatarUrl(data.avatar_url)
            }
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert(error.message)
            }
        } finally {
            setLoading(false)
        }
    }

    async function updateProfile({ name, role, avatar_url }: {
        name: string
        role: string
        avatar_url: string
    }) {
        const roles = ["admin", "(student)", "(tutor)"];

        if (!roles.includes(role.toLowerCase())) {
            Alert.alert("Los roles deben ser: (admin), (student), (tutor)");
            return;
        }

        try {
            setLoading(true)
            if (!session?.user) throw new Error('No user on the session!')

            const updates = {
                id: session?.user.id,
                name,
                role: role.toLowerCase(),
                avatar_url,
                updated_at: new Date(),
            }

            const { data, error } = await supabase
                .from('profiles')
                .update({
                    name,
                    role: role.toLowerCase(),
                    avatar_url,
                    updated_at: new Date()
                })
                .eq('id', session.user.id)
                .select()


            if (error) {
                throw error
            }
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert(error.message)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <View className="flex flex-col pt-28 px-5">
            <View className="flex flex-col mb-10 gap-5">
                <TextInput
                    className="border text-gray-400 border-gray-400 rounded-lg px-4 py-4"
                    value={session?.user?.email}
                    editable={false}
                />
                <TextInput
                    className="w-full px-4 py-4 border border-solid border-gray-400 rounded-lg"
                    onChangeText={(text) => setUsername(text)}
                    value={name || ""}
                    placeholder="Nombre"
                />
                <TextInput
                    className="w-full px-4 py-4 border border-solid border-gray-400 rounded-lg"
                    onChangeText={(text) => setRole(text)}
                    value={role || ""}
                    placeholder="Role"
                />
            </View>
            <View className="flex flex-col gap-5">
                <TouchableOpacity
                    className="bg-blue-600 rounded-lg p-4"
                    disabled={loading}
                    onPress={() => updateProfile({ name, role, avatar_url: avatarUrl })}
                >
                    <Text className="text-white text-center font-semibold text-lg">{ loading ? "Loading..." : "Update" }</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className="bg-blue-600 rounded-lg p-4"
                    onPress={() => supabase.auth.signOut()}>
                    <Text className="text-white text-center font-semibold text-lg">Sign Out</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}