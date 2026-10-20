// STATE & GLOBAL VARIABLES
window.currentUserDoc = null;
window.selectedRole = 'student';

let totalScore = 0;
let currentStreak = 0;
let gameTimer = null;
let timeLeft = 60;
let currentGameType = null;
let currentWordItem = null;
let uploadedImageData = null;
let videoStream = null;
let currentExercises = [];
let currentAudioWordIndex = 0;

const SYSTEM_PROMPT = `Ты — дружелюбный помощник по русскому языку для учеников 5 класса. Говори простыми словами, как с ребёнком 10–11 лет.

Когда ученик присылает текст (диктант, сочинение) или фото тетради:
1. Найди все орфографические и пунктуационные ошибки.
2. Выведи таблицу: "Было" — "Правильно" — "Какое правило".
3. Объясни каждое правило одной-двумя простыми фразами.
4. Назови, какой тип ошибок у ученика встречается чаще всего (Главная точка роста).
5. Составь 3 коротких упражнения именно на это правило (вставить пропущенную букву, выбрать правильный вариант и т.п.).
6. Не пиши за ученика готовый текст целиком. Если ошибок нет, похвали и предложи более сложное упражнение.`;

const DETECTIVE_WORDS = [
  { word: "Шопот", correct: false, hint: "Правильно: шёпот (шептать)" },
  { word: "Цыпленок", correct: true, hint: "Исключение: цыпленок" },
  { word: "Прийти", correct: true, hint: "Правильно: прийти" },
  { word: "Придти", correct: false, hint: "Правильно: прийти" },
  { word: "Сделать", correct: true, hint: "Приставки З не бывает!" },
  { word: "Зделать", correct: false, hint: "Приставки З не бывает!" }
];

const VOWELS_WORDS = [
  { q: "Вод...пад", options: ["о", "а"], ans: "о" },
  { q: "Тр...ва", options: ["а", "о"], ans: "а" },
  { q: "З...ма", options: ["и", "е"], ans: "и" },
  { q: "Л...сной", options: ["е", "и"], ans: "е" }
];

const WORDS_DATABASE = [
  { word: "Что", sound: "што", hint: "Пишется Ч, но слышим и произносим Ш.", example: "Что ты сегодня делаешь?" },
  { word: "Чтобы", sound: "штобы", hint: "Пишется Ч, но произносим Ш. Слитно!", example: "Учись, чтобы всё знать." },
  { word: "Его", sound: "йиво", hint: "Пишется Г, но произносим В.", example: "Я видел его в школе." },
  { word: "Солнце", sound: "сонце", hint: "Непроизносимая согласная Л (солнышко).", example: "Яркое солнце светит." },
  { word: "Сердце", sound: "серце", hint: "Непроизносимая согласная Д (сердечко).", example: "Доброе сердце." },
  { word: "Праздник", sound: "празник", hint: "Непроизносимая согласная Д (празден).", example: "Школьный праздник." },
  { word: "Лестница", sound: "лесница", hint: "Непроизносимая согласная Т.", example: "Крутая лестница." },
  { word: "Честный", sound: "чесный", hint: "Непроизносимая Т (честь).", example: "Честный ответ." },
  { word: "Поздно", sound: "позно", hint: "Непроизносимая Т (опоздать).", example: "Уже поздно спать." },
  { word: "Местный", sound: "месный", hint: "Непроизносимая Т (место).", example: "Местный житель." },
  { word: "Здравствуйте", sound: "здраствуйте", hint: "Непроизносимая В (здравие).", example: "Здравствуйте, учитель!" },
  { word: "Чувствовать", sound: "чувствовать", hint: "Непроизносимая В (чувство).", example: "Чувствовать радость." },
  { word: "Счастливый", sound: "щасливый", hint: "Непроизносимая Т (счастье).", example: "Счастливый день." },
  { word: "Конечно", sound: "конешно", hint: "Пишется ЧН, а произносится ШН.", example: "Я, конечно, приду!" },
  { word: "Сегодня", sound: "сиводня", hint: "Пишется Г, а произносится В.", example: "Сегодня отличная погода." },
  { word: "Вода", sound: "вада", hint: "Безударная гласная О (проверка: во́ды).", example: "Чистая вода." },
  { word: "Трава", sound: "трава", hint: "Безударная А (проверка: тра́вы).", example: "Зелёная трава." },
  { word: "Молоко", sound: "малако", hint: "Сочетание ОЛО.", example: "Вкусное молоко." },
  { word: "Собака", sound: "сабака", hint: "Словарное слово, запомни О!", example: "Верная собака." },
  { word: "Гора", sound: "гара", hint: "Безударная О (проверка: го́ры).", example: "Высокая гора." },
  { word: "Зима", sound: "зима", hint: "Безударная И (проверка: зи́мы).", example: "Холодная зима." },
  { word: "Река", sound: "рика", hint: "Безударная Е (проверка: ре́ки).", example: "Быстрая река." },
  { word: "Деревня", sound: "диревня", hint: "Словарное слово.", example: "Родная деревня." },
  { word: "Корова", sound: "карова", hint: "Сочетание ОРО.", example: "Пятнистая корова." },
  { word: "Дорога", sound: "дарога", hint: "Сочетание ОРО.", example: "Широкая дорога." },
  { word: "Дуб", sound: "дуп", hint: "Оглушение Б -> П на конце (проверка: дубы).", example: "Могучий дуб." },
  { word: "Гриб", sound: "грип", hint: "Оглушение Б -> П (проверка: грибы).", example: "Белый гриб." },
  { word: "Мороз", sound: "марос", hint: "Оглушение З -> С (проверка: морозы).", example: "Сильный мороз." },
  { word: "Зуб", sound: "зуп", hint: "Оглушение Б -> П (проверка: зубы).", example: "Белый зуб." },
  { word: "Нож", sound: "нош", hint: "Оглушение Ж -> Ш (проверка: ножи).", example: "Острый нож." },
  { word: "Глаз", sound: "глас", hint: "Оглушение З -> С (проверка: глаза).", example: "Зоркий глаз." },
  { word: "Пруд", sound: "прут", hint: "Оглушение Д -> Т (проверка: пруды).", example: "Глубокий пруд." },
  { word: "Город", sound: "горот", hint: "Оглушение Д -> Т (проверка: города).", example: "Красивый город." },
  { word: "Жизнь", sound: "жизнь", hint: "Правило ЖИ-ШИ пиши с И!", example: "Долгая жизнь." },
  { word: "Машина", sound: "машина", hint: "Правило ЖИ-ШИ пиши с И!", example: "Быстрая машина." },
  { word: "Шишка", sound: "шишка", hint: "Правило ЖИ-ШИ пиши с И!", example: "Сосновая шишка." },
  { word: "Жираф", sound: "жираф", hint: "Правило ЖИ-ШИ пиши с И!", example: "Высокий жираф." },
  { word: "Карандаши", sound: "карандаши", hint: "Правило ЖИ-ШИ пиши с И!", example: "Цветные карандаши." },
  { word: "Чаща", sound: "чаща", hint: "Правило ЧА-ЩА пиши с А!", example: "Густая чаща." },
  { word: "Чудо", sound: "чудо", hint: "Правило ЧУ-ЩУ пиши с У!", example: "Настоящее чудо." },
  { word: "Щука", sound: "щука", hint: "Правило ЧУ-ЩУ пиши с У!", example: "Речная щука." },
  { word: "Радостный", sound: "радосный", hint: "Непроизносимая Т (радость).", example: "Радостный день." },
  { word: "Опасный", sound: "опасный", hint: "Буква Т НЕ нужна! (опасен).", example: "Опасный путь." },
  { word: "Участвую", sound: "участвую", hint: "Буква Т НЕ нужна! (участие).", example: "Участвую в конкурсе." },
  { word: "Искусство", sound: "искусство", hint: "Двойная СС в корне.", example: "Мировое искусство." },
  { word: "Солнцестояние", sound: "сонцестояние", hint: "Сложное слово: солнце + стоять.", example: "Летнее солнцестояние." },
  { word: "Сказочный", sound: "сказочный", hint: "ЧК-ЧН пишется без мягкого знака!", example: "Сказочный герой." },
  { word: "Местность", sound: "месность", hint: "Непроизносимая Т (место).", example: "Горная местность." },
  { word: "Поздний", sound: "позний", hint: "Непроизносимая Т (поздно).", example: "Поздний вечер." },
  { word: "Учиться", sound: "учица", hint: "Что делать? Есть Ь в вопросе -> пиши -ТЬСЯ!", example: "Надо хорошо учиться." },
  { word: "Учится", sound: "учица", hint: "Что делает? Нет Ь в вопросе -> пиши -ТСЯ!", example: "Он отлично учится." },
  { word: "Стараться", sound: "стараца", hint: "Что делать? Есть Ь -> пиши -ТЬСЯ!", example: "Нужно стараться." },
  { word: "Старается", sound: "стараца", hint: "Что делает? Нет Ь -> пиши -ТСЯ!", example: "Ученик старается." },
  { word: "Улыбаться", sound: "улыбаца", hint: "Что делать? Есть Ь -> пиши -ТЬСЯ!", example: "Любит улыбаться." },
  { word: "Улыбается", sound: "улыбаца", hint: "Что делает? Нет Ь -> пиши -ТСЯ!", example: "Ребёнок улыбается." },
  { word: "Заниматься", sound: "занимаца", hint: "Что делать? Есть Ь -> пиши -ТЬСЯ!", example: "Заниматься спортом." },
  { word: "Занимается", sound: "занимаца", hint: "Что делает? Нет Ь -> пиши -ТСЯ!", example: "Занимается музыкой." },
  { word: "Смеяться", sound: "смеяца", hint: "Что делать? Есть Ь -> пиши -ТЬСЯ!", example: "Весело смеяться." },
  { word: "Смеётся", sound: "смиёца", hint: "Форма глагола с Ё.", example: "Он громко смеётся." },
  { word: "Готовиться", sound: "готовица", hint: "Что делать? Есть Ь -> пиши -ТЬСЯ!", example: "Готовиться к уроку." },
  { word: "Готовится", sound: "готовица", hint: "Что делает? Нет Ь -> пиши -ТСЯ!", example: "Класс готовится." }
];

// INITIALIZATION
window.onload = function() {
  initAuth();
};

function initAuth() {
  const savedUser = localStorage.getItem('gramoteyka_user');
  if (savedUser) {
    window.currentUserDoc = JSON.parse(savedUser);
    updateUserUI();
    document.getElementById('authModal').classList.add('hidden');
    if (window.currentUserDoc.role === 'admin') {
      document.getElementById('navAdminTab').classList.remove('hidden');
    }
  } else {
    document.getElementById('authModal').classList.remove('hidden');
  }
}

function selectRole(role) {
  window.selectedRole = role;
  const studentBtn = document.getElementById('roleStudentBtn');
  const adminBtn = document.getElementById('roleAdminBtn');
  const classContainer = document.getElementById('classInputContainer');
  const passContainer = document.getElementById('adminPassContainer');

  if (role === 'student') {
    studentBtn.className = 'flex-1 py-2.5 rounded-lg bg-white text-indigo-900 shadow-sm transition-all font-bold';
    adminBtn.className = 'flex-1 py-2.5 rounded-lg text-slate-600 hover:text-slate-900 transition-all font-bold';
    classContainer.classList.remove('hidden');
    passContainer.classList.add('hidden');
  } else {
    adminBtn.className = 'flex-1 py-2.5 rounded-lg bg-white text-indigo-900 shadow-sm transition-all font-bold';
    studentBtn.className = 'flex-1 py-2.5 rounded-lg text-slate-600 hover:text-slate-900 transition-all font-bold';
    classContainer.classList.add('hidden');
    passContainer.classList.remove('hidden');
  }
}

async function loginUser() {
  const name = document.getElementById('authName').value.trim();
  const userClass = document.getElementById('authClass').value.trim();
  const adminPass = document.getElementById('authAdminPass').value.trim();

  if (!name) {
    alert('Пожалуйста, введите ваше имя!');
    return;
  }

  if (window.selectedRole === 'admin' && adminPass !== '1234') {
    alert('Неверный пин-код учителя! Используйте стандартный пин-код: 1234');
    return;
  }

  const userId = 'user_' + Date.now();
  const userData = {
    uid: userId,
    name: name,
    class: window.selectedRole === 'admin' ? 'Преподаватель' : (userClass || '5 класс'),
    role: window.selectedRole,
    createdAt: new Date().toISOString()
  };

  window.currentUserDoc = userData;
  localStorage.setItem('gramoteyka_user', JSON.stringify(userData));

  if (window.selectedRole === 'student') {
    let allStudents = JSON.parse(localStorage.getItem('gramoteyka_all_students') || '[]');
    if (!allStudents.some(s => s.uid === userId)) {
      allStudents.push(userData);
      localStorage.setItem('gramoteyka_all_students', JSON.stringify(allStudents));
    }
  }

  document.getElementById('authModal').classList.add('hidden');
  updateUserUI();

  if (userData.role === 'admin') {
    document.getElementById('navAdminTab').classList.remove('hidden');
    switchView('admin');
  } else {
    document.getElementById('navAdminTab').classList.add('hidden');
    switchView('student');
  }
}

function logout() {
  localStorage.removeItem('gramoteyka_user');
  window.currentUserDoc = null;
  document.getElementById('authModal').classList.remove('hidden');
  document.getElementById('navAdminTab').classList.add('hidden');
  switchView('student');
}

function updateUserUI() {
  if (!window.currentUserDoc) return;
  document.getElementById('userDisplayName').innerText = window.currentUserDoc.name;
  document.getElementById('userDisplayRole').innerText = window.currentUserDoc.role === 'admin' ? '👩‍🏫 Учитель / Аналитик' : `👨‍🎓 Ученик (${window.currentUserDoc.class})`;

  if (window.currentUserDoc.role === 'admin') {
    document.getElementById('navAdminTab').classList.remove('hidden');
  } else {
    document.getElementById('navAdminTab').classList.add('hidden');
  }
}

// VIEW SWITCHER
function switchView(viewName) {
  if (window.currentUserDoc && window.currentUserDoc.role === 'student' && viewName === 'admin') {
    viewName = 'student';
  }

  const views = ['studentView', 'cardsView', 'gamesView', 'historyView', 'adminView'];
  const tabs = ['navStudentTab', 'navCardsTab', 'navGamesTab', 'navHistoryTab', 'navAdminTab'];

  views.forEach(v => {
    const el = document.getElementById(v);
    if (el) {
      el.classList.add('hidden');
      el.classList.remove('flex');
    }
  });

  tabs.forEach(t => {
    const btn = document.getElementById(t);
    if (btn) btn.className = "px-4 py-2.5 rounded-xl font-bold text-xs bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm transition-all flex items-center gap-2";
  });

  const targetView = document.getElementById(viewName + 'View');
  const targetTab = document.getElementById('nav' + viewName.charAt(0).toUpperCase() + viewName.slice(1) + 'Tab');

  if (targetView) {
    targetView.classList.remove('hidden');
    if (viewName !== 'student') targetView.classList.add('flex');
  }

  if (targetTab) {
    const activeColor = viewName === 'games' ? 'bg-amber-500' : viewName === 'admin' ? 'bg-violet-600' : 'bg-indigo-600';
    targetTab.className = `px-4 py-2.5 rounded-xl font-bold text-xs ${activeColor} text-white shadow-sm transition-all flex items-center gap-2`;
  }

  if (viewName === 'cards') {
    renderCards();
    updateAudioPlayerDisplay();
  } else if (viewName === 'history') {
    loadUserHistory();
  } else if (viewName === 'admin') {
    loadAdminStudents();
  }
}

// GEMINI AI CHECKER
async function checkText() {
  const studentText = document.getElementById('studentInput').value.trim();

  if (!studentText && !uploadedImageData) {
    alert('Пожалуйста, введите текст диктанта или прикрепите фото тетради!');
    return;
  }

  document.getElementById('emptyState').classList.add('hidden');
  document.getElementById('resultContent').classList.add('hidden');
  document.getElementById('exerciseFeedback').classList.add('hidden');
  document.getElementById('loadingState').classList.remove('hidden');
  document.getElementById('loadingState').classList.add('flex');

  const userParts = [];
  let userPromptText = "Проверь следующий текст ученика 5 класса:";
  if (studentText) userPromptText += ` "${studentText}"`;
  if (uploadedImageData) userPromptText += ` Распознай рукописный текст на фото тетради и проведи его полный разбор.`;

  userParts.push({ text: userPromptText });
  if (uploadedImageData) {
    userParts.push({
      inlineData: { mimeType: uploadedImageData.mimeType, data: uploadedImageData.data }
    });
  }

  const payload = {
    contents: [{ role: "user", parts: userParts }],
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          greeting: { type: "STRING" },
          hasErrors: { type: "BOOLEAN" },
          errors: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                was: { type: "STRING" },
                correct: { type: "STRING" },
                rule: { type: "STRING" }
              },
              required: ["was", "correct", "rule"]
            }
          },
          frequentErrorType: { type: "STRING" },
          exercises: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                id: { type: "INTEGER" },
                question: { type: "STRING" },
                options: { type: "ARRAY", items: { type: "STRING" } }
              },
              required: ["id", "question"]
            }
          }
        },
        required: ["greeting", "hasErrors", "errors", "frequentErrorType", "exercises"]
      }
    }
  };

  try {
    const response = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!jsonText) throw new Error("Ошибка формата ответа");

    const result = JSON.parse(jsonText);
    saveSubmission(studentText, result);
    renderResults(result);

  } catch (err) {
    console.error(err);
    alert('Произошла ошибка при обработке текста. Попробуйте еще раз!');
  } finally {
    document.getElementById('loadingState').classList.remove('flex');
    document.getElementById('loadingState').classList.add('hidden');
  }
}

function saveSubmission(inputText, analysisResult) {
  if (!window.currentUserDoc) return;
  const userId = window.currentUserDoc.uid;
  const submissionData = {
    studentId: userId,
    studentName: window.currentUserDoc.name,
    studentClass: window.currentUserDoc.class,
    inputText: inputText || '(Рукописный текст с фото)',
    hasPhoto: !!uploadedImageData,
    analysis: analysisResult,
    createdAt: new Date().toISOString()
  };

  let localHistory = JSON.parse(localStorage.getItem(`gramoteyka_history_${userId}`) || '[]');
  localHistory.unshift(submissionData);
  localStorage.setItem(`gramoteyka_history_${userId}`, JSON.stringify(localHistory));

  let allSubs = JSON.parse(localStorage.getItem('gramoteyka_all_submissions') || '[]');
  allSubs.unshift(submissionData);
  localStorage.setItem('gramoteyka_all_submissions', JSON.stringify(allSubs));
}

function renderResults(data) {
  document.getElementById('resultContent').classList.remove('hidden');
  document.getElementById('resultContent').classList.add('flex');

  document.getElementById('greetingBox').innerHTML = data.greeting;

  const tableContainer = document.getElementById('errorTableContainer');
  const tableBody = document.getElementById('errorTableBody');
  tableBody.innerHTML = '';

  if (data.hasErrors && data.errors && data.errors.length > 0) {
    tableContainer.classList.remove('hidden');
    data.errors.forEach(err => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50 transition-colors';
      tr.innerHTML = `
        <td class="p-3 text-red-600 font-bold bg-red-50/40 rounded-l-lg">${escapeHtml(err.was)}</td>
        <td class="p-3 text-emerald-700 font-bold bg-emerald-50/40">${escapeHtml(err.correct)}</td>
        <td class="p-3 text-slate-700 rounded-r-lg font-medium">${escapeHtml(err.rule)}</td>
      `;
      tableBody.appendChild(tr);
    });
  } else {
    tableContainer.classList.add('hidden');
  }

  const focusBox = document.getElementById('focusPointBox');
  if (data.frequentErrorType) {
    focusBox.classList.remove('hidden');
    document.getElementById('focusPointText').innerText = data.frequentErrorType;
  } else {
    focusBox.classList.add('hidden');
  }

  const exBox = document.getElementById('exercisesBox');
  const exList = document.getElementById('exerciseList');
  exList.innerHTML = '';

  if (data.exercises && data.exercises.length > 0) {
    exBox.classList.remove('hidden');
    currentExercises = data.exercises;

    data.exercises.forEach((ex, idx) => {
      const card = document.createElement('div');
      card.className = 'p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2';

      let optionsHTML = '';
      if (ex.options && ex.options.length > 0) {
        optionsHTML = `<div class="flex flex-wrap gap-2 mt-1.5">` + 
          ex.options.map(opt => `
            <label class="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold cursor-pointer hover:border-indigo-300 transition-all">
              <input type="radio" name="ex_${ex.id}" value="${escapeHtml(opt)}" class="text-indigo-600 focus:ring-indigo-500">
              <span>${escapeHtml(opt)}</span>
            </label>
          `).join('') + `</div>`;
      } else {
        optionsHTML = `
          <input type="text" id="ex_input_${ex.id}" placeholder="Введите ответ..." class="mt-1.5 w-full p-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none text-xs bg-white font-medium"/>
        `;
      }

      card.innerHTML = `
        <span class="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Упражнение №${idx + 1}</span>
        <p class="font-semibold text-slate-900 text-xs md:text-sm">${escapeHtml(ex.question)}</p>
        ${optionsHTML}
      `;
      exList.appendChild(card);
    });
  } else {
    exBox.classList.add('hidden');
  }
}

async function submitExercises() {
  const userAnswers = [];

  currentExercises.forEach((ex, idx) => {
    let ans = '';
    if (ex.options && ex.options.length > 0) {
      const checked = document.querySelector(`input[name="ex_${ex.id}"]:checked`);
      ans = checked ? checked.value : 'Нет ответа';
    } else {
      const inp = document.getElementById(`ex_input_${ex.id}`);
      ans = inp ? inp.value.trim() : '';
    }
    userAnswers.push(`Задание ${idx + 1} (${ex.question}): Ответ ученика: "${ans || 'нет ответа'}"`);
  });

  const prompt = `Проверь ответы ученика на тренировочные упражнения:
${userAnswers.join('\n')}

Похвалай за верные ответы и кратко объясни неверные.`;

  const feedbackBox = document.getElementById('exerciseFeedback');
  const feedbackContent = document.getElementById('exerciseFeedbackContent');
  
  feedbackBox.classList.remove('hidden');
  feedbackContent.innerHTML = 'Проверяем ваши ответы...';

  try {
    const response = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }
      })
    });

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    feedbackContent.innerHTML = text || 'Задания проверены!';
  } catch (err) {
    feedbackContent.innerHTML = 'Не удалось проверить ответы, попробуйте еще раз.';
  }
}

// 60 WORDS AUDIO CARDS
function renderCards(filterText = "") {
  const grid = document.getElementById('cardsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const filtered = WORDS_DATABASE.filter(item => 
    item.word.toLowerCase().includes(filterText.toLowerCase()) || 
    item.sound.toLowerCase().includes(filterText.toLowerCase()) ||
    item.hint.toLowerCase().includes(filterText.toLowerCase())
  );

  filtered.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = "glass-card p-4 rounded-2xl flex flex-col justify-between gap-3 border border-slate-200 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md cursor-pointer";
    card.onclick = () => selectWordFromGrid(index);

    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-md text-[10px] font-bold">Слово №${index + 1}</span>
          <button onclick="event.stopPropagation(); speakWord('${escapeHtml(item.word)}')" class="w-8 h-8 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-700 flex items-center justify-center transition-all text-xs" title="Прослушать произношение">
            <i class="fa-solid fa-volume-high"></i>
          </button>
        </div>
        
        <div class="flex items-baseline gap-2 mb-1">
          <span class="text-base font-extrabold text-slate-900">${escapeHtml(item.word)}</span>
        </div>
        
        <div class="text-[11px] font-semibold text-indigo-600 mb-2 flex items-center gap-1">
          <span>🔊 Произносим:</span>
          <span class="bg-slate-100 px-2 py-0.5 rounded-md font-mono text-slate-800">[${escapeHtml(item.sound)}]</span>
        </div>

        <p class="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-2">
          💡 ${escapeHtml(item.hint)}
        </p>
      </div>

      <div class="text-[11px] italic text-slate-500 font-medium border-t border-slate-100 pt-2">
        «${escapeHtml(item.example)}»
      </div>
    `;
    grid.appendChild(card);
  });
}

function updateAudioPlayerDisplay() {
  const current = WORDS_DATABASE[currentAudioWordIndex];
  if (!current) return;

  document.getElementById('playerWordTitle').innerText = `${currentAudioWordIndex + 1}. ${current.word}`;
  document.getElementById('playerWordSound').innerText = `Произносим: [${current.sound}]`;
  document.getElementById('playerWordHint').innerText = current.hint;
}

function playNextWord() {
  currentAudioWordIndex = (currentAudioWordIndex + 1) % WORDS_DATABASE.length;
  updateAudioPlayerDisplay();
  speakWord(WORDS_DATABASE[currentAudioWordIndex].word);
}

function repeatCurrentWord() {
  speakWord(WORDS_DATABASE[currentAudioWordIndex].word);
}

function selectWordFromGrid(idx) {
  currentAudioWordIndex = idx;
  updateAudioPlayerDisplay();
  speakWord(WORDS_DATABASE[currentAudioWordIndex].word);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function filterCards() {
  const search = document.getElementById('cardSearchInput').value;
  renderCards(search);
}

function speakWord(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/\[.*?\]/g, '').replace(/[́]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ru-RU';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  } else {
    alert('Ваш браузер не поддерживает озвучивание текста.');
  }
}

// BLITZ GAMES
function startGame(type) {
  currentGameType = type;
  timeLeft = 60;
  currentStreak = 0;

  document.getElementById('gameSelection').classList.add('hidden');
  document.getElementById('gameResultScreen').classList.add('hidden');
  document.getElementById('gameArena').classList.remove('hidden');
  document.getElementById('gameArena').classList.add('flex');

  document.getElementById('gameTitleDisplay').innerText = type === 'detective' ? 'Орфографический Детектив' : 'Гласные в Корне';

  startTimer();
  nextGameQuestion();
}

function startTimer() {
  clearInterval(gameTimer);
  const timerProgress = document.getElementById('timerProgress');

  gameTimer = setInterval(() => {
    timeLeft--;
    document.getElementById('timerText').innerText = `⏱️ ${timeLeft} с`;
    timerProgress.style.width = `${(timeLeft / 60) * 100}%`;

    if (timeLeft <= 0) {
      clearInterval(gameTimer);
      endGame();
    }
  }, 1000);
}

function nextGameQuestion() {
  const qText = document.getElementById('gameQuestionText');
  const container = document.getElementById('gameOptionsContainer');
  container.innerHTML = '';

  if (currentGameType === 'detective') {
    currentWordItem = DETECTIVE_WORDS[Math.floor(Math.random() * DETECTIVE_WORDS.length)];
    qText.innerText = currentWordItem.word;
    document.getElementById('gameSubHint').innerText = 'Написано грамотно без ошибок?';

    container.innerHTML = `
      <button onclick="handleAnswer(true)" class="py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-xl text-sm shadow-md transition-all active:scale-95">
        ✅ Правильно
      </button>
      <button onclick="handleAnswer(false)" class="py-3.5 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-sm shadow-md transition-all active:scale-95">
        ❌ Есть ошибка
      </button>
    `;
  } else {
    currentWordItem = VOWELS_WORDS[Math.floor(Math.random() * VOWELS_WORDS.length)];
    qText.innerText = currentWordItem.q;
    document.getElementById('gameSubHint').innerText = 'Какая буква пропущена?';

    currentWordItem.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-xl shadow-md transition-all active:scale-95';
      btn.innerText = opt;
      btn.onclick = () => handleAnswer(opt);
      container.appendChild(btn);
    });
  }
}

function handleAnswer(userChoice) {
  let isCorrect = false;

  if (currentGameType === 'detective') {
    isCorrect = (userChoice === currentWordItem.correct);
  } else {
    isCorrect = (userChoice === currentWordItem.ans);
  }

  if (isCorrect) {
    totalScore += 10 + currentStreak * 2;
    currentStreak++;
  } else {
    currentStreak = 0;
  }

  document.getElementById('gameScore').innerText = totalScore;
  document.getElementById('gameStreak').innerText = currentStreak;

  nextGameQuestion();
}

function endGame() {
  document.getElementById('gameArena').classList.add('hidden');
  document.getElementById('gameResultScreen').classList.remove('hidden');
  document.getElementById('gameResultScreen').classList.add('flex');

  document.getElementById('finalScore').innerText = totalScore;
  document.getElementById('finalStreak').innerText = currentStreak;
}

function quitGame() {
  clearInterval(gameTimer);
  backToGameMenu();
}

function backToGameMenu() {
  document.getElementById('gameArena').classList.add('hidden');
  document.getElementById('gameResultScreen').classList.add('hidden');
  document.getElementById('gameSelection').classList.remove('hidden');
}

// IMAGE & CAMERA UPLOADS
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const base64String = e.target.result.split(',')[1];
    uploadedImageData = {
      mimeType: file.type || 'image/jpeg',
      data: base64String
    };
    showImagePreview(e.target.result);
  };
  reader.readAsDataURL(file);
}

function showImagePreview(src) {
  document.getElementById('imagePreview').src = src;
  document.getElementById('imagePreviewContainer').classList.remove('hidden');
}

function removeUploadedImage() {
  uploadedImageData = null;
  document.getElementById('imagePreviewContainer').classList.add('hidden');
  document.getElementById('imagePreview').src = '';
  document.getElementById('imageFileInput').value = '';
}

async function openCamera() {
  try {
    videoStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    const video = document.getElementById('cameraVideo');
    video.srcObject = videoStream;
    document.getElementById('cameraModal').classList.remove('hidden');
    document.getElementById('cameraModal').classList.add('flex');
  } catch (err) {
    alert('Камера недоступна. Вы можете загрузить фото тетради из файла!');
  }
}

function closeCamera() {
  if (videoStream) {
    videoStream.getTracks().forEach(track => track.stop());
    videoStream = null;
  }
  document.getElementById('cameraModal').classList.remove('flex');
  document.getElementById('cameraModal').classList.add('hidden');
}

function takePhoto() {
  const video = document.getElementById('cameraVideo');
  const canvas = document.getElementById('cameraCanvas');
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const dataUrl = canvas.toDataURL('image/jpeg');
  const base64String = dataUrl.split(',')[1];

  uploadedImageData = {
    mimeType: 'image/jpeg',
    data: base64String
  };

  showImagePreview(dataUrl);
  closeCamera();
}

// HISTORY & ADMIN FUNCTIONS
function loadUserHistory() {
  const historyList = document.getElementById('historyList');
  if (!window.currentUserDoc) return;

  const userId = window.currentUserDoc.uid;
  const submissions = JSON.parse(localStorage.getItem(`gramoteyka_history_${userId}`) || '[]');

  if (submissions.length === 0) {
    historyList.innerHTML = `<div class="text-slate-400 font-semibold text-xs text-center py-8">История пока пуста. Загрузите свой первый диктант для проверки!</div>`;
    return;
  }

  historyList.innerHTML = '';
  submissions.forEach(item => {
    const dateStr = new Date(item.createdAt).toLocaleString('ru-RU');
    const card = document.createElement('div');
    card.className = "p-4 bg-white rounded-xl border border-slate-200 flex flex-col gap-2";
    
    let errorsCount = item.analysis?.errors?.length || 0;
    let badge = errorsCount === 0 ? `<span class="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] px-2.5 py-0.5 rounded-md font-bold">Без ошибок</span>` : `<span class="bg-amber-50 text-amber-700 border border-amber-100 text-[10px] px-2.5 py-0.5 rounded-md font-bold">Ошибок: ${errorsCount}</span>`;

    card.innerHTML = `
      <div class="flex items-center justify-between border-b border-slate-100 pb-2">
        <span class="text-[11px] font-semibold text-slate-400">${dateStr}</span>
        ${badge}
      </div>
      <div class="text-xs font-bold text-slate-800">Текст: "${escapeHtml(item.inputText)}"</div>
      <div class="text-xs text-slate-600 font-medium"><strong>Главная точка роста:</strong> ${escapeHtml(item.analysis?.frequentErrorType || 'Не определена')}</div>
    `;
    historyList.appendChild(card);
  });
}

function loadAdminStudents() {
  const listContainer = document.getElementById('adminStudentsList');
  const students = JSON.parse(localStorage.getItem('gramoteyka_all_students') || '[]');
  const submissions = JSON.parse(localStorage.getItem('gramoteyka_all_submissions') || '[]');

  document.getElementById('adminTotalStudents').innerText = students.length;
  document.getElementById('adminTotalSubmissions').innerText = submissions.length;

  if (students.length === 0) {
    listContainer.innerHTML = '<div class="text-slate-400 text-xs font-semibold text-center py-6">Учеников в системе пока нет</div>';
    return;
  }

  listContainer.innerHTML = '';
  students.forEach(st => {
    const studentSubs = submissions.filter(s => s.studentId === st.uid);
    const item = document.createElement('div');
    item.className = "p-3 bg-slate-50 hover:bg-indigo-50/50 rounded-xl border border-slate-200 hover:border-indigo-200 cursor-pointer transition-all flex items-center justify-between";
    item.onclick = () => selectStudentForAdmin(st, studentSubs);

    item.innerHTML = `
      <div>
        <div class="font-bold text-slate-900 text-xs">${escapeHtml(st.name)}</div>
        <div class="text-[10px] font-semibold text-slate-500">${escapeHtml(st.class)}</div>
      </div>
      <span class="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-indigo-100">
        ${studentSubs.length} работ
      </span>
    `;
    listContainer.appendChild(item);
  });
}

function selectStudentForAdmin(student, submissions) {
  const header = document.getElementById('adminStudentDetailHeader');
  const content = document.getElementById('adminStudentDetailContent');

  header.innerHTML = `
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-base font-bold text-slate-900">${escapeHtml(student.name)}</h3>
        <p class="text-xs font-semibold text-indigo-600">${escapeHtml(student.class)} &bull; Проверено работ: ${submissions.length}</p>
      </div>
      <span class="bg-violet-100 text-violet-800 text-xs font-bold px-3 py-1 rounded-lg">Карточка ученика</span>
    </div>
  `;

  if (!submissions || submissions.length === 0) {
    content.innerHTML = `<div class="p-6 text-center text-slate-400 text-xs font-semibold bg-slate-50 rounded-xl border border-dashed border-slate-200">Ученик пока не отправлял диктанты.</div>`;
    return;
  }

  const latestSub = submissions[0];
  const gapText = latestSub?.analysis?.frequentErrorType || 'Раздел правил 5 класса';

  let submissionHistoryHTML = submissions.map((sub, idx) => {
    const dateStr = sub.createdAt ? new Date(sub.createdAt).toLocaleString('ru-RU') : 'Ранее';
    const errorCount = sub.analysis?.errors?.length || 0;
    return `
      <div class="p-3 bg-white border border-slate-200 rounded-xl flex flex-col gap-1.5">
        <div class="flex justify-between items-center border-b border-slate-100 pb-1">
          <span class="text-[10px] font-bold text-slate-400">Работа №${submissions.length - idx} &bull; ${dateStr}</span>
          <span class="text-[10px] font-bold ${errorCount === 0 ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'} px-2 py-0.5 rounded-md">
            ${errorCount === 0 ? 'Без ошибок' : 'Ошибок: ' + errorCount}
          </span>
        </div>
        <div class="text-xs text-slate-800 font-medium"><b>Текст:</b> "${escapeHtml(sub.inputText)}"</div>
        <div class="text-[11px] text-slate-600"><b>Точка роста:</b> ${escapeHtml(sub.analysis?.frequentErrorType || 'Не указана')}</div>
      </div>
    `;
  }).join('');

  content.innerHTML = `
    <div class="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
      <div>
        <div class="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Индивидуальные задания</div>
        <div class="text-xs font-extrabold text-slate-900 mt-0.5">Сформировать карточку для урока</div>
        <p class="text-[11px] text-slate-500 font-medium">Создать печатный лист по частым ошибкам ученика</p>
      </div>
      <button onclick="generatePDFWorksheet('${escapeHtml(student.name)}', '${escapeHtml(student.class)}', '${escapeHtml(gapText)}', ${JSON.stringify(latestSub?.analysis?.exercises || []).replace(/"/g, '&quot;')})" class="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2">
        <i class="fa-solid fa-file-arrow-down"></i> Скачать PDF-карточку
      </button>
    </div>

    <div class="flex flex-col gap-2">
      <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">
        <i class="fa-solid fa-clock-rotate-left text-violet-600"></i> История всех работ (${submissions.length}):
      </h4>
      <div class="flex flex-col gap-2 max-h-[260px] overflow-y-auto custom-scrollbar">
        ${submissionHistoryHTML}
      </div>
    </div>
  `;
}

function generatePDFWorksheet(name, studentClass, focusGap, exercises) {
  document.getElementById('pdfStudentInfo').innerText = `Ученик: ${name} | Класс: ${studentClass} | Дата: ${new Date().toLocaleDateString('ru-RU')}`;
  document.getElementById('pdfFocusGap').innerText = focusGap;

  const container = document.getElementById('pdfExercisesList');
  container.innerHTML = '';

  if (!exercises || exercises.length === 0) {
    exercises = [
      { question: "Вставьте пропущенную букву в слове: В...допад" },
      { question: "Выберите правильное написание: (Прийти / Придти) вовремя" },
      { question: "Исправьте ошибку в предложении: Ученик стараеться хорошо учится." }
    ];
  }

  exercises.forEach((ex, idx) => {
    const item = document.createElement('div');
    item.className = "p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col gap-1";
    item.innerHTML = `
      <span class="font-black text-slate-900">Задание ${idx + 1}.</span>
      <p class="font-medium text-slate-800">${escapeHtml(ex.question)}</p>
      <div class="mt-2 border-b border-dotted border-slate-400 h-4">Ответ: ____________________________________________________</div>
    `;
    container.appendChild(item);
  });

  const modal = document.getElementById('printSheetModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closePrintModal() {
  const modal = document.getElementById('printSheetModal');
  modal.classList.remove('flex');
  modal.classList.add('hidden');
}

function printWorksheet() {
  window.print();
}

async function fetchWithRetry(url, options, retries = 3, backoff = 1000) {
  try {
    const res = await fetch(url, options);
    if (!res.ok && res.status === 429 && retries > 0) {
      await new Promise(r => setTimeout(r, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    return res;
  } catch (err) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw err;
  }
}

function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}