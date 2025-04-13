import { useIntl } from 'react-intl'

import { Card, Loader, NoData, VerticalBarChart } from '@acx-ui/components'

import { IntentDetail } from '../../useIntentDetailsQuery'

import channelListJson                   from './mapping/channelList.json'
import { useApChannelDistributionQuery } from './services'

function ChannelDistributionChart (intent: IntentDetail) {
  const { $t } = useIntl()
  const queryResult = useApChannelDistributionQuery({
    root: intent.root,
    sliceId: intent.sliceId,
    code: intent.code
  })
  const apChannelDistribution = queryResult.data

  const channelData = apChannelDistribution?.map(({ channel, apCount }) => [channel, apCount])
  const channelLists = channelListJson.reduce((acc: Record<string, number[]>, curr) => {
    acc[curr.freq] = curr.channels
    return acc
  }, {})

  const channelMapping = {
    'c-crrm-channel24g-auto': channelLists['2.4'],
    'c-crrm-channel5g-auto': channelLists['5'],
    'c-crrm-channel6g-auto': channelLists['6']
  }

  const channelList = channelMapping[intent.code as keyof typeof channelMapping]

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

  const xName = $t({ defaultMessage: 'Channel' })
  const yName = $t({ defaultMessage: 'AP' })

  return (
    <Loader states={[queryResult]}>
      <Card title={$t({ defaultMessage: 'Channel Distribution' })}>
        {apChannelDistribution?.length ? <VerticalBarChart
          data={data}
          xAxisValues={channelList}
          xAxisName={xName}
          barWidth={20}
          showTooltipName={false}
          showNameAndValue={[xName, yName]}
          style={{ height: '200px' }}
        /> : <NoData />}
      </Card>
    </Loader>
  )
}

export default ChannelDistributionChart
