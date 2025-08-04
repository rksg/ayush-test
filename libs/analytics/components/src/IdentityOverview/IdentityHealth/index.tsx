import { useCallback, useMemo } from 'react'

import { mean }    from 'lodash'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { Card, Loader, NoData, useDateRange, GridRow, GridCol, ProgressBarV2 } from '@acx-ui/components'
import { formatter }                                                           from '@acx-ui/formatter'
import { useParams }                                                           from '@acx-ui/react-router-dom'

import { IdentityHealthData, useIdentityHealthQuery } from './services'
import { ProgressBarWrapper }                         from './styledComponents'

const percentFormat = (value: number | null) => {
  return formatter('percentFormat')(value)
}

const calcPercent = ([val, sum]:(number | null)[]) => {
  const percent = val !== null && sum ? val / sum : null
  return percent
}

interface ProgressBarData {
  title: string,
  value: number,
  formattedValue: string
}

const hasData = (progressBarData: ProgressBarData[]) => {
  return progressBarData[0].value || progressBarData[1].value
}

export const IdentityHealth = () => {
  const { $t } = useIntl()
  const { timeRange, selectedRange } = useDateRange()
  const { personaId: identityId, personaGroupId: identityGroupId } = useParams()

  const getProgressBarData = useCallback((
    identityHealthData: IdentityHealthData[] | undefined
  ): ProgressBarData[] => {

    const timeToConnect : number[] = []
    const clientThroughput : number[] = []

    if (identityHealthData !== undefined && identityHealthData !== null) {
      identityHealthData.forEach((row) => {
        const { timeToConnectSLA, clientThroughputSLA } = row
        const timeToConnectPercent = calcPercent(timeToConnectSLA)
        const clientThroughputPercent = calcPercent(clientThroughputSLA)

        timeToConnectPercent !== null && timeToConnect.push(timeToConnectPercent)
        clientThroughputPercent !== null && clientThroughput.push(clientThroughputPercent)
      })
    }

    const averageTimeToConnectPercent: number = mean(timeToConnect)
    const averageClientThroughputPercent: number = mean(clientThroughput)

    const progressBarData: ProgressBarData[] = [
      {
        title: $t({ defaultMessage: 'Time to Connect' }),
        value: averageTimeToConnectPercent * 100,
        formattedValue: averageTimeToConnectPercent ?
          percentFormat(averageTimeToConnectPercent) : '0%'
      },
      {
        title: $t({ defaultMessage: 'Client Throughput' }),
        value: averageClientThroughputPercent * 100,
        formattedValue: averageClientThroughputPercent ?
          percentFormat(averageClientThroughputPercent) : '0%'
      }
    ]

    return progressBarData
  }, [$t])

  const queryResults = useIdentityHealthQuery({
    startDate: timeRange[0].format(),
    endDate: timeRange[1].format(),
    range: selectedRange,
    filter: {},
    identityFilter: { identityId, identityGroupId }
  })

  const progressBarData = useMemo(() => {
    return getProgressBarData(queryResults?.data)
  }, [getProgressBarData, queryResults?.data])

  return (
    <Loader states={[queryResults]}>
      <Card title={$t({ defaultMessage: 'Identity Health' })}>
        { hasData(progressBarData) ? <AutoSizer>
          {({ width, height }) => (
            <ProgressBarWrapper height={height} width={width}>
              {
                progressBarData.map((data) => {
                  return (
                    <GridRow key={data.title}>
                      <GridCol col={{ span: 4 }}>
                        { data.title }
                      </GridCol>
                      <GridCol col={{ span: 16 }}>
                        <ProgressBarV2 percent={data.value || 0 as number}/>
                      </GridCol>
                      <GridCol col={{ span: 4 }}>
                        { data.formattedValue || '0%' }
                      </GridCol>
                    </GridRow>
                  )
                })
              }
            </ProgressBarWrapper>
          )}
        </AutoSizer> : <NoData/>
        }
      </Card>
    </Loader>
  )
}
