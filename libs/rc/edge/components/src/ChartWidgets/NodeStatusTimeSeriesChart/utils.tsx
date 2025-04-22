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

export const getChartData = (node: NodeStatusData, chartBoundary: [TimeStamp, TimeStamp]) => {
  const filledData: [TimeStamp, string, TimeStamp, number | null, string][] = []
  const [start, end] = chartBoundary

  if (node.data.length === 0) {
    filledData.push([start, node.nodeId, end, null, notAvailableColor])
  } else {
    const firstItem = node.data[0]
    const lastItem = node.data[node.data.length - 1]
    const firstItemStartTime = lastItem[0]
    const lastItemEndTime = lastItem[2]

    // Check if the first item start time is later the boundary start time
    if (moment(firstItemStartTime as string).isAfter(moment(start))) {
      filledData.push([start, node.nodeId, firstItem[0], null, notAvailableColor])
    }

    for (let i = 0; i < node.data.length - 1; i++) {
      filledData.push(node.data[i])

      if (moment(node.data[i][2] as string).isBefore(moment(node.data[i+1][0] as string))) {
        filledData.push([node.data[i][2], node.nodeId, node.data[i+1][0], null, notAvailableColor])
      }
    }

    filledData.push(lastItem)

    // Check if the last item end time is before the boundary end time
    if (moment(lastItemEndTime as string).isBefore(moment(end))) {
      // eslint-disable-next-line max-len
      filledData.push([lastItemEndTime, node.nodeId, end, null, notAvailableColor])
    }
  }

  const usedData = filledData.map(item => [item[0], node.nodeId, item[2], item[3], item[4]])

  return usedData
}