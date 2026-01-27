// src/components/dashboard/PieChart.tsx

import React from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

interface PieChartData {
  label: string;
  value: number;
}

interface PieChartProps {
  title: string;
  data: PieChartData[];
  colors?: string[];
  loading?: boolean;
}

const PieChart: React.FC<PieChartProps> = ({
  title,
  data,
  colors = ['#465FFF', '#4BC0C0', '#FF6384', '#FFCE56', '#9966FF', '#FF9F40', '#36A2EB', '#C9CBCF'],
  loading = false
}) => {
  const chartOptions: ApexOptions = {
    chart: {
      type: 'donut',
      fontFamily: 'Outfit, sans-serif',
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
        },
      },
    },
    colors: colors,
    labels: data.map(item => item.label),
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '12px',
        fontFamily: 'Outfit, sans-serif',
      },
      dropShadow: {
        enabled: false,
      },
      formatter: function(val: string | number, opts?: { seriesIndex: number; w: { config: { labels: string[] } } }): string {
        if (!opts) return `${val}%`;
        return `${opts.w.config.labels[opts.seriesIndex]}: ${Number(val).toFixed(1)}%`;
      },
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      fontWeight: 400,
      labels: {
        colors: '#6B7280',
      },
      markers: {
        width: 8,
        height: 8,
        radius: 4,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 600,
              color: '#374151',
            },
            value: {
              show: true,
              fontSize: '22px',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              color: '#111827',
              formatter: function(val: string): string {
                return `${val}%`;
              },
            },
            total: {
              show: true,
              label: 'Total',
              color: '#6B7280',
              fontSize: '14px',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 600,
              formatter: function(w: { globals: { seriesTotals: number[] } }): string {
                const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                return Math.round(total).toString();
              },
            },
          },
        },
      },
    },
    tooltip: {
      y: {
        formatter: function(val: number): string {
          return `${val}%`;
        },
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  };

  const chartSeries = data.map(item => item.value);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
      <Chart options={chartOptions} series={chartSeries} type="donut" height={300} />
    </div>
  );
};

export default PieChart;
