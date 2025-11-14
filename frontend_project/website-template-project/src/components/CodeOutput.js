import React from 'react';

const CodeOutput = ({ cssCode, htmlCode }) => {
    return (
        <section id="code-output" className="code-grid">
            <div className="card code-card">
                <h3>Código CSS Gerado:</h3>
                <pre id="css-code" className="code-block">{cssCode}</pre>
            </div>

            <div className="card code-card">
                <h3>Código HTML gerado:</h3>
                <pre id="html-code">{htmlCode}</pre>
            </div>
        </section>
    );
};

export default CodeOutput;