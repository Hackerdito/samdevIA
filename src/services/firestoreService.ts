import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError, ADMIN_EMAIL } from '../firebase/config';
import { GenerationItem, UserProfile } from '../types';

const GENERATIONS_COLLECTION = 'generations';
const USERS_COLLECTION = 'users';

/**
 * Save a new generation task to Firestore
 */
export async function saveGeneration(item: GenerationItem): Promise<void> {
  const path = `${GENERATIONS_COLLECTION}/${item.id}`;
  if (!auth.currentUser) {
    console.warn('Usuario no autenticado en Firebase. La generación se mantendrá en memoria local.');
    return;
  }

  try {
    const docRef = doc(db, GENERATIONS_COLLECTION, item.id);
    await setDoc(docRef, {
      ...item,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Update an existing generation (e.g. when completed, failed or favorited)
 */
export async function updateGeneration(id: string, updates: Partial<GenerationItem>): Promise<void> {
  const path = `${GENERATIONS_COLLECTION}/${id}`;
  if (!auth.currentUser) {
    return;
  }

  try {
    const docRef = doc(db, GENERATIONS_COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Delete a generation record
 */
export async function deleteGeneration(id: string): Promise<void> {
  const path = `${GENERATIONS_COLLECTION}/${id}`;
  if (!auth.currentUser) {
    return;
  }

  try {
    const docRef = doc(db, GENERATIONS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Toggle favorite status
 */
export async function toggleFavorite(id: string, currentStatus: boolean): Promise<void> {
  await updateGeneration(id, { isFavorite: !currentStatus });
}

/**
 * Subscribe to generations in real-time
 */
export function subscribeToUserGenerations(
  userId: string,
  userEmail: string | null | undefined,
  onData: (items: GenerationItem[]) => void,
  onError?: (error: Error) => void
): () => void {
  const path = GENERATIONS_COLLECTION;

  // Crucial: only attach listener if user is authenticated
  if (!auth.currentUser || !userId) {
    onData([]);
    return () => {};
  }

  const q = query(
    collection(db, path),
    where('userId', '==', userId)
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const items: GenerationItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ ...(docSnap.data() as GenerationItem), id: docSnap.id });
      });
      // Sort in memory by createdAt desc to avoid requiring composite indexes
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(items);
    },
    (error) => {
      console.warn('Error listening to generations in Firebase:', error.message);
      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (err) {
        // Handled format
      }
    }
  );

  return unsubscribe;
}

/**
 * Save user profile and preferences (like default Freepik API Key)
 */
export async function saveUserProfile(profile: Partial<UserProfile> & { uid: string; email: string }): Promise<void> {
  const path = `${USERS_COLLECTION}/${profile.uid}`;
  if (!auth.currentUser) {
    return;
  }

  try {
    const docRef = doc(db, USERS_COLLECTION, profile.uid);
    const existing = await getDoc(docRef);
    const isAdmin = profile.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    const dataToSave = {
      ...profile,
      isAdmin,
      updatedAt: new Date().toISOString(),
      ...(existing.exists() ? {} : { createdAt: new Date().toISOString() }),
    };

    await setDoc(docRef, dataToSave, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetch user profile
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `${USERS_COLLECTION}/${uid}`;
  if (!auth.currentUser) {
    return null;
  }

  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    try {
      handleFirestoreError(error, OperationType.GET, path);
    } catch {
      return null;
    }
  }
}
