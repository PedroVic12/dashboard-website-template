// src/script.js

// Importing React and ReactDOM
// import React from 'react';
// import ReactDOM from 'react-dom';
// import Header from './components/Header';
// import MagicForm from './components/MagicForm';
// import Preview from './components/Preview';
// import CodeOutput from './components/CodeOutput';
// import PlanCards from './components/PlanCards';

// // Main App component
// const App = () => {
//     return (
//         <div>
//             <Header />
//             <main className="container">
//                 <MagicForm />
//                 <Preview />
//                 <CodeOutput />
//             </main>
//             <PlanCards />
//         </div>
//     );
// };

// src/script.js

// Criando componentes simples
const Header = () => (
  <header className="text-center mb-6">
    <h1 className="text-3xl font-bold text-blue-400">
      Painel React do Mestre Pedro Victor ⚡
    </h1>
  </header>
);

const MagicForm = () => (
  <form className="space-y-3">
    <input
      type="text"
      placeholder="Digite algo mágico..."
      className="w-full p-2 rounded text-black"
    />
    <button className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
      Enviar
    </button>
  </form>
);

// Componente principal
const App = () => (
  <div className="text-center space-y-6">
    <Header />
    <MagicForm />
    <p className="text-gray-400">React rodando direto no navegador 💻</p>
  </div>
);

// Renderizando dentro do root
ReactDOM.render(<App />, document.getElementById('root'));

