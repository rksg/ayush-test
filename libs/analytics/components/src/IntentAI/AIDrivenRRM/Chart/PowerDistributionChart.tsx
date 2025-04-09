import { useIntl } from 'react-intl'

import { Card, Loader, NoData, VerticalBarChart } from '@acx-ui/components'
import { txpowerMapping }                         from '@acx-ui/formatter'

import { IntentDetail } from '../../useIntentDetailsQuery'

import { useApPowerDistributionQuery } from './services'

function PowerDistributionChart (intent: IntentDetail) {
  const { $t } = useIntl()

  const queryResult = useApPowerDistributionQuery({
    root: intent.root,
    sliceId: intent.sliceId,
    code: intent.code
  })
  const apPowerDistribution = queryResult.data

  const txPowerList = Object.values(txpowerMapping).map(value => value.replace(/dB/g, 'dB'))
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

  return (
    <Loader states={[queryResult]}>
      <Card title={$t({ defaultMessage: 'Power Transmission' })}>
        {apPowerDistribution?.length ? <VerticalBarChart
          data={data}
          xAxisName={$t({ defaultMessage: 'Tx Power' })}
          barWidth={20}
          showTooltipName={false}
          xAxisValues={txPowerList}
        /> : <NoData />}
      </Card>
    </Loader>
  )
}

export default PowerDistributionChart
