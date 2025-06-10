// app/_layout.tsx
import { Stack } from 'expo-router';
import { FolderProvider } from '../context/FolderContext';
import { TaskProvider } from '../context/TaskContext';

export default function RootLayout() {
  return (
    <FolderProvider>
    <TaskProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </TaskProvider>
    </FolderProvider>
  );
}
