// src/pages/DashboardPage.tsx
import React from 'react';
import PageMeta from '../../components/common/PageMeta';
import { DashboardPrincipal } from '../../components/dashboard/DashboardPrincipal';


const DashboardPage: React.FC = () => {
  return (

    <>
      <PageMeta
        title="Dashboard Odontológico | Sistema de Gestión"
        description="Dashboard principal del sistema de gestión odontológica"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6 ">
        <div className="col-span-12 custom-scrollbar">
          <DashboardPrincipal />
        </div>
      </div>
    </>
    
  );
};

export default DashboardPage;