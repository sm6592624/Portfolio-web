/*
 * Portfolio JavaScript - All the interactive magic happens here!
 * 
 * I wrote this over several coffee-fueled coding sessions.
 * Some parts might be a bit over-engineered, but hey, that's how I learn!
 * 
 * TODO: Refactor some of the animation functions (they work, but could be cleaner)
 * TODO: Add keyboard navigation support
 */

// Quick DOM helpers - because I'm lazy and don't want to type document.querySelector every time
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// App configuration - easier to change stuff from here
const config = {
  // Text for the typewriter effect in hero section
  typewriterTexts: [
    "BTech Student",
    "Aspiring Full Stack Developer",
    "MERN Stack Enthusiast", 
    "Machine Learning Student",
    "Problem Solver",
    "Future Software Engineer"
  ],
  
  // Animation timings - tweaked these until they felt right
  typewriterSpeed: 100,
  deleteSpeed: 50,
  pauseTime: 2000,
  loadingDuration: 2000,
  scrollThreshold: 100
};

// My projects data - I'm pretty proud of these!
const projects = [
  {
    name: "E-Waste Management System",
    category: "fullstack",
    description: "A comprehensive platform for managing electronic waste with real-time tracking, user authentication, and analytics dashboard.",
    link: "https://github.com/saranshmishra/e-waste-system",
    live: "https://e-waste-demo.netlify.app",
    technologies: ["React", "Node.js", "MongoDB", "Express"],
    image: "fas fa-recycle",
    featured: true
  },
  {
    name: "Weather Forecasting App",
    category: "web",
    description: "Real-time weather application with geolocation, 7-day forecast, and beautiful animations using modern APIs.",
    link: "https://github.com/saranshmishra/weather-app",
    live: "https://weather-forecast-sm.netlify.app",
    technologies: ["JavaScript", "API Integration", "CSS3", "HTML5"],
    image: "fas fa-cloud-sun",
    featured: true
  },
  {
    name: "Speech Translation Tool",
    category: "web",
    description: "Hackathon-winning project that translates speech in real-time with support for multiple languages and voice synthesis.",
    link: "https://github.com/saranshmishra/speech-translate",
    live: null,
    technologies: ["JavaScript", "Web Speech API", "Google Translate", "CSS3"],
    image: "fas fa-microphone",
    featured: false
  },
  {
    name: "React Todo Application",
    category: "web",
    description: "Modern todo app with drag-and-drop functionality, local storage, and beautiful animations built with React hooks.",
    link: "https://github.com/saranshmishra/react-todo",
    live: "https://react-todo-sm.netlify.app",
    technologies: ["React", "CSS3", "Local Storage", "React Hooks"],
    image: "fas fa-tasks",
    featured: false
  },
  {
    name: "Secure Login System",
    category: "fullstack",
    description: "Advanced authentication system with CAPTCHA, 2FA, password encryption, and session management.",
    link: "https://github.com/saranshmishra/login-captcha",
    live: null,
    technologies: ["Node.js", "Express", "bcrypt", "JWT", "MongoDB"],
    image: "fas fa-shield-alt",
    featured: true
  },
  {
    name: "Food Delivery Mobile App",
    category: "mobile",
    description: "Android app for food delivery with real-time tracking, payment integration, and user-friendly interface.",
    link: "https://github.com/saranshmishra/food-delivery-android",
    live: null,
    technologies: ["Java", "Android Studio", "Firebase", "Google Maps"],
    image: "fas fa-mobile-alt",
    featured: true
  },
  {
    name: "Chat Application",
    category: "React based",
    description: "Real-time chat application with Socket.io, group chats, file sharing, and emoji support.",
    link: "https://github.com/saranshmishra/chat-app",
    live: "https://chat-app-sm.herokuapp.com",
    technologies: ["Socket.io", "Node.js", "React", "MongoDB"],
    image: "fas fa-comments",
    featured: false
  },
  {
    name: "Expense Tracker",
    category: "mobile",
    description: "Android expense tracking app with budget management, category-wise analysis, and data visualization.",
    link: "https://github.com/saranshmishra/expense-tracker",
    live: null,
    technologies: ["Java", "SQLite", "Chart.js", "Android"],
    image: "fas fa-chart-pie",
    featured: false
  }
];

// State Management
// Global app state - keeping track of everything here
const appState = {
  currentTheme: localStorage.getItem('portfolio-theme') || 'dark', // Default to dark because it looks cooler
  isMenuOpen: false,
  currentProjectFilter: 'all',
  isPageLoading: true,
  hasAnimatedSkills: false,
  observedElements: new Set() // For tracking scroll animations
};

// Theme switcher - because everyone needs dark mode these days
class ThemeController {
  constructor() {
    this.setupTheme();
  }

  setupTheme() {
    this.applyTheme(appState.currentTheme);
    this.bindToggleEvents();
  }

  applyTheme(themeName) {
    appState.currentTheme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('portfolio-theme', themeName);
    this.updateToggleIcon();
  }

  switchTheme() {
    // Simple toggle between light and dark
    const newTheme = appState.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
  }

  updateToggleIcon() {
    const sunIcon = $('.toggle-icon.sun');
    const moonIcon = $('.toggle-icon.moon');
    const toggleSphere = $('.toggle-sphere');
    
    if (sunIcon && moonIcon && toggleSphere) {
      if (appState.currentTheme === 'dark') {
        // Dark theme - highlight moon icon
        sunIcon.style.color = 'rgba(255, 255, 255, 0.6)';
        moonIcon.style.color = '#fbbf24';
        moonIcon.style.transform = 'scale(1.1)';
        sunIcon.style.transform = 'scale(0.9)';
      } else {
        // Light theme - highlight sun icon
        sunIcon.style.color = '#f59e0b';
        moonIcon.style.color = 'rgba(255, 255, 255, 0.6)';
        sunIcon.style.transform = 'scale(1.1)';
        moonIcon.style.transform = 'scale(0.9)';
      }
    }
  }

  bindToggleEvents() {
    const themeToggle = $('#themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.switchTheme());
    }
  }
}

// Enhanced Typewriter Effect
class TypewriterEffect {
  constructor(element, texts, options = {}) {
    this.element = element;
    this.texts = texts;
    this.options = {
      typeSpeed: options.typeSpeed || 100,
      deleteSpeed: options.deleteSpeed || 50,
      pauseTime: options.pauseTime || 2000,
      loop: options.loop !== false,
      cursor: options.cursor !== false
    };
    
    this.textIndex = 0;
    this.charIndex = 0;
    this.isDeleting = false;
    this.isPaused = false;
    
    this.init();
  }

  init() {
    if (this.options.cursor) {
      this.element.style.borderRight = '2px solid';
      this.element.style.animation = 'blink 1s infinite';
    }
    this.type();
  }

  type() {
    const currentText = this.texts[this.textIndex];
    
    if (this.isDeleting) {
      this.element.textContent = currentText.substring(0, this.charIndex - 1);
      this.charIndex--;
    } else {
      this.element.textContent = currentText.substring(0, this.charIndex + 1);
      this.charIndex++;
    }

    let typeSpeed = this.options.typeSpeed;
    if (this.isDeleting) {
      typeSpeed = this.options.deleteSpeed;
    }

    if (!this.isDeleting && this.charIndex === currentText.length) {
      this.isPaused = true;
      typeSpeed = this.options.pauseTime;
      this.isDeleting = true;
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.textIndex = (this.textIndex + 1) % this.texts.length;
      typeSpeed = 500;
    }

    setTimeout(() => this.type(), typeSpeed);
  }
}

// Loading Screen Manager
class LoadingManager {
  constructor() {
    this.loader = $('#loader');
    this.progress = $('.progress');
    this.init();
  }

  init() {
    this.simulateLoading();
  }

  simulateLoading() {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => this.hideLoader(), 500);
      }
      if (this.progress) {
        this.progress.style.width = `${progress}%`;
      }
    }, 100);
  }

  hideLoader() {
    if (this.loader) {
      this.loader.classList.add('hidden');
      state.isLoading = false;
      setTimeout(() => {
        this.loader.style.display = 'none';
        this.initializeMainContent();
      }, 500);
    }
  }

  initializeMainContent() {
    // Initialize scroll animations
    scrollAnimations.init();
    
    // Initialize typewriter effect
    const typewriterElement = $('.typewriter');
    if (typewriterElement) {
      new TypewriterEffect(typewriterElement, config.typewriterTexts, {
        typeSpeed: config.typewriterSpeed,
        deleteSpeed: config.deleteSpeed,
        pauseTime: config.pauseTime
      });
    }
  }
}

// Navigation Manager
class NavigationManager {
  constructor() {
    this.navbar = $('.navbar-3d');
    this.mobileToggle = $('#mobileToggle');
    this.navLinks = $$('.nav-link-3d');
    this.logoCube = $('.logo-cube');
    this.init();
  }

  init() {
    this.bindEvents();
    this.handleScroll();
    this.initializeNavEffects();
  }

  bindEvents() {
    // Mobile menu toggle
    if (this.mobileToggle) {
      this.mobileToggle.addEventListener('click', () => this.toggleMobileMenu());
    }

    // Smooth scroll for nav links
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => this.handleNavClick(e));
    });

    // Scroll event for navbar
    window.addEventListener('scroll', () => this.handleScroll());

    // Logo cube interaction
    if (this.logoCube) {
      this.logoCube.addEventListener('mouseenter', () => this.animateLogo());
    }

    // Add parallax effect to nav particles
    this.initializeParticleParallax();
  }

  initializeNavEffects() {
    // Add entrance animation to nav links
    this.navLinks.forEach((link, index) => {
      link.style.opacity = '0';
      link.style.transform = 'translateY(-20px)';
      
      setTimeout(() => {
        link.style.transition = 'all 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)';
        link.style.opacity = '1';
        link.style.transform = 'translateY(0)';
      }, 100 * index);
    });
  }

  initializeParticleParallax() {
    const particles = $$('.nav-particle');
    
    document.addEventListener('mousemove', (e) => {
      const mouseX = e.clientX / window.innerWidth;
      const mouseY = e.clientY / window.innerHeight;
      
      particles.forEach((particle, index) => {
        const speed = (index + 1) * 0.5;
        const x = (mouseX - 0.5) * speed * 20;
        const y = (mouseY - 0.5) * speed * 20;
        
        particle.style.transform = `translate(${x}px, ${y}px)`;
      });
    });
  }

  animateLogo() {
    if (this.logoCube) {
      this.logoCube.style.animationDuration = '0.5s';
      setTimeout(() => {
        this.logoCube.style.animationDuration = '20s';
      }, 2000);
    }
  }

  toggleMobileMenu() {
    state.isMenuOpen = !state.isMenuOpen;
    this.mobileToggle.classList.toggle('active');
    
    // Animate hamburger lines
    const lines = this.mobileToggle.querySelectorAll('.line');
    lines.forEach((line, index) => {
      if (state.isMenuOpen) {
        switch(index) {
          case 0:
            line.style.transform = 'rotate(45deg) translate(5px, 5px)';
            break;
          case 1:
            line.style.opacity = '0';
            break;
          case 2:
            line.style.transform = 'rotate(-45deg) translate(7px, -6px)';
            break;
        }
      } else {
        line.style.transform = '';
        line.style.opacity = '1';
      }
    });
  }

  handleNavClick(e) {
    e.preventDefault();
    const targetId = e.target.getAttribute('href');
    const targetSection = $(targetId);
    
    if (targetSection) {
      const offsetTop = targetSection.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      
      this.updateActiveNavLink(targetId);
    }
  }

  updateActiveNavLink(activeId) {
    this.navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === activeId) {
        link.classList.add('active');
      }
    });
  }

  handleScroll() {
    const scrolled = window.pageYOffset;
    
    // Enhanced navbar background on scroll for 3D header
    if (this.navbar) {
      if (scrolled > 50) {
        this.navbar.parentElement.style.background = 'rgba(15, 23, 42, 0.98)';
        this.navbar.parentElement.style.backdropFilter = 'blur(30px)';
        this.navbar.parentElement.style.borderBottom = '1px solid rgba(99, 102, 241, 0.3)';
      } else {
        this.navbar.parentElement.style.background = 'rgba(15, 23, 42, 0.95)';
        this.navbar.parentElement.style.backdropFilter = 'blur(20px)';
        this.navbar.parentElement.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
      }
    }

    // Update active nav link based on scroll position
    this.updateActiveNavOnScroll();
  }

  updateActiveNavOnScroll() {
    const sections = $$('section[id]');
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (window.pageYOffset >= sectionTop) {
        current = '#' + section.getAttribute('id');
      }
    });
    
    if (current) {
      this.updateActiveNavLink(current);
    }
  }
}

// Project Manager
// Project showcase manager - handles all the fancy project filtering and animations
class ProjectShowcase {
  constructor() {
    // Grab the DOM elements we'll need
    this.projectContainer = $('#project-list');
    this.filterButtons = $$('.project-nav-btn-3d');
    this.categoryElements = $$('.project-category-3d');
    
    this.setupProjectDisplay();
  }

  setupProjectDisplay() {
    this.displayProjects();
    this.setupFilterButtons();
    this.animateProjectCounters();
  }

  displayProjects() {
    if (!this.projectContainer) return;
    
    // Clear existing projects
    this.projectContainer.innerHTML = '';
    
    // Filter projects based on current selection
    const projectsToShow = appState.currentProjectFilter === 'all' 
      ? projects 
      : projects.filter(project => project.category === appState.currentProjectFilter);

    // Create and add each project card
    projectsToShow.forEach((project, index) => {
      const projectCard = this.createProjectCard(project, index);
      this.projectContainer.appendChild(projectCard);
    });
  }

  createProjectCard(project, index) {
    // Create the main card element
    const card = document.createElement('div');
    card.className = 'project-card-3d fade-in';
    card.setAttribute('data-category', project.category);
    card.style.animationDelay = `${index * 0.1}s`; // Stagger the animations
    
    // Build the card HTML - probably could use a template but this works
    card.innerHTML = `
      <div class="project-card-inner">
        <div class="project-card-front">
          <div class="project-image-3d">
            <i class="${project.image}"></i>
          </div>
          <div class="project-header-3d">
            <h4 class="project-title-3d">${project.name}</h4>
            <span class="project-category-3d">${this.formatCategoryName(project.category)}</span>
          </div>
          <p class="project-description-3d">${project.description}</p>
          <div class="project-tech-3d">
            ${project.technologies.map(tech => `<span class="tech-tag-3d">${tech}</span>`).join('')}
          </div>
        </div>
        <div class="project-card-back">
          <h4>Project Details</h4>
          <p>${project.description}</p>
          <div class="project-tech-3d">
            ${project.technologies.map(tech => `<span class="tech-tag-3d">${tech}</span>`).join('')}
          </div>
          <div class="project-links-3d">
            <a href="${project.link}" target="_blank" rel="noopener" class="project-link-3d">
              <i class="fab fa-github"></i>
              Code
            </a>
            ${project.live ? `
              <a href="${project.live}" target="_blank" rel="noopener" class="project-link-3d">
                <i class="fas fa-external-link-alt"></i>
                Live Demo
              </a>
            ` : ''}
          </div>
        </div>
      </div>
    `;
    
    return card;
  }

  formatCategoryName(category) {
    // Simple mapping for display names
    const categoryNames = {
      'web': 'Web App',
      'mobile': 'Mobile App',
      'fullstack': 'Full Stack',
      'all': 'Featured'
    };
    return categoryNames[category] || category;
  }

  setupFilterButtons() {
    this.filterButtons.forEach(button => {
      // Click handler with some fancy animation feedback
      button.addEventListener('click', (e) => {
        const filter = e.currentTarget.getAttribute('data-category');
        
        // Add click animation
        button.style.transform = 'translateY(-8px) rotateX(5deg) rotateY(2deg) scale(1.02)';
        button.style.transition = 'all 0.1s ease';
        
        setTimeout(() => {
          button.style.transform = '';
          button.style.transition = '';
        }, 150);
        
        this.setActiveNavigation(filter);
        state.currentFilter = filter;
        this.animate3DProjectChange();
      });

      // Enhanced hover effects with dynamic shadows (desktop only)
      if (!this.isMobile()) {
        button.addEventListener('mouseenter', (e) => {
          this.addDynamicShadow(e.currentTarget);
        });

        button.addEventListener('mouseleave', (e) => {
          this.removeDynamicShadow(e.currentTarget);
        });

        // Mouse move effect for 3D tilt (desktop only)
        button.addEventListener('mousemove', (e) => {
          this.add3DTiltEffect(e, e.currentTarget);
        });
      }

      // Touch-friendly interactions for mobile
      if (this.isMobile()) {
        button.addEventListener('touchstart', (e) => {
          this.addMobileFeedback(e.currentTarget);
        });

        button.addEventListener('touchend', (e) => {
          this.removeMobileFeedback(e.currentTarget);
        });
      }
    });
  }

  isMobile() {
    return window.innerWidth <= 768 || 'ontouchstart' in window;
  }

  addMobileFeedback(button) {
    button.style.transform = 'translateY(-4px) scale(1.02)';
    button.style.boxShadow = `
      0 15px 40px rgba(6, 182, 212, 0.4),
      0 8px 20px rgba(6, 182, 212, 0.2)
    `;
  }

  removeMobileFeedback(button) {
    if (!button.classList.contains('active')) {
      button.style.transform = '';
      button.style.boxShadow = '';
    }
  }

  addDynamicShadow(button) {
    button.style.boxShadow = `
      0 25px 60px rgba(6, 182, 212, 0.6),
      0 15px 40px rgba(6, 182, 212, 0.4),
      0 5px 20px rgba(6, 182, 212, 0.8),
      inset 0 2px 4px rgba(255, 255, 255, 0.3)
    `;
  }

  removeDynamicShadow(button) {
    if (!button.classList.contains('active')) {
      button.style.boxShadow = '';
    }
  }

  add3DTiltEffect(e, button) {
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    const rotateX = (mouseY / rect.height) * 10;
    const rotateY = (mouseX / rect.width) * -10;
    
    button.style.transform = `
      translateY(-12px) 
      rotateX(${10 + rotateX}deg) 
      rotateY(${5 + rotateY}deg) 
      scale(1.08)
    `;
  }

  setActiveNavigation(filter) {
    this.navButtons.forEach(button => {
      button.classList.remove('active');
      if (button.getAttribute('data-category') === filter) {
        button.classList.add('active');
      }
    });
  }

  animate3DProjectChange() {
    const cards = $$('.project-card-3d');
    
    // Fade out current cards
    cards.forEach((card, index) => {
      card.style.transition = 'all 0.5s ease';
      card.style.transform = 'translateY(50px) rotateX(-15deg)';
      card.style.opacity = '0';
    });
    
    // Update content after animation
    setTimeout(() => {
      this.renderProjects();
      
      // Fade in new cards
      setTimeout(() => {
        const newCards = $$('.project-card-3d');
        newCards.forEach((card, index) => {
          card.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          card.style.animationDelay = `${index * 0.1}s`;
          card.style.transform = 'translateY(0) rotateX(0deg)';
          card.style.opacity = '1';
        });
      }, 100);
    }, 300);
  }

  initializeCounters() {
    // Animate counters in summary section
    const counters = $$('.animated-counter');
    counters.forEach(counter => {
      const target = parseInt(counter.textContent.replace(/\D/g, ''));
      this.animateCounter(counter, target);
    });
  }

  animateCounter(element, target) {
    let current = 0;
    const increment = target / 30;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current) + (element.textContent.includes('+') ? '+' : '');
    }, 50);
  }
}

// Advanced 3D Skills Animation Manager
class Advanced3DSkillsManager {
  constructor() {
    this.skillNavButtons = $$('.skill-nav-btn');
    this.skillsOverview = $('#skillsOverview');
    this.skillCategories3D = $$('.skill-category-3d');
    this.skillCards3D = $$('.skill-card-3d');
    this.skillSatellites = $$('.skill-satellite');
    this.isAnimated = false;
    this.currentCategory = 'all';
    this.init();
  }

  init() {
    this.bindNavigation();
    this.observeSkillsSection();
    this.initSkillHovers();
    this.initSatelliteInteractions();
    this.setInitialView();
  }

  setInitialView() {
    // Show overview by default
    if (this.skillsOverview) {
      this.skillsOverview.style.display = 'flex';
    }
    
    // Hide all categories initially
    this.skillCategories3D.forEach(category => {
      category.style.display = 'none';
      category.classList.remove('active');
    });
  }

  bindNavigation() {
    this.skillNavButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const category = e.currentTarget.getAttribute('data-category');
        this.filterSkills3D(category);
        this.setActiveNavButton(e.currentTarget);
      });
    });
  }

  setActiveNavButton(activeButton) {
    this.skillNavButtons.forEach(button => {
      button.classList.remove('active');
    });
    activeButton.classList.add('active');
  }

  filterSkills3D(category) {
    this.currentCategory = category;

    if (category === 'all') {
      // Show overview
      this.showOverview();
      this.hideAllCategories();
    } else {
      // Hide overview and show specific category
      this.hideOverview();
      this.showCategory(category);
    }
  }

  showOverview() {
    if (this.skillsOverview) {
      this.skillsOverview.style.display = 'flex';
      this.skillsOverview.style.opacity = '0';
      this.skillsOverview.style.transform = 'translateY(50px) scale(0.8)';
      
      setTimeout(() => {
        this.skillsOverview.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        this.skillsOverview.style.opacity = '1';
        this.skillsOverview.style.transform = 'translateY(0) scale(1)';
      }, 100);
    }
  }

  hideOverview() {
    if (this.skillsOverview) {
      this.skillsOverview.style.transition = 'all 0.5s ease';
      this.skillsOverview.style.opacity = '0';
      this.skillsOverview.style.transform = 'translateY(-50px) scale(0.8)';
      
      setTimeout(() => {
        this.skillsOverview.style.display = 'none';
      }, 500);
    }
  }

  hideAllCategories() {
    this.skillCategories3D.forEach(category => {
      category.classList.remove('active');
      category.style.opacity = '0';
      category.style.transform = 'translateY(50px) rotateX(-10deg)';
      
      setTimeout(() => {
        category.style.display = 'none';
      }, 500);
    });
  }

  showCategory(categoryName) {
    this.skillCategories3D.forEach(category => {
      const categoryData = category.getAttribute('data-category');
      
      if (categoryData === categoryName) {
        category.style.display = 'block';
        category.style.opacity = '0';
        category.style.transform = 'translateY(50px) rotateX(-10deg)';
        
        setTimeout(() => {
          category.classList.add('active');
          category.style.opacity = '1';
          category.style.transform = 'translateY(0) rotateX(0deg)';
          
          // Animate skill cards with stagger
          this.animateSkillCards(category);
        }, 100);
      } else {
        category.classList.remove('active');
        category.style.opacity = '0';
        category.style.transform = 'translateY(50px) rotateX(-10deg)';
        
        setTimeout(() => {
          category.style.display = 'none';
        }, 300);
      }
    });
  }

  animateSkillCards(category) {
    const cards = category.querySelectorAll('.skill-card-3d');
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px) rotateX(-15deg)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0) rotateX(0deg)';
      }, index * 150);
    });
  }

  observeSkillsSection() {
    const skillsSection = $('#skills');
    if (!skillsSection) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isAnimated) {
          this.startGlobeAnimations();
          this.animateNavButtons();
          this.isAnimated = true;
        }
      });
    }, { threshold: 0.3 });

    observer.observe(skillsSection);
  }

  startGlobeAnimations() {
    // Animate satellites with stagger
    this.skillSatellites.forEach((satellite, index) => {
      satellite.style.opacity = '0';
      satellite.style.transform = 'scale(0)';
      
      setTimeout(() => {
        satellite.style.transition = 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        satellite.style.opacity = '1';
        satellite.style.transform = 'scale(1)';
      }, index * 200);
    });

    // Animate globe core
    const globeCore = $('.globe-core');
    if (globeCore) {
      globeCore.style.transform = 'translate(-50%, -50%) scale(0)';
      globeCore.style.opacity = '0';
      
      setTimeout(() => {
        globeCore.style.transition = 'all 1s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        globeCore.style.transform = 'translate(-50%, -50%) scale(1)';
        globeCore.style.opacity = '1';
      }, 800);
    }
  }

  animateNavButtons() {
    this.skillNavButtons.forEach((button, index) => {
      button.style.opacity = '0';
      button.style.transform = 'translateY(-30px) rotateX(-90deg)';
      
      setTimeout(() => {
        button.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        button.style.opacity = '1';
        button.style.transform = 'translateY(0) rotateX(0deg)';
      }, index * 100);
    });
  }

  initSkillHovers() {
    this.skillCards3D.forEach(card => {
      const skillLevel = card.getAttribute('data-level');
      
      card.addEventListener('mouseenter', () => {
        // Add glowing effect
        card.style.boxShadow = '0 20px 60px rgba(99, 102, 241, 0.4)';
        
        // Trigger level ring animation
        const ring = card.querySelector('.skill-level-ring');
        if (ring) {
          ring.style.animation = 'none';
          setTimeout(() => {
            ring.style.animation = 'ringRotate 1s ease-in-out';
          }, 10);
        }
      });

      card.addEventListener('mouseleave', () => {
        card.style.boxShadow = '';
      });

      // Add click event for mobile
      card.addEventListener('click', () => {
        const inner = card.querySelector('.skill-card-inner');
        if (inner) {
          if (inner.style.transform.includes('rotateY(180deg)')) {
            inner.style.transform = 'rotateY(0deg)';
          } else {
            inner.style.transform = 'rotateY(180deg)';
          }
        }
      });
    });
  }

  initSatelliteInteractions() {
    this.skillSatellites.forEach(satellite => {
      satellite.addEventListener('click', () => {
        const skillType = satellite.getAttribute('data-skill');
        
        // Add pulse effect
        satellite.style.animation = 'none';
        setTimeout(() => {
          satellite.style.animation = 'satelliteFloat 3s ease-in-out infinite, skillIconPulse 1s ease-in-out';
        }, 10);

        // Show related category if exists
        this.handleSatelliteClick(skillType);
      });

      satellite.addEventListener('mouseenter', () => {
        // Show tooltip or skill name
        const tooltip = this.createTooltip(satellite.getAttribute('data-skill'));
        satellite.appendChild(tooltip);
      });

      satellite.addEventListener('mouseleave', () => {
        const tooltip = satellite.querySelector('.skill-tooltip');
        if (tooltip) {
          tooltip.remove();
        }
      });
    });
  }

  createTooltip(skillName) {
    const tooltip = document.createElement('div');
    tooltip.className = 'skill-tooltip';
    tooltip.textContent = skillName.charAt(0).toUpperCase() + skillName.slice(1);
    tooltip.style.cssText = `
      position: absolute;
      bottom: -40px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      white-space: nowrap;
      pointer-events: none;
      z-index: 1000;
    `;
    return tooltip;
  }

  handleSatelliteClick(skillType) {
    // Map skills to categories
    const skillCategoryMap = {
      'react': 'frontend',
      'javascript': 'frontend',
      'nodejs': 'backend',
      'python': 'backend',
      'android': 'mobile',
      'docker': 'tools'
    };

    const targetCategory = skillCategoryMap[skillType];
    if (targetCategory) {
      // Find and activate the corresponding nav button
      const targetButton = Array.from(this.skillNavButtons).find(
        btn => btn.getAttribute('data-category') === targetCategory
      );
      
      if (targetButton) {
        targetButton.click();
      }
    }
  }

  // Method to update skill levels dynamically
  updateSkillLevel(skillCard, newLevel) {
    const ring = skillCard.querySelector('.skill-level-ring');
    const percentage = skillCard.querySelector('.level-percentage');
    
    if (ring && percentage) {
      const progressDegree = (newLevel / 100) * 360;
      ring.style.setProperty('--progress-degree', `${progressDegree}deg`);
      percentage.textContent = `${newLevel}%`;
      skillCard.setAttribute('data-level', newLevel);
    }
  }
}

// Scroll Animations Manager
class ScrollAnimations {
  constructor() {
    this.observer = null;
  }

  init() {
    this.createObserver();
    this.observeElements();
  }

  createObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          state.observedElements.add(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
  }

  observeElements() {
    const animatedElements = $$('.fade-in, .section-header, .about-stats, .timeline-item, .contact-method');
    animatedElements.forEach(element => {
      this.observer.observe(element);
    });
  }
}

// Back to Top Button
class BackToTopManager {
  constructor() {
    this.button = $('#backToTop');
    this.init();
  }

  init() {
    if (!this.button) return;
    
    this.bindEvents();
    this.handleScroll();
  }

  bindEvents() {
    this.button.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    window.addEventListener('scroll', () => this.handleScroll());
  }

  handleScroll() {
    if (window.pageYOffset > config.scrollThreshold) {
      this.button.classList.add('visible');
    } else {
      this.button.classList.remove('visible');
    }
  }
}

// Contact Form Manager
class ContactFormManager {
  constructor() {
    this.form = $('#contact-form');
    this.init();
  }

  init() {
    if (!this.form) return;
    this.bindEvents();
  }

  bindEvents() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData);
    
    // Show loading state
    const submitButton = this.form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitButton.disabled = true;
    
    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
      this.showSuccessMessage();
      this.form.reset();
      submitButton.innerHTML = originalText;
      submitButton.disabled = false;
    }, 2000);
  }

  showSuccessMessage() {
    // Create and show success notification
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <span>Message sent successfully! I'll get back to you soon.</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
}

// Performance Optimizer
class PerformanceOptimizer {
  constructor() {
    this.init();
  }

  init() {
    this.optimizeImages();
    this.prefetchLinks();
    this.addServiceWorker();
  }

  optimizeImages() {
    const images = $$('img');
    images.forEach(img => {
      img.loading = 'lazy';
    });
  }

  prefetchLinks() {
    const externalLinks = $$('a[href^="http"]');
    externalLinks.forEach(link => {
      link.setAttribute('rel', 'noopener');
    });
  }

  addServiceWorker() {
    if ('serviceWorker' in navigator) {
      // Service worker would be implemented here for caching
    }
  }
}

// Initialize Application
class App {
  constructor() {
    this.components = {};
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
    } else {
      this.initializeComponents();
    }
  }

  initializeComponents() {
    // Initialize all the main app components
    this.components.themeManager = new ThemeController();
    this.components.loadingManager = new LoadingManager();
    this.components.navigationManager = new NavigationManager();
    this.components.projectManager = new ProjectShowcase();
    this.components.skillsManager = new Advanced3DSkillsManager();
    this.components.backToTopManager = new BackToTopManager();
    this.components.contactFormManager = new ContactFormManager();
    this.components.performanceOptimizer = new PerformanceOptimizer();
    
    // Initialize scroll animations (will be called after loading)
    this.components.scrollAnimations = new ScrollAnimations();
  }
}

// Create global scroll animations instance
const scrollAnimations = new ScrollAnimations();

// Initialize the application
const app = new App();

// Export for external use
window.PortfolioApp = {
  app,
  state,
  config
};
// Enhanced 3D Skills Manager
class Enhanced3DSkillsManager extends ModernSkillsManager {
  constructor() {
    super();
    this.init3DEffects();
    this.setupProgressAnimations();
    this.initCounterAnimations();
  }

  init3DEffects() {
    // Initialize 3D card flip effects
    this.setup3DCards();
    this.setupProgressSpheres();
    this.setupCubeAnimations();
  }

  setup3DCards() {
    const skillCards = document.querySelectorAll('.skill-card-3d');
    
    skillCards.forEach(card => {
      // Add touch support for mobile
      card.addEventListener('touchstart', () => {
        card.classList.add('touched');
      });
      
      // Auto-flip back after delay
      card.addEventListener('mouseleave', () => {
        setTimeout(() => {
          card.style.transform = '';
        }, 3000);
      });
      
      // Parallax effect on mouse move
      card.addEventListener('mousemove', (e) => {
        if (!card.classList.contains('touched')) {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          
          const rotateX = (y - centerY) / 10;
          const rotateY = (centerX - x) / 10;
          
          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        }
      });
    });
  }

  setupProgressSpheres() {
    const progressSpheres = document.querySelectorAll('.progress-sphere');
    
    progressSpheres.forEach(sphere => {
      const percentage = parseInt(sphere.getAttribute('data-percentage'));
      const degrees = (percentage / 100) * 360;
      
      // Animate the conic gradient
      sphere.style.setProperty('--progress', `${degrees}deg`);
      
      // Add glowing effect based on percentage
      if (percentage >= 90) {
        sphere.classList.add('expert-glow');
      } else if (percentage >= 75) {
        sphere.classList.add('advanced-glow');
      } else {
        sphere.classList.add('intermediate-glow');
      }
    });
  }

  setupCubeAnimations() {
    const cubes = document.querySelectorAll('.icon-cube, .rotating-cube');
    
    // Pause animation on hover
    cubes.forEach(cube => {
      cube.addEventListener('mouseenter', () => {
        cube.style.animationPlayState = 'paused';
      });
      
      cube.addEventListener('mouseleave', () => {
        cube.style.animationPlayState = 'running';
      });
    });
  }

  initCounterAnimations() {
    const counters = document.querySelectorAll('.animated-counter');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    });

    counters.forEach(counter => observer.observe(counter));
  }

  animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
      current += step;
      if (current < target) {
        element.textContent = Math.floor(current);
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target;
      }
    };

    updateCounter();
  }

  // Enhanced filter method with 3D transitions
  filterSkills(category) {
    const categories = document.querySelectorAll('.skill-category-3d');
    
    categories.forEach(categoryElement => {
      const categoryData = categoryElement.getAttribute('data-category');
      
      if (category === 'all' || categoryData === category) {
        categoryElement.style.display = 'block';
        setTimeout(() => {
          categoryElement.classList.add('active');
        }, 100);
      } else {
        categoryElement.classList.remove('active');
        setTimeout(() => {
          categoryElement.style.display = 'none';
        }, 500);
      }
    });
    
    // Update 3D navigation
    this.update3DNavigation(category);
  }

  update3DNavigation(activeCategory) {
    const navButtons = document.querySelectorAll('.skill-nav-btn-3d');
    
    navButtons.forEach(button => {
      const buttonCategory = button.getAttribute('data-category');
      if (buttonCategory === activeCategory) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }

  // Add particle effects for interactions
  createParticleEffect(element) {
    const particles = [];
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: #6366f1;
        border-radius: 50%;
        pointer-events: none;
        animation: particleFloat 1s ease-out forwards;
      `;
      
      const rect = element.getBoundingClientRect();
      particle.style.left = rect.left + rect.width / 2 + 'px';
      particle.style.top = rect.top + rect.height / 2 + 'px';
      
      document.body.appendChild(particle);
      
      setTimeout(() => {
        particle.remove();
      }, 1000);
    }
  }
}

// CSS for particle effects (add to your CSS)
const particleCSS = `
@keyframes particleFloat {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) scale(0);
    opacity: 0;
  }
}

.expert-glow {
  box-shadow: 0 0 30px rgba(16, 185, 129, 0.6) !important;
}

.advanced-glow {
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.6) !important;
}

.intermediate-glow {
  box-shadow: 0 0 30px rgba(245, 158, 11, 0.6) !important;
}
`;

// Add the particle CSS to the document
const styleSheet = document.createElement('style');
styleSheet.textContent = particleCSS;
document.head.appendChild(styleSheet);

// Initialize the enhanced 3D skills manager
document.addEventListener('DOMContentLoaded', () => {
  const enhanced3DSkillsManager = new Enhanced3DSkillsManager();
  
  // Profile Image Loading Enhancement
  const profileImage = document.querySelector('.profile-image img');
  if (profileImage) {
    // Add loading class for smooth transition
    profileImage.style.opacity = '0';
    profileImage.style.transform = 'scale(0.8)';
    
    profileImage.addEventListener('load', () => {
      profileImage.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      profileImage.style.opacity = '1';
      profileImage.style.transform = 'scale(1)';
    });
    
    profileImage.addEventListener('error', () => {
      // Fallback if image fails to load
      const fallbackElement = document.createElement('div');
      fallbackElement.innerHTML = '<div style="width: 100%; height: 100%; background: var(--gradient-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 3rem; font-weight: 800; color: white;">SM</div>';
      profileImage.parentNode.replaceChild(fallbackElement.firstChild, profileImage);
    });
  }
});