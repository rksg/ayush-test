import { CallbackDataParams } from 'echarts/types/dist/shared'
import moment                 from 'moment'

import { cssNumber, cssStr }         from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import type { TimeStamp }            from '@acx-ui/types'
import { getIntl }                   from '@acx-ui/utils'

import { NodeStatusData } from './type'

import type {  TooltipComponentOption } from 'echarts'

const notAvailableColor = cssStr('--acx-neutrals-30')

export const tooltipOptions = () =>
  ({
    textStyle: {
      color: cssStr('--acx-primary-white'),
      fontFamily: cssStr('--acx-neutral-brand-font'),
      fontSize: cssNumber('--acx-body-5-font-size'),
      lineHeight: cssNumber('--acx-body-5-line-height'),
      fontWeight: cssNumber('--acx-body-font-weight')
    },
    backgroundColor: cssStr('--acx-primary-black'),
    borderRadius: 2,
    borderWidth: 0,
    padding: 8,
    confine: false,
    extraCssText: 'box-shadow: 0px 4px 8px rgba(51, 51, 51, 0.08); z-index: 6;'
  } as TooltipComponentOption)

export function defaultNodeStatusLabelFormatter (
  nodes: NodeStatusData[],
  params: CallbackDataParams
) {
  const { $t } = getIntl()
  const nodeStatuses: Record<string, string> = {}
  const currentTimestamp = params.value instanceof Array ? params.value[0] : params.value

  nodes.forEach(node => {
    let status = $t({ defaultMessage: 'Not Available' })

    for (const dataPoint of node.data) {
      const startTime = moment(dataPoint[0])
      const endTime = moment(dataPoint[2])

      if (moment(currentTimestamp as string).isBetween(startTime, endTime, null, '[]')) {
        status = dataPoint[3] === 1
          ? $t({ defaultMessage: 'Connected' })
          : $t({ defaultMessage: 'Disconnected' })
        break
      }
    }

    nodeStatuses[node.nodeName] = status
  })
  let formattedTooltip = formatter(DateFormatEnum.DateTimeFormat)(currentTimestamp) + '<br/>'

  Object.entries(nodeStatuses).forEach(([nodeName, status]) => {
    formattedTooltip += `${nodeName}: ${status}<br/>`
  })

  return formattedTooltip.trim()
}

// eslint-disable-next-line max-len
export const getChartData = (node: NodeStatusData, chartBoundary: [TimeStamp, TimeStamp]) => {
  const filledData: [TimeStamp, string, TimeStamp, number | null, string][] = []
  const [start, end] = chartBoundary
  const notAvailableData = null

  if (node.data.length === 0) {
    filledData.push([start, node.nodeId, end, null, notAvailableColor])
  } else {
    const firstItem = node.data[0]
    const lastItem = node.data[node.data.length - 1]
    const firstItemStartTime = firstItem[0]
    const firstItemEndTime = firstItem[2]
    const lastItemStartTime = lastItem[0]
    const lastItemEndTime = lastItem[2]

    // Check if the first item start time is later the boundary start time
    if (moment(firstItemStartTime as string).isAfter(moment(start))) {
      filledData.push([start, node.nodeId, firstItemStartTime, notAvailableData, notAvailableColor])
    }

    for (let i = 0; i < node.data.length - 1; i++) {
      const iData = node.data[i]
      const iDataStartTime = iData[0]
      const iDataEndTime = iData[2]
      const iNextData = node.data[i + 1]
      const iNextDataStartTime = iNextData[0]

      // Check if the first item start time is earlier than the boundary start time
      if (i === 0 && moment(firstItemStartTime as string).isBefore(moment(start))) {
        filledData.push([start, node.nodeId, firstItemEndTime, firstItem[3], firstItem[4]])
      } else {
        // eslint-disable-next-line max-len
        filledData.push([iDataStartTime, node.nodeId, iDataEndTime, iData[3], iData[4]])

        if (moment(iDataEndTime as string).isBefore(moment(iNextDataStartTime as string))) {
          // eslint-disable-next-line max-len
          filledData.push([iDataEndTime, node.nodeId, iNextDataStartTime, notAvailableData, notAvailableColor])
        }
      }
    }

    filledData.push([lastItemStartTime, node.nodeId, lastItemEndTime, lastItem[3], lastItem[4]])

    // Check if the last item end time is before the boundary end time
    if (moment(lastItemEndTime as string).isBefore(moment(end))) {
      // eslint-disable-next-line max-len
      filledData.push([lastItemEndTime, node.nodeId, end, notAvailableData, notAvailableColor])
    }
  }

  const usedData = filledData.map(item => [item[0], node.nodeId, item[2], item[3], item[4]])

  return usedData
}