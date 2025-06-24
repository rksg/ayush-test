import { defineMessage, FormattedMessage, useIntl } from 'react-intl'
import AutoSizer                                    from 'react-virtualized-auto-sizer'

import {
  HistoricalCard,
  Loader,
  NoData,
  DonutChart,
  ContentSwitcher,
  ContentSwitcherProps,
  GridRow,
  GridCol
} from '@acx-ui/components'
import type { DonutChartData } from '@acx-ui/components'
import { intlFormats }         from '@acx-ui/formatter'

import { DistributionMatrix, Mdu360TabProps } from '../../types'

import { ApDistribution, useWifiGenerationQuery } from './services'

interface WiFiGenerationChartData {
  distribution: DonutChartData[]
  distributionData: DistributionMatrix
  olderClientCount: number
  olderApCount: number
}

const apLegend: string[] = [
  'Non Wi-Fi 6/6E AP',
  'Wi-Fi 6/6E AP',
  'Wi-Fi 7 AP'
]

const getWifiGenerationChartData =
(data: ApDistribution[]): WiFiGenerationChartData => {
  const distributionData: DistributionMatrix = {}
  let olderClientCount = 0
  let olderApCount = 0

  if (data && data.length > 0) {
    data.forEach(({ apWifiCapability, clientCapability, apCount, clientCount }) => {
      if (!distributionData[apWifiCapability]) {
        distributionData[apWifiCapability] = { apCount: 0, clientDistribution: {} }
      }

      distributionData[apWifiCapability].apCount += apCount
      distributionData[apWifiCapability].clientDistribution[clientCapability] = clientCount

      if (clientCapability !== 'Non Wi-Fi 6/6E' && apWifiCapability === 'Non Wi-Fi 6/6E AP') {
        olderApCount += apCount
        olderClientCount += clientCount
      }
    })
  }

  return {
    distribution:
    apLegend
      .filter(legendItem => distributionData[legendItem]) // Only include items that exist in data
      .map(name => ({
        name,
        value: distributionData[name].apCount
      })),
    distributionData,
    olderClientCount,
    olderApCount

  }
}

export const tooltipValuesFunc = (
  distributionData: DistributionMatrix
) => (
  name: string
) => {
  const values = distributionData[name].clientDistribution
  return {
    values: Object.entries(values).map(([clientCapability, clientCount], index) => (
      <span key={clientCapability} style={{ marginLeft: '14px' }}>
        {clientCapability}: <strong>{clientCount}</strong>
        {index < Object.entries(values).length - 1 && <br/>}
      </span>
    ))
  }
}

export const WifiGeneration: React.FC<Mdu360TabProps> = ({ startDate, endDate }) => {
  const { $t } = useIntl()
  const queryResults = useWifiGenerationQuery({
    path: [{ type: 'network', name: 'Network' }], // replace the finalized filter as needed
    start: startDate,
    end: endDate
  },{
    selectFromResult: ({ data, ...rest }) => ({
      data: getWifiGenerationChartData(data!),
      ...rest
    })
  })

  const { data } = queryResults
  const isDistributionDataAvailable = data && data.distribution && data.distribution.length > 0

  const distribution = <AutoSizer>
    {({ height, width }) => (
      isDistributionDataAvailable ?
        <DonutChart
          style={{ width, height }}
          data={data.distribution}
          legend='name-bold-value'
          size='small'
          showLegend
          showTotal
          showLabel
          showValue
          dataFormatter={(v) => $t(intlFormats.countFormat, { value: v as number })}
          tooltipFormat={defineMessage({
            defaultMessage: 'Client Distribution:<br></br>{values}'
          })}
          tooltipValuesFunc={tooltipValuesFunc(data.distributionData)}
        />
        : <NoData style={{ margin: '38px 0 0 0' }}/>
    )}
  </AutoSizer>

  const upgradeOpportunity =
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ maxHeight: '140px', display: 'inline-block' }}>
        {data?.olderClientCount > 0 ?
          (<FormattedMessage
            defaultMessage={
              '{olderClientCount} clients are connected to older-generation access points. ' +
            'Consider upgrading {olderApCount} APs to enhance performance and user experience.'
            }
            values={{
              olderClientCount: <strong>{data.olderClientCount}</strong>,
              olderApCount: <strong>{data.olderApCount}</strong>
            }}
          /> ):
          (<span>{$t({ defaultMessage: 'You’ve got the latest and greatest APs in your network! ' +
          'All clients are connected to the newest ' +
          'Wi-Fi generation and are enjoying exceptional performance.' })}</span>) }
      </GridCol>
    </GridRow>

  const tabDetails:ContentSwitcherProps['tabDetails']=[
    { label: $t({ defaultMessage: 'Distribution' }) ,
      children: distribution,
      value: 'distribution' },
    { label: $t({ defaultMessage: 'Upgrade Opportunity' }),
      children: upgradeOpportunity,
      value: 'upgradeOpportunity' }
  ]

  return (
    <Loader states={[queryResults]}>
      <HistoricalCard title={$t({ defaultMessage: 'Wi-Fi Generation' })}>
        <AutoSizer>
          {({ height, width }) => (
            <div style={{ display: 'block', height, width, margin: '-38px 0 0 0' }}>
              <ContentSwitcher tabDetails={tabDetails} align='right' size='small' />
            </div>
          )}
        </AutoSizer>
      </HistoricalCard>
    </Loader>
  )
}
