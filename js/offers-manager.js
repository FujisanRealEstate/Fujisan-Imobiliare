// Offers Management System
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

// Admin emails
const ADMIN_EMAILS = ['matbajean@gmail.com', 'fujisanimobiliare@gmail.com'];

// Global variables
let currentUser = null;
let offers = [];

// Check if user is admin
function isAdmin(user) {
    return user && ADMIN_EMAILS.includes(user.email);
}

// Check if user is authenticated
function isAuthenticated(user) {
    return user !== null;
}

// Add offer button to pages
function addOfferButton() {
    if (!currentUser) return;

    const addButton = document.createElement('button');
    addButton.className = 'add-offer-btn';
    addButton.innerHTML = '<i class="fas fa-plus"></i> Adaugă Ofertă';
    addButton.onclick = showAddOfferModal;

    // Add to page
    const mainContent = document.querySelector('.main');
    if (mainContent) {
        mainContent.appendChild(addButton);
    }
}

// Show add offer modal
function showAddOfferModal() {
    const modal = document.createElement('div');
    modal.className = 'offer-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-plus-circle"></i> Adaugă Ofertă Nouă</h3>
                <button class="close-btn" onclick="this.closest('.offer-modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <form id="addOfferForm">
                <div class="form-group">
                    <label for="offerTitle">Titlu Ofertă *</label>
                    <input type="text" id="offerTitle" required placeholder="Ex: Apartament 3 camere centru">
                </div>
                
                <div class="form-group">
                    <label for="offerCategory">Categorie *</label>
                    <select id="offerCategory" required>
                        <option value="">Selectează categoria</option>
                        <option value="vanzare">Vânzare</option>
                        <option value="cumparare">Cumpărare</option>
                        <option value="inchiriere">Închiriere</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="offerPrice">Preț (RON)</label>
                    <input type="number" id="offerPrice" placeholder="Ex: 150000">
                </div>
                
                <div class="form-group">
                    <label for="offerLocation">Locație</label>
                    <input type="text" id="offerLocation" placeholder="Ex: Râmnicu Vâlcea, centru">
                </div>
                
                <div class="form-group">
                    <label for="offerDescription">Descriere *</label>
                    <textarea id="offerDescription" required rows="4" placeholder="Descrie detaliile ofertei..."></textarea>
                </div>
                
                <div class="form-group">
                    <label for="offerImages">Poze (URL-uri separate prin virgulă)</label>
                    <textarea id="offerImages" rows="3" placeholder="https://example.com/poza1.jpg, https://example.com/poza2.jpg"></textarea>
                </div>
                
                <div class="form-group">
                    <label for="offerContact">Contact</label>
                    <input type="text" id="offerContact" placeholder="Telefon sau email">
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="this.closest('.offer-modal').remove()">
                        <i class="fas fa-times"></i> Anulează
                    </button>
                    <button type="submit" class="btn-primary">
                        <i class="fas fa-save"></i> Salvează Oferta
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Handle form submission
    document.getElementById('addOfferForm').addEventListener('submit', handleAddOffer);
}

// Handle add offer form submission
async function handleAddOffer(event) {
    event.preventDefault();
    
    const formData = {
        title: document.getElementById('offerTitle').value,
        category: document.getElementById('offerCategory').value,
        price: document.getElementById('offerPrice').value || null,
        location: document.getElementById('offerLocation').value || '',
        description: document.getElementById('offerDescription').value,
        images: document.getElementById('offerImages').value.split(',').map(url => url.trim()).filter(url => url),
        contact: document.getElementById('offerContact').value || '',
        createdBy: currentUser.email,
        createdAt: new Date(),
        status: 'active'
    };

    try {
        await addDoc(collection(db, "offers"), formData);
        alert('Oferta a fost adăugată cu succes!');
        document.querySelector('.offer-modal').remove();
        loadOffers(); // Reload offers if on offers page
    } catch (error) {
        console.error('Error adding offer:', error);
        alert('Eroare la adăugarea ofertei: ' + error.message);
    }
}

// Load offers from Firebase
async function loadOffers(category = null) {
    try {
        let q = collection(db, "offers");
        
        if (category) {
            q = query(q, where("category", "==", category), where("status", "==", "active"));
        } else {
            q = query(q, where("status", "==", "active"));
        }
        
        q = query(q, orderBy("createdAt", "desc"));
        
        const querySnapshot = await getDocs(q);
        offers = [];
        
        querySnapshot.forEach((doc) => {
            offers.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        displayOffers();
    } catch (error) {
        console.error('Error loading offers:', error);
    }
}

// Display offers on page
function displayOffers() {
    const offersContainer = document.getElementById('offersContainer');
    if (!offersContainer) return;

    if (offers.length === 0) {
        offersContainer.innerHTML = '<div class="no-offers"><i class="fas fa-info-circle"></i> Nu există oferte disponibile momentan.</div>';
        return;
    }

    offersContainer.innerHTML = offers.map(offer => `
        <div class="offer-card" data-offer-id="${offer.id}">
            <div class="offer-images">
                ${offer.images && offer.images.length > 0 
                    ? `<img src="${offer.images[0]}" alt="${offer.title}" onerror="this.src='images/bama.png'">`
                    : '<img src="images/bama.png" alt="No image">'
                }
            </div>
            <div class="offer-content">
                <h3 class="offer-title">${offer.title}</h3>
                <div class="offer-meta">
                    <span class="offer-category ${offer.category}">
                        <i class="fas fa-${getCategoryIcon(offer.category)}"></i>
                        ${getCategoryName(offer.category)}
                    </span>
                    ${offer.price ? `<span class="offer-price">${offer.price} RON</span>` : ''}
                    ${offer.location ? `<span class="offer-location"><i class="fas fa-map-marker-alt"></i> ${offer.location}</span>` : ''}
                </div>
                <p class="offer-description">${offer.description}</p>
                ${offer.contact ? `<div class="offer-contact"><i class="fas fa-phone"></i> ${offer.contact}</div>` : ''}
                <div class="offer-date">
                    <i class="fas fa-calendar"></i>
                    ${new Date(offer.createdAt.toDate()).toLocaleDateString('ro-RO')}
                </div>
                ${isAdmin(currentUser) ? `
                    <button class="delete-offer-btn" onclick="deleteOffer('${offer.id}')">
                        <i class="fas fa-trash"></i> Șterge
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Get category icon
function getCategoryIcon(category) {
    const icons = {
        'vanzare': 'home',
        'cumparare': 'search',
        'inchiriere': 'key'
    };
    return icons[category] || 'tag';
}

// Get category name
function getCategoryName(category) {
    const names = {
        'vanzare': 'Vânzare',
        'cumparare': 'Cumpărare',
        'inchiriere': 'Închiriere'
    };
    return names[category] || category;
}

// Delete offer (admin only)
async function deleteOffer(offerId) {
    if (!isAdmin(currentUser)) {
        alert('Nu ai permisiunea să ștergi oferte!');
        return;
    }

    if (!confirm('Ești sigur că vrei să ștergi această ofertă?')) {
        return;
    }

    try {
        await deleteDoc(doc(db, "offers", offerId));
        alert('Oferta a fost ștearsă cu succes!');
        loadOffers(); // Reload offers
    } catch (error) {
        console.error('Error deleting offer:', error);
        alert('Eroare la ștergerea ofertei: ' + error.message);
    }
}

// Initialize offers manager
function initOffersManager() {
    // Auth state observer
    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        
        // Add offer button if user is authenticated
        if (isAuthenticated(user)) {
            addOfferButton();
        }
        
        // Load offers if on offers page
        const offersContainer = document.getElementById('offersContainer');
        if (offersContainer) {
            loadOffers();
        }
    });
}

// Export functions
window.deleteOffer = deleteOffer;
window.showAddOfferModal = showAddOfferModal;

// Export for module usage
export { loadOffers, deleteOffer, showAddOfferModal };

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOffersManager);
} else {
    initOffersManager();
} 