// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_APP_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

/**
 * Helper function to add a comment to a specific post in Firestore
 * Builds path: users/{userId}/posts/{postId}/comments
 */
export async function addComment(userId, postId, authorId, content) {
    try {
        const commentsRef = collection(
            db,
            `users/${userId}/posts/${postId}/comments`
        );
        const docRef = await addDoc(commentsRef, {
            content,
            authorId,
            createdAt: serverTimestamp(),
        });

        return {
            id: docRef.id,
            content,
            authorId,
            createdAt: new Date().toISOString(),
        };
    } catch (error) {
        console.error('Error adding comment: ', error);
        throw error;
    }
};