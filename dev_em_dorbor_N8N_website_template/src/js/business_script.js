            // Script para a lógica do seletor de planos (Personal/Business)
            
            const personalBtn = document.getElementById('personal-btn');
            const businessBtn = document.getElementById('business-btn');
            
            const priceFree = document.getElementById('price-free');
            const pricePlus = document.getElementById('price-plus');
            const pricePro = document.getElementById('price-pro');

            // Preços para cada tipo de plano
            const prices = {
                personal: {
                    free: '$0',
                    plus: '$20',
                    pro: '$200'
                },
                business: {
                    free: '$0', // Geralmente não há plano business grátis, mas mantemos para o exemplo
                    plus: '$40',
                    pro: '$400'
                }
            };

            function setPlanType(type) {
                if (type === 'personal') {
                    personalBtn.classList.add('active');
                    personalBtn.classList.remove('text-gray-600');
                    businessBtn.classList.remove('active');
                    businessBtn.classList.add('text-gray-600');
                    
                    priceFree.textContent = prices.personal.free;
                    pricePlus.textContent = prices.personal.plus;
                    pricePro.textContent = prices.personal.pro;

                } else { // type === 'business'
                    businessBtn.classList.add('active');
                    businessBtn.classList.remove('text-gray-600');
                    personalBtn.classList.remove('active');
                    personalBtn.classList.add('text-gray-600');

                    priceFree.textContent = prices.business.free;
                    pricePlus.textContent = prices.business.plus;
                    pricePro.textContent = prices.business.pro;
                }
            }

            personalBtn.addEventListener('click', () => setPlanType('personal'));
            businessBtn.addEventListener('click', () => setPlanType('business'));
            
