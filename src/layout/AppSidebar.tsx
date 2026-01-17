import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/auth/useAuth";

// Assume these icons are imported from an icon library
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";

// ======================
// Tipos y permisos por rol
// ======================

type Rol = "Administrador" | "Odontologo" | "Asistente";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const canSeeMenu = (menuName: string, rol?: Rol | null): boolean => {
  if (!rol) return false;

  const MAP: Record<Rol, string[]> = {
    Administrador: [
      "Dashboard",
      "Pacientes",
      "Agenda",
      "Odontograma",
      "Historia Clínica",
      "Plan Tratamiento",
      "Usuarios",
      "Reportes",
      "Configuración",
    ],
    Odontologo: [
      "Dashboard",
      "Pacientes",
      "Agenda",
      "Odontograma",
      "Historia Clínica",
      "Plan Tratamiento",
      "Reportes",
    ],
    Asistente: ["Dashboard", "Pacientes", "Agenda"],
  };

  return MAP[rol].includes(menuName);
};

// ======================
// Configuración de items
// ======================

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: <UserCircleIcon />,
    name: "Pacientes",
    subItems: [
      { name: "Pacientes", path: "/pacientes", pro: false },
      { name: "Detalles de paciente", path: "/pacientes/constantes-vitales", pro: false },
    ],
  },
  {
    icon: <CalenderIcon />,
    name: "Agenda",
    subItems: [{ name: "Citas", path: "/citas", pro: false }],
  },
  {
    icon: <BoxCubeIcon />,
    name: "Odontograma",
    subItems: [
      { name: "Nuevo Odontograma", path: "/odontograma", pro: false },
      { name: "Historial", path: "/odontograma-timeline", pro: false },
      { name: "Indicadores de Salud Bucal", path: "/indicadores-salud-bucal", pro: false },
    ],
  },
  {
    icon: <PageIcon />,
    name: "Historia Clínica",
    subItems: [
      { name: "Historias Clínicas", path: "/historia-clinica", pro: false },
      { name: "Nueva Historia", path: "/nueva-historia", pro: false },
    ],
  },
  {
    icon: <TableIcon />,
    name: "Plan Tratamiento",
    subItems: [
      { name: "Planes de Tratamiento", path: "/plan-tratamiento", pro: false },
      { name: "Nuevo Plan", path: "/nuevo-plan", pro: false },
    ],
  },
 
];

const othersItems: NavItem[] = [
  {
    icon: <TableIcon />,
    name: "Usuarios",
    subItems: [
      { name: "Gestión de Usuarios", path: "/usuarios", pro: false },
    ],
  },
  {
    icon: <PieChartIcon />,
    name: "Reportes",
    subItems: [
      { name: "Reportes Clínicos", path: "/reportes-clinicos", pro: false },
      { name: "Reportes Financieros", path: "/reportes-financieros", pro: false },
      { name: "Estadísticas", path: "/estadisticas", pro: false },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Configuración",
    subItems: [
      { name: "Permisos Usuario", path: "/permisos-usuario", pro: false },
    ],
  },
];

// ======================
// Componente principal
// ======================

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { user } = useAuth(); // Solo obtener usuario, no logout
  const location = useLocation();

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
    (subItems: { path: string }[] | undefined) => {
      return subItems?.some((subItem) => isActive(subItem.path)) || false;
    },
    [isActive]
  );

  useEffect(() => {
    let submenuMatched = false;

    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems && isSubItemActive(nav.subItems)) {
          setOpenSubmenu({
            type: menuType as "main" | "others",
            index,
          });
          submenuMatched = true;
        } else if (nav.path && isActive(nav.path)) {
          setOpenSubmenu(null);
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive, isSubItemActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

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
                  isItemActive || isSubmenuOpen
                    ? "menu-item-active"
                    : "menu-item-inactive"
                } cursor-pointer ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                }`}
              >
                <span
                  className={`menu-item-icon-size  ${
                    isItemActive || isSubmenuOpen
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
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
                      isActive(nav.path)
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                </Link>
              )
            )}
            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[`${menuType}-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height: isSubmenuOpen
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
                }}
              >
                <ul className="mt-2 space-y-1 ml-9">
                  {nav.subItems.map((subItem) => (
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

  const role = user?.rol as Rol | undefined;
  const filteredNavItems = navItems.filter((item) =>
    canSeeMenu(item.name, role)
  );
  const filteredOthersItems = othersItems.filter((item) =>
    canSeeMenu(item.name, role)
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
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
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar flex-1">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Gestión Dental2"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(filteredNavItems, "main")}
            </div>
            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Administración"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(filteredOthersItems, "others")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;