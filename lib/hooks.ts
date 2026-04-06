import { useState, useEffect } from "react";
import {UserRole, Profile} from "@/src/types/auth";
import {supabase} from "@/lib/supabase";

// --- Session hook ---
export function useSession() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
                console.error("Session error:", error);
                setError(error);

                if (error.message.includes('Invalid Refresh Token')) {
                    setSession(null);
                }
            } else {
                setSession(session);
                setError(null);
            }
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return { session, loading, error };
}

// --- Profile hook ---
export function useProfile(userId?: string) {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        if (!userId) {
            setProfile(null);
            setLoading(false);
            return;
        }

        const fetchProfile = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", userId)
                    .maybeSingle();

                if (error) {
                    setError(error);
                    console.error("Error fetching profile", error);
                } else {
                    setProfile(data);
                }
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    return { profile, loading, error };
}

/* Current User Hook */
export function useCurrentUser() {
    const { session, loading: sessionLoading } = useSession();
    const { profile, loading: profileLoading, error } = useProfile(session?.user?.id);

    return {
        session,
        profile,
        loading: sessionLoading || profileLoading,
        error
    };
}