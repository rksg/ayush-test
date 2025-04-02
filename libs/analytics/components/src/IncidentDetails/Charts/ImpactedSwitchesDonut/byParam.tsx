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
  useImpactedSwitchesDetailQuery
} from './services'

import type { ChartProps } from '../types'

export type DonutChartByParamProps = {
  incident: ChartProps['incident'],
  param: 'model' | 'firmware'
}

const paramMapping = {
  model: 'impactedModelCount',
  firmware: 'impactedFirmwareCount'
}

type DataKey = 'impactedModelCount' | 'impactedFirmwareCount'

export function ImpactedSwitchesByParamDonut ({ incident, param }: DonutChartByParamProps) {
  const { $t } = useIntl()
  const { id } = incident

  const druidRolledup = overlapsRollup(incident.endTime)

  const response = useImpactedSwitchesDetailQuery({ id },
    { skip: druidRolledup })
  const dataKey:DataKey = paramMapping[param] as DataKey
  const sortedData= response.data && Object.entries(response.data[dataKey])
    .sort((a,b)=>b[1]-a[1])

  const topDataKey = sortedData?.at(0)?.at(0) || ''

  const title=$t({ defaultMessage: 'Switch {param}{plural}' },
    { param: param.charAt(0).toUpperCase() + param.slice(1),
      plural: sortedData?.length ? 's' : '' })
  const subtitle = $t({
    defaultMessage: 'Top impacted {param} is {value}' },
  { param, value: topDataKey })

  const transformData = (sortedData:[string,number][])=>{
    const colors = qualitativeColorSet()
    return sortedData.map(([key,value],index)=>{
      return {
        value: value,
        name: key,
        color: colors[index]
      }
    })
  }

  return <Loader states={[response]}>
    <Card title={$t({ defaultMessage: 'Impacted Switch {param}{plural}' },
      { param: param.charAt(0).toUpperCase() + param.slice(1),
        plural: sortedData?.length ? 's' : '' })}
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
              value={`${sortedData?.length || 0}`}
              legend='name-value'
              dataFormatter={(v) => $t(intlFormats.countFormat, { value: v as number })}
              data={transformData(sortedData!)}/>
          )}
        </AutoSizer>
      }
    </Card>
  </Loader>
}

