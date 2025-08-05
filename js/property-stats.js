// Property Statistics Management
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// Function to count properties from Oferte directory structure
function countProperties() {
    // This would need to be updated based on your actual property structure
    // For now, we'll use a static count based on the Oferte directory
    const propertyFolders = [
        '2 camere, 2 garsoniere, Saturn',
        'Apartament centru',
        'Apartament Kaufland',
        'Apartament Ostroveni',
        'Apartament Ostroveni in C',
        'Balcesti',
        'Bar inchiriere',
        'Bar vanzare',
        'Budesti oferte',
        'Bujoreni',
        'Caciulata teren',
        'Casa Balota',
        'Casa Cazanesti',
        'Casa Ciofrangeni',
        'Casa Inchiriere Autogara',
        'Casa pe Strada Campului',
        'Cauta Apartament 60k',
        'Cauta Apartament Libertatii',
        'Cauta casa langa Rm. Valcea',
        'Cauta Teren',
        'Hala Neamt',
        'Hala Neptun',
        'Hala Valcea',
        'Pausesti Maglasi',
        'Romanor',
        'Spatiu Queeen Inchiriere',
        'Teren Budesti',
        'Teren Buleta',
        'Teren Cerna_Maciuca',
        'Teren Daesti',
        'Teren Maciuca',
        'Teren Padure Maciuca'
    ];
    
    return {
        total: propertyFolders.length,
        active: propertyFolders.length // Assuming all are active for now
    };
}

// Function to update property statistics
export async function updatePropertyStats() {
    try {
        const stats = countProperties();
        const propertiesRef = doc(db, "statistics", "properties");
        
        await setDoc(propertiesRef, {
            total: stats.total,
            active: stats.active,
            lastUpdate: new Date()
        });
        
        console.log("Property stats updated successfully:", stats);
        return stats;
    } catch (error) {
        console.error("Error updating property stats:", error);
        return { total: 0, active: 0 };
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

// Function to update property stats on page load (only on profile page)
if (window.location.pathname.includes('profile6752875.html')) {
    updatePropertyStats();
} 