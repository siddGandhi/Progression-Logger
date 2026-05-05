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

// db-service.js
export const workoutService = {
    async addWorkout(movement, reps, weight) {
        const now = new Date();

        // 1. Calculate the "Session Boundary" (3:00 AM today)
        const sessionBoundary = new Date(now);
        sessionBoundary.setHours(3, 0, 0, 0);

        // If it's currently between midnight and 3:00 AM, 
        // the "start" of this session's day was actually 3:00 AM yesterday
        if (now < sessionBoundary) {
            sessionBoundary.setDate(sessionBoundary.getDate() - 1);
        }

        const startOfSessionDay = sessionBoundary.toISOString();

        // 2. Check if a marker exists since the last 3:00 AM boundary
        const q = query(
            collection(db, WORKOUT_COLLECTION),
            where("date", ">=", startOfSessionDay),
            where("movement", "==", "DAILY_MARKER"), // Explicitly look for the banner
            limit(1)
        );

        const existingLogs = await getDocs(q);
        const isFirstOfSession = existingLogs.empty;

        // 3. Prepare and save the actual workout
        const workoutData = {
            movement,
            reps: Number(reps),
            weight: parseFloat(weight),
            date: new Date().toISOString()
        };
        const mainDoc = await addDoc(collection(db, WORKOUT_COLLECTION), workoutData);

        // 4. AUTOMATIC ENTRY: Add banner if this is a new session
        if (isFirstOfSession) {
            // We still want the banner to display the correct calendar date, 
            // but we'll anchor its time to 03:01 AM so it stays grouped
            const markerDate = new Date(sessionBoundary);
            markerDate.setMinutes(1);

            const autoEntryData = {
                movement: "DAILY_MARKER",
                reps: 10000,
                weight: 10000,
                date: markerDate.toISOString()
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
    },
};
