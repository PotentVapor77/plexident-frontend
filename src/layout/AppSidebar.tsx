import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/auth/useAuth";
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  PageIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";

import type { Rol } from "../types/user/IUser";
import { useNavPermissions } from "../hooks/useNavPermissions";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN VISUAL POR ROL
// ─────────────────────────────────────────────────────────────────────────────

const ROL_CONFIG: Record<
  Rol,
  {
    label: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    accentBar: string;
    dotColor: string;
    description: string;
  }
> = {
  Administrador: {
    label: "Administrador",
    badgeBg: "bg-violet-50 dark:bg-violet-900/30",
    badgeText: "text-violet-700 dark:text-violet-300",
    badgeBorder: "border-violet-200 dark:border-violet-700",
    accentBar: "bg-gradient-to-b from-violet-500 to-violet-400",
    dotColor: "bg-violet-500",
    description: "Acceso completo",
  },
  Odontologo: {
    label: "Odontólogo",
    badgeBg: "bg-brand-50 dark:bg-blue-900/30",
    badgeText: "text-brand-700 dark:text-blue-300",
    badgeBorder: "border-brand-200 dark:border-blue-700",
    accentBar: "bg-gradient-to-b from-brand-500 to-brand-400",
    dotColor: "bg-brand-500",
    description: "Acceso clínico",
  },
  Asistente: {
    label: "Asistente",
    badgeBg: "bg-emerald-50 dark:bg-emerald-900/30",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    badgeBorder: "border-emerald-200 dark:border-emerald-700",
    accentBar: "bg-gradient-to-b from-emerald-500 to-emerald-400",
    dotColor: "bg-emerald-500",
    description: "Acceso básico",
  },
};

const DEFAULT_ROL_CONFIG = {
  label: "Sin rol",
  badgeBg: "bg-gray-100 dark:bg-gray-800",
  badgeText: "text-gray-600 dark:text-gray-400",
  badgeBorder: "border-gray-200 dark:border-gray-700",
  accentBar: "bg-gradient-to-b from-gray-400 to-gray-300",
  dotColor: "bg-gray-400",
  description: "Acceso limitado",
};

// ─────────────────────────────────────────────────────────────────────────────
// DEFINICIÓN DE NAV ITEMS
// requiredModule debe coincidir con un valor del Set visibleModules
// ─────────────────────────────────────────────────────────────────────────────

type NavItem = {
  name: string;
  requiredModule?: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/dashboard",
  },
  {
    icon: <UserCircleIcon />,
    name: "Pacientes",
    requiredModule: "Pacientes",
    subItems: [
      { name: "Pacientes", path: "/pacientes" },
      { name: "Detalles de paciente", path: "/pacientes/constantes-vitales" },
    ],
  },
  {
    icon: <CalenderIcon />,
    name: "Agenda",
    requiredModule: "Agenda",
    subItems: [{ name: "Citas", path: "/citas" }],
  },
  {
    icon: <BoxCubeIcon />,
    name: "Odontograma",
    requiredModule: "Odontograma",
    subItems: [
      { name: "Nuevo Odontograma", path: "/odontograma" },
      { name: "Historial", path: "/odontograma-timeline" },
      { name: "Indicadores de Salud Bucal", path: "/indicadores-salud-bucal" },
    ],
  },
  {
    icon: <PageIcon />,
    name: "Historia Clínica",
    requiredModule: "Historia Clínica",
    subItems: [{ name: "Historias Clínicas", path: "/historia-clinica" }],
  },
  {
    icon: <TableIcon />,
    name: "Plan Tratamiento",
    requiredModule: "Plan Tratamiento",
    subItems: [{ name: "Planes de Tratamiento", path: "/plan-tratamiento" }],
  },
];

const othersItems: NavItem[] = [
  {
    icon: <TableIcon />,
    name: "Usuarios",
    requiredModule: "Usuarios",
    subItems: [{ name: "Gestión de Usuarios", path: "/usuarios" }],
  },
  {
    icon: <PlugInIcon />,
    name: "Parametros",
    requiredModule: "Parametros",
    subItems: [{ name: "Confi Horarios", path: "/config-horarios" }],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTE: Avatar con info de usuario y rol
// ─────────────────────────────────────────────────────────────────────────────

interface UserAvatarProps {
  nombres?: string;
  apellidos?: string;
  correo?: string;
  rol?: Rol | null;
  showFull: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  nombres,
  apellidos,
  correo,
  rol,
  showFull,
}) => {
  const rolConfig = (rol && ROL_CONFIG[rol]) || DEFAULT_ROL_CONFIG;
  const initials = [nombres?.[0], apellidos?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase() || "?";

  return (
    <div
      className={`flex items-center gap-3 px-3 py-3 rounded-xl border transition-all duration-200
        ${rolConfig.badgeBg} ${rolConfig.badgeBorder} border`}
    >
      <div className="relative flex-shrink-0">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm
            ${rolConfig.badgeBg} ${rolConfig.badgeText} border-2 ${rolConfig.badgeBorder} shadow-sm`}
        >
          {initials}
        </div>
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${rolConfig.dotColor}`}
          title={rolConfig.description}
        />
      </div>

      {showFull && (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {[nombres, apellidos].filter(Boolean).join(" ") || correo || "Usuario"}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`text-xs font-medium ${rolConfig.badgeText}`}>
              {rolConfig.label}
            </span>
            <span className="text-gray-300 dark:text-gray-600 text-xs">·</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 truncate">
              {rolConfig.description}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTE: Skeleton mientras cargan los permisos
// ─────────────────────────────────────────────────────────────────────────────

const NavSkeleton: React.FC<{ showFull: boolean }> = ({ showFull }) => (
  <ul className="flex flex-col gap-4 animate-pulse">
    {[48, 64, 56].map((w, i) => (
      <li key={i}>
        <div
          className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
            showFull ? "w-full" : "w-10 mx-auto"
          }`}
        >
          <div className="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
          {showFull && (
            <div
              className="h-4 rounded bg-gray-200 dark:bg-gray-700"
              style={{ width: `${w}px` }}
            />
          )}
        </div>
      </li>
    ))}
  </ul>
);

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();

  const role = user?.rol as Rol | undefined;
  const rolConfig = (role && ROL_CONFIG[role]) || DEFAULT_ROL_CONFIG;
  const showFull = isExpanded || isHovered || isMobileOpen;

  // ── Permisos como fuente de verdad ─────────────────────────────
  const { visibleModules, isLoading: isLoadingPerms } = useNavPermissions({
    userId: user?.id,
    rol: role,
  });

  // Filtrar ítems de nav por permisos reales del usuario
  const filteredNavItems = navItems.filter(
    item => !item.requiredModule || visibleModules.has(item.requiredModule)
  );
  const filteredOthersItems = othersItems.filter(
    item => !item.requiredModule || visibleModules.has(item.requiredModule)
  );

  // ── Estado de submenús ──────────────────────────────────────────
  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  const isSubItemActive = useCallback(
    (subItems: { path: string }[] | undefined) =>
      subItems?.some(sub => isActive(sub.path)) || false,
    [isActive]
  );

  useEffect(() => {
    let matched = false;
    (["main", "others"] as const).forEach(menuType => {
      const items = menuType === "main" ? filteredNavItems : filteredOthersItems;
      items.forEach((nav, index) => {
        if (nav.subItems && isSubItemActive(nav.subItems)) {
          setOpenSubmenu({ type: menuType, index });
          matched = true;
        } else if (nav.path && isActive(nav.path)) {
          setOpenSubmenu(null);
        }
      });
    });
    if (!matched) setOpenSubmenu(null);
  }, [location]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight(prev => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu(prev => {
      if (prev?.type === menuType && prev?.index === index) return null;
      return { type: menuType, index };
    });
  };

  // ── Render de items ─────────────────────────────────────────────
  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => {
        const isItemActive = nav.path
          ? isActive(nav.path)
          : isSubItemActive(nav.subItems);
        const isSubmenuOpen =
          openSubmenu?.type === menuType && openSubmenu?.index === index;

        return (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`menu-item group ${
                  isItemActive || isSubmenuOpen ? "menu-item-active" : "menu-item-inactive"
                } cursor-pointer ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isItemActive || isSubmenuOpen
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {showFull && <span className="menu-item-text">{nav.name}</span>}
                {showFull && (
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                      isSubmenuOpen ? "rotate-180 text-brand-500" : ""
                    }`}
                  />
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  to={nav.path}
                  className={`menu-item group ${
                    isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
                >
                  <span
                    className={`menu-item-icon-size ${
                      isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {showFull && <span className="menu-item-text">{nav.name}</span>}
                </Link>
              )
            )}

            {nav.subItems && showFull && (
              <div
                ref={el => { subMenuRefs.current[`${menuType}-${index}`] = el; }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height: isSubmenuOpen
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
                }}
              >
                <ul className="mt-2 space-y-1 ml-9">
                  {nav.subItems.map(subItem => (
                    <li key={subItem.name}>
                      <Link
                        to={subItem.path}
                        className={`menu-dropdown-item ${
                          isActive(subItem.path)
                            ? "menu-dropdown-item-active"
                            : "menu-dropdown-item-inactive"
                        }`}
                      >
                        {subItem.name}
                        <span className="flex items-center gap-1 ml-auto">
                          {subItem.new && (
                            <span
                              className={`ml-auto ${
                                isActive(subItem.path)
                                  ? "menu-dropdown-badge-active"
                                  : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                            >
                              new
                            </span>
                          )}
                          {subItem.pro && (
                            <span
                              className={`ml-auto ${
                                isActive(subItem.path)
                                  ? "menu-dropdown-badge-active"
                                  : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                            >
                              pro
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  // ────────────────────────────────────────────────────────────────
  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0
        bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900
        h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Barra de acento de rol */}
      <div
        className={`absolute top-0 left-0 w-1 h-full rounded-r-full transition-all duration-300 ${rolConfig.accentBar}`}
      />

      {/* Logo */}
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {showFull ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo1/plexidentLig.png"
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo1/plexidentDark.png"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img src="/images/logo/logo-icon.svg" alt="Logo" width={32} height={32} />
          )}
        </Link>
      </div>

      {/* Contenido scrollable */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar flex-1">

        {/* Bloque de usuario */}
        <div className="mb-6">
          {showFull ? (
            <UserAvatar
              nombres={user?.nombres}
              apellidos={user?.apellidos}
              correo={user?.correo}
              rol={role}
              showFull={showFull}
            />
          ) : (
            <div className="flex justify-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border
                  ${rolConfig.badgeBg} ${rolConfig.badgeText} ${rolConfig.badgeBorder}`}
                title={`${rolConfig.label} — ${rolConfig.description}`}
              >
                {rolConfig.label[0]}
              </div>
            </div>
          )}
        </div>

        {/* Divisor con nivel de acceso */}
        {showFull && (
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center">
              <span
                className={`bg-white dark:bg-gray-900 px-2 text-[10px] font-semibold uppercase tracking-widest ${rolConfig.badgeText}`}
              >
                {rolConfig.description}
              </span>
            </div>
          </div>
        )}

        {/* Navegación */}
        <nav className="mb-6">
          <div className="flex flex-col gap-4">

            {/* Sección principal */}
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
                {showFull ? "Gestión Dental" : <HorizontaLDots className="size-6" />}
              </h2>

              {isLoadingPerms ? (
                <NavSkeleton showFull={showFull} />
              ) : (
                renderMenuItems(filteredNavItems, "main")
              )}
            </div>

            {/* Sección de administración — solo si hay ítems visibles */}
            {!isLoadingPerms && filteredOthersItems.length > 0 && (
              <div>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                    !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
                >
                  {showFull ? "Administración" : <HorizontaLDots />}
                </h2>
                {renderMenuItems(filteredOthersItems, "others")}
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Footer: resumen de rol y módulos accesibles */}
      {showFull && (
        <div className="py-4 border-t border-gray-200 dark:border-gray-700">
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border
              ${rolConfig.badgeBg} ${rolConfig.badgeBorder}`}
          >
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${rolConfig.dotColor}`} />
            <span className={`text-xs font-semibold ${rolConfig.badgeText}`}>
              {rolConfig.label}
            </span>
            {!isLoadingPerms && (
              <span className="text-gray-400 dark:text-gray-500 text-xs ml-auto">
                {visibleModules.size} módulos
              </span>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

export default AppSidebar;