import { useIntl } from 'react-intl'

import { Card, NoData, VerticalBarChart } from '@acx-ui/components'

import { IntentDetail } from '../../useIntentDetailsQuery'

function PowerTransmissionChart (intent: IntentDetail) {
  const { $t } = useIntl()
  const { apPowerTransmission } = intent

  const sortedData = apPowerTransmission?.map(
    ({ txPower, apCount }) => [txPower, apCount]).sort((a, b) => a[0] - b[0])

  const data = {
    dimensions: ['txPower', 'apCount'],
    source: sortedData,
    seriesEncode: [
      {
        x: 'txPower',
        y: 'apCount'
      }
    ]
  }

  return (
    <Card title={$t({ defaultMessage: 'Power Transmission' })}>
      {apPowerTransmission.length ? <VerticalBarChart
        data={data}
        xAxisName={$t({ defaultMessage: 'Tx Power' })}
        barWidth={20}
        showTooltipName={false}
      /> : <NoData />}
    </Card>
  )
}

export default PowerTransmissionChart
