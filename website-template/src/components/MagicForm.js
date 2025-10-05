import React, { useState } from 'react';

const MagicForm = () => {
    const [description, setDescription] = useState('');
    const [example, setExample] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Logic to handle form submission and generate background
        console.log('Description:', description);
        console.log('Example:', example);
    };

    return (
        <section className="card">
            <h2 className="card-header">Descreva o que você imagina e veja a magia acontecer no seu website.</h2>
            <p className="subtittle">Crie fundos incríveis com IA generativa. Descreva o que você imagina e veja a magia acontecer no seu website.</p>
            <form onSubmit={handleSubmit} className="form-group">
                <input
                    type="text"
                    id="description"
                    placeholder="Descreva o fundo que você deseja"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="input-field"
                />
                <textarea
                    rows="5"
                    placeholder="Exemplo: Um gradiente azul suave que vai do azul claro para o azul escuro"
                    value={example}
                    onChange={(e) => setExample(e.target.value)}
                    className="textarea-field"
                />
                <button type="submit" id="generate-btn" className="btn-magic">Gerar Background mágico!</button>
            </form>
        </section>
    );
};

export default MagicForm;