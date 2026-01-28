// src/hooks/dashboard/useChartData.ts

import { useMemo } from 'react';
import type { ChartData, ChartOptions } from 'chart.js';

interface ChartConfig {
  data: ChartData;
  options: ChartOptions;
}

export const useChartData = () => {
  // Mover defaultColors dentro de un useMemo para evitar cambios en cada render
  const defaultColors = useMemo(() => [
    '#36A2EB', // Azul
    '#4BC0C0', // Verde azulado
    '#FFCE56', // Amarillo
    '#FF6384', // Rosa
    '#9966FF', // Morado
    '#FF9F40', // Naranja
    '#C9CBCF', // Gris
    '#77DD77', // Verde claro
  ], []);

  const createPieChartConfig = useMemo(() => 
    (labels: string[], values: number[]): ChartConfig => ({
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: defaultColors.slice(0, labels.length),
          borderColor: '#fff',
          borderWidth: 2,
          hoverOffset: 15,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.raw as number;
                const total = values.reduce((sum, val) => sum + val, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              },
            },
          },
        },
      },
    }), [defaultColors]);

  const createBarChartConfig = useMemo(() => 
    (labels: string[], values: number[], label = 'Cantidad'): ChartConfig => ({
      data: {
        labels,
        datasets: [{
          label,
          data: values,
          backgroundColor: defaultColors[0],
          borderColor: defaultColors[0],
          borderWidth: 1,
          borderRadius: 4,
          hoverBackgroundColor: '#2980b9',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.05)',
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
          },
        },
      },
    }), [defaultColors]);

  const createLineChartConfig = useMemo(() => 
    (labels: string[], values: number[], label = 'Evolución'): ChartConfig => ({
      data: {
        labels,
        datasets: [{
          label,
          data: values,
          borderColor: defaultColors[2],
          backgroundColor: 'rgba(255, 206, 86, 0.2)',
          borderWidth: 3,
          tension: 0.1,
          fill: true,
          pointBackgroundColor: defaultColors[2],
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          },
        },
        interaction: {
          intersect: false,
          mode: 'nearest',
        },
      },
    }), [defaultColors]);

  return {
    createPieChartConfig,
    createBarChartConfig,
    createLineChartConfig,
    colors: defaultColors,
  };
};