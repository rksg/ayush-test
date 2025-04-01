import { useIntl } from 'react-intl'

import { Card, NoData, VerticalBarChart } from '@acx-ui/components'

import { IntentDetail } from '../../useIntentDetailsQuery'

import { allChannels } from './utils'

function ChannelDistributionChart (intent: IntentDetail) {
  const { $t } = useIntl()
  const { apChannelDistributions } = intent

  const channelData = apChannelDistributions?.map(({ channel, apCount }) => [channel, apCount])

  const channelList = allChannels[intent.code as keyof typeof allChannels]

  const data = {
    dimensions: ['channel', 'apCount'],
    source: channelData,
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
        xAxisValues={channelList}
        xAxisName={$t({ defaultMessage: 'Channel' })}
        barWidth={20}
        showTooltipName={false}
      /> : <NoData />}
    </Card>
  )
}

export default ChannelDistributionChart
