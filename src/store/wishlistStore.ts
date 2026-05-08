import { create } from 'zustand';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

interface WishlistState {
  wishlistIds: string[];
  toggleWishlist: (productId: string) => Promise<void>;
  fetchWishlist: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlistIds: [],
  fetchWishlist: async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
       const userDoc = await getDoc(doc(db, "users", user.uid));
       if (userDoc.exists() && userDoc.data().wishlist) {
         set({ wishlistIds: userDoc.data().wishlist });
       }
    } catch (e) {
       handleFirestoreError(e, OperationType.GET, `users/${user.uid}`);
    }
  },
  toggleWishlist: async (productId: string) => {
    const { wishlistIds } = get();
    const isWished = wishlistIds.includes(productId);
    
    // Optimistic update
    set({
      wishlistIds: isWished 
        ? wishlistIds.filter(id => id !== productId)
        : [...wishlistIds, productId]
    });

    // Firebase update
    const user = auth.currentUser;
    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
           wishlist: isWished ? arrayRemove(productId) : arrayUnion(productId)
        }, { merge: true });
      } catch (e) {
        // Revert optimistic update on failure
        set({ wishlistIds });
        handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
      }
    }
  }
}));
