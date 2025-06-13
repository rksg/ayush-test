import { useState } from 'react'

import { Divider, Space }            from 'antd'
import _                             from 'lodash'
import { FormattedMessage, useIntl } from 'react-intl'
import AutoSizer                     from 'react-virtualized-auto-sizer'

import {
  HistoricalCard,
  Loader,
  NoData,
  DonutChart,
  ContentSwitcher,
  ContentSwitcherProps,
  cssStr,
  GridRow,
  GridCol,
  Button
} from '@acx-ui/components'
import type { DonutChartData } from '@acx-ui/components'
import { intlFormats }         from '@acx-ui/formatter'

import { DistributionData, DistributionMatrix, Mdu360TabPros } from '../../types'

import { HierarchyNodeData, useWifiClientCapabilityQuery } from './services'
import * as UI                                             from './styledComponents'

const colorMapping: Record<string, string> = {
  'Wi-Fi 6': cssStr('--acx-viz-qualitative-10'),
  'Non Wi-Fi 6': cssStr('--acx-viz-qualitative-11')
}

const apTypes = [
  'Non Wi-Fi 6 AP',
  'Wi-Fi 6 AP',
  'Wi-Fi 7 AP'
]

type WiFiClientCapabilityChartData = {
  capability: DonutChartData[],
  distribution: DistributionData[]
  olderClientCount: number
  olderApCount: number
}
export const getWifiClientCapabilityChartData =
(data: HierarchyNodeData): WiFiClientCapabilityChartData => {
  const capabilityChartData: DonutChartData[] = []
  const distributionData: DistributionMatrix = {}
  let olderClientCount = 0
  let olderApCount = 0


  Object.keys(colorMapping).forEach((clientType) => {
    distributionData[clientType] = {}
    apTypes.forEach(apType => {
      distributionData[clientType][apType] = 0
    })
  })

  if (data && data?.clientCapability?.length > 0) {
    data.clientCapability.forEach(({ name, value }) => {
      if (colorMapping[name]) {
        capabilityChartData.push({
          name,
          value,
          color: colorMapping[name]
        })
      }
    })
  }
  if (data && data?.apDistribution?.length > 0) {
    data.apDistribution.forEach(({ name, apCapability, clientCount, apCount }) => {
      if (distributionData[name] && distributionData[name][apCapability] !== undefined) {
        distributionData[name][apCapability] = apCount
        if (name === 'Wi-Fi 6' && apCapability === 'Non Wi-Fi 6 AP') {
          olderClientCount += clientCount
          olderApCount += apCount
        }
      }
    })
  }

  return {
    capability: capabilityChartData,
    olderClientCount,
    olderApCount,
    distribution: Object.entries(distributionData)
      .map(([name, apModels]) => ({
        name, apModels
      }))
  }
}

export const WifiClientCapability: React.FC<Mdu360TabPros> = ({ startDate, endDate }) => {

  const { $t } = useIntl()
  const [isVisibleCapabilityDrawer, setIsVisibleCapabilityDrawer] = useState(false)

  const queryResults = useWifiClientCapabilityQuery({
    path: [{ type: 'network', name: 'Network' }], // replace the finalized filter as needed
    start: startDate,
    end: endDate
  },{
    selectFromResult: ({ data, ...rest }) => ({
      data: getWifiClientCapabilityChartData(data!),
      ...rest
    })
  })

  const { data } = queryResults
  const isCapabilityDataAvailable = data && data.capability && data.capability.length > 0
  const isDistributionDataAvailable = data && !_.isEmpty(data.distribution)

  const clientByCapability = <AutoSizer>
    {({ height, width }) => (
      isCapabilityDataAvailable ?
        <DonutChart
          style={{ width, height: height-30 }}
          title={$t({ defaultMessage: 'Total Wi-Fi' })}
          dataFormatter={(v) => $t(intlFormats.countFormat, { value: v as number })}
          data={data.capability}
          showLegend
          showTotal
          showLabel
          labelTextStyle={{ overflow: 'breakAll', width: 240 }}
          legend='name-bold-value'
          size={'small'}
        />
        : <NoData style={{ margin: '38px 0 0 0' }}/>
    )}
  </AutoSizer>

  const clientByDistributionContent = isDistributionDataAvailable ?
    <Space direction='vertical'>
      <GridRow>
        <GridCol col={{ span: 8 }}>
          {$t({ defaultMessage: 'Wi-Fi Generation' })}
        </GridCol>
        <GridCol col={{ span: 16 }}>
          {$t({ defaultMessage: 'AP Distribution' })}
        </GridCol>
      </GridRow>
      <Divider style={{ margin: '0 0 10px 0' }}/>
      {data.distribution.map((item, index) => (
        <GridRow key={index}>
          <GridCol col={{ span: 8 }}>
            <strong>{item.name}</strong>
          </GridCol>
          <GridCol col={{ span: 16 }} style={{ display: 'inline' }}>
            {Object.entries(item.apModels).map(([apType, value], index) => (
              <span style={{ marginRight: '8px' }} key={index}>
                {apType}: <strong>{value}</strong>
                {index < Object.entries(item.apModels).length - 1 && ', '}
              </span>
            ))}
          </GridCol>
        </GridRow>
      ))}
    </Space>
    : <NoData style={{ margin: '38px 0 0 0' }}/>

  const clientByDistribution =
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ maxHeight: '140px' }}>
        {clientByDistributionContent}
        <GridRow>
          <GridCol col={{ span: 24 }}
            style={{ marginTop: '10px', justifyContent: 'flex-end', flexDirection: 'row' }}>
            <Button
              type='link'
              onClick={() => {
                setIsVisibleCapabilityDrawer(true)
              }}>
              {$t({ defaultMessage: 'Upgrade Opportunity' })}
            </Button>
          </GridCol>
        </GridRow>
      </GridCol>
    </GridRow>

  const tabDetails:ContentSwitcherProps['tabDetails']=[
    { label: $t({ defaultMessage: 'Capability' }) ,
      children: clientByCapability,
      value: 'capability' },
    { label: $t({ defaultMessage: 'Distribution' }),
      children: clientByDistribution,
      value: 'distribution' }
  ]

  return (
    <Loader states={[queryResults]}>
      <HistoricalCard title={$t({ defaultMessage: 'Wi-Fi Client Capability' })}>
        <AutoSizer>
          {({ height, width }) => (
            <div style={{ display: 'block', height, width, margin: '-38px 0 0 0' }}>
              <ContentSwitcher tabDetails={tabDetails} align='right' size='small' />
            </div>
          )}
        </AutoSizer>
      </HistoricalCard>
      {isDistributionDataAvailable &&
      <UI.OpportunityDrawer
        width={493}
        title={$t({ defaultMessage: 'Upgrade Opportunity' })}
        placement='right'
        onClose={() => setIsVisibleCapabilityDrawer(false)}
        visible={isVisibleCapabilityDrawer}
      >
        <FormattedMessage
          defaultMessage={
            '{olderClientCount} {wifi6} capable clients ' +
            'are currently connected to older-generation Wi-Fi 5 or older standard APs,' +
            ' which may be limiting their performance and overall network experience. {br}' +
            'Upgrading these {olderApCount} to {wifi7Aps} will enhance speed, ' +
            'efficiency, and reliability for these devices'
          }
          values={{
            wifi6: <strong>Wi-Fi 6</strong>,
            olderClientCount: <strong>{data.olderClientCount}</strong>,
            olderApCount: <strong>{data.olderApCount} APs</strong>,
            wifi7Aps: <strong>Wi-Fi 7 APs</strong>,
            br: <br />
          }}
        />
      </UI.OpportunityDrawer>
      }
    </Loader>
  )
}
