import * as FileSystem from 'expo-file-system';
import { useState } from 'react';
import { Alert, Button, Image, ScrollView, Text, View } from 'react-native';

type Book = {
  author: string;
  title: string;
  'cover-link': string;
  'content-link': string;
};

export default function Library() {
  const [catalogUrl, setCatalogUrl] = useState('https://toncatalogue.github.io/catalogue.json');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchCatalog() {
    setLoading(true);
    try {
      const res = await fetch(catalogUrl);
      const data = await res.json();
      setBooks(data);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de charger le catalogue');
    }
    setLoading(false);
  }

  async function downloadBook(book: Book) {
    const booksDir = FileSystem.documentDirectory + 'books/';
    const dirInfo = await FileSystem.getInfoAsync(booksDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(booksDir, { intermediates: true });
    }

    // Télécharge la couverture
    const coverPath = booksDir + book.title + '_cover.jpg';
    await FileSystem.downloadAsync(book['cover-link'], coverPath);

    // Télécharge le contenu (zip)
    const contentPath = booksDir + book.title + '.zip';
    await FileSystem.downloadAsync(book['content-link'], contentPath);

    Alert.alert('Téléchargé', `Livre "${book.title}" téléchargé !`);
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Button title="Charger le catalogue" onPress={fetchCatalog} disabled={loading} />
      <ScrollView>
        {books.map((book, i) => (
          <View key={i} style={{ marginVertical: 10, borderBottomWidth: 1, borderColor: '#ccc', paddingBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>{book.title}</Text>
            <Text>Auteur: {book.author}</Text>
            <Image source={{ uri: book['cover-link'] }} style={{ width: 100, height: 150, marginVertical: 5 }} />
            <Button title="Télécharger" onPress={() => downloadBook(book)} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}