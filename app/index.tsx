import { parseManifest } from '@/app/taqrafmt';
import * as FileSystem from 'expo-file-system';
import { router, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

export default function Index() {
  const [books, setBooks] = useState<any[]>([]);

  useEffect(() => {
    async function loadBooks() {
      const router = useRouter();
      const root = FileSystem.documentDirectory + 'books/';
      console.log("root:", root);

       const dirInfo = await FileSystem.getInfoAsync(root);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(root, { intermediates: true });
      }

      try {
        const entries = await FileSystem.readDirectoryAsync(root);

        const foundBooks = [];

        for (const name of entries) {
          const fullPath = root + name + '/';
          const manifestPath = fullPath + 'manifest.taqra';

          const manifestExists = await FileSystem.getInfoAsync(manifestPath);
          if (manifestExists.exists) {
            const manifestContent = await FileSystem.readAsStringAsync(manifestPath);
            
            // Tu peux parser ici ton fichier custom
            foundBooks.push({
              name,
              root: fullPath,
              manifest: manifestContent,
            });

            const parsed = parseManifest(manifestContent);
            console.log(parsed.meta);
            console.log(parsed.pagePaths);
          }
        }

        setBooks(foundBooks);
      } catch (e) {
        console.error('Erreur:', e);
      }
    }

    loadBooks();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text>📚 Livres trouvés : {books.length}</Text>
      {books.map((book, i) => (
        <View key={i}>
          <Text>{book.name}</Text>
        </View>
      ))}
      <Text
        style={{ color: 'blue', marginTop: 30 }}
        onPress={() => router.push('/lib')}
      >
        ➕ Ajouter des livres depuis une librairie en ligne
      </Text>
    </View>
  );
}
