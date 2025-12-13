import React, { useEffect, useRef, useState } from "react";

export type VideoPlayerProps = {
    videoUrl: string;
    screenshotTime?: number;
    className?: string;
    height?: number | string;
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({
    videoUrl,
    screenshotTime = 0,
    className,
    height
}) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [poster, setPoster] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        const handleLoadedMetadata = () => {
            video.currentTime = Math.min(screenshotTime, video.duration || 0);
        };

        const handleSeeked = () => {
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            setPoster(canvas.toDataURL("image/png"));
        };

        const handleEnded = () => {
            setIsPlaying(false);
            video.currentTime = Math.min(screenshotTime, video.duration || 0);
        };

        video.addEventListener("loadedmetadata", handleLoadedMetadata);
        video.addEventListener("seeked", handleSeeked);
        video.addEventListener("ended", handleEnded);

        return () => {
            video.removeEventListener("loadedmetadata", handleLoadedMetadata);
            video.removeEventListener("seeked", handleSeeked);
            video.removeEventListener("ended", handleEnded);
        };
    }, [videoUrl, screenshotTime]);

    const handlePlay = () => {
        setIsPlaying(true);
        videoRef.current?.play();
    };

    return (
        <div className={`position-relative ${className ?? ""}`}>
            <canvas ref={canvasRef} style={{ display: "none" }} />

            {!isPlaying && poster && (
                <div className="position-relative">
                    <img
                        src={poster}
                        alt="Video preview"
                        style={{ width: "100%", height: height ?? "auto", display: "block" }}
                    />

                    <button
                        onClick={handlePlay}
                        className="position-absolute top-50 start-50 translate-middle bg-transparent border-0"
                        aria-label="Play video"
                    >
                        <span className="call-to-action-more__arrow text-white lh-1 video-popup position-relative d-inline-block">
                            <img
                                className="call-to-action-more__svg"
                                src="/assets/images/svg-text.svg"
                                alt="Play"
                            />
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="24"
                                fill="none"
                                viewBox="0 0 20 24"
                                className="position-absolute top-50 start-50 translate-middle"
                            >
                                <path
                                    fill="currentColor"
                                    d="M.417.5v23L19.583 12 .417.5z"
                                />
                            </svg>
                        </span>
                    </button>
                </div>
            )}

            <video
                ref={videoRef}
                src={videoUrl}
                controls
                crossOrigin="anonymous"
                style={{
                    width: "100%", height: "auto",
                    display: isPlaying ? "block" : "none"
                }}
            />
        </div>
    );
};

export default VideoPlayer;