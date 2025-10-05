import React from 'react';

const PlanCards = () => {
    const plans = [
        {
            title: "Grátis",
            price: "$0",
            description: "Inteligência para tarefas do dia a dia",
            features: [
                "Acesso ao GPT-5",
                "Carregamento de arquivos limitado",
                "Geração de imagens mais lenta e limitada",
                "Memória e contexto limitados",
                "Investigação limitada"
            ],
            buttonLabel: "Seu plano atual",
            buttonClass: "w-full mt-6 py-3 rounded-lg bg-white border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50 transition-colors"
        },
        {
            title: "Plus",
            price: "$20",
            description: "Mais acesso à inteligência avançada",
            features: [
                "GPT-5 com reflexão avançada",
                "Mais mensagens e carregamentos",
                "Mais criação de imagens com maior velocidade",
                "Mais memória e contexto",
                "Mais investigações e modo agente"
            ],
            buttonLabel: "Assinar Plus",
            buttonClass: "w-full mt-6 py-3 rounded-lg bg-violet-600 text-white font-semibold hover:bg-violet-700 transition-colors"
        },
        {
            title: "Pro",
            price: "$200",
            description: "Acesso completo ao melhor do ChatGPT",
            features: [
                "GPT-5 com reflexão pro",
                "Mensagens e carregamentos ilimitados",
                "Criação de imagens ilimitada e mais rápida",
                "O máximo de memória e contexto",
                "O máximo de investigações e do modo agente"
            ],
            buttonLabel: "Assinar Pro",
            buttonClass: "w-full mt-6 py-3 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 border border-gray-200 flex flex-col">
                    <h2 className="text-2xl font-semibold text-gray-900">{plan.title}</h2>
                    <div className="mt-4">
                        <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                        <span className="text-gray-500">USD / mês</span>
                    </div>
                    <p className="mt-2 text-gray-600">{plan.description}</p>
                    <button className={plan.buttonClass}>{plan.buttonLabel}</button>
                    <ul className="mt-8 space-y-4 text-gray-600 flex-grow">
                        {plan.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-start">
                                <svg className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default PlanCards;