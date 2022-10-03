import { sum }     from 'lodash'
import { useIntl } from 'react-intl'
import { Tooltip } from 'antd'

import { AnalyticsFilter, kpiConfig } from '@acx-ui/analytics/utils'
import { ProgressPill, Loader }       from '@acx-ui/components'
import { InformationOutlined }        from '@acx-ui/icons'
import { formatter }                  from '@acx-ui/utils'

import * as UI from '../styledComponents'

import {
  useKpiHistogramQuery,
  useKpiTimeseriesQuery,
  KPITimeseriesResponse,
  KPIHistogramResponse
} from './services'

type PillData = { success: number, total: number }

const transformTSResponse = ({ data }: KPITimeseriesResponse) : PillData => {
  const [success, total] = data.reduce(([success, total], datum) => (
    datum && datum.length && (datum[0] !== null && datum[1] !== null )
      ? [success + datum[0], total + datum[1]] : [success, total]
  ), [0, 0])
  return { success, total }
}

const tranformHistResponse = (
  { data, kpi }: KPIHistogramResponse & { kpi: string }
) : PillData => {
  const { histogram } = Object(kpiConfig[kpi as keyof typeof kpiConfig])
  const { splits, highlightAbove, isReverse, initialThreshold } = histogram
  const indexOfThreshold = splits.indexOf(initialThreshold)
  const total = sum(data)
  const highlightedData = highlightAbove || isReverse
    ? data.slice(indexOfThreshold + 1)
    : data.slice(0, indexOfThreshold + 1)
  const success = sum(highlightedData)
  return { success, total }
}
const formatPillText = (value: number = 0, suffix: string) => suffix
  ? `${formatter('percentFormatRound')(value / 100)} ${suffix}`
  : `${formatter('percentFormatRound')(value/ 100)}`

function HealthPill ({ filters, kpi }: { filters: AnalyticsFilter, kpi: string }) {
  const { histogram, pill, text } = Object(kpiConfig[kpi as keyof typeof kpiConfig])
  const { $t } = useIntl()
  let queryResults
  if (histogram) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    queryResults = useKpiHistogramQuery({ ...filters, kpi }, {
      selectFromResult: ({ data, ...rest }) => ({
        ...rest,
        data: data ? tranformHistResponse({ ...data!, kpi }) : { success: 0, total: 0 }
      })
    })
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    queryResults = useKpiTimeseriesQuery({ ...filters, kpi }, {
      selectFromResult: ({ data, ...rest }) => ({
        ...rest,
        data: data ? transformTSResponse(data!) : { success: 0, total: 0 }
      })
    })
  }
  const { success, total } = queryResults.data as PillData
  const percent = total > 0 ? (success / total) * 100 : 0
  const { pillSuffix, description, thresholdDesc, thresholdFormatter, tooltip } = pill
  const translatedDesc = description
    ? $t(description, { successCount: success, totalCount: total })
    : ''
  const translatedThresholdDesc = []
  if (thresholdDesc.length) {
    const { initialThreshold } = histogram
    translatedThresholdDesc.push($t(thresholdDesc[0]))
    translatedThresholdDesc.push(
      $t(
        thresholdDesc[1],
        {
          threshold: thresholdFormatter ? thresholdFormatter(initialThreshold) : initialThreshold
        }
      )
    )
  }
  return <Loader states={[queryResults]} key={kpi}>
    <UI.PillTitle>
      <span>{$t(text)}</span>
      <span>
        <Tooltip placement='top' title={tooltip}><InformationOutlined /></Tooltip>
      </span>
    </UI.PillTitle>
    <UI.PillWrap>
      <ProgressPill percent={percent} formatter={value => formatPillText(value, pillSuffix)}/>
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
