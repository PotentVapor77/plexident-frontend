// src/components/layout/MainLayout.tsx
import React from 'react';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <main className="main-content">
            {children}
        </main>
    );
};

export default MainLayout;