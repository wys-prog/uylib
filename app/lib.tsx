import { styles } from "@/assets/style/style";
import { uploadFile } from "@/lib/googleDrive";
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';

type Book = {
  author: string;
  title: string;
  'cover-link': string;
  'content-link': string;
  description: string;
};

export default function Library() {
  const router = useRouter();
  const [catalogUrl] = useState('https://raw.githubusercontent.com/wys-prog/Uyghur-library/main/booklist.json');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchCatalog() {
    setLoading(true);
    try {
      const res = await fetch(catalogUrl);
      const data = await res.json();
      setBooks(data);
    } catch (e) {
      Alert.alert('Error', 'Unable to load the catalog');
    }
    setLoading(false);
  }

  async function downloadBook(book: Book) {
  try {
    const coverRes = await fetch(book["cover-link"]);
    const coverBlob = await coverRes.blob();
    const coverBase64 = await blobToBase64(coverBlob);

    const contentRes = await fetch(book["content-link"]);
    const content = await contentRes.text();

    await uploadFile(`${book.title}_cover.jpg`, coverBase64, "image/jpeg");
    await uploadFile(`${book.title}.uybook`, content, "text/plain");

    Alert.alert("Downloaded", `Book "${book.title}" uploaded to Google Drive!`);
  } catch (e) {
    Alert.alert("Error", "Could not download or upload the book");
  }
}

  function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve(atob(base64));
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>🌐 Online Library</Text>
      <Pressable
        style={[styles.button, { backgroundColor: "#fff", borderWidth: 1, borderColor: "#4f8cff" }]}
        onPress={() => router.back()}
      >
        <Text style={[styles.buttonText, { color: "#4f8cff" }]}>⬅️ Back</Text>
      </Pressable>
      <Pressable
        style={[styles.button, { marginBottom: 10 }]}
        onPress={fetchCatalog}
        disabled={loading}
      >
        <Text style={styles.buttonText}>🔄 Load Catalog</Text>
      </Pressable>
      <ScrollView>
        {books.map((book, i) => (
          <View key={i} style={styles.bookCard}>
            <Image
              source={{ uri: book['cover-link'] }}
              style={styles.cover}
            />
            <View style={styles.bookInfo}>
              <Text style={styles.bookTitle}>{book.title}</Text>
              <Text style={styles.bookAuthor}>Author: {book.author}</Text>
              <Text style={{ color: "#333", marginBottom: 8 }}>{book.description}</Text>
              <Pressable
                style={[styles.button, { marginTop: 0 }]}
                onPress={() => downloadBook(book)}
              >
                <Text style={styles.buttonText}>⬇️ Download</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}