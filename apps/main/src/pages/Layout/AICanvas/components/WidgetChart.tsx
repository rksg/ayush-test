import React, { useEffect } from 'react'

import { CallbackDataParams } from 'echarts/types/dist/shared'
import { useDrag }            from 'react-dnd'
import { getEmptyImage }      from 'react-dnd-html5-backend'
import { useIntl }            from 'react-intl'
import AutoSizer              from 'react-virtualized-auto-sizer'
import { v4 as uuidv4 }       from 'uuid'

import { BarChartData }                                                             from '@acx-ui/analytics/utils'
import { BarChart, cssNumber, cssStr, DonutChart, Loader, StackedAreaChart, Table } from '@acx-ui/components'
import { formatter }                                                                from '@acx-ui/formatter'
import { useChatChartQuery }                                                        from '@acx-ui/rc/services'
import { WidgetListData }                                                           from '@acx-ui/rc/utils'

import * as UI from '../styledComponents'

import { ItemTypes } from './GroupItem'

interface WidgetListProps {
  data: WidgetListData;
}

interface WidgetCategory {
  width: number
  height: number
  currentSizeIndex?: number
  sizes?: { width: number, height:number }[]
}

const ChartConfig:{ [key:string]: WidgetCategory } = {
  pie: {
    width: 1,
    height: 4,
    currentSizeIndex: 0,
    sizes: [
      {
        width: 1,
        height: 4
      },
      {
        width: 2,
        height: 6
      },
      {
        width: 4,
        height: 9
      }
    ]
  },
  line: {
    width: 2,
    height: 4
  },
  bar: {
    width: 2,
    height: 8,
    currentSizeIndex: 0,
    sizes: [
      {
        width: 1,
        height: 4
      },
      {
        width: 2,
        height: 8
      }
    ]
  },
  table: {
    width: 2,
    height: 4
  }
}

export const DraggableChart: React.FC<WidgetListProps> = ({ data }) => {
  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.CARD,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    }),
    item: () => {
      const dragCard = {
        ...data,
        id: data.id + uuidv4(),
        type: ItemTypes.CARD,
        isShadow: true,
        ...(data.chartType? ChartConfig[data.chartType] : [])
      }
      return dragCard
    }
  })

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move'
      }}
    >
      <div style={{
        margin: '7px',
        height: data.chartType === 'bar' ? '300px' : '165px',
        width: data.chartType === 'pie' ? '200px' : '300px' }}>
        <WidgetChart data={data} />
      </div>
    </div>
  )
}

export const WidgetChart: React.FC<WidgetListProps> = ({ data }) => {
  const { $t } = useIntl()
  const queryResults = useChatChartQuery({
    params: {
      sessionId: data.sessionId,
      chatId: data.chatId
    }
  })

  function labelFormatter (params: CallbackDataParams): string {
    const usage = Array.isArray(params.data) ? params.data[params?.encode?.['x'][0]!] : params.data
    return '{data|' + formatter('bytesFormat')(usage) + '}'
  }

  const richStyle = () => ({
    data: {
      color: cssStr('--acx-primary-black'),
      fontFamily: cssStr('--acx-neutral-brand-font'),
      fontSize: cssNumber('--acx-body-5-font-size'),
      lineHeight: cssNumber('--acx-body-5-line-height'),
      fontWeight: cssNumber('--acx-body-5-font-weight')
    }
  })


  const getChart = (type: string, width:number, height:number, chartData:WidgetListData) => {
    if(type === 'pie') {
      return <DonutChart
        style={{ width, height }}
        size={'medium'}
        data={chartData?.chartOption || []}
        animation={true}
        showTotal
      />
    } else if(type === 'line') {
      return <StackedAreaChart
        style={{ width, height }}
        data={chartData?.chartOption || []}
        xAxisType={chartData?.axisType}
      />
    } else if(type === 'bar') {
      return <BarChart
        style={{ width, height }}
        data={(chartData?.chartOption || []) as BarChartData}
        barWidth={8}
        labelFormatter={labelFormatter}
        labelRichStyle={richStyle()}
      />
    } else if(type === 'table') {
      return <Table
        style={{ width: width-30 }}
        columns={chartData?.chartOption?.columns?.map(i => ({ ...i, searchable: true })) || []}
        dataSource={chartData?.chartOption?.dataSource}
        type='compactWidget'
        rowKey={chartData?.chartOption?.columns?.[0]?.key || 'id'}
      />
    }
    return
  }
  // const queryResults = {
  //   data: {
  //     chartOption: [
  //       {
  //           "key": "switchId_Total Uplink Traffic (Bytes)",
  //           "name": "Total Uplink Traffic (Bytes)",
  //           "data": [
  //               [
  //                   "D4:C1:9E:15:E9:21",
  //                   278871529
  //               ],
  //               [
  //                   "58:FB:96:0E:81:B2",
  //                   46174041
  //               ]
  //           ]
  //       },
  //       {
  //           "key": "switchId_Total Downlink Traffic (Bytes)",
  //           "name": "Total Downlink Traffic (Bytes)",
  //           "data": [
  //               [
  //                   "D4:C1:9E:15:E9:21",
  //                   12376117
  //               ],
  //               [
  //                   "58:FB:96:0E:81:B2",
  //                   6073197
  //               ]
  //           ]
  //       }
  //   ]
  //   }
  // }
  const chartData = data //data.type === 'card' ? queryResults.data : data
  return (
    <Loader states={[{ isLoading: queryResults.isLoading }]}>
      <UI.Widget
        key={data.id}
        title={data.type === 'card' ? (data.title || $t({ defaultMessage: 'Title' })) : ''}
        className={data.chartType === 'table' ? 'table' : ''}
      >
        <AutoSizer>
          {({ height, width }) => getChart(
            data.chartType, width, height, chartData as WidgetListData)}
        </AutoSizer>
      </UI.Widget>
    </Loader>
  )
}

