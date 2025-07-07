import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
    padding: 20,
  },
  bookCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  cover: {
    width: 70,
    height: 100,
    borderRadius: 8,
    marginRight: 18,
    backgroundColor: "#e1e4ea",
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontWeight: "bold",
    fontSize: 19,
    marginBottom: 16,
    color: "#222",
    lineHeight: 24,
  },
  bookAuthor: {
    color: "#888",
    marginBottom: 8,
    fontSize: 15,
    lineHeight: 22,
  },
  link: {
    color: "#4f8cff",
    marginTop: 8,
    fontWeight: "bold",
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    backgroundColor: "#4f8cff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 18,
    color: "#222",
    marginTop: 10,
  },
});