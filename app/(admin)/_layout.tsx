import { Stack } from "expo-router";

export default function AdminLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="tabs" />
            <Stack.Screen name="index" />
            <Stack.Screen name="users" />
            <Stack.Screen name="Profile" />
        </Stack>
    );
}
