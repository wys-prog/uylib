import { styles } from "@/assets/style/style";
import { downloadFile, listBooks } from "@/lib/googleDrive"; // ajuste le chemin
import { parseBookFile } from "@/lib/parser";
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

export async function initGoogleAPI() {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject("Not a web environment");
      return;
    }

    if (window.gapi) {
      window.gapi.load("client:auth2", async () => {
        try {
          await window.gapi.client.init({
            apiKey: "AIzaSyCCo-O1817jwJksJdH3BEykZimIS1oadrQ",
            clientId: "322726300328-f19221mrnhnpv0800ihstchp7kkf0vhj.apps.googleusercontent.com",
            discoveryDocs: [
              "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
            ],
            scope:
              "https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file",
          });

          resolve();
        } catch (e) {
          reject(e);
        }
      });
    } else {
      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/api.js";
      script.async = true;
      script.onload = () => {
        window.gapi.load("client:auth2", async () => {
          try {
            await window.gapi.client.init({
              apiKey: "AIzaSyCCo-O1817jwJksJdH3BEykZimIS1oadrQ",
              clientId:
                "322726300328-f19221mrnhnpv0800ihstchp7kkf0vhj.apps.googleusercontent.com",
              discoveryDocs: [
                "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
              ],
              scope:
                "https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file",
            });
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      };
      script.onerror = reject;
      document.body.appendChild(script);
    }
  });
}


export default function Index() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState(false);
  const [books, setBooks] = useState<any[]>([]);
  const root = FileSystem.documentDirectory + "books/";

  async function loadBooks() {
    try {
      const files = await listBooks();

      const books: any[] = [];

      for (const bookFile of files) {
        if (!bookFile.name.endsWith(".uybook")) continue;

        const baseName = bookFile.name.replace(".uybook", "");
        const coverFile = files.find((f: { name: string; }) => f.name === `${baseName}_cover.jpg`);
        const content = await downloadFile(bookFile.id);
        const parsed = parseBookFile(content);

        const coverData = coverFile
          ? `data:image/jpeg;base64,${btoa(await downloadFile(coverFile.id))}`
          : null;

        books.push({
          name: bookFile.name,
          meta: parsed.meta,
          html: parsed.html,
          cover: coverData,
        });
      }

      setBooks(books);
    } catch (e) {
      console.error("Drive error", e);
    }
  }

  useEffect(() => {
    async function init() {
      try {
        await initGoogleAPI();
        const auth = window.gapi.auth2.getAuthInstance();

        if (!auth.isSignedIn.get()) {
          setLoggedIn(false);
        } else {
          setLoggedIn(true);
          await loadBooks();
        }
      } catch (err) {
        console.error("Erreur d'init GAPI:", err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  async function handleSignIn() {
    const auth = window.gapi.auth2.getAuthInstance();
    setLoginError(false);
    try {
      await auth.signIn();
      setLoggedIn(true);
      await loadBooks();
    } catch (e) {
      console.error("Login failed", e);
      setLoginError(true);
    }
  }

  return (
    <View style={styles.container}>
      {!loggedIn && !loading && (
        <>
          <Pressable style={[styles.button, { marginTop: 40 }]} onPress={handleSignIn}>
            <Text style={styles.buttonText}>🔐 Sign in with Google</Text>
          </Pressable>

          {loginError && (
            <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
              <Text style={{ color: "red", textAlign: "center", marginBottom: 10 }}>
                ⚠️ La connexion a échoué, veuillez réessayer.
              </Text>
              <Pressable style={[styles.button, { backgroundColor: "#f44336" }]} onPress={handleSignIn}>
                <Text style={styles.buttonText}>Réessayer</Text>
              </Pressable>
            </View>
          )}
        </>
      )}

      <Text style={styles.sectionTitle}>📚 My Library (Web based)</Text>

      <ScrollView>
        {books.length === 0 && (
          <Text style={{ color: "#888", marginTop: 40, textAlign: "center" }}>
            No books downloaded yet.
          </Text>
        )}
        {books.map((book, i) => (
          <View key={i} style={styles.bookCard}>
            <Image
              source={
                book.cover
                  ? { uri: book.cover }
                  : require("@/assets/images/cover-placeholder.jpg")
              }
              style={styles.cover}
            />
            <View style={styles.bookInfo}>
              <Text style={[styles.bookTitle]}>{book.meta.title}</Text>
              <Text style={[styles.bookAuthor]}>Author: {book.meta.author}</Text>
              <Pressable
                onPress={() =>
                  router.push({ pathname: "/read", params: { path: book.path } })
                }
              >
                <Text style={styles.link}>➡️ Read this book</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
      <Pressable
        style={[styles.button, { backgroundColor: "#fff", borderWidth: 1, borderColor: "#4f8cff" }]}
        onPress={() => router.push("/lib")}
      >
        <Text style={[styles.buttonText, { color: "#4f8cff" }]}>
          ➕ Add books from an online library
        </Text>
      </Pressable>
    </View>
  );
}

/*

<Pressable onPress={deleteAllBooks} style={styles.button}>
        <Text style={styles.buttonText}>🗑️ Delete all books</Text>
      </Pressable>
<meta http-equiv="Content-Security-Policy" content="script-src 'self' https://apis.google.com https://www.gstatic.com; object-src 'none';"></meta>
*/

