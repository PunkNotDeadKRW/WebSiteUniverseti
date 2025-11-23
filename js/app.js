// ==========================================================================
// Application State: глобальные переменные состояния приложения
// ==========================================================================

let currentUser = null;
let chatMessages = [];
let enrolledCourses = {};
let userAccessCourses = {};

// Тестовые пользователи
const testUsers = [
  { username: 'admin', password: 'admin', email: 'admin@school.com', name: 'Администратор', fullName: 'Администратор', phone: '', photo: '', role: 'admin' },
  { username: 'user', password: 'user', email: 'user@school.com', name: 'Пользователь', fullName: 'Иванов Иван Иванович', phone: '+7 (999) 123-45-67', photo: '', role: 'user' }
];

const courses = [
  { id: 'level1', name: 'Уровень 1', type: 'level' },
  { id: 'level2', name: 'Уровень 2', type: 'level' },
  { id: 'level3', name: 'Уровень 3', type: 'level' },
  { id: 'level4', name: 'Уровень 4', type: 'level' },
  { id: 'individual', name: 'Индивидуальные занятия', type: 'individual' }
];

// Загрузка данных из localStorage: восстановление состояния после перезагрузки страницы
function loadFromStorage() {
  const savedUser = localStorage.getItem('currentUser');
  const savedChat = localStorage.getItem('chatMessages');
  const savedUsers = localStorage.getItem('users');
  const savedEnrollments = localStorage.getItem('enrolledCourses');
  const savedAccess = localStorage.getItem('userAccessCourses');
  
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    updateAuthUI();
  }
  
  if (savedChat) {
    chatMessages = JSON.parse(savedChat);
    renderChatMessages();
  }
  
  if (savedUsers) {
    const users = JSON.parse(savedUsers);
    testUsers.push(...users);
  }

  if (savedEnrollments) {
    enrolledCourses = JSON.parse(savedEnrollments);
  }

  if (savedAccess) {
    userAccessCourses = JSON.parse(savedAccess);
  }
}

// Сохранение данных в localStorage: сохранение текущего состояния в браузере
function saveToStorage() {
  if (currentUser) {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  } else {
    localStorage.removeItem('currentUser');
  }
  localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
  localStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourses));
  localStorage.setItem('userAccessCourses', JSON.stringify(userAccessCourses));
}

// ==========================================================================
// Discount Carousel: карусель скидки 10% с автоматической сменой слайдов
// ==========================================================================

function initDiscountCarousel() {
  const slides = document.querySelectorAll('.discount-slide');
  if (slides.length === 0) return;
  
  let currentSlide = 0;
  
  setInterval(() => {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
  }, 4000);
}

// ==========================================================================
// Authentication: система авторизации и регистрации пользователей
// ==========================================================================

function initAuth() {
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const loginModal = document.getElementById('login-modal');
  const registerModal = document.getElementById('register-modal');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const loginClose = document.getElementById('login-close');
  const registerClose = document.getElementById('register-close');

  loginBtn?.addEventListener('click', () => {
    loginModal?.classList.add('show');
  });

  registerBtn?.addEventListener('click', () => {
    registerModal?.classList.add('show');
  });

  loginClose?.addEventListener('click', () => {
    loginModal?.classList.remove('show');
  });

  registerClose?.addEventListener('click', () => {
    registerModal?.classList.remove('show');
  });

  loginModal?.addEventListener('click', (e) => {
    if (e.target === loginModal) {
      loginModal.classList.remove('show');
    }
  });

  registerModal?.addEventListener('click', (e) => {
    if (e.target === registerModal) {
      registerModal.classList.remove('show');
    }
  });

  loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    const user = testUsers.find(u => u.username === username && u.password === password);
    
    if (user) {
      currentUser = { ...user };
      saveToStorage();
      updateAuthUI();
      loginModal.classList.remove('show');
      loginForm.reset();
      alert('Вы успешно вошли в систему!');
    } else {
      alert('Неверный логин или пароль');
    }
  });

  registerForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const name = document.getElementById('register-name').value;
    
    if (testUsers.find(u => u.username === username)) {
      alert('Пользователь с таким логином уже существует');
      return;
    }
    
    const newUser = { 
      username, 
      password, 
      email, 
      name, 
      fullName: name,
      phone: '',
      photo: '',
      role: 'user' 
    };
    testUsers.push(newUser);
    
    const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    savedUsers.push(newUser);
    localStorage.setItem('users', JSON.stringify(savedUsers));
    
    currentUser = { ...newUser };
    saveToStorage();
    updateAuthUI();
    registerModal.classList.remove('show');
    registerForm.reset();
    alert('Регистрация успешна! Вы вошли в систему.');
  });

  logoutBtn?.addEventListener('click', () => {
    currentUser = null;
    saveToStorage();
    updateAuthUI();
    alert('Вы вышли из системы');
  });
}

// Обновление UI авторизации: кнопки входа/регистрации меняются на кнопку профиля
function updateAuthUI() {
  const authMenu = document.getElementById('auth-menu');
  const userMenu = document.getElementById('user-menu');
  
  if (currentUser) {
    // Показываем меню пользователя (кнопка "Профиль" и "Выход")
    authMenu?.classList.add('hidden');
    userMenu?.classList.remove('hidden');
  } else {
    // Показываем меню авторизации (кнопки "Вход" и "Регистрация")
    authMenu?.classList.remove('hidden');
    userMenu?.classList.add('hidden');
  }
}

// ==========================================================================
// Profile Management: управление профилем пользователя (админ/пользователь)
// ==========================================================================

function showAdminTabs() {
  document.getElementById('admin-tabs').classList.remove('hidden');
  document.getElementById('user-tabs').classList.add('hidden');
  switchTab('admin-profile');
}

function showUserTabs() {
  document.getElementById('user-tabs').classList.remove('hidden');
  document.getElementById('admin-tabs').classList.add('hidden');
  switchTab('user-profile');
}

function initProfileTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-tab');
      switchTab(tabName);
    });
  });
}

function switchTab(tabName) {
  // Убираем активность со всех кнопок и вкладок
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });

  // Активируем выбранную вкладку
  const btn = document.querySelector(`[data-tab="${tabName}"]`);
  const content = document.getElementById(tabName);
  
  if (btn) btn.classList.add('active');
  if (content) content.classList.add('active');

  // Обновляем данные при переключении
  if (tabName === 'admin-users') {
    renderAdminUsers();
  } else if (tabName === 'admin-support') {
    renderAdminChat();
  } else if (tabName === 'user-courses') {
    renderUserCourses();
  } else if (tabName === 'user-support') {
    renderUserChat();
  }
}

function loadProfile() {
  if (!currentUser) return;
  
  if (currentUser.role === 'admin') {
    document.getElementById('admin-profile-name').textContent = currentUser.name || 'Администратор';
    document.getElementById('admin-profile-username').textContent = currentUser.username;
    document.getElementById('admin-profile-email').textContent = currentUser.email;
    document.getElementById('admin-profile-role').textContent = 'Администратор';
  } else {
    // Загружаем фото
    const photoElement = document.getElementById('user-profile-photo');
    if (currentUser.photo) {
      photoElement.innerHTML = `<img src="${currentUser.photo}" alt="Фото профиля">`;
    } else {
      photoElement.innerHTML = `
        <div class="photo-placeholder">
          <span>📷</span>
          <small>Фото профиля</small>
        </div>
      `;
    }

    document.getElementById('user-profile-fullname').value = currentUser.fullName || currentUser.name || '';
    document.getElementById('user-profile-email').value = currentUser.email || '';
    document.getElementById('user-profile-phone').value = currentUser.phone || '';
  }
}

function initProfileActions() {
  // Загрузка фото
  const photoInput = document.getElementById('photo-input');
  const uploadBtn = document.getElementById('upload-photo-btn');
  const saveProfileBtn = document.getElementById('save-profile-btn');

  uploadBtn?.addEventListener('click', () => {
    photoInput?.click();
  });

  photoInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        currentUser.photo = event.target.result;
        loadProfile();
        saveToStorage();
      };
      reader.readAsDataURL(file);
    }
  });

  // Сохранение профиля
  saveProfileBtn?.addEventListener('click', () => {
    if (!currentUser) return;
    
    currentUser.fullName = document.getElementById('user-profile-fullname').value;
    currentUser.email = document.getElementById('user-profile-email').value;
    currentUser.phone = document.getElementById('user-profile-phone').value;
    
    // Обновляем в массиве пользователей
    const userIndex = testUsers.findIndex(u => u.username === currentUser.username);
    if (userIndex !== -1) {
      testUsers[userIndex] = { ...testUsers[userIndex], ...currentUser };
    }
    
    // Сохраняем в localStorage
    const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const savedUserIndex = savedUsers.findIndex(u => u.username === currentUser.username);
    if (savedUserIndex !== -1) {
      savedUsers[savedUserIndex] = { ...savedUsers[savedUserIndex], ...currentUser };
    } else {
      savedUsers.push(currentUser);
    }
    localStorage.setItem('users', JSON.stringify(savedUsers));
    
    saveToStorage();
    alert('Профиль успешно сохранен!');
  });
}

// ==========================================================================
// Admin Users Management: управление пользователями для администратора
// ==========================================================================

function renderAdminUsers() {
  const usersList = document.getElementById('users-list');
  if (!usersList) return;

  usersList.innerHTML = '';
  
  // Показываем всех пользователей кроме текущего админа
  const usersToShow = testUsers.filter(u => u.username !== currentUser?.username);
  
  if (usersToShow.length === 0) {
    usersList.innerHTML = '<p style="text-align: center; color: #718096;">Нет зарегистрированных пользователей</p>';
    return;
  }

  usersToShow.forEach(user => {
    const userItem = document.createElement('div');
    userItem.className = 'user-item';
    
    const accessCourses = userAccessCourses[user.username] || [];
    
    userItem.innerHTML = `
      <div class="user-item-header">
        <div class="user-item-info">
          <h4>${user.fullName || user.name || user.username}</h4>
          <p>${user.email} | Логин: ${user.username}</p>
        </div>
      </div>
      <div class="user-courses-select">
        <label>Доступные курсы:</label>
        <div class="course-checkbox-group">
          ${courses.map(course => `
            <div class="course-checkbox">
              <input 
                type="checkbox" 
                id="course-${user.username}-${course.id}" 
                value="${course.id}"
                ${accessCourses.includes(course.id) ? 'checked' : ''}
              >
              <label for="course-${user.username}-${course.id}">${course.name}</label>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    // Добавляем обработчики чекбоксов
    courses.forEach(course => {
      const checkbox = userItem.querySelector(`#course-${user.username}-${course.id}`);
      checkbox.addEventListener('change', () => {
        if (!userAccessCourses[user.username]) {
          userAccessCourses[user.username] = [];
        }
        
        if (checkbox.checked) {
          if (!userAccessCourses[user.username].includes(course.id)) {
            userAccessCourses[user.username].push(course.id);
          }
        } else {
          userAccessCourses[user.username] = userAccessCourses[user.username].filter(c => c !== course.id);
        }
        
        saveToStorage();
      });
    });
    
    usersList.appendChild(userItem);
  });
}

// ==========================================================================
// Course Enrollment: функция записи на курс с выпадающим списком курсов
// ==========================================================================

function initEnrollment() {
  const enrollModal = document.getElementById('enroll-modal');
  const enrollForm = document.getElementById('enroll-form');
  const enrollClose = document.getElementById('enroll-close');
  const enrollButtons = document.querySelectorAll('.enroll-btn');
  const enrollCourseSelect = document.getElementById('enroll-course-select');
  const enrollCourseHidden = document.getElementById('enroll-course');

  // Обработка клика на кнопки "Записаться на курс"
  enrollButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const courseName = btn.getAttribute('data-course');
      
      // Устанавливаем выбранный курс в селекте
      if (enrollCourseSelect) {
        // Находим опцию по значению
        const options = enrollCourseSelect.options;
        for (let i = 0; i < options.length; i++) {
          if (options[i].value === courseName || options[i].value.includes(courseName.split(' ')[0])) {
            enrollCourseSelect.selectedIndex = i;
            break;
          }
        }
        // Если курс не найден, пытаемся найти похожий
        if (enrollCourseSelect.value === '') {
          if (courseName.includes('1')) {
            enrollCourseSelect.value = 'Уровень 1';
          } else if (courseName.includes('2')) {
            enrollCourseSelect.value = 'Уровень 2';
          } else if (courseName.includes('3')) {
            enrollCourseSelect.value = 'Уровень 3';
          } else if (courseName.includes('4')) {
            enrollCourseSelect.value = 'Уровень 4';
          } else if (courseName.includes('Индивидуальные')) {
            enrollCourseSelect.value = 'Индивидуальные занятия';
          }
        }
      }
      
      // Сохраняем выбранный курс в скрытое поле
      if (enrollCourseHidden && enrollCourseSelect) {
        enrollCourseHidden.value = enrollCourseSelect.value;
      }
      
      // Открываем модальное окно
      enrollModal.classList.add('show');
    });
  });

  // Обновление скрытого поля при изменении селекта
  enrollCourseSelect?.addEventListener('change', () => {
    if (enrollCourseHidden) {
      enrollCourseHidden.value = enrollCourseSelect.value;
    }
  });

  // Закрытие модального окна
  enrollClose?.addEventListener('click', () => {
    enrollModal.classList.remove('show');
    enrollForm.reset();
  });

  enrollModal?.addEventListener('click', (e) => {
    if (e.target === enrollModal) {
      enrollModal.classList.remove('show');
      enrollForm.reset();
    }
  });

  // Обработка отправки формы записи на курс
  enrollForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('Пожалуйста, войдите в систему для записи на курс');
      enrollModal.classList.remove('show');
      // Открываем окно входа
      setTimeout(() => {
        document.getElementById('login-modal')?.classList.add('show');
      }, 300);
      return;
    }

    const courseName = enrollCourseSelect?.value || enrollCourseHidden?.value;
    const firstName = document.getElementById('enroll-firstname').value;
    const lastName = document.getElementById('enroll-lastname').value;
    const email = document.getElementById('enroll-email').value;
    const phone = document.getElementById('enroll-phone').value;

    // Валидация телефона (+7 или +82)
    const phoneRegex = /^(\+7|\+82)\s?\(?\d{1,3}\)?\s?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
    if (!phoneRegex.test(phone)) {
      alert('Пожалуйста, введите корректный номер телефона (формат: +7 или +82)');
      return;
    }

    if (!courseName) {
      alert('Пожалуйста, выберите курс');
      return;
    }

    // Сохраняем запись на курс
    if (!enrolledCourses[currentUser.username]) {
      enrolledCourses[currentUser.username] = [];
    }

    const enrollment = {
      id: Date.now(),
      course: courseName,
      firstName,
      lastName,
      email,
      phone,
      date: new Date().toISOString(),
      status: 'active'
    };

    enrolledCourses[currentUser.username].push(enrollment);
    saveToStorage();

    // Закрываем форму записи
    enrollModal.classList.remove('show');
    enrollForm.reset();

    // Показываем модальное окно благодарности
    showThankYouModal(firstName);

    // Обновляем отображение курсов, если открыт личный кабинет
    if (currentUser.role === 'user') {
      renderUserCourses();
    }
  });
}

// Показ модального окна благодарности: отображается после успешной записи
function showThankYouModal(firstName) {
  const thankYouModal = document.getElementById('thank-you-modal');
  const thankYouName = document.getElementById('thank-you-name');

  if (thankYouName) {
    thankYouName.textContent = firstName;
  }

  if (thankYouModal) {
    thankYouModal.classList.add('show');
  }
}

// Инициализация модального окна благодарности: обработчики закрытия
function initThankYouModal() {
  const thankYouModal = document.getElementById('thank-you-modal');
  const thankYouClose = document.getElementById('thank-you-close');
  const thankYouOk = document.getElementById('thank-you-ok');

  // Закрытие по кнопке X
  thankYouClose?.addEventListener('click', () => {
    thankYouModal?.classList.remove('show');
  });

  // Закрытие по кнопке "Понятно"
  thankYouOk?.addEventListener('click', () => {
    thankYouModal?.classList.remove('show');
  });

  // Закрытие по клику вне модального окна
  thankYouModal?.addEventListener('click', (e) => {
    if (e.target === thankYouModal) {
      thankYouModal.classList.remove('show');
    }
  });
}

// ==========================================================================
// User Courses: отображение курсов пользователя в личном кабинете
// ==========================================================================

// Рендеринг курсов пользователя: отображение записанных курсов с блоками обучения
function renderUserCourses() {
  const myCoursesList = document.getElementById('my-courses-list');
  if (!myCoursesList || !currentUser) return;

  const userCourses = enrolledCourses[currentUser.username] || [];
  
  if (userCourses.length === 0) {
    myCoursesList.innerHTML = '<p class="no-courses">У вас пока нет записанных курсов. Запишитесь на курс, чтобы начать обучение!</p>';
    return;
  }

  myCoursesList.innerHTML = '';
  
  // Данные для блоков обучения по курсам
  const courseLessons = {
    'Уровень 1': [
      { title: 'Урок 1: Хангыль - основы', description: 'Изучение базовых букв корейского алфавита', progress: 0 },
      { title: 'Урок 2: Простые слова', description: 'Основные слова и фразы для повседневного общения', progress: 0 },
      { title: 'Урок 3: Грамматика начального уровня', description: 'Простые грамматические структуры', progress: 0 },
      { title: 'Урок 4: Практика произношения', description: 'Тренировка правильного произношения звуков', progress: 0 }
    ],
    'Уровень 2': [
      { title: 'Урок 1: Повседневные диалоги', description: 'Разговорные ситуации в быту', progress: 0 },
      { title: 'Урок 2: Средняя грамматика', description: 'Более сложные грамматические конструкции', progress: 0 },
      { title: 'Урок 3: Чтение текстов', description: 'Работа с простыми текстами', progress: 0 },
      { title: 'Урок 4: Письмо', description: 'Написание предложений и коротких текстов', progress: 0 }
    ],
    'Уровень 3': [
      { title: 'Урок 1: Сложная грамматика', description: 'Углубленное изучение грамматики', progress: 0 },
      { title: 'Урок 2: Чтение новостей', description: 'Работа с новостными статьями', progress: 0 },
      { title: 'Урок 3: Деловая переписка', description: 'Формальный стиль общения', progress: 0 },
      { title: 'Урок 4: Разговорная практика', description: 'Практика свободного общения', progress: 0 }
    ],
    'Уровень 4': [
      { title: 'Урок 1: Продвинутая грамматика', description: 'Сложные грамматические конструкции', progress: 0 },
      { title: 'Урок 2: Литературные тексты', description: 'Чтение и анализ литературных произведений', progress: 0 },
      { title: 'Урок 3: Профессиональный корейский', description: 'Язык для работы и бизнеса', progress: 0 },
      { title: 'Урок 4: Подготовка к TOPIK', description: 'Подготовка к экзамену TOPIK', progress: 0 }
    ],
    'Индивидуальные занятия': [
      { title: 'Персональный урок 1', description: 'Индивидуальная программа обучения', progress: 0 },
      { title: 'Персональный урок 2', description: 'Фокус на ваших целях изучения', progress: 0 },
      { title: 'Персональный урок 3', description: 'Интенсивная практика', progress: 0 }
    ]
  };
  
  userCourses.forEach(enrollment => {
    const courseItem = document.createElement('div');
    courseItem.className = 'course-item';
    courseItem.style.marginBottom = '2rem';
    
    const lessons = courseLessons[enrollment.course] || [];
    
    let lessonsHTML = '';
    if (lessons.length > 0) {
      lessonsHTML = '<div class="course-lessons" style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 2px solid rgba(102, 126, 234, 0.1);">';
      lessonsHTML += '<h5 style="margin-bottom: 1rem; color: #1a1a2e; font-weight: 600;">Блоки обучения:</h5>';
      lessonsHTML += '<div style="display: grid; gap: 1rem;">';
      lessons.forEach((lesson, index) => {
        lessonsHTML += `
          <div class="lesson-block" style="background: rgba(248, 249, 255, 0.8); padding: 1.25rem; border-radius: 12px; border: 1px solid rgba(102, 126, 234, 0.1);">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
              <div>
                <h6 style="color: #1a1a2e; font-weight: 600; margin-bottom: 0.25rem; font-size: 1.05rem;">${lesson.title}</h6>
                <p style="color: #4a5568; font-size: 0.9rem; margin-bottom: 0.75rem;">${lesson.description}</p>
              </div>
            </div>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <button class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.9rem;">Начать урок</button>
              <span style="color: #718096; font-size: 0.85rem;">Прогресс: ${lesson.progress}%</span>
            </div>
          </div>
        `;
      });
      lessonsHTML += '</div></div>';
    }
    
    courseItem.innerHTML = `
      <div class="course-item-info">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
          <div>
            <h4 style="color: #1a1a2e; font-weight: 700; margin-bottom: 0.5rem; font-size: 1.5rem;">${enrollment.course}</h4>
            <p style="color: #718096; font-size: 0.95rem;">Записано: ${new Date(enrollment.date).toLocaleDateString('ru-RU')}</p>
          </div>
          <div class="course-status ${enrollment.status}" style="padding: 0.5rem 1rem; border-radius: 20px; font-weight: 600; font-size: 0.85rem;">
            ${enrollment.status === 'active' ? 'Активен' : 'Завершен'}
          </div>
        </div>
        ${lessonsHTML}
      </div>
    `;
    myCoursesList.appendChild(courseItem);
  });
}

// ==========================================================================
// Navigation: навигация по странице и мобильное меню
// ==========================================================================

function initNavigation() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const navList = document.querySelector('.nav-list');
  
  mobileToggle?.addEventListener('click', () => {
    navList?.classList.toggle('active');
  });

  document.addEventListener('click', (e) => {
    if (mobileToggle && navList && !mobileToggle.contains(e.target) && !navList.contains(e.target)) {
      navList.classList.remove('active');
    }
  });

  const coursesLink = document.getElementById('courses-link');
  const coursesDropdown = document.getElementById('courses-dropdown');
  
  coursesLink?.addEventListener('click', (e) => {
    e.preventDefault();
    const coursesSection = document.getElementById('courses');
    if (coursesSection) {
      coursesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  coursesDropdown?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const coursesSection = document.getElementById('courses');
      if (coursesSection) {
        coursesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => {
          const level = link.getAttribute('data-level');
          const courseCard = document.querySelector(`[data-level="${level}"]`);
          if (courseCard) {
            courseCard.style.transform = 'scale(1.05)';
            courseCard.style.boxShadow = '0 12px 40px rgba(102, 126, 234, 0.4)';
            setTimeout(() => {
              courseCard.style.transform = '';
              courseCard.style.boxShadow = '';
            }, 2000);
          }
        }, 500);
      }
    });
  });
}

// ==========================================================================
// Support Chat: система чата поддержки (виджет и в личном кабинете)
// ==========================================================================

function initSupportChat() {
  const chatWidget = document.getElementById('support-chat-widget');
  const chatToggle = document.getElementById('chat-toggle');
  const chatHeader = document.getElementById('chat-header');
  const chatSend = document.getElementById('chat-send');
  const chatInput = document.getElementById('chat-input');
  let isCollapsed = false;

  chatToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    isCollapsed = !isCollapsed;
    chatWidget?.classList.toggle('collapsed', isCollapsed);
    chatToggle.textContent = isCollapsed ? '+' : '−';
  });

  chatHeader?.addEventListener('click', (e) => {
    if (e.target !== chatToggle) {
      isCollapsed = !isCollapsed;
      chatWidget?.classList.toggle('collapsed', isCollapsed);
      chatToggle.textContent = isCollapsed ? '+' : '−';
    }
  });

  function sendMessage() {
    const message = chatInput?.value.trim();
    if (!message) return;

    const newMessage = {
      id: Date.now(),
      text: message,
      user: currentUser ? currentUser.username : 'Гость',
      userName: currentUser ? (currentUser.fullName || currentUser.name) : 'Гость',
      timestamp: new Date().toISOString(),
      role: currentUser ? currentUser.role : 'guest'
    };

    chatMessages.push(newMessage);
    saveToStorage();
    renderChatMessages();
    chatInput.value = '';
    
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: 'Спасибо за ваш вопрос! Наш администратор свяжется с вами в ближайшее время.',
        user: 'bot',
        userName: 'Поддержка',
        timestamp: new Date().toISOString(),
        role: 'bot'
      };
      chatMessages.push(botResponse);
      saveToStorage();
      renderChatMessages();
    }, 1000);
  }

  chatSend?.addEventListener('click', sendMessage);
  
  chatInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
}

// Рендеринг чата поддержки: отображение только сообщений текущего пользователя или гостя
function renderChatMessages() {
  const chatMessagesContainer = document.getElementById('chat-messages');
  if (!chatMessagesContainer) return;

  chatMessagesContainer.innerHTML = '';
  
  const welcomeMsg = document.createElement('div');
  welcomeMsg.className = 'chat-message bot';
  welcomeMsg.innerHTML = '<p>Добро пожаловать! Задайте ваш вопрос, и мы обязательно ответим.</p>';
  chatMessagesContainer.appendChild(welcomeMsg);

  // Фильтруем сообщения для текущего пользователя/гостя
  const currentUsername = currentUser ? currentUser.username : 'Гость';
  const userChatMessages = chatMessages.filter(msg => {
    if (msg.role === 'bot') return true;
    if (msg.user === currentUsername) return true;
    if (msg.role === 'admin' && msg.targetUser === currentUsername) return true;
    if (!currentUser && msg.user === 'Гость' && msg.role === 'guest') return true;
    return false;
  });

  userChatMessages.forEach(msg => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${msg.role === 'bot' ? 'bot' : msg.role === 'admin' ? 'admin' : 'user'}`;
    msgDiv.innerHTML = `
      <p><strong>${msg.userName}:</strong> ${msg.text}</p>
      <small>${new Date(msg.timestamp).toLocaleString('ru-RU')}</small>
    `;
    chatMessagesContainer.appendChild(msgDiv);
  });

  chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

// Рендеринг чата поддержки админа: группировка сообщений по пользователям
function renderAdminChat() {
  const adminChatMessages = document.getElementById('admin-chat-messages');
  if (!adminChatMessages) return;

  adminChatMessages.innerHTML = '';
  
  // Группируем сообщения по пользователям
  const usersWithMessages = {};
  chatMessages.forEach(msg => {
    if (msg.role === 'user' || msg.role === 'guest') {
      if (!usersWithMessages[msg.user]) {
        usersWithMessages[msg.user] = [];
      }
      usersWithMessages[msg.user].push(msg);
    } else if (msg.role === 'admin' && msg.targetUser) {
      if (!usersWithMessages[msg.targetUser]) {
        usersWithMessages[msg.targetUser] = [];
      }
      usersWithMessages[msg.targetUser].push(msg);
    }
  });
  
  if (Object.keys(usersWithMessages).length === 0) {
    adminChatMessages.innerHTML = '<p style="color: #718096; text-align: center; padding: 2rem;">Нет новых вопросов от пользователей</p>';
    return;
  }

  // Отображаем чаты по каждому пользователю
  Object.keys(usersWithMessages).forEach(username => {
    const userMsgs = usersWithMessages[username].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const user = testUsers.find(u => u.username === username);
    const userName = user ? (user.fullName || user.name) : username;
    
    const chatSection = document.createElement('div');
    chatSection.style.marginBottom = '2rem';
    chatSection.style.padding = '1.5rem';
    chatSection.style.background = 'rgba(248, 249, 255, 0.8)';
    chatSection.style.borderRadius = '12px';
    chatSection.style.border = '1px solid rgba(102, 126, 234, 0.2)';
    
    const chatHeader = document.createElement('div');
    chatHeader.style.marginBottom = '1rem';
    chatHeader.style.paddingBottom = '0.75rem';
    chatHeader.style.borderBottom = '2px solid rgba(102, 126, 234, 0.3)';
    chatHeader.innerHTML = `<h4 style="color: #1a1a2e; font-weight: 700; font-size: 1.2rem;">Чат с ${userName} (${username})</h4>`;
    chatSection.appendChild(chatHeader);

    userMsgs.forEach(msg => {
      const msgDiv = document.createElement('div');
      msgDiv.className = msg.role === 'admin' ? 'chat-message admin' : 'chat-message user';
      msgDiv.style.marginBottom = '0.75rem';
      msgDiv.style.padding = '0.75rem 1rem';
      msgDiv.style.borderRadius = '8px';
      if (msg.role === 'admin') {
        msgDiv.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)';
        msgDiv.style.color = 'white';
        msgDiv.style.marginLeft = 'auto';
        msgDiv.style.maxWidth = '80%';
      } else {
        msgDiv.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        msgDiv.style.color = 'white';
        msgDiv.style.maxWidth = '80%';
      }
      msgDiv.innerHTML = `
        <p style="margin-bottom: 0.25rem;"><strong>${msg.userName}:</strong></p>
        <p style="margin-bottom: 0.5rem;">${msg.text}</p>
        <small style="opacity: 0.8; font-size: 0.75rem;">${new Date(msg.timestamp).toLocaleString('ru-RU')}</small>
      `;
      chatSection.appendChild(msgDiv);
    });

    adminChatMessages.appendChild(chatSection);
  });

  adminChatMessages.scrollTop = adminChatMessages.scrollHeight;
}

// Рендеринг чата поддержки пользователя: отображение только сообщений текущего пользователя и ответов админа ему
function renderUserChat() {
  const userChatMessages = document.getElementById('user-chat-messages');
  const userChatInput = document.getElementById('user-chat-input');
  const userChatSend = document.getElementById('user-chat-send');

  if (!userChatMessages || !currentUser) return;

  // Фильтруем сообщения текущего пользователя и ответы админа ему
  const userMessages = chatMessages.filter(msg => {
    if (msg.user === currentUser.username) return true;
    if (msg.role === 'bot') return true;
    if (msg.role === 'admin' && msg.targetUser === currentUser.username) return true;
    return false;
  }).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  userChatMessages.innerHTML = '';
  
  userMessages.forEach(msg => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${msg.role === 'bot' || msg.role === 'admin' ? (msg.role === 'admin' ? 'admin' : 'bot') : 'user'}`;
    msgDiv.innerHTML = `
      <p><strong>${msg.userName}:</strong> ${msg.text}</p>
      <small>${new Date(msg.timestamp).toLocaleString('ru-RU')}</small>
    `;
    userChatMessages.appendChild(msgDiv);
  });

  userChatMessages.scrollTop = userChatMessages.scrollHeight;

  // Удаляем старые обработчики и добавляем новые
  const newSendBtn = userChatSend?.cloneNode(true);
  userChatSend?.parentNode?.replaceChild(newSendBtn, userChatSend);
  
  const newInput = userChatInput?.cloneNode(false);
  if (userChatInput) {
    newInput.value = userChatInput.value;
    newInput.placeholder = userChatInput.placeholder;
    userChatInput.parentNode?.replaceChild(newInput, userChatInput);
  }

  // Обработчик отправки сообщения
  const sendUserMessage = () => {
    const message = newInput?.value.trim();
    if (!message) return;

    const newMessage = {
      id: Date.now(),
      text: message,
      user: currentUser.username,
      userName: currentUser.fullName || currentUser.name,
      timestamp: new Date().toISOString(),
      role: currentUser.role
    };

    chatMessages.push(newMessage);
    saveToStorage();
    renderUserChat();
    renderChatMessages();
    if (newInput) newInput.value = '';
  };

  newSendBtn?.addEventListener('click', sendUserMessage);
  newInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendUserMessage();
    }
  });
}

// ==========================================================================
// Initialization: инициализация всех функций при загрузке страницы
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  loadFromStorage();
  initDiscountCarousel();
  initAuth();
  initNavigation();
  initSupportChat();
  initEnrollment();
  initProfileTabs();
  initProfileActions();
  initThankYouModal();
  updateAuthUI();
  
  console.log('Сайт для примера онлайн школы обучения языкам');
});
