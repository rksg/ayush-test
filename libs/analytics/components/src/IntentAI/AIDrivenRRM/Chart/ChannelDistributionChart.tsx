import { useIntl } from 'react-intl'

import { Card, Loader, NoData, VerticalBarChart } from '@acx-ui/components'

import { IntentDetail } from '../../useIntentDetailsQuery'

import { useApChannelDistributionQuery } from './services'
import { allChannels }                   from './utils'

function ChannelDistributionChart (intent: IntentDetail) {
  const { $t } = useIntl()
  const queryResult = useApChannelDistributionQuery({
    root: intent.root,
    sliceId: intent.sliceId,
    code: intent.code
  })
  const apChannelDistribution = queryResult.data

  const channelData = apChannelDistribution?.map(({ channel, apCount }) => [channel, apCount])
  const channelList = allChannels[intent.code as keyof typeof allChannels]

  const data = {
    dimensions: ['channel', 'apCount'],
    source: channelData!,
    seriesEncode: [
      {
        x: 'channel',
        y: 'apCount'
      }
    ]
  }

  return (
    <Loader states={[queryResult]}>
      <Card title={$t({ defaultMessage: 'Channel Distribution' })}>
        {apChannelDistribution?.length ? <VerticalBarChart
          data={data}
          xAxisValues={channelList}
          xAxisName={$t({ defaultMessage: 'Channel' })}
          barWidth={20}
          showTooltipName={false}
        /> : <NoData />}
      </Card>
    </Loader>

  )
}

export default ChannelDistributionChart
