// Visit Counter Script
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
async function incrementVisits() {
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
        
        // Update the display
        updateVisitDisplay();
    } catch (error) {
        console.error("Error updating visit counter:", error);
    }
}

// Function to update visit display
async function updateVisitDisplay() {
    try {
        const visitsDoc = await getDoc(doc(db, "statistics", "visits"));
        if (visitsDoc.exists()) {
            const data = visitsDoc.data();
            const todayElement = document.getElementById('todayVisits');
            const totalElement = document.getElementById('totalVisits');
            
            if (todayElement) {
                todayElement.textContent = data.today || 0;
            }
            if (totalElement) {
                totalElement.textContent = data.total || 0;
            }
        }
    } catch (error) {
        console.error("Error updating visit display:", error);
    }
}

// Check if we should increment visits (not on profile page)
if (!window.location.pathname.includes('profile6752875.html')) {
    // Increment visits when page loads
    incrementVisits();
    
    // Also update display periodically
    setInterval(updateVisitDisplay, 30000); // Update every 30 seconds
} 