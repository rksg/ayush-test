import { scaleLinear } from 'd3-scale'
import { useIntl }     from 'react-intl'
import AutoSizer       from 'react-virtualized-auto-sizer'

import { Card, Loader, NoData, VerticalBarChart } from '@acx-ui/components'
import { formatter, txpowerMapping }              from '@acx-ui/formatter'

import { IntentDetail } from '../../useIntentDetailsQuery'

import { useApPowerDistributionQuery } from './services'
import * as UI                         from './styledComponents'

function PowerDistributionChart (intent: IntentDetail) {
  const { $t } = useIntl()

  const queryResult = useApPowerDistributionQuery({
    root: intent.root,
    sliceId: intent.sliceId,
    code: intent.code
  })
  const apPowerDistribution = queryResult.data

  const txPowerList = Object.values(txpowerMapping)
  const txPowerData = apPowerDistribution?.map(({ txPower, apCount }) => [
    txpowerMapping[txPower as keyof typeof txpowerMapping],
    apCount
  ])

  const data = {
    dimensions: ['txPower', 'apCount'],
    source: txPowerData!,
    seriesEncode: [
      {
        x: 'txPower',
        y: 'apCount'
      }
    ]
  }

  const xName = $t({ defaultMessage: 'Tx Power' })
  const yName = $t({ defaultMessage: 'AP' })

  const customTooltipText = (values: { xValue: string, yValue: number }) => {
    const { xValue, yValue } = values
    const count = formatter('countFormat')(yValue)
    const yLabel = $t(
      {
        defaultMessage: `{count, plural,
            one {{single}}
            other {{plural}}
          }`
      },
      {
        count: values.yValue,
        single: yName,
        plural: `${yName}s`
      }
    )

    return $t(
      { defaultMessage: '{xName} {xValue}: {count} {yLabel}' }, { xName, xValue, count, yLabel })
  }

  return (
    <Loader states={[queryResult]} style={{ minHeight: '254px' }}>
      <Card>
        <UI.Title>{$t({ defaultMessage: 'Power Transmission' })}</UI.Title>
        <AutoSizer>{({ width }) =>
          apPowerDistribution?.length ? <VerticalBarChart
            data={data}
            xAxisName={xName}
            barWidth={scaleLinear([300, 1000], [4, 20]).clamp(true)(width)}
            xAxisValues={txPowerList}
            showTooltipName={false}
            style={{ width, height: '200px' }}
            customTooltipText={customTooltipText}
          /> : <NoData />
        }</AutoSizer>
      </Card>
    </Loader>
  )
}

export default PowerDistributionChart
