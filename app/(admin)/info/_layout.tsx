import { Stack } from "expo-router";

export default function InfoUserLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="[id]" />
            <Stack.Screen name="index" />
        </Stack>
    );
}