
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { overlapsRollup } from '@acx-ui/analytics/utils'
import {  Card, Loader,
  NoGranularityText, cssStr,
  DonutChart
} from '@acx-ui/components'
import { intlFormats } from '@acx-ui/formatter'

import {
  useImpactedSwitchesAndTotalSwitchCountQuery
} from './services'

import type { ChartProps } from '../types'

export function ImpactedSwitchesDonut ({ incident }: ChartProps) {
  const { $t } = useIntl()
  const { id } = incident

  const druidRolledup = overlapsRollup(incident.endTime)

  const response = useImpactedSwitchesAndTotalSwitchCountQuery({ id },
    { skip: druidRolledup })

  const impactedSwitchCount = response.data?.impactedCount ?? 0
  const totalSwitchCount = response.data?.totalCount ?? 0

  const title=$t({ defaultMessage: 'Total Switch{plural}' },
    { plural: totalSwitchCount > 1 ? 'es' : '' })
  const subtitle = $t({
    defaultMessage: 'This incident impacted {impactedSwitchCount} switch{plural}' },
  { impactedSwitchCount, plural: impactedSwitchCount > 1 ? 'es' : '' })

  const impactedCountText = $t({
    defaultMessage: 'Impacted Switch{plural}' },
  { impactedSwitchCount, plural: impactedSwitchCount > 1 ? 'es' : '' })

  const nonImpactedCountText = $t({
    defaultMessage: 'Non-impacted Switch{plural}' },
  { impactedSwitchCount, plural: (totalSwitchCount - impactedSwitchCount) > 1 ? 'es' : '' })

  const transformData = (data:{ impactedCount:number,totalCount:number })=>{
    return [
      { value: data.impactedCount,
        name: impactedCountText,
        color: cssStr('--acx-semantics-red-50') },
      { value: (data.totalCount - data.impactedCount),
        name: nonImpactedCountText,
        color: cssStr('--acx-semantics-green-50') }
    ]
  }

  return <Loader states={[response]}>
    <Card title={$t({ defaultMessage: 'Switch Distribution' })} type='no-border'>
      {druidRolledup
        ? <NoGranularityText />
        : <AutoSizer>
          {({ height, width }) => (
            <DonutChart
              style={{ width, height }}
              showLegend={false}
              title={title}
              subTitle={subtitle}
              legend='name-value'
              dataFormatter={(v) => $t(intlFormats.countFormat, { value: v as number })}
              data={transformData(response.data!)}/>
          )}
        </AutoSizer>
      }
    </Card>
  </Loader>
}

