// src/components/dashboard/DashboardCharts.tsx
import React, { useState } from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import PieChart from './PieChart';
import { Dropdown } from '../ui/dropdown/Dropdown';
import { DropdownItem } from '../ui/dropdown/DropdownItem';
import { MoreDotIcon } from '../../icons';
import type { DashboardResponse } from '../../types/dashboard/IDashboard';

interface DashboardChartsProps {
  graficos?: DashboardResponse['graficos'];
  loading?: boolean;
  rol?: string; // ✅ Propiedad para el rol
}

// ✅ Tipos específicos para ApexCharts tooltips
interface TooltipFormatterOptions {
  dataPointIndex: number;
  seriesIndex: number;
  w: {
    config: {
      series: Array<{ data: number[] }>;
      xaxis: { categories: string[] };
    };
  };
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ 
  graficos, 
  loading = false,
  rol // ✅ Recibir el rol como prop
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  // ✅ RF-06.2: Datos para gráfico de distribución por estado (PIE CHART)
  const getDistribucionEstadosData = () => {
    if (!graficos?.distribucion_estados?.length) return null;
    
    const labels = graficos.distribucion_estados.map(item => item.estado_display);
    const values = graficos.distribucion_estados.map(item => item.total);
    const percentages = graficos.distribucion_estados.map(item => item.porcentaje);
    
    return {
      labels,
      values,
      percentages,
    };
  };

  // ✅ RF-06.3: Datos para gráfico de diagnósticos frecuentes (BAR CHART)
  const getDiagnosticosFrecuentesData = () => {
    // ✅ OCULTAR para Asistente
    if (rol === 'Asistente') return null;
    
    if (!graficos?.diagnosticos_frecuentes?.length) return null;
    
    console.log('🔍 Diagnosticos frecuentes recibidos:', {
      total: graficos.diagnosticos_frecuentes.length,
      diagnosticos: graficos.diagnosticos_frecuentes.map(d => ({
        nombre: d.diagnostico_nombre,
        siglas: d.diagnostico_siglas,
        total: d.total,
        porcentaje: d.porcentaje
      }))
    });
    
    // Tomar top 8 diagnósticos
    const topDiagnosticos = [...graficos.diagnosticos_frecuentes]
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
    
    console.log('📊 Top 8 diagnosticos para gráfico:', {
      count: topDiagnosticos.length,
      diagnosticos: topDiagnosticos.map(d => d.diagnostico_nombre)
    });
    
    return {
      options: {
        chart: {
          type: 'bar',
          fontFamily: 'Outfit, sans-serif',
          toolbar: { show: false },
          height: 350,
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '55%',
            borderRadius: 5,
          },
        },
        colors: ['#0D9488'],
        dataLabels: { enabled: false },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent'],
        },
        xaxis: {
          categories: topDiagnosticos.map(item => {
            if (item.diagnostico_nombre.length <= 15) {
              return item.diagnostico_nombre;
            }
            return item.diagnostico_siglas;
          }),
          labels: {
            style: {
              fontSize: '12px',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 500,
            },
            rotate: -45,
          },
        },
        yaxis: {
          title: {
            text: 'Cantidad',
            style: {
              fontSize: '12px',
              fontFamily: 'Outfit, sans-serif',
            },
          },
          labels: {
            formatter: (val: number) => Math.round(val).toString(),
          },
        },
        tooltip: {
          custom: ({ dataPointIndex }: { dataPointIndex: number }) => {
            const diagnostico = topDiagnosticos[dataPointIndex];
            return `
              <div class="apexcharts-tooltip-custom p-3">
                <div class="font-semibold mb-2">${diagnostico.diagnostico_nombre}</div>
                <div class="space-y-1">
                  <div>Total: <span class="font-bold">${diagnostico.total}</span> casos</div>
                  <div>Porcentaje: <span class="font-bold">${diagnostico.porcentaje.toFixed(1)}%</span></div>
                  <div>Siglas: <span class="font-bold">${diagnostico.diagnostico_siglas}</span></div>
                </div>
              </div>
            `;
          }
        },
        responsive: [{
          breakpoint: 768,
          options: {
            plotOptions: {
              bar: {
                columnWidth: '70%',
              },
            },
          },
        }],
      } as ApexOptions,
      series: [{
        name: 'Diagnósticos',
        data: topDiagnosticos.map(item => item.total),
      }],
      diagnosticos: topDiagnosticos,
    };
  };

  // Gráfico de evolución de citas (LINE CHART)
  const getEvolucionCitasData = () => {
    if (!graficos?.evolucion_citas?.length) return null;
    
    return {
      options: {
        chart: {
          type: 'line',
          fontFamily: 'Outfit, sans-serif',
          toolbar: { show: false },
          height: 300,
        },
        colors: ['#0D9488'],
        stroke: {
          width: 3,
          curve: 'smooth',
        },
        markers: {
          size: 5,
          hover: {
            size: 7,
          },
        },
        xaxis: {
          categories: graficos.evolucion_citas.map(item => item.mes_corto),
        },
        yaxis: {
          title: {
            text: 'Citas Asistidas',
            style: {
              fontSize: '12px',
              fontFamily: 'Outfit, sans-serif',
            },
          },
          min: 0,
        },
        tooltip: {
          y: {
            formatter: (val: number) => `${val} citas`,
          },
        },
        grid: {
          borderColor: '#f1f1f1',
        },
      } as ApexOptions,
      series: [{
        name: 'Citas Asistidas',
        data: graficos.evolucion_citas.map(item => item.total),
      }],
    };
  };

  // ✅ Gráfico de citas por día (AREA CHART)
  const getCitasPorDiaData = () => {
    if (!graficos?.citas_por_dia?.length) {
      console.log('📅 No hay datos de citas_por_dia o array vacío');
      return null;
    }

    console.log('📅 Datos de citas_por_dia recibidos:', {
      total: graficos.citas_por_dia.length,
      fechas: graficos.citas_por_dia.map(c => ({
        fecha: c.fecha,
        total: c.total,
        fechaOriginal: new Date(c.fecha)
      }))
    });
    
    const formattedData = graficos.citas_por_dia.map(item => {
      const date = new Date(item.fecha);
      const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
      
      if (isNaN(adjustedDate.getTime())) {
        console.warn('⚠️ Fecha inválida:', item.fecha);
        return null;
      }
      
      return {
        ...item,
        formattedDate: `${adjustedDate.getDate().toString().padStart(2, '0')}/${(adjustedDate.getMonth() + 1).toString().padStart(2, '0')}`,
        dateObj: adjustedDate
      };
    }).filter((item): item is NonNullable<typeof item> => item !== null);

    if (formattedData.length === 0) {
      console.log('📅 No hay fechas válidas después del filtrado');
      return null;
    }

    formattedData.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    
    const categories = formattedData.map(item => item.formattedDate);
    const dates = formattedData.map(item => item.dateObj);
    const values = formattedData.map(item => item.total);

    console.log('📊 Datos procesados para gráfico:', {
      categories,
      values,
      fechasCompletas: dates.map(d => d.toISOString())
    });
    
    return {
      options: {
        chart: {
          type: 'area',
          fontFamily: 'Outfit, sans-serif',
          toolbar: { show: false },
          height: 250,
          zoom: {
            enabled: true,
            type: 'x',
            autoScaleYaxis: true
          }
        },
        colors: ['#0D9488'],
        stroke: {
          width: 2,
          curve: 'smooth',
        },
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.7,
            opacityTo: 0.3,
            stops: [0, 90, 100],
          },
        },
        dataLabels: { enabled: false },
        xaxis: {
          categories: categories,
          labels: {
            style: {
              fontSize: '12px',
              fontFamily: 'Outfit, sans-serif',
            },
            rotate: -45,
          },
        },
        yaxis: {
          title: {
            text: 'Cantidad de Citas',
            style: {
              fontSize: '12px',
              fontFamily: 'Outfit, sans-serif',
            },
          },
          min: 0,
          forceNiceScale: true,
          labels: {
            formatter: (val: number) => Math.round(val).toString(),
          },
        },
        tooltip: {
          shared: true,
          intersect: false,
          x: {
            formatter: (value: number, opts?: TooltipFormatterOptions): string => {
              const index = opts?.dataPointIndex ?? 0;
              if (index < dates.length) {
                const date = dates[index];
                return date.toLocaleDateString('es-ES', { 
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                });
              }
              return value.toString();
            }
          },
          y: {
            formatter: (val: number): string => {
              return `${val} ${val === 1 ? 'cita' : 'citas'}`;
            },
          },
        },
        grid: {
          borderColor: '#f1f1f1',
          strokeDashArray: 4,
        },
      } as ApexOptions,
      series: [{
        name: 'Citas por Día',
        data: values,
      }],
    };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <div className="h-5 bg-gray-200 rounded dark:bg-gray-700 w-1/3 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded dark:bg-gray-700"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const distribucionEstadosData = getDistribucionEstadosData();
  const diagnosticosFrecuentesData = getDiagnosticosFrecuentesData();
  const evolucionCitasData = getEvolucionCitasData();
  const citasPorDiaData = getCitasPorDiaData();

  console.log('📈 Estado de todos los gráficos:', {
    rol, // ✅ Ver el rol en los logs
    tieneDistribucionEstados: !!distribucionEstadosData,
    tieneDiagnosticosFrecuentes: !!diagnosticosFrecuentesData,
    tieneEvolucionCitas: !!evolucionCitasData,
    tieneCitasPorDia: !!citasPorDiaData,
    citasPorDiaCount: citasPorDiaData?.series?.[0]?.data?.length || 0,
  });

  // ✅ Determinar si es asistente
  const esAsistente = rol === 'Asistente';

  return (
    <div className="space-y-6">
      {/* Primera fila: Solo distribución por estado si es asistente, sino mostrar ambos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ✅ RF-06.2: Distribución de citas por estado - SIEMPRE MOSTRAR */}
        <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Distribución por Estado
              </h3>
              <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
                Todas las citas en el periodo seleccionado
              </p>
            </div>
          </div>
          
          {distribucionEstadosData ? (
            <>
              <div className="h-80">
                <PieChart
                  title=""
                  data={distribucionEstadosData.labels.map((label, index) => ({
                    label,
                    value: distribucionEstadosData.values[index],
                  }))}
                  colors={['#10B981', '#0D9488', '#F59E0B', '#EF4444', '#6B7280', '#8B5CF6']}
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {distribucionEstadosData.labels.map((label, index) => (
                  <div key={index} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {label}
                    </div>
                    <div className="mt-1 flex items-baseline">
                      <span className="text-2xl font-bold text-gray-800 dark:text-white">
                        {distribucionEstadosData.values[index]}
                      </span>
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                        ({distribucionEstadosData.percentages[index].toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-80 flex flex-col items-center justify-center">
              <div className="text-gray-400 dark:text-gray-500 mb-3">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-center mb-2">
                No hay datos de distribución de estados
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                No se encontraron citas en el periodo seleccionado
              </p>
            </div>
          )}
        </div>

        {/* ✅ RF-06.3: Diagnósticos frecuentes - SOLO MOSTRAR SI NO ES ASISTENTE */}
        {!esAsistente && diagnosticosFrecuentesData && (
          <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Diagnósticos Frecuentes
                </h3>
                <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
                  Top {diagnosticosFrecuentesData.diagnosticos.length} diagnósticos en el periodo
                </p>
              </div>
              <div className="relative inline-block">
                <button className="dropdown-toggle" onClick={toggleDropdown}>
                  <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6" />
                </button>
                <Dropdown
                  isOpen={isOpen}
                  onClose={closeDropdown}
                  className="w-40 p-2"
                >
                  <DropdownItem
                    onItemClick={closeDropdown}
                    className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                  >
                    Ver más
                  </DropdownItem>
                  <DropdownItem
                    onItemClick={closeDropdown}
                    className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                  >
                    Exportar
                  </DropdownItem>
                </Dropdown>
              </div>
            </div>
            
            <div className="h-80">
              <Chart 
                options={diagnosticosFrecuentesData.options} 
                series={diagnosticosFrecuentesData.series} 
                type="bar" 
                height="100%" 
              />
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Mostrando {diagnosticosFrecuentesData.diagnosticos.length} diagnósticos
            </div>
          </div>
        )}

        {/* ✅ Para asistentes: Si no hay diagnósticos frecuentes, mostrar el gráfico de evolución de citas en la misma fila */}
        {esAsistente && evolucionCitasData && (
          <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Evolución de Citas Asistidas
              </h3>
              <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
                Últimos 6 meses
              </p>
            </div>
            
            <div className="h-80">
              <Chart 
                options={evolucionCitasData.options} 
                series={evolucionCitasData.series} 
                type="line" 
                height="100%" 
              />
            </div>
          </div>
        )}

        {/* ✅ Para Admin/Odontólogo: Si no hay datos de diagnósticos frecuentes, mostrar mensaje */}
        {!esAsistente && !diagnosticosFrecuentesData && (
          <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Diagnósticos Frecuentes
                </h3>
                <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
                  Diagnósticos del periodo seleccionado
                </p>
              </div>
            </div>
            
            <div className="h-80 flex flex-col items-center justify-center">
              <div className="text-gray-400 dark:text-gray-500 mb-3">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-center mb-2">
                No hay diagnósticos registrados
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                No se encontraron diagnósticos en el periodo seleccionado
              </p>
            </div>
          </div>
        )}

        {/* ✅ Para Asistentes: Si no hay evolución de citas, mostrar mensaje o mantener espacio */}
        {esAsistente && !evolucionCitasData && (
          <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Evolución de Citas Asistidas
              </h3>
              <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
                Últimos 6 meses
              </p>
            </div>
            
            <div className="h-80 flex flex-col items-center justify-center">
              <div className="text-gray-400 dark:text-gray-500 mb-3">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-center mb-2">
                No hay datos de evolución de citas
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Prueba seleccionando un periodo diferente
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ✅ SEGUNDA FILA: Siempre mostrar Tendencia Diaria de Citas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Para Admin/Odontólogo: Mostrar Evolución de Citas si existe */}
        {!esAsistente && evolucionCitasData && (
          <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Evolución de Citas Asistidas
              </h3>
              <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
                Últimos 6 meses
              </p>
            </div>
            
            <div className="h-80">
              <Chart 
                options={evolucionCitasData.options} 
                series={evolucionCitasData.series} 
                type="line" 
                height="100%" 
              />
            </div>
          </div>
        )}

        {/* Para Admin/Odontólogo: Si no hay Evolución de Citas pero hubo Diagnósticos Frecuentes */}
        {!esAsistente && !evolucionCitasData && diagnosticosFrecuentesData && (
          <div className="rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Evolución de Citas Asistidas
              </h3>
              <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
                Últimos 6 meses
              </p>
            </div>
            
            <div className="h-80 flex flex-col items-center justify-center">
              <div className="text-gray-400 dark:text-gray-500 mb-3">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-center mb-2">
                No hay datos de evolución de citas
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Prueba seleccionando un periodo diferente
              </p>
            </div>
          </div>
        )}

        {/* ✅ Tendencia Diaria de Citas - SIEMPRE MOSTRAR */}
        <div className={`${(!esAsistente && !evolucionCitasData) || esAsistente ? 'lg:col-span-2' : ''} rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6`}>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Tendencia Diaria de Citas
            </h3>
            <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
              Evolución día a día en el periodo seleccionado
            </p>
          </div>
          
          {citasPorDiaData ? (
            <div className="h-80">
              <Chart 
                options={citasPorDiaData.options} 
                series={citasPorDiaData.series} 
                type="area" 
                height="100%" 
              />
            </div>
          ) : (
            <div className="h-80 flex flex-col items-center justify-center">
              <div className="text-gray-400 dark:text-gray-500 mb-3">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-center mb-2">
                No hay datos de citas por día
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Selecciona un periodo con citas para visualizar
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;