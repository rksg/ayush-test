import {
  Dispatch,
  RefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
  RefCallback,
  useImperativeHandle,
} from 'react';
import * as UI from './styledComponents'

import ReactECharts from 'echarts-for-react';
import type { TimeSeriesChartData } from '@acx-ui/analytics/utils';
import { formatter } from '@acx-ui/utils';

import {
  TooltipFormatterCallback,
  TopLevelFormatterParams,
  CustomSeriesRenderItem,
  ElementEvent,
} from 'echarts/types/dist/shared';
import moment from 'moment-timezone';
import { useIntl } from 'react-intl';

import {
  xAxisOptions,
  ResetButton,
  axisLabelOptions,
  dateAxisFormatter,
  cssStr,
  cssNumber,
  ChartFormatterFn,
  tooltipOptions,
  timeSeriesTooltipFormatter,
} from '@acx-ui/components';
import type { TimeStampRange } from '@acx-ui/types';
import type {
  ECharts,
  EChartsOption,
  SeriesOption,
  CustomSeriesRenderItemAPI,
  CustomSeriesRenderItemParams,
  TooltipComponentOption
} from 'echarts';
import {  format } from 'echarts';
import type { EChartsReactProps } from 'echarts-for-react';

type OnDatazoomEvent = {
  batch?: {
    startValue: number;
    endValue: number;
  }[];
  start?: number;
  end?: number;
};
export interface MultiBarTimeSeriesChart extends Omit<EChartsReactProps, 'option' | 'opts'> {
  data: (TimeSeriesChartData & { color: string })[]; // https://github.com/microsoft/TypeScript/issues/44373
  chartBoundary: number[];
  zoomEnabled?: boolean;
  selectedData?: number;
  chartRef?: RefCallback<ReactECharts>;
  hasXaxisLabel?: boolean;
  dataFormatter?: ChartFormatterFn;
  tooltipFormatter?: TooltipFormatterCallback<TopLevelFormatterParams>;
  seriesFormatters?: Record<string, ChartFormatterFn>;
}
export const mapping = [{ key: 'SwitchStatus', series: 'Switch', color: 'green' }] as {
  key: string;
  series: string;
  color: string;
}[];

export const renderCustomItem = (
  params: CustomSeriesRenderItemParams,
  api: CustomSeriesRenderItemAPI
) => {
  const yValue = api?.value?.(1);
  const start = api?.coord?.([api?.value?.(0), yValue]);
  const end = api?.coord?.([api?.value?.(2), yValue]);
  const height = (api?.size as CallableFunction)?.([0, 1])?.[1];
  return {
    type: 'rect',
    shape: {
      x: start?.[0],
      y: start?.[1] - 9,
      width: end?.[0] - start?.[0],
      height: height,
    },
    style: api?.style?.(),
  };
};
export const onDataClick = (
  eChartsRef: RefObject<ReactECharts>,
  onDotClick: ((param: unknown) => void) | undefined,
  setShowTooltip: Dispatch<SetStateAction<boolean>>

) => {
  const handler = useCallback(
    function (params: { dataIndex?: number; seriesIndex?: number }) {
      const echartInstance = eChartsRef.current!.getEchartsInstance() as ECharts;
      echartInstance.dispatchAction({
        type: 'showTip',
        seriesIndex: params.seriesIndex,
        dataIndex: params.dataIndex
    });
      setShowTooltip(true)
    },
    [setShowTooltip]
  )
  useEffect(() => {
    if (!eChartsRef || !eChartsRef.current) return
    const echartInstance = eChartsRef.current?.getEchartsInstance() as ECharts    
    echartInstance.on('click', handler)
    return () => {
      echartInstance.off('click', handler)
    }
  }, [eChartsRef, handler])
}
export const useDataZoom = (
  eChartsRef: RefObject<ReactECharts>,
  zoomEnabled: boolean,
  onDataZoom?: (range: TimeStampRange, isReset: boolean) => void
): [boolean, () => void] => {
  const [canResetZoom, setCanResetZoom] = useState<boolean>(false);

  const onDatazoomCallback = useCallback(
    (e: unknown) => {
      const event = e as unknown as OnDatazoomEvent;
      const firstBatch = event.batch?.[0];
      firstBatch && onDataZoom && onDataZoom([firstBatch.startValue, firstBatch.endValue], false);
      if (event.start === 0 && event.end === 100) {
        setCanResetZoom(false);
      } else {
        setCanResetZoom(true);
      }
    },
    [onDataZoom]
  );
  useEffect(() => {
    if (!eChartsRef?.current || !zoomEnabled) return;
    const echartInstance = eChartsRef.current!.getEchartsInstance() as ECharts;
    echartInstance.dispatchAction({
      type: 'takeGlobalCursor',
      key: 'dataZoomSelect',
      dataZoomSelectActive: true,
    });
    echartInstance.on('datazoom', onDatazoomCallback);
  });

  const resetZoomCallback = useCallback(() => {
    if (!eChartsRef?.current) return;
    const echartInstance = eChartsRef.current!.getEchartsInstance() as ECharts;
    echartInstance.dispatchAction({ type: 'dataZoom', start: 0, end: 100 });
  }, [eChartsRef]);

  return [canResetZoom, resetZoomCallback];
};

export function MultiBarTimeSeriesChart({
  data,
  chartBoundary,
  selectedData,
  chartRef,
  tooltipFormatter,
  hasXaxisLabel,
  zoomEnabled = false,
  dataFormatter = formatter('countFormat'),
  seriesFormatters,
  ...props
}: MultiBarTimeSeriesChart) {
  const { $t } = useIntl();
  useImperativeHandle(chartRef, () => eChartsRef.current!);
  const chartPadding = 10;
  const rowHeight = 12;
  const xAxisHeight = hasXaxisLabel ? 30 : 0;
  const [showToolTip, setShowToolTip] = useState<boolean>(false)

  const eChartsRef = useRef<ReactECharts>(null);
  const [canResetZoom, resetZoomCallback] = useDataZoom(eChartsRef, zoomEnabled);
  onDataClick(eChartsRef, (params)=>{console.log(params)}, setShowToolTip)


  const option: EChartsOption = {
    animation: false,
    grid: {
      top: 0,
      bottom: 0,
      left: chartPadding,
      right: 0,
      width: props.style?.width,
      height: rowHeight,
    },
    tooltip: {
      show: showToolTip,
      alwaysShowContent: showToolTip,
      ...tooltipOptions(),
      formatter: tooltipFormatter ? tooltipFormatter : timeSeriesTooltipFormatter(
        data,
        { ...seriesFormatters, default: dataFormatter }
      )
    },

    xAxis: {
      ...xAxisOptions(),
      type: 'time',
      ...(hasXaxisLabel
        ? {
            axisLabel: {
              ...axisLabelOptions(),
              formatter: dateAxisFormatter(),
            },
            axisLine: {
              show: false,
            },
          }
        : {
            axisLabel: {
              show: false,
            },
          }),
      min: chartBoundary[0],
      max: chartBoundary[1],
      splitLine: {
        show: false,
        lineStyle: { color: cssStr('--acx-neutrals-20') },
      },
      axisPointer: {
        show : true,
        snap: false,
        triggerTooltip: false,
        label: {
          show: true,
          formatter: function(params) {
            return format.formatTime('yyyy-MM-dd', params.value);
          }
        },
      },  
    },
    yAxis: {
      type: 'category',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitArea: {
        show: true,
        areaStyle: {
          color: [cssStr('--acx-neutrals-20')],
        },
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: [cssStr('--acx-primary-white')],
          width: 4,
        },
      },
      data: [
        ...mapping.map(({ key }) => key),
      ],
    },
    ...(zoomEnabled
      ? {
          toolbox: {
            feature: {
              dataZoom: {
                yAxisIndex: 'none',
                brushStyle: { color: 'rgba(0, 0, 0, 0.05)' },
                icon: { back: 'path://', zoom: 'path://' },
              },
              brush: { type: ['rect'], icon: { rect: 'path://' } },
            },
          },
          dataZoom: [
            {
              id: 'zoom',
              type: 'inside',
              zoomLock: true,
              minValueSpan: 60,
            },
          ],
        }
      : { toolbox: { show: false } }),

    series: data
      .reverse()
      .slice()
      .map(({ key, color, data }) => {
        return {
          type: 'custom',
          name: key,
          renderItem: renderCustomItem as unknown as CustomSeriesRenderItem,
          itemStyle: {
            color: color,
          },
          data: data,

        };
      }) as SeriesOption,
  };
  return (
    <UI.Wrapper>
      <ReactECharts
        {...{
          ...props,
          style: {
            ...props.style,
            WebkitUserSelect: 'none',
            marginBottom: 0,
            width: (props.style?.width as number),
            height: rowHeight + xAxisHeight,
          },
        }}
        ref={eChartsRef}
        option={option}
      />
      {canResetZoom && (
        <ResetButton
          size="small"
          onClick={resetZoomCallback}
          children={$t({ defaultMessage: 'Reset Zoom' })}
          $disableLegend={true}
          style={{ top: -24 }}
        />
      )}
    </UI.Wrapper>
  );
}
