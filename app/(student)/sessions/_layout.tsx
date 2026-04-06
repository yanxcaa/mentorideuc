import { Stack } from "expo-router";

export default function SessionsStudentLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="[id]" />
            <Stack.Screen name="index" />
        </Stack>
    );
}