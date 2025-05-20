import { sum }     from 'lodash'
import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import {
  healthApi,
  KPITimeseriesResponse,
  KPIHistogramResponse
} from '@acx-ui/analytics/services'
import { kpiConfig, productNames }       from '@acx-ui/analytics/utils'
import { Tooltip, ProgressPill, Loader } from '@acx-ui/components'
import { formatter, FormatterType }      from '@acx-ui/formatter'
import { InformationOutlined }           from '@acx-ui/icons'
import { TimeStampRange }                from '@acx-ui/types'
import type { AnalyticsFilter }          from '@acx-ui/utils'

import GenericError from '../../GenericError'
import * as UI      from '../styledComponents'


export type PillData = { success: number, total: number, length?: number, maxCount?: number }

export const transformTSResponse = (
  { data, time }: KPITimeseriesResponse,
  window: { startDate: string, endDate: string }
) : PillData => {
  const filteredData = data
    .filter((_, index) =>
      moment(time[index]).isBetween(
        moment(window.startDate), moment(window.endDate), undefined, '[]'
      )
    )
  const [success, total, length, maxCount] = filteredData
    .reduce(([success, total,length,maxCount], datum) => (
      datum && datum.length && (datum[0] !== null && datum[1] !== null )
        ? [success + datum[0], total + datum[1], length + 1, Math.max(maxCount,datum[1])]
        : [success, total, length, maxCount]
    ), [0, 0, 0, 0])

  return { success, total, length, maxCount }
}

export const tranformHistResponse = (
  { data, kpi, threshold }: KPIHistogramResponse & { kpi: string, threshold : number }
) : PillData => {
  const { histogram } = Object(kpiConfig[kpi as keyof typeof kpiConfig])
  const { splits, highlightAbove, isReverse } = histogram
  const indexOfThreshold = splits.indexOf(threshold)
  const total = sum(data)
  const highlightedData = highlightAbove || isReverse
    ? data.slice(indexOfThreshold + 1)
    : data.slice(0, indexOfThreshold + 1)
  const success = sum(highlightedData)
  return { success, total }
}

const formatPillText = (
  value: number = 0, suffix: string, valueFormatter: FormatterType = 'percentFormatRound'
) => suffix
  ? `${formatter(valueFormatter)(value / 100)} ${suffix}`
  : `${formatter(valueFormatter)(value / 100)}`

type PillQueryProps = {
  kpi: string
  filters: AnalyticsFilter
  timeWindow: {
    startDate: string
    endDate: string
  }
  threshold: number
  apCount?: number
  skip?: boolean
}

export const usePillQuery = ({
  kpi, filters, timeWindow, threshold, skip = false
}: PillQueryProps) => {
  const { histogram, enableSwitchFirmwareFilter } = Object(kpiConfig[kpi as keyof typeof kpiConfig])
  const histogramQuery = healthApi.useKpiHistogramQuery({ ...filters, ...timeWindow,
    kpi, enableSwitchFirmwareFilter }, {
    skip: skip || !Boolean(histogram),
    selectFromResult: ({ data, ...rest }) => ({
      ...rest,
      data: data ? tranformHistResponse({ ...data!, kpi, threshold }) : { success: 0, total: 0 }
    })
  })
  const timeseriesQuery = healthApi.useKpiTimeseriesQuery({ ...filters,
    kpi, enableSwitchFirmwareFilter }, {
    skip: skip || Boolean(histogram),
    selectFromResult: ({ data, ...rest }) => ({
      ...rest,
      data: data ? transformTSResponse(data!, timeWindow) : { success: 0, total: 0 }
    })
  })
  const queryResults = histogram ? histogramQuery : timeseriesQuery

  const { success, total, length, maxCount } = queryResults.data as PillData
  const percent = total > 0 ? (success / total) : 0

  return { queryResults, percent, length, maxCount }
}

function HealthPill ({ filters, kpi, timeWindow, threshold, isShowNoData }: {
  filters: AnalyticsFilter, kpi: string, timeWindow: TimeStampRange, threshold: number,
  isShowNoData?: boolean
}) {
  const { $t } = useIntl()

  const { pill, text } = Object(kpiConfig[kpi as keyof typeof kpiConfig])
  const [ startDate, endDate ] = timeWindow as [string, string]

  const { queryResults, percent } = usePillQuery({
    kpi, filters, timeWindow: { startDate, endDate }, threshold,
    skip: isShowNoData
  })
  let { success, total, length, maxCount } = queryResults.data as PillData
  // We need this check in case if wrong data is reported by an ICX.
  if ( success > total) success = total

  const {
    pillSuffix,
    description,
    thresholdDesc,
    thresholdFormatter,
    tooltip,
    valueFormatter
  } = pill
  const countFormat = formatter('countFormat')
  const translatedDesc = description
    ? $t(description, { successCount: countFormat(success), totalCount: countFormat(total),
      avgSuccessCount: countFormat(Math.ceil(success/(length || 1))),
      avgTotalCount: countFormat(Math.ceil(total/(length || 1))),
      maxCount })
    : ''
  const translatedThresholdDesc = []
  if (thresholdDesc.length) {
    translatedThresholdDesc.push($t(thresholdDesc[0]))
    translatedThresholdDesc.push(
      $t(
        thresholdDesc[1],
        {
          threshold: thresholdFormatter ? thresholdFormatter(threshold) : threshold
        }
      )
    )
  }
  return <Loader states={[queryResults]} key={kpi} errorFallback={<GenericError />}>
    <UI.PillTitle>
      <span>{$t(text, productNames)}</span>
      <span>
        <Tooltip placement='top' title={$t(tooltip, { ...productNames, br: '\n' })}>
          <InformationOutlined />
        </Tooltip>
      </span>
    </UI.PillTitle>
    <UI.PillWrap>
      <ProgressPill
        percent={percent * 100}
        formatter={value => formatPillText(value, pillSuffix && $t(pillSuffix), valueFormatter)}
      />
    </UI.PillWrap>
    <UI.PillDesc>{translatedDesc}</UI.PillDesc>
    {translatedThresholdDesc.length > 0 &&
      <UI.PillThresholdDesc>
        {translatedThresholdDesc[0]} &nbsp;
        <UI.PillThresholdVal>{translatedThresholdDesc[1]}</UI.PillThresholdVal>
      </UI.PillThresholdDesc>
    }
  </Loader>
}
export default HealthPill
