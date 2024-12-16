import React, { useEffect } from 'react'

import { CallbackDataParams } from 'echarts/types/dist/shared'
import { useDrag }            from 'react-dnd'
import { getEmptyImage }      from 'react-dnd-html5-backend'
import { useIntl }            from 'react-intl'
import AutoSizer              from 'react-virtualized-auto-sizer'
import { v4 as uuidv4 }       from 'uuid'

import { BarChartData }                                                                   from '@acx-ui/analytics/utils'
import { BarChart, Card, cssNumber, cssStr, DonutChart, Loader, StackedAreaChart, Table } from '@acx-ui/components'
import { useChatChartQuery }                                                              from '@acx-ui/rc/services'
import { WidgetListData }                                                                 from '@acx-ui/rc/utils'

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
    height: 4
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
      <div style={{ margin: '7px', height: '165px', width: '200px' }}>
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
    return '{data|' + usage + '}'
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


  const getChart = (type: string, width:number, height:number) => {
    if(type === 'pie') {
      return <DonutChart
        style={{ width, height }}
        size={'medium'}
        data={queryResults.data?.chartOption || []}
        animation={true}
        showTotal
      />
    } else if(type === 'line') {
      return <StackedAreaChart
        style={{ width, height }}
        data={queryResults.data?.chartOption || []}
      />
    } else if(type === 'bar') {
      return <BarChart
        style={{ width: '100%', height: '100%' }}
        data={(queryResults.data?.chartOption || []) as BarChartData}
        barWidth={queryResults.data?.multiseries ? 8 : undefined}
        labelFormatter={labelFormatter}
        labelRichStyle={queryResults.data?.multiseries ? richStyle() : undefined}
      />
    } else if(type === 'table') {
      return <Table
        columns={queryResults.data?.chartOption?.columns || []}
        dataSource={queryResults.data?.chartOption?.dataSource}
        type='compact'
        rowKey={queryResults.data?.chartOption?.columns?.[0]?.key || 'id'}
      />
    }
    return
  }
  // const queryResults = {
  //   data: {
  //     chartOption: [
  //       { name: 'Requires Attention',value: 1 },
  //       { name: 'In Setup Phase',value: 64 },
  //       { name: 'Operational',value: 1 }
  //     ]
  //   }
  // }
  return (
    <Loader states={[{ isLoading: queryResults.isLoading }]}>
      <Card key={data.id} title={data.title || $t({ defaultMessage: 'Title' })}>
        <AutoSizer>
          {({ height, width }) => getChart(data.chartType, width, height)}
        </AutoSizer>
      </Card>
    </Loader>
  )
}

