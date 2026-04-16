// db-service.js
import { db } from "./firebase-config.js";
import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    limit,
    orderBy,
    doc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const WORKOUT_COLLECTION = "workouts";

export const workoutService = {
    // Add a workout with "First of Day" detection
    async addWorkout(movement, reps, weight) {
        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();

        // Check if a workout has already been logged today
        const q = query(
            collection(db, WORKOUT_COLLECTION),
            where("date", ">=", startOfDay),
            limit(1)
        );

        const existingLogs = await getDocs(q);
        const isFirst = existingLogs.empty;

        const docData = {
            movement,
            reps: Number(reps),
            weight: parseFloat(weight),
            date: new Date().toISOString(),
            isFirstOfDay: isFirst // The new boolean flag
        };

        return await addDoc(collection(db, WORKOUT_COLLECTION), docData);
    },

    async getAllWorkouts() {
        const q = query(collection(db, WORKOUT_COLLECTION), orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async deleteWorkout(id) {
        return await deleteDoc(doc(db, WORKOUT_COLLECTION, id));
    }
};