document.addEventListener('DOMContentLoaded', () => {
  const content = document.getElementById('content');
  const navLinks = document.querySelectorAll('.nav-link');

  // Função para inicializar o carrossel
  const initCarousel = () => {
    const carousel = content.querySelector('.carousel');
    if (!carousel) return;

    const inner = carousel.querySelector('.carousel-inner');
    const items = carousel.querySelectorAll('.carousel-item');
    const prevBtn = carousel.querySelector('.carousel-control.prev');
    const nextBtn = carousel.querySelector('.carousel-control.next');

    let currentIndex = 0;
    const totalItems = items.length;

    const updateCarousel = () => {
      inner.style.transform = `translateX(-${currentIndex * 100}%)`;
    };

    prevBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + totalItems) % totalItems;
      updateCarousel();
    });

    nextBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % totalItems;
      updateCarousel();
    });

    // Auto-play (opcional)
    setInterval(() => {
      nextBtn.click();
    }, 5000);
  };

  // Função para inicializar a To-Do List
  const initTodoList = () => {
    const todoSection = content.querySelector('#todo-section');
    if (!todoSection) return;

    const todoForm = todoSection.querySelector('#todo-form');
    const todoInput = todoSection.querySelector('#todo-input');
    const todoList = todoSection.querySelector('#todo-list');
    const storageKey = 'my-todo-tasks';

    let tasks = JSON.parse(localStorage.getItem(storageKey)) || [];

    const saveTasks = () => {
      localStorage.setItem(storageKey, JSON.stringify(tasks));
    };

    const renderTasks = () => {
      todoList.innerHTML = '';
      if (tasks.length === 0) {
        todoList.innerHTML = '<p class="empty-list-message">Nenhuma tarefa ainda. Adicione uma acima!</p>';
      }

      tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `todo-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => {
          toggleComplete(task.id);
        });

        const span = document.createElement('span');
        span.textContent = task.text;

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'actions';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '&#10005;'; // 'X' symbol
        deleteBtn.addEventListener('click', () => {
          deleteTask(task.id);
        });

        actionsDiv.appendChild(deleteBtn);
        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(actionsDiv);
        todoList.appendChild(li);
      });
      updateStats();
    };

    const updateStats = () => {
        const completedTasks = tasks.filter(t => t.completed).length;
        const pendingTasks = tasks.length - completedTasks;
        document.getElementById('tasks-completed').textContent = completedTasks;
        document.getElementById('tasks-pending').textContent = pendingTasks;
        document.getElementById('tasks-total').textContent = tasks.length;
    };

    const addTask = (text) => {
      const newTask = {
        id: Date.now(),
        text: text,
        completed: false
      };
      tasks.push(newTask);
      saveTasks();
      renderTasks();
    };

    const toggleComplete = (id) => {
      tasks = tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      );
      saveTasks();
      renderTasks();
    };

    const deleteTask = (id) => {
      tasks = tasks.filter(task => task.id !== id);
      saveTasks();
      renderTasks();
    };

    todoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = todoInput.value.trim();
      if (text) {
        addTask(text);
        todoInput.value = '';
        todoInput.focus();
      }
    });

    renderTasks();
  };

  // Função para carregar o conteúdo da página
  const loadPage = async (page) => {
    try {
      const response = await fetch(`pages/${page}.html`);
      if (!response.ok) {
        // Se a página não for encontrada, carrega a home como padrão
        await loadPage('home');
        return;
      }
      const pageContent = await response.text();
      content.innerHTML = pageContent;

      // Ativa o link de navegação correspondente
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === page);
      });
      
      // Inicializa funcionalidades específicas da página
      if (page === 'home') {
        initCarousel();
      } else if (page === 'dashboard') {
        initTodoList();
      }
    } catch (error) {
      console.error('Erro ao carregar a página:', error);
      content.innerHTML = '<p>Erro ao carregar o conteúdo. Tente novamente.</p>';
    }
  };

  // Lógica do roteador
  const router = (event) => {
    event.preventDefault();
    const target = event.target;
    const page = target.getAttribute('href');
    
    // Atualiza a URL na barra de endereço
    history.pushState({ page }, null, page);
    loadPage(page);
  };

  // Adiciona o listener de clique para os links de navegação
  navLinks.forEach(link => {
    link.addEventListener('click', router);
  });

  // Lida com os botões de voltar/avançar do navegador
  window.addEventListener('popstate', (event) => {
    const page = event.state ? event.state.page : 'home';
    loadPage(page);
  });

  // Carrega a página inicial ou a página da URL atual
  const initialPage = window.location.pathname.split('/').pop() || 'home';
  loadPage(initialPage);
});
