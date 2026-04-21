// db-service.js
import { db } from "./firebase-config.js";
import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    doc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const WORKOUT_COLLECTION = "workouts";

export const workoutService = {
    // Add a simple workout log
    async addWorkout(movement, reps, weight) {
        const docData = {
            movement,
            reps: Number(reps),
            weight: parseFloat(weight),
            date: new Date().toISOString()
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