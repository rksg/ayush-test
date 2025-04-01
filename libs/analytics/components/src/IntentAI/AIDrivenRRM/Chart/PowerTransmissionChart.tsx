import { useIntl } from 'react-intl'

import { Card, NoData, VerticalBarChart } from '@acx-ui/components'
import { txpowerMapping }                 from '@acx-ui/formatter'

import { IntentDetail } from '../../useIntentDetailsQuery'

function PowerTransmissionChart (intent: IntentDetail) {
  const { $t } = useIntl()
  const { apPowerTransmission } = intent

  const txPowerMapping = Object.values(txpowerMapping).map(value => value.replace(/dB/g, ' dB'))

  const sortedData = apPowerTransmission?.map(({ txPower, apCount }) => [txPower, apCount])

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
        xAxisValues={txPowerMapping}
      /> : <NoData />}
    </Card>
  )
}

export default PowerTransmissionChart
