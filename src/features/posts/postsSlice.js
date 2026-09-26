import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { db, addComment } from '../../firebase';

export const fetchPostsByUser = createAsyncThunk(
    'posts/fetchByUser',
    async (userId) => {
        try {
            const postsRef = collection(db, `users/${userId}/posts`);
            const querySnapshot = await getDocs(postsRef);
            const docs = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                comments: [], // prepare comments array
                ...doc.data(),
            }));
            return docs;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
);

export const savePost = createAsyncThunk(
    'posts/savePost',
    async ({ userId, postContent }) => {
        try {
            const postsRef = collection(db, `users/${userId}/posts`);
            const newPostRef = doc(postsRef);
            await setDoc(newPostRef, { content: postContent, likes: [] });
            const newPost = await getDoc(newPostRef);

            const post = {
                id: newPost.id,
                comments: [],
                ...newPost.data(),
            };

            return post;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
);

// ✅ Add Comment Thunk
export const addCommentThunk = createAsyncThunk(
    'posts/addComment',
    async ({ userId, postId, authorId, content }) => {
        const newComment = await addComment(userId, postId, authorId, content);
        return { userId, postId, newComment };
    }
);

export const likePost = createAsyncThunk(
    'posts/likePost',
    async ({ userId, postId }) => {
        try {
            const postRef = doc(db, `users/${userId}/posts/${postId}`);
            const docSnap = await getDoc(postRef);

            if (docSnap.exists()) {
                const postData = docSnap.data();
                const likes = [...postData.likes, userId];
                await setDoc(postRef, { ...postData, likes });
            }

            return { userId, postId };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
);

export const removeLikeFromPost = createAsyncThunk(
    'posts/removeLikeFromPost',
    async ({ userId, postId }) => {
        try {
            const postRef = doc(db, `users/${userId}/posts/${postId}`);
            const docSnap = await getDoc(postRef);

            if (docSnap.exists()) {
                const postData = docSnap.data();
                const likes = postData.likes.filter((id) => id !== userId);
                await setDoc(postRef, { ...postData, likes });
            }

            return { userId, postId };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
);

const postsSlice = createSlice({
    name: 'posts',
    initialState: { posts: [], loading: true },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPostsByUser.fulfilled, (state, action) => {
                state.posts = action.payload;
                state.loading = false;
            })
            .addCase(savePost.fulfilled, (state, action) => {
                state.posts = [action.payload, ...state.posts];
            })
            .addCase(likePost.fulfilled, (state, action) => {
                const { userId, postId } = action.payload;
                const postIndex = state.posts.findIndex((post) => post.id === postId);
                if (postIndex !== -1) {
                    state.posts[postIndex].likes.push(userId);
                }
            })
            .addCase(removeLikeFromPost.fulfilled, (state, action) => {
                const { userId, postId } = action.payload;
                const postIndex = state.posts.findIndex((post) => post.id === postId);
                if (postIndex !== -1) {
                    state.posts[postIndex].likes = state.posts[postIndex].likes.filter(
                        (id) => id !== userId
                    );
                }
            })
            // ✅ Add comment reducer
            .addCase(addCommentThunk.fulfilled, (state, action) => {
                const { postId, newComment } = action.payload;
                const postIndex = state.posts.findIndex((post) => post.id === postId);
                if (postIndex !== -1) {
                    state.posts[postIndex].comments.push(newComment);
                }
            });
    },
});

export default postsSlice.reducer;
