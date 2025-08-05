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
                    <label>Poze</label>
                    <div class="upload-area" id="offerUploadArea">
                        <input type="file" id="offerImages" multiple accept="image/*" class="file-input">
                        <div class="upload-icon">📁</div>
                        <div class="upload-text">Trage imaginile aici sau click pentru a selecta</div>
                        <div class="upload-hint">Suportă drag & drop, paste și selectare din fișier</div>
                    </div>
                    
                    <div class="upload-stats" id="offerUploadStats" style="display: none;">
                        <div class="stat-item">
                            <div class="stat-number" id="totalOfferFiles">0</div>
                            <div class="stat-label">Total fișiere</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number" id="uploadedOfferFiles">0</div>
                            <div class="stat-label">Încărcate</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number" id="failedOfferFiles">0</div>
                            <div class="stat-label">Eșuate</div>
                        </div>
                    </div>
                    
                    <div class="upload-progress" id="offerUploadProgress">
                        <div class="progress-bar" id="offerProgressBar"></div>
                    </div>
                    
                    <div class="image-preview-container" id="offerImagePreview"></div>
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

    // Initialize upload functionality for the offer modal
    initOfferUpload();
    
    // Handle form submission
    document.getElementById('addOfferForm').addEventListener('submit', handleAddOffer);
}

// Initialize upload functionality for offers
function initOfferUpload() {
    const uploadArea = document.getElementById('offerUploadArea');
    const fileInput = document.getElementById('offerImages');
    const imagePreview = document.getElementById('offerImagePreview');
    const uploadStats = document.getElementById('offerUploadStats');
    
    // Drag and drop functionality
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        addOfferFiles(files);
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        addOfferFiles(files);
    });
    
    // Paste functionality
    document.addEventListener('paste', (e) => {
        if (document.getElementById('offerUploadArea')) {
            const items = Array.from(e.clipboardData.items);
            const files = items
                .filter(item => item.type.startsWith('image/'))
                .map(item => item.getAsFile());
            if (files.length > 0) {
                addOfferFiles(files);
            }
        }
    });
    
    // Click to select files
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    function addOfferFiles(files) {
        files.forEach(file => {
            if (file.type.startsWith('image/') && !window.selectedOfferFiles.find(f => f.name === file.name && f.size === file.size)) {
                window.selectedOfferFiles.push(file);
                createOfferImagePreview(file);
            }
        });
        updateOfferStats();
    }
    
    function createOfferImagePreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'image-preview-item';
            previewItem.innerHTML = `
                <img src="${e.target.result}" alt="${file.name}">
                <button type="button" class="remove-btn" onclick="removeOfferFile('${file.name}', ${file.size})">×</button>
            `;
            imagePreview.appendChild(previewItem);
        };
        reader.readAsDataURL(file);
    }
    
    window.removeOfferFile = function(fileName, fileSize) {
        window.selectedOfferFiles = window.selectedOfferFiles.filter(f => !(f.name === fileName && f.size === fileSize));
        updateOfferStats();
        // Remove preview
        const previewItems = imagePreview.querySelectorAll('.image-preview-item');
        previewItems.forEach(item => {
            const img = item.querySelector('img');
            if (img.alt === fileName) {
                item.remove();
            }
        });
    };
    
    function updateOfferStats() {
        const totalFiles = document.getElementById('totalOfferFiles');
        const uploadedFiles = document.getElementById('uploadedOfferFiles');
        const failedFiles = document.getElementById('failedOfferFiles');
        
        totalFiles.textContent = window.selectedOfferFiles.length;
        uploadedFiles.textContent = '0';
        failedFiles.textContent = '0';
        
        if (window.selectedOfferFiles.length > 0) {
            uploadStats.style.display = 'flex';
        } else {
            uploadStats.style.display = 'none';
        }
    }
}

// Handle add offer form submission
async function handleAddOffer(event) {
    event.preventDefault();
    
    // Initialize selected files array if not exists
    if (!window.selectedOfferFiles) {
        window.selectedOfferFiles = [];
    }
    
    // Handle image uploads first
    let imageUrls = [];
    
    if (window.selectedOfferFiles.length > 0) {
        try {
            const uploadProgress = document.getElementById('offerUploadProgress');
            const progressBar = document.getElementById('offerProgressBar');
            const uploadedFiles = document.getElementById('uploadedOfferFiles');
            const failedFiles = document.getElementById('failedOfferFiles');
            
            uploadProgress.style.display = 'block';
            
            let uploaded = 0;
            let failed = 0;
            
            imageUrls = await uploadImagesToImageKit(window.selectedOfferFiles, (progress) => {
                progressBar.style.width = progress + '%';
            }, (success) => {
                if (success) {
                    uploaded++;
                    uploadedFiles.textContent = uploaded;
                } else {
                    failed++;
                    failedFiles.textContent = failed;
                }
            });
        } catch (error) {
            console.error('Error uploading images:', error);
            const continueWithoutImages = confirm('Eroare la încărcarea imaginilor: ' + error.message + '\n\nDorești să continui fără imagini?');
            if (!continueWithoutImages) {
                return;
            }
            // Continue without images
            imageUrls = [];
        } finally {
            const uploadProgress = document.getElementById('offerUploadProgress');
            const progressBar = document.getElementById('offerProgressBar');
            uploadProgress.style.display = 'none';
            progressBar.style.width = '0%';
        }
    }
    
    const formData = {
        title: document.getElementById('offerTitle').value,
        category: document.getElementById('offerCategory').value,
        price: document.getElementById('offerPrice').value || null,
        location: document.getElementById('offerLocation').value || '',
        description: document.getElementById('offerDescription').value,
        images: imageUrls,
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

// Upload images to ImageKit
async function uploadImagesToImageKit(files, progressCallback, statusCallback) {
    const imageUrls = [];
    const imageKitConfig = {
        publicKey: 'public_UFJStOhYLxOl6tm4ku61BDsF+uo=',
        urlEndpoint: 'https://ik.imagekit.io/biihsnqf1'
    };
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('publicKey', imageKitConfig.publicKey);
        formData.append('fileName', `offer_${Date.now()}_${i}`);
        formData.append('useUniqueFileName', 'true');
        formData.append('folder', '/fujisan-offers');
        
        try {
            const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                },
                body: formData
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('ImageKit upload error:', response.status, errorText);
                if (statusCallback) statusCallback(false);
                throw new Error(`Upload failed: ${response.status} - ${errorText}`);
            }
            
            const result = await response.json();
            if (result.url) {
                imageUrls.push(result.url);
                if (statusCallback) statusCallback(true);
            } else {
                if (statusCallback) statusCallback(false);
                throw new Error('No URL returned from ImageKit');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            if (statusCallback) statusCallback(false);
            throw error;
        }
        
        // Update progress
        if (progressCallback) {
            const progress = ((i + 1) / files.length) * 100;
            progressCallback(progress);
        }
    }
    
    return imageUrls;
}

// Load offers from Firebase
async function loadOffers(category = null) {
    try {
        let q = collection(db, "offers");
        
        if (category) {
            q = query(q, where("category", "==", category));
        }
        
        const querySnapshot = await getDocs(q);
        offers = [];
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            offers.push({
                id: doc.id,
                ...data
            });
        });
        
        // Sort offers by createdAt date (newest first)
        offers.sort((a, b) => {
            if (a.createdAt && b.createdAt) {
                return b.createdAt.toDate() - a.createdAt.toDate();
            }
            return 0;
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
    
    // Update search list
    updateSearchList();
}

// Update search list with current offers
function updateSearchList() {
    const searchList = document.getElementById('myUL');
    if (!searchList) return;
    
    searchList.innerHTML = offers.map(offer => `
        <li style="border: 1px solid #ddd; background-color: #f6f6f6; padding: 12px; font-size: 18px; color: black; display: block;">
            <a href="#offer-${offer.id}" class="a">${offer.title}</a>
        </li>
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
        
        // Initialize search functionality
        initSearch();
    });
}

// Initialize search functionality
function initSearch() {
    const searchInput = document.getElementById('myInput');
    const searchList = document.getElementById('myUL');
    
    if (searchInput && searchList) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const listItems = searchList.getElementsByTagName('li');
            
            for (let i = 0; i < listItems.length; i++) {
                const item = listItems[i];
                const text = item.textContent || item.innerText;
                
                if (text.toLowerCase().includes(searchTerm)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            }
        });
    }
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