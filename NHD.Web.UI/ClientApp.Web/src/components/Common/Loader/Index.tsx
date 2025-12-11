interface LoaderProps {
    loading: boolean;
    isDark?: boolean;
    fullscreen?: boolean;
}

export default function Loader({ loading, fullscreen = true, isDark = false }: LoaderProps) {
    if (!loading) return null;

    return (
        <div className={fullscreen ? "loader-brand" : "loader-absolute"} style={{
            background: isDark
                ? "rgba(0, 0, 0, 0.8)"   // dark mode → black with opacity
                : "white" // light mode → white with opacity
        }}>
            <img
                src={isDark ? "/assets/images/logo-white.svg" : "/assets/images/logo-black.svg"}
                className="loader-logo"
                alt="logo"
            />
            <div className="loader-ring"></div>
        </div>
    );
}
