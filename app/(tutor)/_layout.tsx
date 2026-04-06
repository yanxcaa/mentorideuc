import { Stack } from "expo-router";

export default function TutorLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="tabs" />
            <Stack.Screen name="index" />
            <Stack.Screen name="CalendarScreen" />
            <Stack.Screen name="PendingSessions" />
            <Stack.Screen name="Profile" />
        </Stack>
    );
}
