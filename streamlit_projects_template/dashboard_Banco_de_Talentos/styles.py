custom_css = """
<style>
/* ==================== TAB STYLING ==================== */

/* Container das tabs */
.stTabs [data-baseweb="tab-list"] {
    gap: 4px;
    padding: 8px 0;
}

/* Tabs individuais - Base */
.stTabs [data-baseweb="tab-list"] button {
    border-radius: 8px 8px 0 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 0.75rem 1.5rem;
    font-size: clamp(0.875rem, 2vw, 1rem); /* Responsivo */
    font-weight: 500;
    border: none;
    position: relative;
    overflow: hidden;
}

/* Hover effect */
.stTabs [data-baseweb="tab-list"] button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Active indicator */
.stTabs [data-baseweb="tab-list"] button[aria-selected="true"]::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #4CAF50, #45a049);
}

/* Tab content area */
.stTabs [data-baseweb="tab-panel"] {
    padding: clamp(1rem, 3vw, 2rem);
    border-radius: 0 8px 8px 8px;
    animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

/* ==================== LIGHT MODE ==================== */
[data-theme="light"] .stTabs [data-baseweb="tab-list"] button,
body:not([data-theme="dark"]) .stTabs [data-baseweb="tab-list"] button {
    background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
    color: #2c3e50;
    border: 1px solid #d1d9e6;
}

[data-theme="light"] .stTabs [data-baseweb="tab-list"] button:hover,
body:not([data-theme="dark"]) .stTabs [data-baseweb="tab-list"] button:hover {
    background: linear-gradient(135deg, #ffffff 0%, #f0f3f7 100%);
    border-color: #4CAF50;
}

[data-theme="light"] .stTabs [data-baseweb="tab-list"] button[aria-selected="true"],
body:not([data-theme="dark"]) .stTabs [data-baseweb="tab-list"] button[aria-selected="true"] {
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    color: white;
    font-weight: 600;
    border-color: #4CAF50;
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

[data-theme="light"] .stTabs [data-baseweb="tab-panel"],
body:not([data-theme="dark"]) .stTabs [data-baseweb="tab-panel"] {
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    border: 1px solid #e0e6ed;
    color: #2c3e50;
}

/* ==================== DARK MODE ==================== */
[data-theme="dark"] .stTabs [data-baseweb="tab-list"] button {
    background: linear-gradient(135deg, #1e1e2e 0%, #262637 100%);
    color: #a0a0b0;
    border: 1px solid #3a3a4a;
}

[data-theme="dark"] .stTabs [data-baseweb="tab-list"] button:hover {
    background: linear-gradient(135deg, #2a2a3a 0%, #30304a 100%);
    border-color: #4CAF50;
    color: #d0d0e0;
}

[data-theme="dark"] .stTabs [data-baseweb="tab-list"] button[aria-selected="true"] {
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    color: white;
    font-weight: 600;
    border-color: #4CAF50;
    box-shadow: 0 4px 16px rgba(76, 175, 80, 0.4);
}

[data-theme="dark"] .stTabs [data-baseweb="tab-panel"] {
    background: linear-gradient(135deg, #1a1a2e 0%, #252538 100%);
    border: 1px solid #3a3a4a;
    color: #e0e0f0;
}

/* ==================== RESPONSIVE ==================== */
@media (max-width: 768px) {
    .stTabs [data-baseweb="tab-list"] button {
        padding: 0.6rem 1rem;
        font-size: 0.875rem;
    }
    
    .stTabs [data-baseweb="tab-panel"] {
        padding: 1rem;
    }
}

@media (max-width: 480px) {
    .stTabs [data-baseweb="tab-list"] {
        flex-direction: column;
        gap: 8px;
    }
    
    .stTabs [data-baseweb="tab-list"] button {
        width: 100%;
        border-radius: 8px;
        text-align: center;
    }
}

/* ==================== ACCESSIBILITY ==================== */
.stTabs [data-baseweb="tab-list"] button:focus {
    outline: 2px solid #4CAF50;
    outline-offset: 2px;
}

/* ==================== CUSTOM SCROLLBAR ==================== */
.stTabs [data-baseweb="tab-panel"]::-webkit-scrollbar {
    width: 8px;
}

[data-theme="light"] .stTabs [data-baseweb="tab-panel"]::-webkit-scrollbar-thumb,
body:not([data-theme="dark"]) .stTabs [data-baseweb="tab-panel"]::-webkit-scrollbar-thumb {
    background: #c0c0d0;
    border-radius: 4px;
}

[data-theme="dark"] .stTabs [data-baseweb="tab-panel"]::-webkit-scrollbar-thumb {
    background: #4a4a5a;
    border-radius: 4px;
}
</style>
"""