import { scaleLinear } from 'd3-scale'
import { useIntl }     from 'react-intl'
import AutoSizer       from 'react-virtualized-auto-sizer'

import { Card, Loader, NoData, VerticalBarChart } from '@acx-ui/components'
import { formatter }                              from '@acx-ui/formatter'

import { IntentDetail } from '../../useIntentDetailsQuery'

import channelListJson                   from './mapping/channelList.json'
import { useApChannelDistributionQuery } from './services'
import * as UI                           from './styledComponents'

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
      { defaultMessage: 'Channel {xValue}: {count} {yLabel}' },
      { xValue: <b>{xValue}</b>, count: <b>{count}</b>, yLabel })
  }

  return (
    <Loader states={[queryResult]} style={{ minHeight: '254px' }}>
      <Card>
        <UI.Title>{$t({ defaultMessage: 'Channel Distribution' })}</UI.Title>
        <AutoSizer>{({ width }) =>
          apChannelDistribution?.length ? <VerticalBarChart
            data={data}
            xAxisValues={channelList}
            xAxisName={xName}
            barWidth={scaleLinear([300, 1000], [4, 20]).clamp(true)(width)}
            showTooltipName={false}
            style={{ width, height: '200px' }}
            customTooltipText={customTooltipText}
          /> : <NoData />
        }</AutoSizer>
      </Card>
    </Loader>
  )
}

export default ChannelDistributionChart
