"use client";


import dynamic from 'next/dynamic';

import { useState } from 'react';

// Dynamically import ApexCharts to ensure proper client-side rendering
const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const AreaChart = () => {
  const [options, setOptions] = useState({
    chart: {
      height: '100%',
      type: 'area',
      fontFamily: 'Inter, sans-serif',
      dropShadow: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    tooltip: {
      enabled: true,
      x: {
        show: false,
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
        shade: '#1C64F2',
        gradientToColors: ['#1C64F2'],
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 6,
    },
    grid: {
      show: false,
      strokeDashArray: 4,
      padding: {
        left: 2,
        right: 2,
        top: 0,
      },
    },
    xaxis: {
      categories: ['01 February', '02 February', '03 February', '04 February', '05 February', '06 February', '07 February'],
      labels: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      show: false,
    },
  });

  const [series, setSeries] = useState([
    {
      name: 'New users',
      data: [6500, 6418, 6456, 6526, 6356, 6456],
      color: '#1A56DB',
    },
  ]);

  return (
    <div id="area-chart">
      <ApexChart options={options} series={series} type="area" height="300" />
    </div>
  );
};

export default AreaChart;
