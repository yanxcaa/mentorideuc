import React, { useState } from 'react'
import { Alert, View, AppState } from 'react-native'
import { supabase } from '@/lib/supabase'

AppState.addEventListener('change', (state) => {
    if (state === 'active') {
        supabase.auth.startAutoRefresh()
    } else {
        supabase.auth.stopAutoRefresh()
    }
})

export default function useAuth() {
    const [loading, setLoading] = useState(false)

    async function signInWithEmail(email: string, password: string) {
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })

        if (error) Alert.alert(error.message)
        setLoading(false)
    }

    async function signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    }

    async function signUpWithEmail(email: string, password: string) {
        setLoading(true)

        if (password.length < 6) {
            Alert.alert("Contraseña debe de tener mas de 6 digitos");
            setLoading(false);
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    // Change this shit
                    name: 'Ricardo',
                    role: 'tutor',
                }
            }
        });

        if (error) Alert.alert(error.message)
        setLoading(false)
    }

    return {
        loading,
        signOut,
        signUpWithEmail,
        signInWithEmail
    }
}