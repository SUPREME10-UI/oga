function Button({ children, onClick, variant = 'primary', className = '' }) {
    return (
        <button
            className={`btn btn-${variant} ${className}`}
            onClick={onClick}
        >
            {children}
        </button>
    );
}

export default Button;
