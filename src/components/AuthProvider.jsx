import { createContext, useEffect, useState, useCallback } from "react";
import { auth, db, storage } from "../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getDoc, collection, doc, getDocs, setDoc, updateDoc, deleteDoc } from "firebase/firestore";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [postLoading, setPostLoading] = useState(true)

    useEffect(() => {
        return auth.onAuthStateChanged((user) => {
            setCurrentUser(user);
            setLoading(false);
        });
    }, [])

    const uploadFile = useCallback(async (file) => {
        const storageRef = ref(storage, `posts/${file.name}`);
        const response = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(response.ref);
        return url;
    }, [])

    const fetchPostsByUser = useCallback(async (userId) => {
        setPostLoading(true);
        try {
            const postRef = collection(db, `users/${userId}/posts`);
            const querySnapshot = await getDocs(postRef);
            const docs = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setPosts(docs);
        } catch (error) {
            console.error(error);
        } finally {
            setPostLoading(false);
        }
    }, [])

    const savePost = useCallback(async (userId, postContent, file) => {
        try {
            let imageUrl = null;
            if (file) {
                imageUrl = await uploadFile(file);
            }

            const postRef = collection(db, `users/${userId}/posts`);
            const newPostRef = doc(postRef);
            await setDoc(newPostRef, { content: postContent, likes: [], imageUrl });
            const newPost = await getDoc(newPostRef);

            setPosts((prev) => [{ id: newPost.id, ...newPost.data() }, ...prev]);
        } catch (error) {
            console.error(error);
        }
    }, [uploadFile])

    const likePost = useCallback(async (userId, postId) => {
        try {
            const postRef = doc(db, `users/${userId}/posts/${postId}`);
            const docSnap = await getDoc(postRef);
            if (docSnap.exists()) {
                const postData = docSnap.data();
                const likes = [...(postData.likes || []), userId];
                await setDoc(postRef, { ...postData, likes });

                setPosts((prev) =>
                    prev.map((post) => (post.id === postId ? { ...post, likes } : post)));
            }
        } catch (error) {
            console.error(error);
        }
    }, [])

    const removeLikeFromPost = useCallback(async (userId, postId) => {
        try {
            const postRef = doc(db, `users/${userId}/posts/${postId}`);
            const docSnap = await getDoc(postRef);
            if (docSnap.exists()) {
                const postData = docSnap.data();
                const likes = (postData.likes || []).filter((id) => id !== userId);
                await setDoc(postRef, { ...postData, likes });

                setPosts((prev) =>
                    prev.map((post) => (post.id === postId ? { ...post, likes } : post)));
            }
        } catch (error) {
            console.error(error);
        }
    }, [])

    const updatePost = useCallback(
        async (userId, postId, newPostContent, newFile) => {
            try {
                const postRef = doc(db, `users/${userId}/posts/${postId}`);
                const postSnap = await getDoc(postRef);
                if (!postSnap.exists()) throw new Error("Post does not exist.");

                let newImageUrl = null;
                if (newFile) {
                    newImageUrl = await uploadFile(newFile);
                }

                const postData = postSnap.data();
                const updatedData = {
                    ...postData,
                    content: newPostContent || postData.content,
                    imageUrl: newImageUrl || postData.imageUrl,
                };

                await updateDoc(postRef, updatedData)

                setPosts((prev) =>
                    prev.map((p) => (p.id === postId ? { id: postId, ...updatedData } : p)));
            } catch (error) {
                console.error(error)
            }
        }, [uploadFile]
    );

    const deletePost = useCallback(async (userId, postId) => {
        try {
            const postRef = doc(db, `users/${userId}/posts/${postId}`);
            await deleteDoc(postRef);

            setPosts((prev) => prev.filter((post) => post.id !== postId));
        } catch (error) {
            console.error(error);
        }
    }, []);

    const value = {
        currentUser,
        posts,
        postLoading,
        fetchPostsByUser,
        savePost,
        updatePost,
        deletePost,
        likePost,
        removeLikeFromPost,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );

}