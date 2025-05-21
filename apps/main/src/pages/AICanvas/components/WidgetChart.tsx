import React, { useEffect } from 'react'

import { TooltipComponentFormatterCallbackParams } from 'echarts'
import { CallbackDataParams }                      from 'echarts/types/dist/shared'
import { useDrag }                                 from 'react-dnd'
import { getEmptyImage }                           from 'react-dnd-html5-backend'
import { renderToString }                          from 'react-dom/server'
import { useIntl }                                 from 'react-intl'
import AutoSizer                                   from 'react-virtualized-auto-sizer'
import { v4 as uuidv4 }                            from 'uuid'

import { BarChartData }                                                                                                    from '@acx-ui/analytics/utils'
import { BarChart, cssNumber, cssStr, DonutChart, Loader, NoDataIcon, showToast, StackedAreaChart, Table, TooltipWrapper } from '@acx-ui/components'
import { DateFormatEnum, formatter }                                                                                       from '@acx-ui/formatter'
import { useGetWidgetQuery }                                                                                               from '@acx-ui/rc/services'
import { WidgetListData }                                                                                                  from '@acx-ui/rc/utils'
import { noDataDisplay }                                                                                                   from '@acx-ui/utils'

import { Group } from '../Canvas'
import * as UI   from '../styledComponents'

import { WidgetProperty }                      from './Card'
import CustomizeWidgetDrawer, { timeRangeMap } from './CustomizeWidgetDrawer'
import { ItemTypes }                           from './GroupItem'


interface WidgetListProps {
  data: WidgetListData
  visible?: boolean
  setVisible?: (v: boolean) => void
  groups?: Group[]
  removeShadowCard?: ()=>void
  changeWidgetProperty?: (data: WidgetProperty)=> void
}

interface WidgetCategory {
  width: number
  height: number
  currentSizeIndex?: number
  sizes?: { width: number, height:number }[]
}

interface BarChartTooltip {
  y: string
  x: string
  value: string
  color: string
}

export const getChartConfig = (data: WidgetListData) => {
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
          height: 8
        },
        {
          width: 3,
          height: 12
        },
        {
          width: 4,
          height: 16
        }
      ]
    },
    line: {
      width: 2,
      height: 6,
      currentSizeIndex: 0,
      sizes: [
        {
          width: 2,
          height: 6
        },
        {
          width: 3,
          height: 7
        },
        {
          width: 4,
          height: 8
        }
      ]
    },
    bar: {
      width: 2,
      height: data?.chartOption?.source?.length > 30 ? 8 : 6,
      currentSizeIndex: 0,
      sizes: [
        {
          width: 2,
          height: data?.chartOption?.source?.length > 30 ? 8 : 6
        },
        {
          width: 3,
          height: 10
        },
        {
          width: 4,
          height: 12
        }
      ]
    },
    table: {
      width: 2,
      height: 6,
      currentSizeIndex: 0,
      sizes: [
        {
          width: 2,
          height: 6
        },
        {
          width: 3,
          height: 8
        },
        {
          width: 4,
          height: 10
        }
      ]
    }
  }
  return ChartConfig[data.chartType]
}

export const DraggableChart: React.FC<WidgetListProps> = ({ data, groups, removeShadowCard }) => {
  const { $t } = useIntl()
  const canDragtoCanvas = () => {
    if(groups) {
      let cardsCount = 0
      groups.forEach(g => {
        g.cards.forEach(() => cardsCount++)
      })
      if(cardsCount < 20) {
        return true
      } else {
        showToast({
          type: 'error',
          content: $t(
            { defaultMessage: 'The maximum number of widgets is 20' }
          )
        })
        return false
      }
    }
    return true
  }
  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.CARD,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    }),
    canDrag: () => canDragtoCanvas(),
    item: () => {
      const dragCard = {
        ...data,
        id: data.id + uuidv4(),
        type: ItemTypes.CARD,
        isShadow: true,
        ...(data.chartType? getChartConfig(data) : [])
      }
      return dragCard
    },
    end: (item, monitor) => {
      if (!monitor.didDrop() && removeShadowCard) {
        removeShadowCard()
      }
    }
  })

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

  const getChartHeight = () => {
    if(data.chartType === 'bar') {
      return data?.chartOption?.source?.length > 30 ? '500px' : '250px'
    }
    return '165px'
  }

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab'
      }}
    >
      <div style={{
        margin: '7px',
        marginLeft: '10px',
        height: getChartHeight(),
        width: data.chartType === 'pie' ? '200px' : '300px' }}>
        <WidgetChart data={data} />
      </div>
    </div>
  )
}

export const WidgetChart: React.FC<WidgetListProps> = (
  { data, visible, setVisible, changeWidgetProperty }) => {
  const { $t } = useIntl()
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const queryResults = useGetWidgetQuery({
    customHeaders: { timezone },
    params: {
      canvasId: data.canvasId,
      widgetId: data.widgetId
    }
  }, { skip: data.type !== 'card' })

  const labelFormatter = (params: CallbackDataParams) => {
    const unit = data?.unit ? 'bytesFormat' : 'countFormat'
    const usage = Array.isArray(params.data) ? params.data[params?.encode?.['x'][0]!] : params.data
    return '{data|' + formatter(unit)(usage) + '}'
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

  const tooltipFormatter = (callbackParams: TooltipComponentFormatterCallbackParams) => {
    const params = Array.isArray(callbackParams) ? callbackParams : [callbackParams]
    const unit = data?.unit ? 'bytesFormat' : 'countFormat'
    let maps = [] as BarChartTooltip[]
    if(Array.isArray(params)) {
      //@ts-ignore
      maps = params.map(p => {
        const yIndex = p?.encode?.y?.length ? p.encode.y[0] : 0
        const xIndex = p?.encode?.x?.length ? p.encode.x[0] : 1
        return {
          y: Array.isArray(p.data) ? p.data[yIndex] : '',
          x: Array.isArray(p.dimensionNames) ? p.dimensionNames[xIndex] : '',
          value: Array.isArray(p.data) ? p.data[xIndex] : '',
          color: p.color
        }})
    }

    return renderToString(
      <TooltipWrapper>
        <div>
          {
            maps.map((i, index) => <>
              {
                index === 0 && <b>{chartData?.axisType === 'time' ?
                  formatter(DateFormatEnum.DateTimeFormat)(i.y) : i.y as string}</b>
              }
              <br/>
              {
                i.color ? <UI.Badge
                  className='acx-chart-tooltip'
                  color={i.color as string}
                  text={i.x}
                />: i.x
              } : <b> {formatter(unit)(i.value) as string}</b>
            </>)
          }
        </div>
      </TooltipWrapper>
    )
  }


  const getChart = (
    type: string, width:number, height:number, chartData:WidgetListData, isCard: boolean) => {
    const heightDiff = isCard ? 20 : 5
    if(type === 'pie') {
      return <DonutChart
        style={{ width: width-5, height: height-heightDiff }}
        size={'medium'}
        data={chartData?.chartOption || []}
        animation={true}
        showTotal
      />
    } else if(type === 'line') {
      return <StackedAreaChart
        style={{ width: width-5, height: height-heightDiff }}
        data={chartData?.chartOption || []}
        xAxisType={chartData?.axisType}
      />
    } else if(type === 'bar') {
      if(!chartData?.chartOption?.source) {
        return <NoDataIcon hideText={true} />
      } else {
        return <BarChart
          style={{ width: width-30, height: height-heightDiff }}
          grid={{
            right: '10px',
            top: chartData?.multiseries ? '15%': '0'
          }}
          disableLegend={data.type !== 'card'}
          data={(chartData?.chartOption || []) as BarChartData}
          barWidth={chartData?.multiseries || chartData?.chartOption?.source?.length > 30
            ? 8 : undefined}
          labelFormatter={labelFormatter}
          labelRichStyle={richStyle()}
          yAxisType={chartData?.axisType}
          tooltipFormatter={tooltipFormatter}
          tooltip={{
            trigger: 'item'
          }}
        />
      }
    } else if(type === 'table') {
      const formatterType = {
        MILLISECONDS: formatter('longDurationFormat'),
        BYTES: formatter('bytesFormat')
      }
      return <Table
        style={{ width: width-30, height: '100%' }}
        columns={chartData?.chartOption?.columns?.filter(c => c.key !== 'index')
          .map(i => ({
            ...i,
            searchable: true,
            // @ts-ignore
            ...(i?.unit ? {
              render: (value) => {
                // @ts-ignore
                return value ? formatterType[i.unit](value) : noDataDisplay
              }
            } : [])
          })) || []}
        dataSource={chartData?.chartOption?.dataSource}
        type='compactWidget'
        rowKey='index' // API support 'index' column
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
  const isCard = data.type === 'card'
  const chartData = isCard ? queryResults.data : data
  const widgetTitle = chartData?.name && data?.updated
    ? { title: chartData?.name, icon: <span className='update-indicator' /> }
    : chartData?.name
  const widgetTimeRange = chartData?.timeRange
    ? $t(timeRangeMap[chartData.timeRange])
    : (chartData?.defaultTimeRange || '')
  return (
    <Loader states={[{ isLoading: queryResults.isLoading }]}>
      <UI.Widget
        key={data.id}
        title={isCard ? widgetTitle : ''}
        className={data.chartType === 'table' ? 'table' : ''}
      >
        {
          isCard && <div className='sub-title'>{widgetTimeRange}</div>
        }
        <AutoSizer>
          {({ height, width }) => <div className='chart'>{getChart(
            data.chartType, width, height, chartData as WidgetListData, isCard)}</div>}
        </AutoSizer>
      </UI.Widget>
      {
        (visible && setVisible && changeWidgetProperty) && <CustomizeWidgetDrawer
          visible={visible as boolean}
          setVisible={setVisible}
          widget={chartData as WidgetListData}
          canvasId={data.canvasId as string}
          changeWidgetProperty={changeWidgetProperty}
        />
      }
    </Loader>
  )
}

