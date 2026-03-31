// ============================================
// ECHOES - DEMO INTERACTIVE AVEC SWITCH FREEMIUM/PREMIUM
// ============================================

const STORAGE_KEYS = {
    POSTS: 'echoes_demo_posts',
    VIEWED: 'echoes_demo_viewed',
    USER: 'echoes_demo_user'
};

const IMAGES = {
    post1: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=600&fit=crop',
    post2: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    post3: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop'
};

const DEFAULT_POSTS = [
    {
        id: 1,
        userId: 2,
        userName: "Sarah",
        userAvatar: "S",
        mediaType: "photo",
        mediaUrl: IMAGES.post1,
        viewLimit: 500,
        viewCount: 179,
        status: "active",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        type: "ephemeral",
        isPremium: true,
        caption: "Coucher de soleil magique 🌅"
    },
    {
        id: 2,
        userId: 3,
        userName: "Thomas",
        userAvatar: "T",
        mediaType: "photo",
        mediaUrl: IMAGES.post2,
        viewLimit: 100,
        viewCount: 67,
        status: "active",
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        type: "ephemeral",
        isPremium: false,
        caption: "Aventure en montagne 🏔️"
    },
    {
        id: 3,
        userId: 4,
        userName: "Léa",
        userAvatar: "L",
        mediaType: "photo",
        mediaUrl: IMAGES.post3,
        viewLimit: 1000,
        viewCount: 342,
        status: "active",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        type: "ephemeral",
        isPremium: false,
        caption: "Balade en forêt 🌲"
    }
];

const DEFAULT_USER = {
    id: 1,
    name: "Moi",
    avatar: "M",
    isPremium: false
};

let currentUser;
let posts;
let viewedPosts;
let isDemoPremium = false; // État du switch (démo uniquement)

// ============================================
// PERSISTANCE
// ============================================

function savePosts() {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
}

function saveViewed() {
    localStorage.setItem(STORAGE_KEYS.VIEWED, JSON.stringify(viewedPosts));
}

function saveUser() {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
}

function loadData() {
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    } else {
        currentUser = { ...DEFAULT_USER };
    }
    
    const savedPosts = localStorage.getItem(STORAGE_KEYS.POSTS);
    if (savedPosts) {
        posts = JSON.parse(savedPosts);
        posts.forEach(post => {
            if (post.id === 1 && !post.mediaUrl) post.mediaUrl = IMAGES.post1;
            if (post.id === 2 && !post.mediaUrl) post.mediaUrl = IMAGES.post2;
            if (post.id === 3 && !post.mediaUrl) post.mediaUrl = IMAGES.post3;
        });
    } else {
        posts = JSON.parse(JSON.stringify(DEFAULT_POSTS));
    }
    
    const savedViewed = localStorage.getItem(STORAGE_KEYS.VIEWED);
    if (savedViewed) {
        viewedPosts = JSON.parse(savedViewed);
    } else {
        viewedPosts = [];
    }
}

function resetAllData() {
    posts = JSON.parse(JSON.stringify(DEFAULT_POSTS));
    savePosts();
    viewedPosts = [];
    saveViewed();
    currentUser = { ...DEFAULT_USER };
    saveUser();
    renderFeed();
    updateUserAvatar();
    updatePremiumUI();
    showNotification('🔄 Données réinitialisées ! Les posts sont revenus.', 'success');
}

// ============================================
// FONCTIONS MÉTIER
// ============================================

function formatTime(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60);
    
    if (diff < 1) return "à l'instant";
    if (diff < 60) return `il y a ${diff} min`;
    if (diff < 1440) return `il y a ${Math.floor(diff / 60)}h`;
    return `il y a ${Math.floor(diff / 1440)}j`;
}

function disappearPost(postId) {
    const postCard = document.querySelector(`.post-card[data-post-id="${postId}"]`);
    if (postCard) {
        postCard.classList.add('disappeared');
    }
    
    if (!viewedPosts.includes(postId)) {
        viewedPosts.push(postId);
        saveViewed();
    }
}

function addView(postId) {
    if (viewedPosts.includes(postId)) return false;
    
    const post = posts.find(p => p.id === postId);
    if (!post || post.status !== 'active') return false;
    if (post.type !== 'ephemeral') return false;
    
    post.viewCount++;
    viewedPosts.push(postId);
    
    savePosts();
    saveViewed();
    
    disappearPost(postId);
    
    if (post.viewCount >= post.viewLimit) {
        post.status = 'evaporated';
        savePosts();
        showNotification(`🌫️ Le post de ${post.userName} a atteint son quota et s'est évaporé pour tous !`, 'info');
    } else {
        showNotification(`👁️ Post vu ! Le post a disparu pour vous.`, 'success');
    }
    
    renderFeed();
    return true;
}

function viewPost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post || post.status !== 'active') return;
    if (viewedPosts.includes(postId)) {
        showNotification("Vous avez déjà vu ce post", "warning");
        return;
    }
    
    const postCard = document.querySelector(`.post-card[data-post-id="${postId}"]`);
    if (!postCard) return;
    
    const imageContainer = postCard.querySelector('.image-container');
    const postImage = postCard.querySelector('.post-image');
    const overlay = postCard.querySelector('.image-overlay');
    
    if (!imageContainer || !postImage) return;
    
    postImage.classList.remove('blurred');
    postImage.classList.add('revealed');
    if (overlay) overlay.classList.add('hidden');
    
    imageContainer.style.pointerEvents = 'none';
    
    const timerOverlay = document.createElement('div');
    timerOverlay.className = 'timer-overlay';
    timerOverlay.innerHTML = `
        <div class="timer-badge">
            <div class="timer-circle" id="timerCircle">5</div>
            <div class="timer-text">
                Visualisation<br>
                <span class="timer-warning">🔒 capture bloquée</span>
            </div>
        </div>
    `;
    
    imageContainer.style.position = 'relative';
    imageContainer.appendChild(timerOverlay);
    
    let seconds = 5;
    const timerCircle = timerOverlay.querySelector('#timerCircle');
    
    const interval = setInterval(() => {
        seconds--;
        if (timerCircle) timerCircle.textContent = seconds;
        
        if (seconds <= 0) {
            clearInterval(interval);
            timerOverlay.remove();
            imageContainer.style.pointerEvents = '';
            addView(postId);
        }
    }, 1000);
}

function createPost(mediaType, viewLimit, isPermanent = false) {
    const defaultImage = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop';
    
    const newPost = {
        id: Date.now(),
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        mediaType: mediaType,
        mediaUrl: defaultImage,
        viewLimit: isPermanent ? null : viewLimit,
        viewCount: 0,
        status: "pending",
        createdAt: new Date().toISOString(),
        type: isPermanent ? "permanent" : "ephemeral",
        isPremium: currentUser.isPremium || isDemoPremium,
        caption: isPermanent ? "📌 Post permanent (ne disparaît jamais)" : "Mon nouveau post 📸"
    };
    
    posts.unshift(newPost);
    savePosts();
    renderFeed();
    showNotification(`⏳ Post en cours de vérification... (max 15min)`, 'info');
    
    setTimeout(() => {
        newPost.status = "active";
        savePosts();
        renderFeed();
        if (isPermanent) {
            showNotification(`✅ Ton post permanent a été vérifié et publié ! Il ne disparaîtra jamais.`, 'success');
        } else {
            showNotification(`✅ Ton post a été vérifié et publié ! ${viewLimit} vues max.`, 'success');
        }
    }, 2000);
}

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notif = document.createElement('div');
    notif.className = 'notification';
    
    const icon = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    notif.innerHTML = `${icon} ${message}`;
    
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.remove();
    }, 3000);
}

// ============================================
// GESTION DU SWITCH FREEMIUM/PREMIUM
// ============================================

function updatePremiumUI() {
    const isPremium = isDemoPremium;
    const premiumBanner = document.getElementById('premiumBanner');
    const premiumFeaturesDemo = document.getElementById('premiumFeaturesDemo');
    const customQuotaContainer = document.getElementById('customQuotaContainer');
    const permanentOption = document.getElementById('permanentOption');
    const premiumNote = document.getElementById('premiumNote');
    const freemiumLabel = document.querySelector('.freemium-label');
    const premiumLabel = document.querySelector('.premium-label');
    
    // Mettre à jour les labels du switch
    if (freemiumLabel) {
        freemiumLabel.classList.toggle('active', !isPremium);
    }
    if (premiumLabel) {
        premiumLabel.classList.toggle('active', isPremium);
    }
    
    // Afficher/masquer les éléments UI
    if (premiumBanner) {
        premiumBanner.classList.toggle('hidden', isPremium);
    }
    if (premiumFeaturesDemo) {
        premiumFeaturesDemo.classList.toggle('hidden', !isPremium);
    }
    if (customQuotaContainer) {
        customQuotaContainer.style.display = isPremium ? 'block' : 'none';
    }
    if (permanentOption) {
        permanentOption.style.display = isPremium ? 'block' : 'none';
    }
    if (premiumNote) {
        if (isPremium) {
            premiumNote.innerHTML = '⭐ Mode Premium actif : quotas personnalisés (1 à 1M) + posts permanents disponibles !';
            premiumNote.style.background = 'rgba(16, 185, 129, 0.1)';
            premiumNote.style.color = '#10b981';
        } else {
            premiumNote.innerHTML = '⭐ Passez en mode Premium (switch ci-dessus) pour découvrir : quotas personnalisés, posts permanents';
            premiumNote.style.background = 'rgba(139, 92, 246, 0.1)';
            premiumNote.style.color = '#8b5cf6';
        }
    }
    
    renderFeed();
}

function initPremiumSwitch() {
    const switchInput = document.getElementById('premiumSwitch');
    const bannerUpgradeBtn = document.getElementById('bannerUpgradeBtn');
    
    if (switchInput) {
        switchInput.checked = isDemoPremium;
        switchInput.addEventListener('change', (e) => {
            isDemoPremium = e.target.checked;
            updatePremiumUI();
            showNotification(isDemoPremium ? '⭐ Mode Premium activé ! Découvrez les fonctionnalités exclusives' : '📱 Mode Freemium activé', 'info');
        });
    }
    
    if (bannerUpgradeBtn) {
        bannerUpgradeBtn.addEventListener('click', () => {
            if (switchInput) {
                switchInput.checked = true;
                isDemoPremium = true;
                updatePremiumUI();
                showNotification('⭐ Mode Premium activé ! Découvrez les fonctionnalités exclusives', 'success');
            }
        });
    }
}

// ============================================
// RENDU DU FEED
// ============================================

function renderFeed() {
    const feed = document.getElementById('feed');
    if (!feed) return;
    
    const visiblePosts = posts.filter(p => 
        (p.status === 'active' || p.status === 'pending') && 
        !viewedPosts.includes(p.id)
    );
    
    if (visiblePosts.length === 0) {
        feed.innerHTML = `
            <div class="empty-state">
                <span>🌊</span>
                <p>Plus aucun post à voir</p>
                <p style="font-size: 0.875rem;">Créez un nouveau post ou réinitialisez la démo</p>
                <button class="btn btn-primary" style="margin-top: 1rem;" id="resetFromEmpty">🔄 Réinitialiser la démo</button>
            </div>
        `;
        const resetBtn = document.getElementById('resetFromEmpty');
        if (resetBtn) {
            resetBtn.onclick = () => resetAllData();
        }
        return;
    }
    
    feed.innerHTML = visiblePosts.map(post => {
        const progress = post.status === 'active' && post.type === 'ephemeral' ? (post.viewCount / post.viewLimit) * 100 : 0;
        const remaining = post.status === 'active' && post.type === 'ephemeral' ? post.viewLimit - post.viewCount : null;
        const isPending = post.status === 'pending';
        const isPermanent = post.type === 'permanent';
        
        if (isPending) {
            return `
                <div class="post-card" data-post-id="${post.id}">
                    <div class="post-header">
                        <div class="post-avatar">${post.userAvatar}</div>
                        <div class="post-user">
                            <div class="post-name">${post.userName}</div>
                            <div class="post-time">${formatTime(post.createdAt)}</div>
                        </div>
                    </div>
                    <div class="post-media">
                        <div class="image-container" style="background: rgba(139, 92, 246, 0.1); height: 280px; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                            <span style="font-size: 2rem;">⏳</span>
                            <p>En cours de vérification...</p>
                            <p style="font-size: 0.7rem;">🛡️ Modération pré-publication</p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="post-card ${isPermanent ? 'premium-feature' : ''}" data-post-id="${post.id}">
                <div class="post-header">
                    <div class="post-avatar">${post.userAvatar}</div>
                    <div class="post-user">
                        <div class="post-name">
                            ${post.userName}
                            ${post.isPremium ? '<span class="post-badge">⭐ Premium</span>' : ''}
                            ${isPermanent ? '<span class="post-badge premium-active">📌 Permanent</span>' : ''}
                        </div>
                        <div class="post-time">${formatTime(post.createdAt)}</div>
                    </div>
                    <div class="post-menu">⋯</div>
                </div>
                ${post.caption ? `<div style="padding: 0 1.5rem 0.5rem; font-size: 0.875rem; color: var(--text-secondary);">${post.caption}</div>` : ''}
                <div class="post-media" data-post-id="${post.id}">
                    <div class="image-container" style="position: relative; width: 100%; height: 280px;">
                        <img src="${post.mediaUrl}" alt="Post image" class="post-image blurred" style="width: 100%; height: 100%; object-fit: cover;">
                        <div class="image-overlay">
                            <span>🔒</span>
                            <p>Cliquez pour révéler l'image</p>
                            <small>⏱️ Visualisation 5 secondes</small>
                            ${!isPermanent ? '<small>💨 Le post disparaîtra après</small>' : '<small>📌 Post permanent</small>'}
                        </div>
                    </div>
                </div>
                ${!isPermanent ? `
                    <div class="view-counter">
                        <span>👁️ ${post.viewCount} / ${post.viewLimit} vues</span>
                        <div class="view-progress">
                            <div class="view-progress-fill" style="width: ${progress}%;"></div>
                        </div>
                        <span>💨 ${remaining} restantes</span>
                    </div>
                ` : `
                    <div class="view-counter">
                        <span>📌 Post permanent</span>
                        <span>⭐ Premium</span>
                    </div>
                `}
                <div class="post-actions">
                    <button class="action-btn" onclick="viewPost(${post.id})">
                        👁️ Voir (5s)
                    </button>
                    <button class="action-btn">
                        🔄 ${post.type === 'permanent' ? '∞' : post.viewCount} vues
                    </button>
                    <button class="action-btn">
                        ⚡ ${post.type === 'permanent' ? '∞' : post.viewLimit} quota
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    document.querySelectorAll('.post-card').forEach(card => {
        const postId = parseInt(card.dataset.postId);
        const post = posts.find(p => p.id === postId);
        
        if (post && post.status === 'active' && !viewedPosts.includes(postId)) {
            const imageContainer = card.querySelector('.image-container');
            if (imageContainer) {
                imageContainer.style.cursor = 'pointer';
                imageContainer.onclick = (e) => {
                    e.stopPropagation();
                    viewPost(postId);
                };
            }
        }
    });
}

// ============================================
// INITIALISATION DE LA MODALE DE CRÉATION
// ============================================

function initCreateModal() {
    const modal = document.getElementById('createModal');
    const openBtn = document.getElementById('openCreateModal');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelPost');
    const publishBtn = document.getElementById('publishPost');
    const quotaOptions = document.querySelectorAll('.quota-option');
    const mediaPreview = document.getElementById('mediaPreview');
    const customQuotaInput = document.getElementById('customQuotaInput');
    const permanentCheckbox = document.getElementById('permanentCheckbox');
    
    let selectedQuota = 100;
    let selectedMedia = 'photo';
    
    if (openBtn) {
        openBtn.onclick = () => modal.classList.add('active');
    }
    
    const closeModal = () => modal.classList.remove('active');
    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;
    
    quotaOptions.forEach(opt => {
        opt.onclick = () => {
            quotaOptions.forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            selectedQuota = parseInt(opt.dataset.quota);
            if (customQuotaInput) customQuotaInput.value = '';
        };
    });
    
    if (customQuotaInput) {
        customQuotaInput.addEventListener('input', (e) => {
            if (e.target.value) {
                quotaOptions.forEach(o => o.classList.remove('selected'));
                selectedQuota = parseInt(e.target.value);
            }
        });
    }
    
    if (mediaPreview) {
        mediaPreview.onclick = () => {
            selectedMedia = selectedMedia === 'photo' ? 'video' : 'photo';
            mediaPreview.innerHTML = selectedMedia === 'photo' 
                ? '<span>📸</span><p>Photo sélectionnée</p>' 
                : '<span>🎬</span><p>Vidéo sélectionnée</p>';
        };
    }
    
    if (publishBtn) {
        publishBtn.onclick = () => {
            let finalQuota = selectedQuota;
            let isPermanent = false;
            
            if (isDemoPremium && permanentCheckbox && permanentCheckbox.checked) {
                isPermanent = true;
            } else if (isDemoPremium && customQuotaInput && customQuotaInput.value) {
                finalQuota = Math.min(Math.max(parseInt(customQuotaInput.value), 1), 1000000);
            } else if (!isDemoPremium && ![100, 500, 1000].includes(selectedQuota)) {
                showNotification('En mode Freemium, choisissez 100, 500 ou 1000 vues. Activez le mode Premium pour des quotas personnalisés !', 'warning');
                return;
            }
            
            createPost(selectedMedia, finalQuota, isPermanent);
            closeModal();
            
            if (permanentCheckbox) permanentCheckbox.checked = false;
            if (customQuotaInput) customQuotaInput.value = '';
            quotaOptions.forEach(o => o.classList.remove('selected'));
            document.querySelector('.quota-option[data-quota="100"]')?.classList.add('selected');
            selectedQuota = 100;
        };
    }
}

function updateUserAvatar() {
    const avatarElement = document.getElementById('userAvatar');
    if (avatarElement) {
        avatarElement.textContent = currentUser.avatar;
    }
}

function initActionButtons() {
    const notifBtn = document.getElementById('notifBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    if (notifBtn) {
        notifBtn.onclick = () => {
            const unseenCount = posts.filter(p => p.status === 'active' && !viewedPosts.includes(p.id)).length;
            if (unseenCount > 0) {
                showNotification(`🔔 Vous avez ${unseenCount} post${unseenCount > 1 ? 's' : ''} non vu${unseenCount > 1 ? 's' : ''} dans votre feed`, 'info');
            } else {
                showNotification('🔔 Aucun nouveau post à voir', 'info');
            }
        };
    }
    
    if (resetBtn) {
        resetBtn.onclick = () => {
            if (confirm('Réinitialiser toutes les données ? Les posts reviendront et les vues seront effacées.')) {
                resetAllData();
            }
        };
    }
}

function init() {
    loadData();
    updateUserAvatar();
    initCreateModal();
    initActionButtons();
    initPremiumSwitch();
    updatePremiumUI();
    renderFeed();
    
    setTimeout(() => {
        showNotification('👋 Bienvenue sur Echoes ! Activez le mode Premium (switch) pour découvrir les fonctionnalités exclusives', 'info');
    }, 500);
}

init();