import { parseBookFile } from '@/lib/parser';
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text } from 'react-native';
import RenderHTML from 'react-native-render-html';

export default function Read() {
  const { path } = useLocalSearchParams<{ path: string }>();
  const [html, setHtml] = useState('');
  const [title, setTitle] = useState('');

  useEffect(() => {
    async function load() {
      const content = await FileSystem.readAsStringAsync(path!);
      const parsed = parseBookFile(content);
      setTitle(parsed.meta.title ?? 'Unknown book');
      setHtml(parsed.html);
    }
    load();
  }, []);

  return (
      <ScrollView
    style={{ flex: 1, padding: 20 }}
    contentContainerStyle={{ paddingBottom: 100 }} // 👈 ajoute du fond
  >
    <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, lineHeight: 30 }}>
      {title}
    </Text>
    <RenderHTML source={{ html }} contentWidth={300} />
  </ScrollView>
  );
}