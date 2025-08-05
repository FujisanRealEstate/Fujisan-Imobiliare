// Firebase Statistics Management
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, updateDoc, increment, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBttBExAw6WUhIFLzFYy8RnMU8lxp07tzk",
    authDomain: "fujisan-imobiliare.firebaseapp.com",
    projectId: "fujisan-imobiliare",
    storageBucket: "fujisan-imobiliare.firebasestorage.app",
    messagingSenderId: "400381645661",
    appId: "1:400381645661:web:66a79aa42934e7758c0eb4",
    measurementId: "G-5VP4RPYGZS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to increment visit counter
export async function incrementVisits() {
    try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        const visitsRef = doc(db, "statistics", "visits");
        
        // Get current data
        const visitsDoc = await getDoc(visitsRef);
        
        if (visitsDoc.exists()) {
            const data = visitsDoc.data();
            const lastUpdate = data.lastUpdate || '';
            
            // Update total visits
            await updateDoc(visitsRef, {
                total: increment(1),
                lastUpdate: today
            });
            
            // Reset today's count if it's a new day
            if (lastUpdate !== today) {
                await updateDoc(visitsRef, {
                    today: 1
                });
            } else {
                await updateDoc(visitsRef, {
                    today: increment(1)
                });
            }
        } else {
            // Create new document if it doesn't exist
            await setDoc(visitsRef, {
                total: 1,
                today: 1,
                lastUpdate: today
            });
        }
        
        console.log("Visit counter updated successfully");
    } catch (error) {
        console.error("Error updating visit counter:", error);
    }
}

// Function to get visit statistics
export async function getVisitStats() {
    try {
        const visitsDoc = await getDoc(doc(db, "statistics", "visits"));
        if (visitsDoc.exists()) {
            return visitsDoc.data();
        }
        return { total: 0, today: 0 };
    } catch (error) {
        console.error("Error getting visit stats:", error);
        return { total: 0, today: 0 };
    }
}

// Function to update property statistics
export async function updatePropertyStats(totalProperties, activeListings) {
    try {
        const propertiesRef = doc(db, "statistics", "properties");
        await setDoc(propertiesRef, {
            total: totalProperties,
            active: activeListings,
            lastUpdate: new Date()
        });
        console.log("Property stats updated successfully");
    } catch (error) {
        console.error("Error updating property stats:", error);
    }
}

// Function to get property statistics
export async function getPropertyStats() {
    try {
        const propertiesDoc = await getDoc(doc(db, "statistics", "properties"));
        if (propertiesDoc.exists()) {
            return propertiesDoc.data();
        }
        return { total: 0, active: 0 };
    } catch (error) {
        console.error("Error getting property stats:", error);
        return { total: 0, active: 0 };
    }
}

// Auto-increment visits when page loads (if not on profile page)
if (!window.location.pathname.includes('profile6752875.html')) {
    incrementVisits();
} 