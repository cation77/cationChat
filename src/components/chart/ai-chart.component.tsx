'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui';
import { cn } from '@/lib/utils';
import { ChartConfig } from '@/types/chat.types';

type ChartType = 'line' | 'bar' | 'pie' | 'area';

interface AIChartProps {
  type: ChartType;
  data: Record<string, unknown>[];
  options?: Record<string, unknown>;
  className?: string;
  loading?: boolean;
}

const AIChart: React.FC<AIChartProps> = ({
  type,
  data,
  options = {},
  className,
  loading = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 300 });
  const chartRef = useRef<any>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: (options.height as number) || 300,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [options.height]);

  useEffect(() => {
    if (loading || !data || data.length === 0 || !containerRef.current) return;

    const chartConfigs: Record<ChartType, { config: Record<string, unknown> }> = {
      line: {
        config: {
          smooth: true,
          pointSize: 5,
          pointStyle: { fill: '#1890ff', stroke: '#fff', lineWidth: 2 },
          lineWidth: 2,
          xField: 'x',
          yField: 'y',
        },
      },
      bar: {
        config: {
          barWidthRatio: 0.6,
          xField: 'x',
          yField: 'y',
          seriesField: 'series',
        },
      },
      pie: {
        config: {
          radius: 0.8,
          innerRadius: 0.6,
          label: { type: 'outer', content: '{name}: {percentage}' },
          legend: { position: 'bottom' },
        },
      },
      area: {
        config: {
          smooth: true,
          xField: 'x',
          yField: 'y',
          areaStyle: { fill: 'l(270) 0:#ffffff 1:#1890ff' },
        },
      },
    };

    const chartConfig = chartConfigs[type];
    const config = {
      ...chartConfig.config,
      ...options,
      data,
      width: dimensions.width,
      height: dimensions.height,
      renderer: 'svg',
    };

    const renderChart = async () => {
      try {
        let ChartComponent: any;

        switch (type) {
          case 'line':
            const { Line } = await import('@ant-design/charts');
            ChartComponent = Line;
            break;
          case 'bar':
            const { Bar } = await import('@ant-design/charts');
            ChartComponent = Bar;
            break;
          case 'pie':
            const { Pie } = await import('@ant-design/charts');
            ChartComponent = Pie;
            break;
          case 'area':
            const { Area } = await import('@ant-design/charts');
            ChartComponent = Area;
            break;
          default:
            return;
        }

        if (chartRef.current) {
          chartRef.current.destroy();
        }

        const chart = new ChartComponent(config);
        chart.render();
        chartRef.current = chart;
      } catch (error) {
        console.error('Chart render error:', error);
      }
    };

    renderChart();

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [type, data, options, dimensions, loading]);

  if (loading) {
    return (
      <Card className={cn('flex items-center justify-center p-8', className)}>
        <div className="text-muted-foreground">加载图表中...</div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className={cn('flex items-center justify-center p-8', className)}>
        <div className="text-muted-foreground">暂无数据</div>
      </Card>
    );
  }

  return (
    <Card className={cn('p-4', className)}>
      <div ref={containerRef} style={{ width: '100%', height: dimensions.height }} />
    </Card>
  );
};

export { AIChart };
export type { AIChartProps, ChartType };
