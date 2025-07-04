import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  projectId: "lifetree-3c81e",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

if (process.env.NODE_ENV !== "production") {
  connectFirestoreEmulator(db, "localhost", 8080);
}

export { db };
