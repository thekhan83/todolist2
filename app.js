/**
 * TaskFlow Focus - Application Logic
 * State Management, Pomodoro Focus Engine, Audio Synthesizer, UI Controllers
 */

// ==========================================================================
// 1. Initial State & Default Sample Data
// ==========================================================================
const DEFAULT_CATEGORIES = [
  { id: 'work', name: '업무', color: '#6366F1' },
  { id: 'study', name: '공부', color: '#10B981' },
  { id: 'personal', name: '개인', color: '#8B5CF6' },
  { id: 'health', name: '건강', color: '#EC4899' }
];

const DEFAULT_SETTINGS = {
  focusTime: 25,
  shortBreak: 5,
  longBreak: 15,
  soundEnabled: true,
  theme: 'dark'
};

const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTomorrowString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const INITIAL_SAMPLE_TASKS = [
  {
    id: 'task-1',
    title: '신규 프로젝트 기획안 검토 및 피드백 정리',
    completed: false,
    priority: 'high',
    category: 'work',
    targetPomo: 3,
    completedPomo: 1,
    dueDate: getTodayString(),
    notes: '팀장님 및 디자인 리드와 3시 회의 전까지 사전 리뷰 완료할 것.\n- 핵심 마일스톤 확인\n- 리소스 병목 지점 체크',
    subtasks: [
      { id: 'sub-1', title: '1차 목차 구조 검토', completed: true },
      { id: 'sub-2', title: '개발 견적 산정표 작성', completed: false },
      { id: 'sub-3', title: '슬라이드 코멘트 추가', completed: false }
    ],
    createdAt: Date.now() - 3600000 * 4,
    order: 1
  },
  {
    id: 'task-2',
    title: 'TypeScript 고급 타입 심화 강의 수강 (2단원)',
    completed: false,
    priority: 'medium',
    category: 'study',
    targetPomo: 2,
    completedPomo: 0,
    dueDate: getTodayString(),
    notes: 'Conditional Types 및 Mapped Types 실습 코드 직접 타이핑해보기.',
    subtasks: [
      { id: 'sub-4', title: '강의 2-1 시청', completed: false },
      { id: 'sub-5', title: '연습문제 풀이', completed: false }
    ],
    createdAt: Date.now() - 3600000 * 2,
    order: 2
  },
  {
    id: 'task-3',
    title: '주간 업무 회고 작성 및 다음 주 스프린트 계획',
    completed: false,
    priority: 'high',
    category: 'work',
    targetPomo: 2,
    completedPomo: 0,
    dueDate: getTomorrowString(),
    notes: '이번 주 집중 시간(뽀모도로) 분석 리포트 확인하고 계획 수립하기.',
    subtasks: [],
    createdAt: Date.now() - 3600000 * 1,
    order: 3
  },
  {
    id: 'task-4',
    title: '퇴근 후 저녁 가벼운 조깅 30분 & 스트레칭',
    completed: true,
    priority: 'low',
    category: 'health',
    targetPomo: 1,
    completedPomo: 1,
    dueDate: getTodayString(),
    notes: '스트레칭 10분 포함해서 무리하지 않게 달리기.',
    subtasks: [],
    createdAt: Date.now() - 3600000 * 5,
    order: 4
  }
];

// ==========================================================================
// 2. State Store (LocalStorage 연동)
// ==========================================================================
class TaskStore {
  constructor() {
    this.STORAGE_KEYS = {
      TASKS: 'taskflow_tasks',
      CATEGORIES: 'taskflow_categories',
      SETTINGS: 'taskflow_settings',
      STATS: 'taskflow_stats'
    };

    this.loadState();
  }

  loadState() {
    // Tasks
    const savedTasks = localStorage.getItem(this.STORAGE_KEYS.TASKS);
    this.tasks = savedTasks ? JSON.parse(savedTasks) : INITIAL_SAMPLE_TASKS;

    // Categories
    const savedCats = localStorage.getItem(this.STORAGE_KEYS.CATEGORIES);
    this.categories = savedCats ? JSON.parse(savedCats) : DEFAULT_CATEGORIES;

    // Settings
    const savedSettings = localStorage.getItem(this.STORAGE_KEYS.SETTINGS);
    this.settings = savedSettings ? { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) } : DEFAULT_SETTINGS;

    // Daily Stats
    const savedStats = localStorage.getItem(this.STORAGE_KEYS.STATS);
    const today = getTodayString();
    if (savedStats) {
      const parsed = JSON.parse(savedStats);
      this.stats = parsed.todayDate === today ? parsed : { todayDate: today, totalFocusMinutes: 0, completedPomodoros: 0 };
    } else {
      this.stats = { todayDate: today, totalFocusMinutes: 25, completedPomodoros: 1 };
    }
  }

  saveTasks() {
    localStorage.setItem(this.STORAGE_KEYS.TASKS, JSON.stringify(this.tasks));
  }

  saveCategories() {
    localStorage.setItem(this.STORAGE_KEYS.CATEGORIES, JSON.stringify(this.categories));
  }

  saveSettings() {
    localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
  }

  saveStats() {
    localStorage.setItem(this.STORAGE_KEYS.STATS, JSON.stringify(this.stats));
  }

  addTask(taskData) {
    const newTask = {
      id: 'task_' + Date.now(),
      title: taskData.title.trim(),
      completed: false,
      priority: taskData.priority || 'medium',
      category: taskData.category || this.categories[0]?.id || 'work',
      targetPomo: parseInt(taskData.targetPomo, 10) || 2,
      completedPomo: 0,
      dueDate: taskData.dueDate || '',
      notes: '',
      subtasks: [],
      createdAt: Date.now(),
      order: this.tasks.length + 1
    };
    this.tasks.unshift(newTask);
    this.saveTasks();
    return newTask;
  }

  updateTask(id, updates) {
    const taskIndex = this.tasks.findIndex(t => t.id === id);
    if (taskIndex !== -1) {
      this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates };
      this.saveTasks();
      return this.tasks[taskIndex];
    }
    return null;
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.saveTasks();
  }

  toggleTaskCompleted(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks();
      return task;
    }
    return null;
  }

  clearCompletedTasks() {
    this.tasks = this.tasks.filter(t => !t.completed);
    this.saveTasks();
  }

  incrementTaskPomo(id, minutes = 25) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.completedPomo = (task.completedPomo || 0) + 1;
      this.saveTasks();
    }
    // Update daily stats
    this.stats.completedPomodoros = (this.stats.completedPomodoros || 0) + 1;
    this.stats.totalFocusMinutes = (this.stats.totalFocusMinutes || 0) + minutes;
    this.saveStats();
  }

  addCategory(name, color) {
    const id = 'cat_' + Date.now();
    const newCat = { id, name: name.trim(), color };
    this.categories.push(newCat);
    this.saveCategories();
    return newCat;
  }

  resetAllToSample() {
    this.tasks = [...INITIAL_SAMPLE_TASKS];
    this.categories = [...DEFAULT_CATEGORIES];
    this.settings = { ...DEFAULT_SETTINGS };
    this.stats = { todayDate: getTodayString(), totalFocusMinutes: 25, completedPomodoros: 1 };
    this.saveTasks();
    this.saveCategories();
    this.saveSettings();
    this.saveStats();
  }
}

// ==========================================================================
// 3. Web Audio API Synthesizer (차임벨 사운드)
// ==========================================================================
class SoundSynthesizer {
  constructor() {
    this.ctx = null;
  }

  initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // 차임벨 (세션 종료 축하음 - 펜타토닉 화음)
  playChime(soundEnabled = true) {
    if (!soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const startTime = this.ctx.currentTime + index * 0.14;
        const duration = 1.2;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.22, startTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // 가벼운 완료 팝 사운드
  playPop(soundEnabled = true) {
    if (!soundEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const now = this.ctx.currentTime;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }
}

// ==========================================================================
// 4. Pomodoro Engine (State Machine)
// ==========================================================================
class PomodoroEngine {
  constructor(store, soundSynth, onTick, onStateChange, onComplete) {
    this.store = store;
    this.soundSynth = soundSynth;
    this.onTick = onTick;
    this.onStateChange = onStateChange;
    this.onComplete = onComplete;

    this.status = 'idle'; // 'idle' | 'running' | 'paused'
    this.mode = 'focus';  // 'focus' | 'shortBreak' | 'longBreak'
    this.activeTask = null;
    this.cycleCount = 0; // 뽀모도로 세션 사이클

    this.timerId = null;
    this.timeLeft = 25 * 60;
    this.totalDuration = 25 * 60;
  }

  setActiveTask(task) {
    this.activeTask = task;
  }

  startSession(mode = 'focus', task = null) {
    if (task) this.activeTask = task;
    this.mode = mode;

    let durationMinutes = 25;
    if (mode === 'focus') {
      durationMinutes = this.store.settings.focusTime || 25;
    } else if (mode === 'shortBreak') {
      durationMinutes = this.store.settings.shortBreak || 5;
    } else if (mode === 'longBreak') {
      durationMinutes = this.store.settings.longBreak || 15;
    }

    this.totalDuration = durationMinutes * 60;
    this.timeLeft = this.totalDuration;
    this.status = 'running';

    this.startInterval();
    this.notifyState();
  }

  togglePlayPause() {
    if (this.status === 'running') {
      this.pause();
    } else if (this.status === 'paused') {
      this.resume();
    } else if (this.status === 'idle') {
      this.startSession(this.mode, this.activeTask);
    }
  }

  pause() {
    if (this.status === 'running') {
      clearInterval(this.timerId);
      this.timerId = null;
      this.status = 'paused';
      this.notifyState();
    }
  }

  resume() {
    if (this.status === 'paused') {
      this.status = 'running';
      this.startInterval();
      this.notifyState();
    }
  }

  reset() {
    clearInterval(this.timerId);
    this.timerId = null;
    this.timeLeft = this.totalDuration;
    this.status = 'paused';
    this.notifyTick();
    this.notifyState();
  }

  skip() {
    clearInterval(this.timerId);
    this.timerId = null;
    if (this.mode === 'focus') {
      this.cycleCount++;
      const nextMode = (this.cycleCount % 4 === 0) ? 'longBreak' : 'shortBreak';
      this.startSession(nextMode, this.activeTask);
    } else {
      this.startSession('focus', this.activeTask);
    }
  }

  startInterval() {
    clearInterval(this.timerId);
    this.timerId = setInterval(() => {
      this.timeLeft--;
      this.notifyTick();

      if (this.timeLeft <= 0) {
        this.handleComplete();
      }
    }, 1000);
  }

  handleComplete() {
    clearInterval(this.timerId);
    this.timerId = null;
    this.status = 'idle';

    // Play Chime
    this.soundSynth.playChime(this.store.settings.soundEnabled);

    // Browser Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const title = this.mode === 'focus' ? '🎉 집중 세션 완료!' : '☕️ 휴식 종료!';
      const body = this.mode === 'focus'
        ? `${this.activeTask?.title || '작업'} 25분 집중을 완료했습니다. 이제 5분간 휴식을 취해보세요.`
        : '휴식 시간이 끝났습니다. 다시 멋지게 집중을 시작해볼까요?';
      new Notification(title, { body, icon: '🍅' });
    }

    if (this.mode === 'focus') {
      this.cycleCount++;
      const sessionMinutes = Math.round(this.totalDuration / 60);
      if (this.activeTask) {
        this.store.incrementTaskPomo(this.activeTask.id, sessionMinutes);
      }
      this.onComplete('focus', this.activeTask, this.cycleCount);
    } else {
      this.onComplete('break', this.activeTask, this.cycleCount);
    }

    this.notifyState();
  }

  notifyTick() {
    if (this.onTick) {
      this.onTick(this.timeLeft, this.totalDuration);
    }
  }

  notifyState() {
    if (this.onStateChange) {
      this.onStateChange({
        status: this.status,
        mode: this.mode,
        timeLeft: this.timeLeft,
        totalDuration: this.totalDuration,
        activeTask: this.activeTask,
        cycleCount: this.cycleCount
      });
    }
  }
}

// ==========================================================================
// 5. UI Application Controller
// ==========================================================================
class TaskFlowApp {
  constructor() {
    this.store = new TaskStore();
    this.soundSynth = new SoundSynthesizer();
    this.currentFilter = 'all';
    this.currentCategoryFilter = null;
    this.searchQuery = '';
    this.currentSort = 'order';
    this.editingTaskId = null;

    this.pomoEngine = new PomodoroEngine(
      this.store,
      this.soundSynth,
      (left, total) => this.renderTimerTick(left, total),
      (state) => this.renderTimerState(state),
      (type, task, cycles) => this.onTimerCompleted(type, task, cycles)
    );

    this.initDOM();
    this.initEvents();
    this.applyTheme(this.store.settings.theme);
    this.renderAll();
  }

  // DOM 캐싱
  initDOM() {
    // Header
    this.currentDateDisplay = document.getElementById('currentDateDisplay');
    this.headerCompletionRate = document.getElementById('headerCompletionRate');
    this.headerProgressBar = document.getElementById('headerProgressBar');
    this.headerFocusTime = document.getElementById('headerFocusTime');
    this.headerPomoCount = document.getElementById('headerPomoCount');
    this.themeToggleBtn = document.getElementById('themeToggleBtn');
    this.openSettingsBtn = document.getElementById('openSettingsBtn');

    // Sidebar
    this.appSidebar = document.getElementById('appSidebar');
    this.closeSidebarBtn = document.getElementById('closeSidebarBtn');
    this.filterNavList = document.getElementById('filterNavList');
    this.categoryNavList = document.getElementById('categoryNavList');
    this.addCategoryBtn = document.getElementById('addCategoryBtn');

    // Counter Badges
    this.countAll = document.getElementById('countAll');
    this.countToday = document.getElementById('countToday');
    this.countImportant = document.getElementById('countImportant');
    this.countPomo = document.getElementById('countPomo');
    this.countCompleted = document.getElementById('countCompleted');

    // Mobile Bar
    this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
    this.mobileCurrentFilterTitle = document.getElementById('mobileCurrentFilterTitle');
    this.mobileAddBtn = document.getElementById('mobileAddBtn');

    // Task Create Form
    this.taskCreateForm = document.getElementById('taskCreateForm');
    this.taskTitleInput = document.getElementById('taskTitleInput');
    this.newPrioritySelect = document.getElementById('newPrioritySelect');
    this.newCategorySelect = document.getElementById('newCategorySelect');
    this.newTargetPomoSelect = document.getElementById('newTargetPomoSelect');
    this.newDueDateInput = document.getElementById('newDueDateInput');

    // Toolbar
    this.currentViewTitle = document.getElementById('currentViewTitle');
    this.taskTotalCounter = document.getElementById('taskTotalCounter');
    this.taskSearchInput = document.getElementById('taskSearchInput');
    this.clearSearchBtn = document.getElementById('clearSearchBtn');
    this.taskSortSelect = document.getElementById('taskSortSelect');
    this.clearCompletedBtn = document.getElementById('clearCompletedBtn');

    // Feeds & Empty State
    this.tasksFeedContainer = document.getElementById('tasksFeedContainer');
    this.emptyStateContainer = document.getElementById('emptyStateContainer');
    this.emptyAddBtn = document.getElementById('emptyAddBtn');

    // Mini Player
    this.miniPomoPlayer = document.getElementById('miniPomoPlayer');
    this.miniSessionType = document.getElementById('miniSessionType');
    this.miniTaskTitle = document.getElementById('miniTaskTitle');
    this.miniTimerDisplay = document.getElementById('miniTimerDisplay');
    this.miniToggleBtn = document.getElementById('miniToggleBtn');
    this.miniMaximizeBtn = document.getElementById('miniMaximizeBtn');

    // Zen Focus Mode Overlay
    this.zenFocusOverlay = document.getElementById('zenFocusOverlay');
    this.zenAmbientGlow = document.getElementById('zenAmbientGlow');
    this.zenSoundToggleBtn = document.getElementById('zenSoundToggleBtn');
    this.zenSoundIcon = document.getElementById('zenSoundIcon');
    this.zenMinimizeBtn = document.getElementById('zenMinimizeBtn');
    this.zenExitBtn = document.getElementById('zenExitBtn');
    this.zenSessionBadge = document.getElementById('zenSessionBadge');
    this.zenSessionBadgeText = document.getElementById('zenSessionBadgeText');
    this.zenTaskTitle = document.getElementById('zenTaskTitle');
    this.zenCategoryPill = document.getElementById('zenCategoryPill');
    this.zenPriorityPill = document.getElementById('zenPriorityPill');
    this.zenTimerProgressRing = document.getElementById('zenTimerProgressRing');
    this.zenTimerDigits = document.getElementById('zenTimerDigits');
    this.zenTimerSubtext = document.getElementById('zenTimerSubtext');
    this.zenPomoDots = document.getElementById('zenPomoDots');
    this.zenMainToggleBtn = document.getElementById('zenMainToggleBtn');
    this.zenMainToggleIcon = document.getElementById('zenMainToggleIcon');
    this.zenMainToggleText = document.getElementById('zenMainToggleText');
    this.zenResetBtn = document.getElementById('zenResetBtn');
    this.zenSkipBtn = document.getElementById('zenSkipBtn');
    this.zenSubtasksCard = document.getElementById('zenSubtasksCard');
    this.zenSubtaskProgress = document.getElementById('zenSubtaskProgress');
    this.zenSubtaskList = document.getElementById('zenSubtaskList');
    this.zenQuickSubtaskInput = document.getElementById('zenQuickSubtaskInput');
    this.zenCompleteTaskBtn = document.getElementById('zenCompleteTaskBtn');

    // Task Detail Drawer
    this.drawerBackdrop = document.getElementById('drawerBackdrop');
    this.taskDetailDrawer = document.getElementById('taskDetailDrawer');
    this.closeDrawerBtn = document.getElementById('closeDrawerBtn');
    this.drawerTaskTitle = document.getElementById('drawerTaskTitle');
    this.drawerPriority = document.getElementById('drawerPriority');
    this.drawerCategory = document.getElementById('drawerCategory');
    this.drawerDueDate = document.getElementById('drawerDueDate');
    this.drawerTargetPomo = document.getElementById('drawerTargetPomo');
    this.drawerCompletedPomoText = document.getElementById('drawerCompletedPomoText');
    this.drawerStartPomoBtn = document.getElementById('drawerStartPomoBtn');
    this.drawerNotes = document.getElementById('drawerNotes');
    this.drawerSubtasksCount = document.getElementById('drawerSubtasksCount');
    this.drawerSubtasksList = document.getElementById('drawerSubtasksList');
    this.newSubtaskInput = document.getElementById('newSubtaskInput');
    this.addSubtaskBtn = document.getElementById('addSubtaskBtn');
    this.drawerDeleteTaskBtn = document.getElementById('drawerDeleteTaskBtn');
    this.drawerSaveBtn = document.getElementById('drawerSaveBtn');

    // Modals
    this.settingsModal = document.getElementById('settingsModal');
    this.closeSettingsModalBtn = document.getElementById('closeSettingsModalBtn');
    this.cfgFocusDuration = document.getElementById('cfgFocusDuration');
    this.cfgShortBreak = document.getElementById('cfgShortBreak');
    this.cfgLongBreak = document.getElementById('cfgLongBreak');
    this.cfgSoundEnabled = document.getElementById('cfgSoundEnabled');
    this.testSoundBtn = document.getElementById('testSoundBtn');
    this.exportDataBtn = document.getElementById('exportDataBtn');
    this.importDataInput = document.getElementById('importDataInput');
    this.resetDataBtn = document.getElementById('resetDataBtn');
    this.saveSettingsBtn = document.getElementById('saveSettingsBtn');

    // Category Modal
    this.categoryModal = document.getElementById('categoryModal');
    this.closeCategoryModalBtn = document.getElementById('closeCategoryModalBtn');
    this.newCategoryName = document.getElementById('newCategoryName');
    this.categoryColorPicker = document.getElementById('categoryColorPicker');
    this.submitNewCategoryBtn = document.getElementById('submitNewCategoryBtn');

    // Toast Container
    this.toastContainer = document.getElementById('toastContainer');
  }

  // 이벤트 바인딩
  initEvents() {
    // 테마 토글
    this.themeToggleBtn.addEventListener('click', () => {
      const nextTheme = document.body.classList.contains('theme-light') ? 'dark' : 'light';
      this.applyTheme(nextTheme);
      this.store.settings.theme = nextTheme;
      this.store.saveSettings();
    });

    // 필터 클릭
    this.filterNavList.addEventListener('click', (e) => {
      const item = e.target.closest('.nav-item');
      if (item) {
        this.filterNavList.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        this.currentFilter = item.dataset.filter;
        this.currentCategoryFilter = null;
        this.updateViewTitle();
        this.renderTasks();
        this.closeSidebarOnMobile();
      }
    });

    // 카테고리 필터 클릭
    this.categoryNavList.addEventListener('click', (e) => {
      const item = e.target.closest('.nav-item');
      if (item) {
        this.filterNavList.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        this.categoryNavList.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        this.currentFilter = 'category';
        this.currentCategoryFilter = item.dataset.category;
        this.updateViewTitle();
        this.renderTasks();
        this.closeSidebarOnMobile();
      }
    });

    // 모바일 사이드바
    this.mobileMenuBtn?.addEventListener('click', () => {
      this.appSidebar.classList.add('open');
    });
    this.closeSidebarBtn?.addEventListener('click', () => {
      this.closeSidebarOnMobile();
    });

    // 할 일 등록
    this.taskCreateForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = this.taskTitleInput.value.trim();
      if (!title) return;

      this.store.addTask({
        title,
        priority: this.newPrioritySelect.value,
        category: this.newCategorySelect.value,
        targetPomo: this.newTargetPomoSelect.value,
        dueDate: this.newDueDateInput.value
      });

      this.taskTitleInput.value = '';
      this.newDueDateInput.value = '';
      this.renderAll();
      this.showToast('새로운 할 일이 추가되었습니다! 🎯');
    });

    // 검색
    this.taskSearchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.clearSearchBtn.classList.toggle('hide', !this.searchQuery);
      this.renderTasks();
    });

    this.clearSearchBtn.addEventListener('click', () => {
      this.taskSearchInput.value = '';
      this.searchQuery = '';
      this.clearSearchBtn.classList.add('hide');
      this.renderTasks();
    });

    // 정렬
    this.taskSortSelect.addEventListener('change', (e) => {
      this.currentSort = e.target.value;
      this.renderTasks();
    });

    // 완료 일괄 정리
    this.clearCompletedBtn.addEventListener('click', () => {
      const completedCount = this.store.tasks.filter(t => t.completed).length;
      if (completedCount === 0) {
        this.showToast('완료된 할 일이 없습니다.');
        return;
      }
      if (confirm(`완료된 ${completedCount}개의 할 일을 목록에서 정리하시겠습니까?`)) {
        this.store.clearCompletedTasks();
        this.renderAll();
        this.showToast('완료된 할 일을 모두 정리했습니다.');
      }
    });

    // 빈 화면 추가 버튼
    this.emptyAddBtn?.addEventListener('click', () => {
      this.taskTitleInput.focus();
    });

    // 카테고리 모달 열기
    this.addCategoryBtn.addEventListener('click', () => {
      this.openCategoryModal();
    });
    this.closeCategoryModalBtn.addEventListener('click', () => {
      this.categoryModal.classList.add('hide');
    });
    this.submitNewCategoryBtn.addEventListener('click', () => {
      const name = this.newCategoryName.value.trim();
      if (!name) {
        alert('카테고리 이름을 입력하세요.');
        return;
      }
      const activeColorDot = this.categoryColorPicker.querySelector('.color-dot.active');
      const color = activeColorDot ? activeColorDot.dataset.color : '#6366F1';

      this.store.addCategory(name, color);
      this.categoryModal.classList.add('hide');
      this.newCategoryName.value = '';
      this.renderCategories();
      this.showToast(`'${name}' 카테고리가 추가되었습니다.`);
    });

    this.categoryColorPicker.addEventListener('click', (e) => {
      const dot = e.target.closest('.color-dot');
      if (dot) {
        this.categoryColorPicker.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
      }
    });

    // 설정 모달
    this.openSettingsBtn.addEventListener('click', () => {
      this.openSettingsModal();
    });
    this.closeSettingsModalBtn.addEventListener('click', () => {
      this.settingsModal.classList.add('hide');
    });

    this.testSoundBtn.addEventListener('click', () => {
      this.soundSynth.playChime(true);
    });

    this.saveSettingsBtn.addEventListener('click', () => {
      this.store.settings.focusTime = parseInt(this.cfgFocusDuration.value, 10) || 25;
      this.store.settings.shortBreak = parseInt(this.cfgShortBreak.value, 10) || 5;
      this.store.settings.longBreak = parseInt(this.cfgLongBreak.value, 10) || 15;
      this.store.settings.soundEnabled = this.cfgSoundEnabled.checked;
      this.store.saveSettings();

      this.settingsModal.classList.add('hide');
      this.showToast('설정이 저장되었습니다.');

      // Request browser notification permission if not asked
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    });

    // JSON 백업 / 복구
    this.exportDataBtn.addEventListener('click', () => {
      const exportObj = {
        tasks: this.store.tasks,
        categories: this.store.categories,
        settings: this.store.settings,
        stats: this.store.stats,
        exportedAt: new Date().toISOString()
      };
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObj, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `TaskFlow_Backup_${getTodayString()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      this.showToast('데이터 백업 파일이 다운로드되었습니다.');
    });

    this.importDataInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (imported.tasks && imported.categories) {
            this.store.tasks = imported.tasks;
            this.store.categories = imported.categories;
            if (imported.settings) this.store.settings = imported.settings;
            if (imported.stats) this.store.stats = imported.stats;
            this.store.saveTasks();
            this.store.saveCategories();
            this.store.saveSettings();
            this.store.saveStats();
            this.renderAll();
            this.settingsModal.classList.add('hide');
            this.showToast('데이터가 성공적으로 복원되었습니다! ✨');
          } else {
            alert('유효하지 않은 백업 파일 형식입니다.');
          }
        } catch (err) {
          alert('파일을 읽는 중 오류가 발생했습니다: ' + err.message);
        }
      };
      reader.readAsText(file);
    });

    this.resetDataBtn.addEventListener('click', () => {
      if (confirm('모든 데이터를 샘플 상태로 초기화하시겠습니까? 현재 변경사항은 삭제됩니다.')) {
        this.store.resetAllToSample();
        this.renderAll();
        this.settingsModal.classList.add('hide');
        this.showToast('기본 데이터로 초기화되었습니다.');
      }
    });

    // 상세 서랍
    this.drawerBackdrop.addEventListener('click', () => this.closeDrawer());
    this.closeDrawerBtn.addEventListener('click', () => this.closeDrawer());
    this.drawerSaveBtn.addEventListener('click', () => this.saveDrawerChanges());
    this.drawerDeleteTaskBtn.addEventListener('click', () => {
      if (this.editingTaskId && confirm('이 할 일을 정말 삭제하시겠습니까?')) {
        this.store.deleteTask(this.editingTaskId);
        this.closeDrawer();
        this.renderAll();
        this.showToast('할 일이 삭제되었습니다.');
      }
    });

    this.drawerStartPomoBtn.addEventListener('click', () => {
      const task = this.store.tasks.find(t => t.id === this.editingTaskId);
      if (task) {
        this.closeDrawer();
        this.launchZenMode(task);
      }
    });

    // 서브태스크 추가
    this.addSubtaskBtn.addEventListener('click', () => this.addSubtaskFromDrawer());
    this.newSubtaskInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.addSubtaskFromDrawer();
      }
    });

    // Zen Focus Mode 컨트롤
    this.zenMainToggleBtn.addEventListener('click', () => {
      this.pomoEngine.togglePlayPause();
    });

    this.zenResetBtn.addEventListener('click', () => {
      this.pomoEngine.reset();
      this.showToast('타이머가 초기화되었습니다.');
    });

    this.zenSkipBtn.addEventListener('click', () => {
      this.pomoEngine.skip();
      this.showToast('다음 세션으로 전환되었습니다.');
    });

    this.zenMinimizeBtn.addEventListener('click', () => {
      this.zenFocusOverlay.classList.add('hide');
      this.miniPomoPlayer.classList.remove('hide');
    });

    this.zenExitBtn.addEventListener('click', () => {
      if (confirm('집중 모드를 종료하시겠습니까? (타이머는 일시정지됩니다)')) {
        this.pomoEngine.pause();
        this.zenFocusOverlay.classList.add('hide');
        this.miniPomoPlayer.classList.remove('hide');
      }
    });

    this.zenSoundToggleBtn.addEventListener('click', () => {
      this.store.settings.soundEnabled = !this.store.settings.soundEnabled;
      this.store.saveSettings();
      this.updateZenSoundIcon();
      this.showToast(this.store.settings.soundEnabled ? '사운드 알림 켜짐 🔔' : '사운드 알림 꺼짐 🔕');
    });

    this.zenCompleteTaskBtn.addEventListener('click', () => {
      if (this.pomoEngine.activeTask) {
        this.store.toggleTaskCompleted(this.pomoEngine.activeTask.id);
        this.soundSynth.playPop(this.store.settings.soundEnabled);
        this.showToast(`🎉 '${this.pomoEngine.activeTask.title}' 완료! 대단해요!`);
        this.renderAll();
        this.zenFocusOverlay.classList.add('hide');
        this.miniPomoPlayer.classList.add('hide');
      }
    });

    this.zenQuickSubtaskInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const text = e.target.value.trim();
        if (text && this.pomoEngine.activeTask) {
          const subtasks = this.pomoEngine.activeTask.subtasks || [];
          subtasks.push({ id: 'sub_' + Date.now(), title: text, completed: false });
          this.store.updateTask(this.pomoEngine.activeTask.id, { subtasks });
          e.target.value = '';
          this.renderZenSubtasks(this.pomoEngine.activeTask);
        }
      }
    });

    // 미니 플레이어 컨트롤
    this.miniToggleBtn.addEventListener('click', () => {
      this.pomoEngine.togglePlayPause();
    });
    this.miniMaximizeBtn.addEventListener('click', () => {
      this.miniPomoPlayer.classList.add('hide');
      this.zenFocusOverlay.classList.remove('hide');
    });
  }

  // 테마 적용
  applyTheme(theme) {
    if (theme === 'light') {
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
    } else {
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
    }
  }

  closeSidebarOnMobile() {
    this.appSidebar.classList.remove('open');
  }

  // ==========================================================================
  // Render Methods
  // ==========================================================================
  renderAll() {
    this.renderDate();
    this.renderHeaderStats();
    this.renderCategorySelects();
    this.renderCategories();
    this.renderCounterBadges();
    this.renderTasks();
    if (window.lucide) lucide.createIcons();
  }

  renderDate() {
    const now = new Date();
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const formatted = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${days[now.getDay()]}`;
    this.currentDateDisplay.textContent = formatted;
  }

  renderHeaderStats() {
    const total = this.store.tasks.length;
    const completed = this.store.tasks.filter(t => t.completed).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    this.headerCompletionRate.textContent = `${rate}%`;
    this.headerProgressBar.style.width = `${rate}%`;

    const focusMinutes = this.store.stats.totalFocusMinutes || 0;
    const pomoCount = this.store.stats.completedPomodoros || 0;
    this.headerFocusTime.textContent = `${focusMinutes}분`;
    this.headerPomoCount.textContent = `🍅 ${pomoCount}`;
  }

  renderCategorySelects() {
    const optionsHtml = this.store.categories.map(cat => 
      `<option value="${cat.id}">${cat.name}</option>`
    ).join('');

    this.newCategorySelect.innerHTML = optionsHtml;
    this.drawerCategory.innerHTML = optionsHtml;
  }

  renderCategories() {
    const html = this.store.categories.map(cat => {
      const count = this.store.tasks.filter(t => t.category === cat.id && !t.completed).length;
      const isActive = (this.currentFilter === 'category' && this.currentCategoryFilter === cat.id) ? 'active' : '';
      return `
        <li class="nav-item ${isActive}" data-category="${cat.id}">
          <span class="category-dot" style="background: ${cat.color};"></span>
          <span class="nav-text">${cat.name}</span>
          <span class="nav-badge">${count}</span>
        </li>
      `;
    }).join('');

    this.categoryNavList.innerHTML = html;
  }

  renderCounterBadges() {
    const todayStr = getTodayString();
    this.countAll.textContent = this.store.tasks.length;
    this.countToday.textContent = this.store.tasks.filter(t => t.dueDate === todayStr && !t.completed).length;
    this.countImportant.textContent = this.store.tasks.filter(t => t.priority === 'high' && !t.completed).length;
    this.countPomo.textContent = this.store.tasks.filter(t => (t.completedPomo > 0 || t.targetPomo > 0) && !t.completed).length;
    this.countCompleted.textContent = this.store.tasks.filter(t => t.completed).length;
  }

  updateViewTitle() {
    const titles = {
      all: '전체 할 일',
      today: '☀️ 오늘 할 일',
      important: '⭐️ 중요 작업',
      pomo: '🍅 뽀모도로 진행 중',
      completed: '✅ 완료된 작업'
    };

    if (this.currentFilter === 'category' && this.currentCategoryFilter) {
      const cat = this.store.categories.find(c => c.id === this.currentCategoryFilter);
      const title = cat ? `📁 ${cat.name}` : '카테고리';
      this.currentViewTitle.textContent = title;
      if (this.mobileCurrentFilterTitle) this.mobileCurrentFilterTitle.textContent = title;
    } else {
      const title = titles[this.currentFilter] || '할 일 목록';
      this.currentViewTitle.textContent = title;
      if (this.mobileCurrentFilterTitle) this.mobileCurrentFilterTitle.textContent = title;
    }
  }

  getFilteredTasks() {
    const todayStr = getTodayString();
    let list = [...this.store.tasks];

    // Filter by type
    if (this.currentFilter === 'today') {
      list = list.filter(t => t.dueDate === todayStr);
    } else if (this.currentFilter === 'important') {
      list = list.filter(t => t.priority === 'high');
    } else if (this.currentFilter === 'pomo') {
      list = list.filter(t => (t.completedPomo > 0 || t.targetPomo > 0) && !t.completed);
    } else if (this.currentFilter === 'completed') {
      list = list.filter(t => t.completed);
    } else if (this.currentFilter === 'category' && this.currentCategoryFilter) {
      list = list.filter(t => t.category === this.currentCategoryFilter);
    }

    // Search query
    if (this.searchQuery) {
      list = list.filter(t => 
        t.title.toLowerCase().includes(this.searchQuery) || 
        (t.notes && t.notes.toLowerCase().includes(this.searchQuery))
      );
    }

    // Sorting
    list.sort((a, b) => {
      // Completed items always sink to the bottom
      if (a.completed !== b.completed) return a.completed ? 1 : -1;

      if (this.currentSort === 'priority') {
        const order = { high: 1, medium: 2, low: 3 };
        return (order[a.priority] || 2) - (order[b.priority] || 2);
      } else if (this.currentSort === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      } else if (this.currentSort === 'pomo') {
        return (b.completedPomo || 0) - (a.completedPomo || 0);
      } else if (this.currentSort === 'title') {
        return a.title.localeCompare(b.title);
      }
      return (a.order || 0) - (b.order || 0);
    });

    return list;
  }

  renderTasks() {
    const filtered = this.getFilteredTasks();
    this.taskTotalCounter.textContent = `${filtered.length}개의 할 일`;

    if (filtered.length === 0) {
      this.tasksFeedContainer.innerHTML = '';
      this.emptyStateContainer.classList.remove('hide');
      return;
    }

    this.emptyStateContainer.classList.add('hide');

    const cardsHtml = filtered.map(task => {
      const cat = this.store.categories.find(c => c.id === task.category) || { name: '일반', color: '#6366F1' };
      const priorityLabels = { high: '🔥 긴급', medium: '보통', low: '낮음' };
      const priorityClasses = { high: 'badge-priority-high', medium: 'badge-priority-med', low: 'badge-priority-low' };

      // D-Day Badge
      let dDayBadgeHtml = '';
      if (task.dueDate) {
        const dday = this.calculateDDay(task.dueDate);
        dDayBadgeHtml = `<span class="badge-tag badge-due-date ${dday.cls}"><i data-lucide="calendar"></i> ${dday.text}</span>`;
      }

      // Subtask progress
      let subtaskBadgeHtml = '';
      if (task.subtasks && task.subtasks.length > 0) {
        const doneSub = task.subtasks.filter(s => s.completed).length;
        subtaskBadgeHtml = `<span class="badge-tag badge-category"><i data-lucide="check-square"></i> ${doneSub}/${task.subtasks.length}</span>`;
      }

      return `
        <div class="task-card priority-${task.priority} ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
          <!-- Animated Checkbox -->
          <div class="task-checkbox-wrap" data-action="toggle-complete">
            <div class="task-checkbox">
              <i data-lucide="check"></i>
            </div>
          </div>

          <!-- Card Body Click opens Drawer -->
          <div class="task-card-body" data-action="open-detail">
            <div class="task-title-row">
              <span class="task-title">${this.escapeHtml(task.title)}</span>
              ${task.notes ? '<i data-lucide="align-left" class="task-has-memo-icon" title="메모 있음"></i>' : ''}
            </div>
            <div class="task-badges-row">
              <span class="badge-tag ${priorityClasses[task.priority]}">${priorityLabels[task.priority]}</span>
              <span class="badge-tag badge-category" style="border-left: 2px solid ${cat.color};">${cat.name}</span>
              ${dDayBadgeHtml}
              ${subtaskBadgeHtml}
              <span class="task-pomo-pill" title="뽀모도로 진행: ${task.completedPomo || 0} / 목표 ${task.targetPomo}개">
                🍅 ${task.completedPomo || 0}/${task.targetPomo}
              </span>
            </div>
          </div>

          <!-- Card Actions -->
          <div class="task-card-actions">
            ${!task.completed ? `
              <button class="btn-launch-pomo" data-action="start-pomo" title="이 작업 뽀모도로 포커스 시작">
                <i data-lucide="play"></i>
                <span>집중 시작</span>
              </button>
            ` : ''}
            <button class="btn-card-action" data-action="open-detail" title="수정 및 세부 메모">
              <i data-lucide="more-horizontal"></i>
            </button>
            <button class="btn-card-action btn-delete" data-action="delete-task" title="삭제">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    this.tasksFeedContainer.innerHTML = cardsHtml;
    if (window.lucide) lucide.createIcons();

    // Event Delegation for Task Cards
    this.tasksFeedContainer.onclick = (e) => {
      const card = e.target.closest('.task-card');
      if (!card) return;
      const taskId = card.dataset.taskId;
      const actionEl = e.target.closest('[data-action]');
      const action = actionEl ? actionEl.dataset.action : 'open-detail';

      if (action === 'toggle-complete') {
        const updated = this.store.toggleTaskCompleted(taskId);
        if (updated) {
          if (updated.completed) {
            this.soundSynth.playPop(this.store.settings.soundEnabled);
            this.showToast('할 일 완료! 멋져요! 🎉');
          }
          this.renderAll();
        }
      } else if (action === 'start-pomo') {
        const task = this.store.tasks.find(t => t.id === taskId);
        if (task) this.launchZenMode(task);
      } else if (action === 'delete-task') {
        if (confirm('이 할 일을 삭제하시겠습니까?')) {
          this.store.deleteTask(taskId);
          this.renderAll();
          this.showToast('할 일이 삭제되었습니다.');
        }
      } else if (action === 'open-detail') {
        this.openDrawer(taskId);
      }
    };
  }

  calculateDDay(dateStr) {
    const today = new Date(getTodayString());
    const target = new Date(dateStr);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `마감 ${Math.abs(diffDays)}일 지남`, cls: 'urgent' };
    } else if (diffDays === 0) {
      return { text: '오늘 마감', cls: 'today' };
    } else if (diffDays === 1) {
      return { text: '내일 마감 (D-1)', cls: 'today' };
    } else {
      return { text: `D-${diffDays}`, cls: '' };
    }
  }

  // ==========================================================================
  // Zen Focus Mode & Timer UI
  // ==========================================================================
  launchZenMode(task) {
    this.pomoEngine.setActiveTask(task);
    this.pomoEngine.startSession('focus', task);

    this.zenTaskTitle.textContent = task.title;
    const cat = this.store.categories.find(c => c.id === task.category);
    this.zenCategoryPill.textContent = cat ? `📁 ${cat.name}` : '일반';
    this.zenPriorityPill.textContent = task.priority === 'high' ? '🔥 High' : (task.priority === 'medium' ? 'Medium' : 'Low');

    this.renderZenSubtasks(task);
    this.updateZenSoundIcon();

    this.zenFocusOverlay.classList.remove('hide');
    this.miniPomoPlayer.classList.add('hide');

    if (window.lucide) lucide.createIcons();
  }

  renderZenSubtasks(task) {
    if (!task.subtasks || task.subtasks.length === 0) {
      this.zenSubtaskList.innerHTML = '<div style="color: var(--text-dim); font-size: 0.8rem; padding: 4px;">하위 체크리스트가 없습니다.</div>';
      this.zenSubtaskProgress.textContent = '0/0';
      return;
    }

    const doneCount = task.subtasks.filter(s => s.completed).length;
    this.zenSubtaskProgress.textContent = `${doneCount}/${task.subtasks.length}`;

    this.zenSubtaskList.innerHTML = task.subtasks.map(st => `
      <div class="zen-subtask-item ${st.completed ? 'completed' : ''}" data-subtask-id="${st.id}">
        <input type="checkbox" ${st.completed ? 'checked' : ''} style="cursor: pointer;">
        <span>${this.escapeHtml(st.title)}</span>
      </div>
    `).join('');

    this.zenSubtaskList.querySelectorAll('.zen-subtask-item').forEach(item => {
      item.onclick = (e) => {
        const subId = item.dataset.subtaskId;
        const sub = task.subtasks.find(s => s.id === subId);
        if (sub) {
          sub.completed = !sub.completed;
          this.store.saveTasks();
          this.renderZenSubtasks(task);
        }
      };
    });
  }

  renderTimerTick(timeLeft, totalDuration) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Update Digits
    this.zenTimerDigits.textContent = timeStr;
    this.miniTimerDisplay.textContent = timeStr;

    // Title Tag reflection
    document.title = `(${timeStr}) TaskFlow Focus`;

    // Circular SVG Progress Ring
    // Radius = 145, Circumference = 2 * PI * 145 ≈ 911.06
    const circumference = 911.06;
    const fraction = timeLeft / totalDuration;
    const offset = circumference * (1 - fraction);
    this.zenTimerProgressRing.style.strokeDashoffset = offset;
  }

  renderTimerState(state) {
    const isBreak = state.mode !== 'focus';

    // Zen UI Styling based on Focus vs Break
    if (isBreak) {
      this.zenAmbientGlow.classList.add('break-mode');
      this.zenSessionBadge.classList.add('break-mode');
      this.zenSessionBadgeText.textContent = state.mode === 'longBreak' ? '☕️ 15분 긴 휴식' : '☕️ 5분 짧은 휴식';
      this.zenTimerProgressRing.classList.add('break-mode');
      this.zenMainToggleBtn.classList.add('break-mode');
      this.zenTimerSubtext.textContent = '눈을 쉬어주고 가볍게 스트레칭하세요 🧘';
      this.miniSessionType.textContent = '휴식 세션';
      this.miniSessionType.style.color = '#34d399';
    } else {
      this.zenAmbientGlow.classList.remove('break-mode');
      this.zenSessionBadge.classList.remove('break-mode');
      this.zenSessionBadgeText.textContent = '🔥 25분 집중 세션';
      this.zenTimerProgressRing.classList.remove('break-mode');
      this.zenMainToggleBtn.classList.remove('break-mode');
      this.zenTimerSubtext.textContent = '호흡을 가다듬고 현재 작업에만 몰입하세요';
      this.miniSessionType.textContent = '집중 세션';
      this.miniSessionType.style.color = '#ff7676';
    }

    // Play/Pause button text & icon
    if (state.status === 'running') {
      this.zenMainToggleIcon.setAttribute('data-lucide', 'pause');
      this.zenMainToggleText.textContent = '일시정지';
      this.miniToggleBtn.innerHTML = '<i data-lucide="pause"></i>';
    } else {
      this.zenMainToggleIcon.setAttribute('data-lucide', 'play');
      this.zenMainToggleText.textContent = isBreak ? '휴식 시작' : '집중 계속';
      this.miniToggleBtn.innerHTML = '<i data-lucide="play"></i>';
    }

    // Mini Player title
    this.miniTaskTitle.textContent = state.activeTask?.title || '작업 진행 중';

    // Zen Pomodoro Dots
    if (state.activeTask) {
      const target = state.activeTask.targetPomo || 2;
      const completed = state.activeTask.completedPomo || 0;
      let dotsHtml = '';
      for (let i = 0; i < target; i++) {
        dotsHtml += i < completed ? '<span class="pomo-dot" title="완료 세션">🍅</span>' : '<span class="pomo-dot" style="opacity: 0.35;">⚪️</span>';
      }
      this.zenPomoDots.innerHTML = dotsHtml;
    }

    if (window.lucide) lucide.createIcons();
  }

  onTimerCompleted(type, task, cycles) {
    if (type === 'focus') {
      this.showToast(`🍅 뽀모도로 1세션 완료! 대단합니다! (+25분)`);
      this.renderAll();
      const nextMode = (cycles % 4 === 0) ? 'longBreak' : 'shortBreak';
      this.pomoEngine.startSession(nextMode, task);
    } else {
      this.showToast(`☕️ 휴식 종료! 다시 집중해볼까요?`);
      this.pomoEngine.startSession('focus', task);
    }
  }

  updateZenSoundIcon() {
    const isEnabled = this.store.settings.soundEnabled;
    this.zenSoundIcon.setAttribute('data-lucide', isEnabled ? 'volume-2' : 'volume-x');
    if (window.lucide) lucide.createIcons();
  }

  // ==========================================================================
  // Task Detail Drawer
  // ==========================================================================
  openDrawer(taskId) {
    const task = this.store.tasks.find(t => t.id === taskId);
    if (!task) return;

    this.editingTaskId = taskId;
    this.drawerTaskTitle.value = task.title;
    this.drawerPriority.value = task.priority;
    this.drawerCategory.value = task.category;
    this.drawerDueDate.value = task.dueDate || '';
    this.drawerTargetPomo.value = String(task.targetPomo || 2);
    this.drawerCompletedPomoText.textContent = `🍅 ${task.completedPomo || 0} / ${task.targetPomo} 세션 (${(task.completedPomo || 0) * 25}분 완료)`;
    this.drawerNotes.value = task.notes || '';

    this.renderDrawerSubtasks(task);

    this.drawerBackdrop.classList.remove('hide');
    this.taskDetailDrawer.classList.remove('hide');
    if (window.lucide) lucide.createIcons();
  }

  closeDrawer() {
    this.drawerBackdrop.classList.add('hide');
    this.taskDetailDrawer.classList.add('hide');
    this.editingTaskId = null;
  }

  renderDrawerSubtasks(task) {
    const subtasks = task.subtasks || [];
    const done = subtasks.filter(s => s.completed).length;
    this.drawerSubtasksCount.textContent = `${done}/${subtasks.length} 완료`;

    this.drawerSubtasksList.innerHTML = subtasks.map(st => `
      <div class="drawer-subtask-item ${st.completed ? 'completed' : ''}" data-subtask-id="${st.id}">
        <input type="checkbox" ${st.completed ? 'checked' : ''}>
        <span>${this.escapeHtml(st.title)}</span>
        <button class="btn-del-subtask" title="하위 작업 삭제"><i data-lucide="x"></i></button>
      </div>
    `).join('');

    this.drawerSubtasksList.querySelectorAll('.drawer-subtask-item').forEach(item => {
      const subId = item.dataset.subtaskId;
      item.querySelector('input[type="checkbox"]').onchange = (e) => {
        const sub = task.subtasks.find(s => s.id === subId);
        if (sub) {
          sub.completed = e.target.checked;
          this.store.saveTasks();
          this.renderDrawerSubtasks(task);
          this.renderTasks();
        }
      };

      item.querySelector('.btn-del-subtask').onclick = () => {
        task.subtasks = task.subtasks.filter(s => s.id !== subId);
        this.store.saveTasks();
        this.renderDrawerSubtasks(task);
        this.renderTasks();
      };
    });

    if (window.lucide) lucide.createIcons();
  }

  addSubtaskFromDrawer() {
    const text = this.newSubtaskInput.value.trim();
    if (!text || !this.editingTaskId) return;

    const task = this.store.tasks.find(t => t.id === this.editingTaskId);
    if (task) {
      if (!task.subtasks) task.subtasks = [];
      task.subtasks.push({
        id: 'sub_' + Date.now(),
        title: text,
        completed: false
      });
      this.store.saveTasks();
      this.newSubtaskInput.value = '';
      this.renderDrawerSubtasks(task);
      this.renderTasks();
    }
  }

  saveDrawerChanges() {
    if (!this.editingTaskId) return;
    const updates = {
      title: this.drawerTaskTitle.value.trim(),
      priority: this.drawerPriority.value,
      category: this.drawerCategory.value,
      dueDate: this.drawerDueDate.value,
      targetPomo: parseInt(this.drawerTargetPomo.value, 10),
      notes: this.drawerNotes.value.trim()
    };

    if (!updates.title) {
      alert('작업명을 입력해주세요.');
      return;
    }

    this.store.updateTask(this.editingTaskId, updates);
    this.closeDrawer();
    this.renderAll();
    this.showToast('변경사항이 저장되었습니다.');
  }

  // ==========================================================================
  // Modals & Utilities
  // ==========================================================================
  openSettingsModal() {
    this.cfgFocusDuration.value = this.store.settings.focusTime || 25;
    this.cfgShortBreak.value = this.store.settings.shortBreak || 5;
    this.cfgLongBreak.value = this.store.settings.longBreak || 15;
    this.cfgSoundEnabled.checked = this.store.settings.soundEnabled;
    this.settingsModal.classList.remove('hide');
    if (window.lucide) lucide.createIcons();
  }

  openCategoryModal() {
    this.newCategoryName.value = '';
    this.categoryModal.classList.remove('hide');
    this.newCategoryName.focus();
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i data-lucide="bell" style="width: 16px; height: 16px; color: #ff7676;"></i> <span>${this.escapeHtml(message)}</span>`;
    this.toastContainer.appendChild(toast);
    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m]));
  }
}

// Application Entry Point
document.addEventListener('DOMContentLoaded', () => {
  window.app = new TaskFlowApp();
});
