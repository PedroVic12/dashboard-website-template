import React from 'react';

const Preview = ({ background }) => {
    const previewStyle = {
        background: background,
        height: '300px',
        width: '100%',
        borderRadius: '8px',
        transition: 'background 0.5s ease',
    };

    return (
        <div className="preview-card" style={previewStyle}>
            <h3 className="text-center text-white">Prévia do Fundo</h3>
        </div>
    );
};

export default Preview;