import React, { useEffect } from 'react'

import { TooltipComponentFormatterCallbackParams } from 'echarts'
import { CallbackDataParams }                      from 'echarts/types/dist/shared'
import { useDrag }                                 from 'react-dnd'
import { getEmptyImage }                           from 'react-dnd-html5-backend'
import { renderToString }                          from 'react-dom/server'
import { useIntl }                                 from 'react-intl'
import AutoSizer                                   from 'react-virtualized-auto-sizer'
import { v4 as uuidv4 }                            from 'uuid'

import { BarChartData }                                                                                        from '@acx-ui/analytics/utils'
import { BarChart, cssNumber, cssStr, DonutChart, Loader, showToast, StackedAreaChart, Table, TooltipWrapper } from '@acx-ui/components'
import { DateFormatEnum, formatter }                                                                           from '@acx-ui/formatter'
import { useGetWidgetQuery }                                                                                   from '@acx-ui/rc/services'
import { WidgetListData }                                                                                      from '@acx-ui/rc/utils'
import { noDataDisplay }                                                                                       from '@acx-ui/utils'

import { Group } from '../Canvas'
import * as UI   from '../styledComponents'

import CustomizeWidgetDrawer from './CustomizeWidgetDrawer'
import { ItemTypes }         from './GroupItem'


interface WidgetListProps {
  data: WidgetListData
  visible?: boolean
  setVisible?: (v: boolean) => void
  groups?: Group[]
  removeShadowCard?: ()=>void
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
          width: 4,
          height: 12
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

export const WidgetChart: React.FC<WidgetListProps> = ({ data, visible, setVisible }) => {
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

  const tooltipFormatter = (params: TooltipComponentFormatterCallbackParams) => {
    const yIndex = Array.isArray(params) && params[0]?.encode?.y?.length ?
      params[0]?.encode?.y[0] : 0
    const xIndex = Array.isArray(params) && params[0]?.encode?.x?.length ?
      params[0]?.encode?.x[0] : 1
    const y = Array.isArray(params) && Array.isArray(params[0].data) ?
      params[0].data[yIndex] : ''
    const x = Array.isArray(params) && Array.isArray(params[0].dimensionNames) ?
      params[0].dimensionNames[xIndex] : ''
    const value = Array.isArray(params) && Array.isArray(params[0].data) ?
      params[0].data[xIndex] : ''
    const color = Array.isArray(params) ? params[0].color : ''
    const unit = data?.unit ? 'bytesFormat' : 'countFormat'
    let maps = [] as BarChartTooltip[]
    if(Array.isArray(params)) {
      //@ts-ignore
      maps =params.map(p => {
        const yIndex = p?.encode?.y?.length ? p.encode.y[0] : 0
        const xIndex = p?.encode?.x?.length ? p.encode.x[0] : 1
        return {
          y: Array.isArray(p.data) ? p.data[yIndex] : '',
          x: Array.isArray(p.dimensionNames) ? p.dimensionNames[xIndex] : '',
          value: Array.isArray(p.data) ? p.data[xIndex] : '',
          color: p.color
        }})
    }

    return Array.isArray(params) ? renderToString(
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
    ) : renderToString(
      <TooltipWrapper>
        <div>
          <b>{chartData?.axisType === 'time' ?
            formatter(DateFormatEnum.DateTimeFormat)(y) : y as string}</b>
          <p>
            {
              color ? <UI.Badge
                className='acx-chart-tooltip'
                color={color as string}
                text={x}
              />: x
            } : <b> {formatter(unit)(value) as string}</b>
          </p>
        </div>
      </TooltipWrapper>
    )
  }


  const getChart = (type: string, width:number, height:number, chartData:WidgetListData) => {
    if(type === 'pie') {
      return <DonutChart
        style={{ width: width-5, height: height-5 }}
        size={'medium'}
        data={chartData?.chartOption || []}
        animation={true}
        showTotal
      />
    } else if(type === 'line') {
      return <StackedAreaChart
        style={{ width: width-5, height: height-5 }}
        data={chartData?.chartOption || []}
        xAxisType={chartData?.axisType}
      />
    } else if(type === 'bar') {
      return <BarChart
        style={{ width: width-30, height: height-5 }}
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
      />
    } else if(type === 'table') {
      const formatterType = {
        MILLISECONDS: formatter('longDurationFormat'),
        BYTES: formatter('bytesFormat')
      }
      return <Table
        style={{ width: width-30, height: height-5 }}
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
  const chartData = data.type === 'card' ? queryResults.data : data
  return (
    <Loader states={[{ isLoading: queryResults.isLoading }]}>
      <UI.Widget
        key={data.id}
        title={data.type === 'card' ? chartData?.name : ''}
        className={data.chartType === 'table' ? 'table' : ''}
      >
        <AutoSizer>
          {({ height, width }) => <div className='chart'>{getChart(
            data.chartType, width, height, chartData as WidgetListData)}</div>}
        </AutoSizer>
      </UI.Widget>
      {
        (visible && setVisible) && <CustomizeWidgetDrawer
          visible={visible as boolean}
          setVisible={setVisible}
          widget={chartData as WidgetListData}
          canvasId={data.canvasId as string}
        />
      }
    </Loader>
  )
}

