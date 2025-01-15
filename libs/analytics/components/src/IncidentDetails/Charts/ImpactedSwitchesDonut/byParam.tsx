
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { overlapsRollup } from '@acx-ui/analytics/utils'
import {  Card, Loader,
  NoGranularityText,
  DonutChart,
  qualitativeColorSet
} from '@acx-ui/components'
import { intlFormats } from '@acx-ui/formatter'

import {
  CountByType,
  useImpactedSwitchesDetailQuery
} from './services'

import type { ChartProps } from '../types'

type DonutChartByParamProps = {
  incident: ChartProps['incident'],
  byParam: 'model' | 'firmware'
}

const paramMapping = {
  model: 'impactedModelCount',
  firmware: 'impactedFirmwareCount'
}

type DataKey = 'impactedModelCount' | 'impactedFirmwareCount'

export function ImpactedSwitchesByParamDonut ({ incident, byParam }: DonutChartByParamProps) {
  const { $t } = useIntl()
  const { id } = incident

  const druidRolledup = overlapsRollup(incident.endTime)

  const response = useImpactedSwitchesDetailQuery({ id },
    { skip: druidRolledup })
  const dataKey:DataKey = paramMapping[byParam] as DataKey
  const sortedData= response.data && Object.entries(response.data[dataKey])
    .sort((a,b)=>b[1]-a[1])

  const topDataKey = sortedData?.at(0)?.at(0) || ''

  const title=$t({ defaultMessage: 'Total Impacted Switch {byParam}{plural}' },
    { byParam, plural: sortedData?.length ? 's' : '' })
  const subtitle = $t({
    defaultMessage: 'Top imapacted {byParam} is {value}' },
  { byParam, value: topDataKey })

  const transformData = (data:{ impactedModelCount:CountByType,
    impactedFirmwareCount:CountByType })=>{
    const colors = qualitativeColorSet()
    return Object.entries(data[dataKey]).sort((a,b)=>b[1]-a[1]).map(([key,value],index)=>{
      return {
        value: value,
        name: key,
        color: colors[index]
      }
    })
  }

  return <Loader states={[response]}>
    <Card title={$t({ defaultMessage: 'Impacted Switch {byParam}{plural}' },
      { byParam, plural: sortedData?.length ? 's' : '' })}
    type='no-border'>
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

