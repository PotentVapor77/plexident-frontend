// src/layout/FullScreenLayout.tsx
import { useEffect } from "react";
import { acquireFullscreenLock, releaseFullscreenLock } from "../core/utils/fullscreenLock";

export const FullScreenLayout: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = "",
}) => {
    useEffect(() => {
        acquireFullscreenLock();
        return () => {
            releaseFullscreenLock();
        };
    }, []);

    return (
        <div className={`w-full h-full overflow-hidden ${className}`}>
            {children}
        </div>
    );
};

export default FullScreenLayout;