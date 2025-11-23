// ==========================================================================
// Profile Page Script: скрипт для отдельной страницы личного кабинета
// ==========================================================================

// Проверка авторизации: редирект на главную если пользователь не авторизован
function checkAuth() {
  const savedUser = localStorage.getItem('currentUser');
  if (!savedUser) {
    window.location.href = 'index.html';
    return;
  }
  currentUser = JSON.parse(savedUser);
  loadProfile();
  if (currentUser.role === 'admin') {
    showAdminTabs();
    renderAdminUsers();
    renderAdminChat();
  } else {
    showUserTabs();
    renderUserCourses();
    renderUserChat();
  }
}

// Инициализация страницы профиля
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  initProfileTabs();
  initProfileActions();
  initLogout();
  initAdminChatResponse();
});

// Инициализация выхода из системы
function initLogout() {
  const logoutBtn = document.getElementById('logout-btn');
  logoutBtn?.addEventListener('click', () => {
    currentUser = null;
    saveToStorage();
    window.location.href = 'index.html';
  });
}

// Инициализация ответа админа пользователю в чате поддержки
function initAdminChatResponse() {
  const adminChatSend = document.getElementById('admin-chat-send');
  const adminChatInput = document.getElementById('admin-chat-input');
  const adminChatUserSelect = document.getElementById('admin-chat-user-select');

  // Загрузка списка пользователей для выбора
  function loadUsersForChat() {
    if (!adminChatUserSelect) return;
    
    const usersWithMessages = [...new Set(chatMessages
      .filter(msg => (msg.role === 'user' || msg.role === 'guest') && msg.user !== 'Гость')
      .map(msg => msg.user))];
    
    adminChatUserSelect.innerHTML = '<option value="">Выберите пользователя для ответа</option>';
    usersWithMessages.forEach(username => {
      const user = testUsers.find(u => u.username === username);
      const option = document.createElement('option');
      option.value = username;
      option.textContent = user ? (user.fullName || user.name) : username;
      adminChatUserSelect.appendChild(option);
    });
  }

  // Отправка ответа админа пользователю
  function sendAdminResponse() {
    const selectedUser = adminChatUserSelect?.value;
    const message = adminChatInput?.value.trim();

    if (!selectedUser) {
      alert('Пожалуйста, выберите пользователя для ответа');
      return;
    }

    if (!message) {
      alert('Пожалуйста, введите ответ');
      return;
    }

    const adminMessage = {
      id: Date.now(),
      text: message,
      user: 'admin',
      userName: currentUser.name || 'Администратор',
      targetUser: selectedUser,
      timestamp: new Date().toISOString(),
      role: 'admin'
    };

    chatMessages.push(adminMessage);
    saveToStorage();
    renderAdminChat();
    renderUserChat();
    if (adminChatInput) adminChatInput.value = '';
  }

  adminChatSend?.addEventListener('click', sendAdminResponse);
  adminChatInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendAdminResponse();
    }
  });

  // Обновление списка пользователей при переключении на вкладку чата
  const adminSupportTab = document.querySelector('[data-tab="admin-support"]');
  adminSupportTab?.addEventListener('click', () => {
    setTimeout(() => {
      loadUsersForChat();
      renderAdminChat();
    }, 100);
  });

  loadUsersForChat();
}

