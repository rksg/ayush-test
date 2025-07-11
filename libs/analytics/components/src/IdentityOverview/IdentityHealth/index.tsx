import { useMemo } from 'react'

import { mean }    from 'lodash'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { Card, Loader, NoData, useDateRange, GridRow, GridCol, ProgressBarV2 } from '@acx-ui/components'
import { formatter }                                                           from '@acx-ui/formatter'

import { IdentityHealthData, useIdentityHealthQuery } from './services'
import { ProgressBarWrapper }                         from './styledComponents'

const percentFormat = (value: number | null) => {
  return formatter('percentFormat')(value)
}

const calcPercent = ([val, sum]:(number | null)[]) => {
  const percent = val !== null && sum ? val / sum : null
  return { percent, formatted: percentFormat(percent) }
}

const getIdentityHealthData = (identityHealthData: IdentityHealthData[] | undefined) => {
  const timeToConnect : number[] = []
  const clientThroughput : number[] = []

  if (identityHealthData !== undefined && identityHealthData !== null) {
    identityHealthData.forEach((row) => {
      const { timeToConnectSLA, clientThroughputSLA } = row
      const timeToConnectPercent = calcPercent(timeToConnectSLA)
      const clientThroughputPercent = calcPercent(clientThroughputSLA)

      timeToConnectPercent.percent !== null &&
        timeToConnect.push(timeToConnectPercent.percent)
      clientThroughputPercent.percent !== null &&
        clientThroughput.push(clientThroughputPercent.percent)
    })
  }

  return {
    timeToConnect: mean(timeToConnect),
    clientThroughput: mean(clientThroughput)
  }
}

export const IdentityHealth = () => {
  const { $t } = useIntl()
  const { timeRange, selectedRange } = useDateRange()

  const queryResults = useIdentityHealthQuery({
    startDate: timeRange[0].format(),
    endDate: timeRange[1].format(),
    range: selectedRange,
    filter: {}
  })

  const data = useMemo(() => getIdentityHealthData(queryResults?.data), [queryResults?.data])

  return (
    <Loader states={[queryResults]}>
      <Card title={$t({ defaultMessage: 'Identity Health' })}>
        {(data.clientThroughput || data.timeToConnect) ?
          <AutoSizer>
            {({ width, height }) => (
              <ProgressBarWrapper height={height} width={width}>
                <GridRow>
                  <GridCol col={{ span: 4 }}>
                    {$t({ defaultMessage: 'Time to Connect' })}
                  </GridCol>
                  <GridCol col={{ span: 16 }}>
                    <ProgressBarV2 percent={data.timeToConnect * 100 || 0 as number}/>
                  </GridCol>
                  <GridCol col={{ span: 4 }}>
                    {
                      data.timeToConnect ? percentFormat(data.timeToConnect) : '0%'
                    }
                  </GridCol>
                </GridRow>
                <GridRow>
                  <GridCol col={{ span: 4 }}>
                    {$t({ defaultMessage: 'Client Throughput' })}
                  </GridCol>
                  <GridCol col={{ span: 16 }}>
                    <ProgressBarV2 percent={data.clientThroughput * 100 || 0 as number}/>
                  </GridCol>
                  <GridCol col={{ span: 4 }}>
                    {
                      data.clientThroughput ? percentFormat(data.clientThroughput) : '0%'
                    }
                  </GridCol>
                </GridRow>
              </ProgressBarWrapper>
            )}
          </AutoSizer> : <NoData/>}
      </Card>
    </Loader>
  )
}
