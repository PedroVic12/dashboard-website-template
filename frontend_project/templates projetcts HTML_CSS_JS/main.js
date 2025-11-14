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
      
      // Inicializa o carrossel se a página for a 'home'
      if (page === 'home') {
        initCarousel();
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
