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
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const WORKOUT_COLLECTION = "workouts";

export const workoutService = {
    // Add a simple workout log
    async addWorkout(movement, reps, weight) {
        const now = new Date();
        // Get the start of the current day in ISO format
        const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();

        // 1. Check if any workout exists for today
        const q = query(
            collection(db, WORKOUT_COLLECTION),
            where("date", ">=", startOfDay),
            limit(1)
        );
        const existingLogs = await getDocs(q);
        const isFirstOfDay = existingLogs.empty;

        // 2. Prepare and save the actual workout
        const workoutData = {
            movement,
            reps: Number(reps),
            weight: parseFloat(weight),
            date: new Date().toISOString()
        };
        const mainDoc = await addDoc(collection(db, WORKOUT_COLLECTION), workoutData);

        // 3. AUTOMATIC ENTRY: If this was the first log of the day, add the "10000" entry
        if (isFirstOfDay) {
            // Create a date object for the current moment
            const markerDate = new Date();
            // Force it to 1 minute past midnight
            markerDate.setHours(0, 1, 0, 0);

            const autoEntryData = {
                movement: "DAILY_MARKER",
                reps: 10000,
                weight: 10000,
                date: markerDate.toISOString() // Now saves as 00:01:00
            };
            await addDoc(collection(db, WORKOUT_COLLECTION), autoEntryData);
        }

        return mainDoc;
    },

    async swapWeightAndReps(id, currentWeight, currentReps) {
        const workoutRef = doc(db, WORKOUT_COLLECTION, id);
        return await updateDoc(workoutRef, {
            weight: parseFloat(currentReps), // Swap reps into weight
            reps: Number(currentWeight)      // Swap weight into reps
        });
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