import { useIntl } from 'react-intl'

import { Card, NoData, VerticalBarChart } from '@acx-ui/components'

import { IntentDetail } from '../../useIntentDetailsQuery'

function ChannelDistributionChart (intent: IntentDetail) {
  const { $t } = useIntl()
  const { apChannelDistributions } = intent

  const sortedData = apChannelDistributions?.map(
    ({ channel, apCount }) => [channel, apCount]).sort((a, b) => a[0] - b[0])

  const data = {
    dimensions: ['channel', 'apCount'],
    source: sortedData,
    seriesEncode: [
      {
        x: 'channel',
        y: 'apCount'
      }
    ]
  }

  return (
    <Card title={$t({ defaultMessage: 'Channel Distribution' })}>
      {apChannelDistributions.length ? <VerticalBarChart
        data={data}
        xAxisName={`(${$t({ defaultMessage: 'Channel' })})`}
        barWidth={20}
        showTooltipName={false}
      /> : <NoData />}
    </Card>
  )
}

export default ChannelDistributionChart
