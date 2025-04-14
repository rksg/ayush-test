import { useIntl } from 'react-intl'

import { Card, Loader, NoData, VerticalBarChart } from '@acx-ui/components'
import { txpowerMapping }                         from '@acx-ui/formatter'

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

  return (
    <Loader states={[queryResult]}>
      <Card>
        <UI.Title>{$t({ defaultMessage: 'Power Transmission' })}</UI.Title>
        {apPowerDistribution?.length ? <VerticalBarChart
          data={data}
          xAxisName={$t({ defaultMessage: 'Tx Power' })}
          barWidth={20}
          xAxisValues={txPowerList}
          showTooltipName={false}
          showNameAndValue={[xName, yName]}
          style={{ height: '200px' }}
        /> : <NoData />}
      </Card>
    </Loader>
  )
}

export default PowerDistributionChart
