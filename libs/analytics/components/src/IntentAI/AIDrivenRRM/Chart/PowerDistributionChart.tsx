import { scaleLinear } from 'd3-scale'
import { useIntl }     from 'react-intl'
import AutoSizer       from 'react-virtualized-auto-sizer'

import { Card, Loader, NoData, VerticalBarChart } from '@acx-ui/components'
import { txpowerMapping }                         from '@acx-ui/formatter'

import { IntentDetail } from '../../useIntentDetailsQuery'

import { useApPowerDistributionQuery } from './services'
import * as UI                         from './styledComponents'

function PowerDistributionChart (intent: IntentDetail) {
  const { $t } = useIntl()
  const intl = useIntl()

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

  const customTooltipText = (values: { xValue: string, yValue: number }) => {
    const { xValue, yValue } = values

    return intl.formatMessage(
      {
        defaultMessage:
          'Tx Power <b>{xValue}</b>: <b>{yValue}</b> {yValue, plural, one {AP} other {APs}}'
      },
      {
        xValue,
        yValue,
        b: (chunks: React.ReactNode) => <b>{chunks}</b>
      }
    )
  }

  return (<AutoSizer disableHeight>{({ width }) =>
    <Loader states={[queryResult]} style={{ width, minHeight: '248px' }}>
      <Card>
        <UI.Title>{$t({ defaultMessage: 'Power Transmission' })}</UI.Title>
        {apPowerDistribution?.length ? <VerticalBarChart
          data={data}
          xAxisName={xName}
          barWidth={scaleLinear([300, 1000], [4, 20]).clamp(true)(width)}
          xAxisValues={txPowerList}
          showTooltipName={false}
          style={{ height: '200px' }}
          customTooltipText={customTooltipText}
        /> : <NoData />}
      </Card>
    </Loader>
  }</AutoSizer>)
}

export default PowerDistributionChart
