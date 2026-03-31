// ============================================
// ECHOES - DEMO INTERACTIVE AVEC GROUPES ET DISCUSSION
// ============================================

const STORAGE_KEYS = {
    POSTS: 'echoes_demo_posts',
    VIEWED: 'echoes_demo_viewed',
    USER: 'echoes_demo_user',
    GROUPS: 'echoes_demo_groups',
    GROUP_MEMBERS: 'echoes_demo_group_members',
    GROUP_MESSAGES: 'echoes_demo_group_messages'
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
        caption: "Coucher de soleil magique 🌅",
        groupId: null
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
        caption: "Aventure en montagne 🏔️",
        groupId: null
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
        caption: "Balade en forêt 🌲",
        groupId: null
    }
];

const DEFAULT_GROUPS = [
    {
        id: 101,
        name: "Photographes",
        description: "Partagez vos meilleurs clichés éphémères",
        visibility: "public",
        creatorId: 2,
        creatorName: "Sarah",
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        settings: { defaultViewLimit: 500, allowedMemberTypes: "all" }
    },
    {
        id: 102,
        name: "Voyageurs",
        description: "Partagez vos aventures avant qu'elles ne disparaissent",
        visibility: "public",
        creatorId: 3,
        creatorName: "Thomas",
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        settings: { defaultViewLimit: 1000, allowedMemberTypes: "all" }
    }
];

const DEFAULT_GROUP_MEMBERS = [
    { groupId: 101, userId: 2, userName: "Sarah", userAvatar: "S", role: "admin", joinedAt: new Date(Date.now() - 7 * 86400000).toISOString() },
    { groupId: 101, userId: 1, userName: "Moi", userAvatar: "M", role: "member", joinedAt: new Date(Date.now() - 6 * 86400000).toISOString() },
    { groupId: 102, userId: 3, userName: "Thomas", userAvatar: "T", role: "admin", joinedAt: new Date(Date.now() - 5 * 86400000).toISOString() },
    { groupId: 102, userId: 4, userName: "Léa", userAvatar: "L", role: "member", joinedAt: new Date(Date.now() - 4 * 86400000).toISOString() }
];

const DEFAULT_GROUP_MESSAGES = [
    { id: 1, groupId: 101, userId: 2, userName: "Sarah", userAvatar: "S", message: "Bienvenue dans le groupe Photographes ! Partagez vos plus beaux clichés 📸", createdAt: new Date(Date.now() - 6 * 86400000).toISOString() },
    { id: 2, groupId: 101, userId: 1, userName: "Moi", userAvatar: "M", message: "Super, hâte de partager !", createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
    { id: 3, groupId: 102, userId: 3, userName: "Thomas", userAvatar: "T", message: "Bienvenue aux voyageurs ! Racontez vos aventures ✈️", createdAt: new Date(Date.now() - 4 * 86400000).toISOString() },
    { id: 4, groupId: 102, userId: 4, userName: "Léa", userAvatar: "L", message: "Merci ! J'ai hâte de partager mes photos de rando 🏔️", createdAt: new Date(Date.now() - 3 * 86400000).toISOString() }
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
let groups;
let groupMembers;
let groupMessages;
let isDemoPremium = false;
let currentTab = 'feed';
let currentGroupDetail = null;
let currentInnerTab = 'discussion';

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

function saveGroups() {
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
}

function saveGroupMembers() {
    localStorage.setItem(STORAGE_KEYS.GROUP_MEMBERS, JSON.stringify(groupMembers));
}

function saveGroupMessages() {
    localStorage.setItem(STORAGE_KEYS.GROUP_MESSAGES, JSON.stringify(groupMessages));
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
    
    const savedGroups = localStorage.getItem(STORAGE_KEYS.GROUPS);
    if (savedGroups) {
        groups = JSON.parse(savedGroups);
    } else {
        groups = JSON.parse(JSON.stringify(DEFAULT_GROUPS));
    }
    
    const savedMembers = localStorage.getItem(STORAGE_KEYS.GROUP_MEMBERS);
    if (savedMembers) {
        groupMembers = JSON.parse(savedMembers);
    } else {
        groupMembers = JSON.parse(JSON.stringify(DEFAULT_GROUP_MEMBERS));
    }
    
    const savedMessages = localStorage.getItem(STORAGE_KEYS.GROUP_MESSAGES);
    if (savedMessages) {
        groupMessages = JSON.parse(savedMessages);
    } else {
        groupMessages = JSON.parse(JSON.stringify(DEFAULT_GROUP_MESSAGES));
    }
}

function resetAllData() {
    posts = JSON.parse(JSON.stringify(DEFAULT_POSTS));
    savePosts();
    viewedPosts = [];
    saveViewed();
    currentUser = { ...DEFAULT_USER };
    saveUser();
    groups = JSON.parse(JSON.stringify(DEFAULT_GROUPS));
    saveGroups();
    groupMembers = JSON.parse(JSON.stringify(DEFAULT_GROUP_MEMBERS));
    saveGroupMembers();
    groupMessages = JSON.parse(JSON.stringify(DEFAULT_GROUP_MESSAGES));
    saveGroupMessages();
    renderFeed();
    renderGroups();
    updateUserAvatar();
    updatePremiumUI();
    showNotification('🔄 Données réinitialisées !', 'success');
}

// ============================================
// FONCTIONS GROUPES ET DISCUSSION
// ============================================

function getUserGroups() {
    return groups.filter(group => 
        groupMembers.some(m => m.groupId === group.id && m.userId === currentUser.id)
    );
}

function getGroupMembers(groupId) {
    return groupMembers.filter(m => m.groupId === groupId);
}

function isGroupMember(groupId) {
    return groupMembers.some(m => m.groupId === groupId && m.userId === currentUser.id);
}

function getGroupMessages(groupId) {
    return groupMessages.filter(m => m.groupId === groupId).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

function sendGroupMessage(groupId, messageText) {
    if (!messageText.trim()) return;
    
    const newMessage = {
        id: Date.now(),
        groupId: groupId,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        message: messageText.trim(),
        createdAt: new Date().toISOString()
    };
    
    groupMessages.push(newMessage);
    saveGroupMessages();
    
    if (currentGroupDetail === groupId) {
        renderGroupDiscussion(groupId);
    }
    
    showNotification(`💬 Message envoyé dans le groupe`, 'success');
}

function joinGroup(groupId) {
    if (isGroupMember(groupId)) return false;
    
    const group = groups.find(g => g.id === groupId);
    if (!group) return false;
    
    if (group.visibility === 'private') {
        showNotification('🔒 Groupe privé - invitation requise', 'warning');
        return false;
    }
    
    groupMembers.push({
        groupId: groupId,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        role: 'member',
        joinedAt: new Date().toISOString()
    });
    saveGroupMembers();
    
    const welcomeMessage = {
        id: Date.now(),
        groupId: groupId,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        message: `🎉 ${currentUser.name} a rejoint le groupe !`,
        createdAt: new Date().toISOString()
    };
    groupMessages.push(welcomeMessage);
    saveGroupMessages();
    
    renderGroups();
    showNotification(`✅ Vous avez rejoint le groupe ${group.name}`, 'success');
    return true;
}

function leaveGroup(groupId) {
    const index = groupMembers.findIndex(m => m.groupId === groupId && m.userId === currentUser.id);
    if (index !== -1) {
        groupMembers.splice(index, 1);
        saveGroupMembers();
        renderGroups();
        if (currentGroupDetail === groupId) {
            closeGroupDetailModal();
        }
        showNotification(`👋 Vous avez quitté le groupe`, 'info');
    }
}

function createGroup(name, description, visibility, settings = {}) {
    if (!isDemoPremium && getUserGroups().length >= 3) {
        showNotification('⚠️ Version Freemium : limite de 3 groupes. Passez Premium pour plus de groupes !', 'warning');
        return false;
    }
    
    const newGroup = {
        id: Date.now(),
        name: name,
        description: description,
        visibility: visibility,
        creatorId: currentUser.id,
        creatorName: currentUser.name,
        createdAt: new Date().toISOString(),
        settings: { ...settings, isPremium: isDemoPremium }
    };
    
    groups.push(newGroup);
    saveGroups();
    
    groupMembers.push({
        groupId: newGroup.id,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        role: 'admin',
        joinedAt: new Date().toISOString()
    });
    saveGroupMembers();
    
    const welcomeMessage = {
        id: Date.now(),
        groupId: newGroup.id,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        message: `🎉 Bienvenue dans ${name} ! Ce groupe vient d'être créé.`,
        createdAt: new Date().toISOString()
    };
    groupMessages.push(welcomeMessage);
    saveGroupMessages();
    
    renderGroups();
    showNotification(`🎉 Groupe "${name}" créé avec succès !`, 'success');
    return true;
}

// ============================================
// RENDU DES DISCUSSIONS
// ============================================

function renderGroupDiscussion(groupId) {
    const chatContainer = document.getElementById('chatMessages');
    if (!chatContainer) return;
    
    const messages = getGroupMessages(groupId);
    
    if (messages.length === 0) {
        chatContainer.innerHTML = `
            <div class="empty-state" style="padding: 2rem;">
                <span>💬</span>
                <p>Aucun message pour l'instant</p>
                <p style="font-size: 0.75rem;">Soyez le premier à envoyer un message !</p>
            </div>
        `;
        return;
    }
    
    chatContainer.innerHTML = messages.map(msg => {
        const isOwn = msg.userId === currentUser.id;
        return `
            <div class="chat-message ${isOwn ? 'chat-message-own' : ''}">
                <div class="chat-message-avatar">${msg.userAvatar}</div>
                <div class="chat-message-content">
                    <div class="chat-message-header">
                        <span class="chat-message-name">${msg.userName}</span>
                        <span class="chat-message-time">${formatTime(msg.createdAt)}</span>
                    </div>
                    <div class="chat-message-text">${escapeHtml(msg.message)}</div>
                </div>
            </div>
        `;
    }).join('');
    
    // Scroll en bas
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// FONCTIONS MÉTIER EXISTANTES
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
    if (currentGroupDetail) renderGroupPosts(currentGroupDetail);
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

function createPost(mediaType, viewLimit, isPermanent = false, groupId = null) {
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
        caption: isPermanent ? "📌 Post permanent (ne disparaît jamais)" : "Mon nouveau post 📸",
        groupId: groupId
    };
    
    posts.unshift(newPost);
    savePosts();
    
    if (currentTab === 'feed') renderFeed();
    if (currentGroupDetail) renderGroupPosts(currentGroupDetail);
    
    showNotification(`⏳ Post en cours de vérification... (max 15min)`, 'info');
    
    setTimeout(() => {
        newPost.status = "active";
        savePosts();
        if (currentTab === 'feed') renderFeed();
        if (currentGroupDetail) renderGroupPosts(currentGroupDetail);
        if (isPermanent) {
            showNotification(`✅ Ton post permanent a été vérifié et publié !`, 'success');
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
// RENDU DES GROUPES ET DETAILS
// ============================================

function renderGroups() {
    const groupsList = document.getElementById('groupsList');
    if (!groupsList) return;
    
    const userGroups = getUserGroups();
    const publicGroups = groups.filter(g => g.visibility === 'public' && !isGroupMember(g.id));
    
    if (userGroups.length === 0 && publicGroups.length === 0) {
        groupsList.innerHTML = `
            <div class="empty-state">
                <span>👥</span>
                <p>Aucun groupe disponible</p>
                <p style="font-size: 0.875rem;">Créez votre premier groupe !</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    if (userGroups.length > 0) {
        html += `<div class="groups-section"><h3 style="margin: 1rem 0 0.5rem; font-size: 0.875rem; color: var(--text-secondary);">📌 Mes groupes</h3>`;
        html += userGroups.map(group => renderGroupCard(group, true)).join('');
        html += `</div>`;
    }
    
    if (publicGroups.length > 0) {
        html += `<div class="groups-section"><h3 style="margin: 1rem 0 0.5rem; font-size: 0.875rem; color: var(--text-secondary);">🌍 Groupes publics</h3>`;
        html += publicGroups.map(group => renderGroupCard(group, false)).join('');
        html += `</div>`;
    }
    
    groupsList.innerHTML = html;
    
    document.querySelectorAll('.group-card').forEach(card => {
        const groupId = parseInt(card.dataset.groupId);
        card.onclick = () => openGroupDetail(groupId);
        
        const joinBtn = card.querySelector('.join-group-btn');
        if (joinBtn) {
            joinBtn.onclick = (e) => {
                e.stopPropagation();
                joinGroup(groupId);
            };
        }
    });
}

function renderGroupCard(group, isMember) {
    const memberCount = getGroupMembers(group.id).length;
    const visibilityIcon = group.visibility === 'public' ? '🌍' : group.visibility === 'private' ? '🔒' : '🕶️';
    const visibilityText = group.visibility === 'public' ? 'Public' : group.visibility === 'private' ? 'Privé' : 'Caché';
    
    return `
        <div class="group-card" data-group-id="${group.id}">
            <div class="group-card-header">
                <div class="group-avatar">${visibilityIcon}</div>
                <div class="group-info">
                    <div class="group-name">
                        ${group.name}
                        ${group.settings?.isPremium ? '<span class="group-badge premium">⭐ Premium</span>' : ''}
                        <span class="group-badge private">${visibilityText}</span>
                    </div>
                    <div class="group-meta">Créé par ${group.creatorName} • ${formatTime(group.createdAt)}</div>
                </div>
            </div>
            ${group.description ? `<div class="group-description">${group.description}</div>` : ''}
            <div class="group-stats">
                <span>👥 ${memberCount} membre${memberCount > 1 ? 's' : ''}</span>
                <span>💬 ${getGroupMessages(group.id).length} messages</span>
                ${!isMember ? `<button class="join-group-btn" style="background: var(--accent); border: none; border-radius: 2rem; padding: 0.25rem 0.75rem; color: white; cursor: pointer; font-size: 0.7rem;">Rejoindre</button>` : ''}
            </div>
        </div>
    `;
}

function renderGroupPosts(groupId) {
    const container = document.getElementById('groupPostsList');
    if (!container) return;
    
    const groupPosts = posts.filter(p => p.groupId === groupId && p.status === 'active' && !viewedPosts.includes(p.id));
    
    if (groupPosts.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.8rem; text-align: center; padding: 2rem;">Aucun post dans ce groupe</p>';
        return;
    }
    
    container.innerHTML = groupPosts.map(post => `
        <div class="group-post-item" data-post-id="${post.id}">
            <div class="group-post-header">
                <span class="group-post-author">${post.userName}</span>
                <span class="group-post-time">${formatTime(post.createdAt)}</span>
            </div>
            ${post.caption ? `<div class="group-post-caption">${post.caption}</div>` : ''}
            <div class="group-post-stats">
                <span>👁️ ${post.viewCount}/${post.viewLimit} vues</span>
                <span>💨 ${post.viewLimit - post.viewCount} restantes</span>
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.group-post-item').forEach(item => {
        const postId = parseInt(item.dataset.postId);
        item.onclick = () => {
            const post = posts.find(p => p.id === postId);
            if (post && !viewedPosts.includes(postId)) {
                viewPost(postId);
            }
        };
    });
}

function renderGroupMembers(groupId) {
    const container = document.getElementById('groupMembersContainer');
    if (!container) return;
    
    const members = getGroupMembers(groupId);
    
    container.innerHTML = members.map(m => `
        <div class="group-member-item">
            <div class="group-member-avatar">${m.userAvatar}</div>
            <div class="group-member-info">
                <div class="group-member-name">${m.userName}</div>
                ${m.role === 'admin' ? '<div class="group-member-role">👑 Administrateur</div>' : ''}
            </div>
        </div>
    `).join('');
}

function switchInnerTab(tabId) {
    currentInnerTab = tabId;
    
    // Update tabs
    document.querySelectorAll('.group-inner-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.innerTab === tabId);
    });
    
    // Update content
    document.getElementById('groupDiscussionTab').classList.toggle('hidden', tabId !== 'discussion');
    document.getElementById('groupPostsTab').classList.toggle('hidden', tabId !== 'posts');
    document.getElementById('groupMembersTab').classList.toggle('hidden', tabId !== 'members');
    
    if (tabId === 'discussion' && currentGroupDetail) {
        renderGroupDiscussion(currentGroupDetail);
    }
    if (tabId === 'posts' && currentGroupDetail) {
        renderGroupPosts(currentGroupDetail);
    }
    if (tabId === 'members' && currentGroupDetail) {
        renderGroupMembers(currentGroupDetail);
    }
}

function openGroupDetail(groupId) {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    
    currentGroupDetail = groupId;
    currentInnerTab = 'discussion';
    
    document.getElementById('groupDetailTitle').textContent = group.name;
    
    // Reset tabs
    document.querySelectorAll('.group-inner-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.innerTab === 'discussion');
    });
    document.getElementById('groupDiscussionTab').classList.remove('hidden');
    document.getElementById('groupPostsTab').classList.add('hidden');
    document.getElementById('groupMembersTab').classList.add('hidden');
    
    renderGroupDiscussion(groupId);
    renderGroupPosts(groupId);
    renderGroupMembers(groupId);
    
    const leaveBtn = document.getElementById('leaveGroupBtn');
    if (leaveBtn) {
        leaveBtn.onclick = () => {
            if (confirm(`Quitter le groupe "${group.name}" ?`)) {
                leaveGroup(groupId);
            }
        };
    }
    
    document.getElementById('groupDetailModal').classList.add('active');
}

function closeGroupDetailModal() {
    document.getElementById('groupDetailModal').classList.remove('active');
    currentGroupDetail = null;
}

// ============================================
// RENDU DU FEED
// ============================================

function renderFeed() {
    const feed = document.getElementById('feed');
    if (!feed) return;
    
    const visiblePosts = posts.filter(p => 
        (p.status === 'active' || p.status === 'pending') && 
        !viewedPosts.includes(p.id) &&
        !p.groupId
    );
    
    if (visiblePosts.length === 0) {
        feed.innerHTML = `
            <div class="empty-state">
                <span>🌊</span>
                <p>Plus aucun post à voir dans le feed</p>
                <p style="font-size: 0.875rem;">Créez un post ou rejoignez des groupes !</p>
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
// UI ET INITIALISATION
// ============================================

function updatePremiumUI() {
    const isPremium = isDemoPremium;
    const premiumBanner = document.getElementById('premiumBanner');
    const premiumFeaturesDemo = document.getElementById('premiumFeaturesDemo');
    const customQuotaContainer = document.getElementById('customQuotaContainer');
    const permanentOption = document.getElementById('permanentOption');
    const premiumNote = document.getElementById('premiumNote');
    const groupSettingsPremium = document.getElementById('groupSettingsPremium');
    const premiumGroupNote = document.getElementById('premiumGroupNote');
    const freemiumLabel = document.querySelector('.freemium-label');
    const premiumLabel = document.querySelector('.premium-label');
    
    if (freemiumLabel) freemiumLabel.classList.toggle('active', !isPremium);
    if (premiumLabel) premiumLabel.classList.toggle('active', isPremium);
    if (premiumBanner) premiumBanner.classList.toggle('hidden', isPremium);
    if (premiumFeaturesDemo) premiumFeaturesDemo.classList.toggle('hidden', !isPremium);
    if (customQuotaContainer) customQuotaContainer.style.display = isPremium ? 'block' : 'none';
    if (permanentOption) permanentOption.style.display = isPremium ? 'block' : 'none';
    if (groupSettingsPremium) groupSettingsPremium.style.display = isPremium ? 'block' : 'none';
    
    if (premiumNote) {
        if (isPremium) {
            premiumNote.innerHTML = '⭐ Mode Premium actif : quotas personnalisés (1 à 1M) + posts permanents disponibles !';
            premiumNote.style.background = 'rgba(16, 185, 129, 0.1)';
            premiumNote.style.color = '#10b981';
        } else {
            premiumNote.innerHTML = '⭐ Passez en mode Premium (switch ci-dessus) pour découvrir : quotas personnalisés, posts permanents, groupes illimités';
            premiumNote.style.background = 'rgba(139, 92, 246, 0.1)';
            premiumNote.style.color = '#8b5cf6';
        }
    }
    
    if (premiumGroupNote) {
        if (isPremium) {
            premiumGroupNote.innerHTML = '⭐ Premium actif : groupes illimités, personnalisation avancée disponible !';
            premiumGroupNote.style.background = 'rgba(16, 185, 129, 0.1)';
            premiumGroupNote.style.color = '#10b981';
        } else {
            premiumGroupNote.innerHTML = '⭐ Premium : groupes illimités, personnalisation avancée. Passez Premium pour plus de groupes !';
            premiumGroupNote.style.background = 'rgba(139, 92, 246, 0.1)';
            premiumGroupNote.style.color = '#8b5cf6';
        }
    }
    
    renderFeed();
    renderGroups();
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

function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const feedView = document.getElementById('feed');
    const groupsView = document.getElementById('groupsView');
    const createBar = document.getElementById('createBar');
    const createGroupBar = document.getElementById('createGroupBar');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentTab = tab.dataset.tab;
            
            if (currentTab === 'feed') {
                feedView.classList.remove('hidden');
                groupsView.classList.add('hidden');
                createBar.classList.remove('hidden');
                createGroupBar.classList.add('hidden');
                renderFeed();
            } else {
                feedView.classList.add('hidden');
                groupsView.classList.remove('hidden');
                createBar.classList.add('hidden');
                createGroupBar.classList.remove('hidden');
                renderGroups();
            }
        });
    });
}

function initInnerTabs() {
    const tabs = document.querySelectorAll('.group-inner-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchInnerTab(tab.dataset.innerTab);
        });
    });
}

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
    const groupSelect = document.getElementById('groupSelect');
    
    let selectedQuota = 100;
    let selectedMedia = 'photo';
    
    if (openBtn) {
        openBtn.onclick = () => {
            const groupsList = getUserGroups();
            if (groupSelect) {
                groupSelect.innerHTML = '<option value="">Mon feed public</option>';
                groupsList.forEach(group => {
                    groupSelect.innerHTML += `<option value="${group.id}">👥 ${group.name}</option>`;
                });
            }
            modal.classList.add('active');
        };
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
            let groupId = groupSelect ? (groupSelect.value ? parseInt(groupSelect.value) : null) : null;
            
            if (isDemoPremium && permanentCheckbox && permanentCheckbox.checked) {
                isPermanent = true;
            } else if (isDemoPremium && customQuotaInput && customQuotaInput.value) {
                finalQuota = Math.min(Math.max(parseInt(customQuotaInput.value), 1), 1000000);
            } else if (!isDemoPremium && ![100, 500, 1000].includes(selectedQuota)) {
                showNotification('En mode Freemium, choisissez 100, 500 ou 1000 vues. Activez le mode Premium pour des quotas personnalisés !', 'warning');
                return;
            }
            
            createPost(selectedMedia, finalQuota, isPermanent, groupId);
            closeModal();
            
            if (permanentCheckbox) permanentCheckbox.checked = false;
            if (customQuotaInput) customQuotaInput.value = '';
            quotaOptions.forEach(o => o.classList.remove('selected'));
            document.querySelector('.quota-option[data-quota="100"]')?.classList.add('selected');
            selectedQuota = 100;
        };
    }
}

function initCreateGroupModal() {
    const modal = document.getElementById('createGroupModal');
    const openBtn = document.getElementById('openCreateGroupModal');
    const closeBtn = document.getElementById('closeGroupModal');
    const cancelBtn = document.getElementById('cancelGroup');
    const createBtn = document.getElementById('createGroupBtn');
    const groupNameInput = document.getElementById('groupNameInput');
    const groupDescInput = document.getElementById('groupDescInput');
    const visibilityRadios = document.querySelectorAll('input[name="visibility"]');
    const customQuotaGroup = document.getElementById('customQuotaGroup');
    const mixedMembers = document.getElementById('mixedMembers');
    
    if (openBtn) {
        openBtn.onclick = () => modal.classList.add('active');
    }
    
    const closeModal = () => modal.classList.remove('active');
    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;
    
    if (createBtn) {
        createBtn.onclick = () => {
            const name = groupNameInput?.value.trim();
            if (!name) {
                showNotification('Veuillez entrer un nom de groupe', 'warning');
                return;
            }
            
            let visibility = 'public';
            visibilityRadios.forEach(radio => {
                if (radio.checked) visibility = radio.value;
            });
            
            const settings = {};
            if (isDemoPremium) {
                if (customQuotaGroup?.checked) settings.customQuota = true;
                if (mixedMembers?.checked) settings.allowedMemberTypes = 'all';
            }
            
            createGroup(name, groupDescInput?.value || '', visibility, settings);
            closeModal();
            groupNameInput.value = '';
            groupDescInput.value = '';
        };
    }
}

function initChat() {
    const sendBtn = document.getElementById('sendChatMessage');
    const input = document.getElementById('chatMessageInput');
    
    if (sendBtn && input) {
        sendBtn.onclick = () => {
            if (currentGroupDetail && input.value.trim()) {
                sendGroupMessage(currentGroupDetail, input.value);
                input.value = '';
            }
        };
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && currentGroupDetail && input.value.trim()) {
                sendGroupMessage(currentGroupDetail, input.value);
                input.value = '';
            }
        });
    }
}

function initCreateGroupPost() {
    const createBtn = document.getElementById('createGroupPostFromModal');
    if (createBtn) {
        createBtn.onclick = () => {
            document.getElementById('openCreateModal').click();
            window.pendingGroupId = currentGroupDetail;
        };
    }
}

function initActionButtons() {
    const notifBtn = document.getElementById('notifBtn');
    const resetBtn = document.getElementById('resetBtn');
    const closeGroupDetail = document.getElementById('closeGroupDetailModal');
    
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
    
    if (closeGroupDetail) {
        closeGroupDetail.onclick = () => closeGroupDetailModal();
    }
    
    window.onclick = (e) => {
        const modal = document.getElementById('groupDetailModal');
        if (e.target === modal) closeGroupDetailModal();
    };
}

function updateUserAvatar() {
    const avatarElement = document.getElementById('userAvatar');
    if (avatarElement) {
        avatarElement.textContent = currentUser.avatar;
    }
}

function init() {
    loadData();
    updateUserAvatar();
    initCreateModal();
    initCreateGroupModal();
    initActionButtons();
    initPremiumSwitch();
    initTabs();
    initInnerTabs();
    initChat();
    initCreateGroupPost();
    updatePremiumUI();
    
    setTimeout(() => {
        showNotification('👋 Bienvenue sur Echoes ! Explorez les groupes et discutez avec les membres !', 'info');
    }, 500);
}

init();