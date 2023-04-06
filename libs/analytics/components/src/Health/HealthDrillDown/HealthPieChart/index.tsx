import { useEffect, useState } from 'react'

import { isNull }  from 'lodash'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { AnalyticsFilter } from '@acx-ui/analytics/utils'
import {
  Card,
  ContentSwitcher,
  ContentSwitcherProps,
  DonutChart,
  Loader,
  NoData,
  qualitativeColorSet
} from '@acx-ui/components'
import { formatter }   from '@acx-ui/formatter'
import { NetworkPath } from '@acx-ui/utils'

import { DrilldownSelection, stageMapToName } from '../config'

import { ImpactedNodesAndWlans, usePieChartQuery } from './services'
import * as UI                                     from './styledComponents'

const transformData = (
  data: ImpactedNodesAndWlans | undefined,
  queryType: DrilldownSelection
): {
  nodes: {
    key: string;
    value: number;
    name: string;
    color: string;
  }[];
  wlans: {
    key: string;
    value: number;
    name: string;
    color: string;
  }[];
} => {
  if (data) {
    const colors = qualitativeColorSet()
    let { wlans: rawWlans, nodes: rawNodes } = data.network.hierarchyNode
    rawNodes = rawNodes ?? []
    switch (queryType) {
      case 'connectionFailure': {
        const nodes = rawNodes
          .map((node, index) => ({
            ...node,
            name: node.key,
            color: colors[index]
          }))
          .slice(0, 5)
        const wlans = rawWlans
          .map((node, index) => ({
            ...node,
            name: node.key,
            color: colors[index]
          }))
          .slice(0, 5)
        return { nodes, wlans }
      }
      case 'ttc': {
        const nodes = rawNodes
          .map((node, index) => ({
            ...node,
            name: node.key,
            color: colors[index]
          }))
          .slice(0, 5)
        const wlans = rawWlans
          .map((node, index) => ({
            ...node,
            name: node.key,
            color: colors[index]
          }))
          .slice(0, 5)
        return { nodes, wlans }
      }
    }
  }
  return { nodes: [], wlans: [] }
}

export function pieNodeMap (node: NetworkPath) {
  const lastPath = node[node.length - 1]
  const type = lastPath.type
  switch (type) {
    case 'zone':
      return 'AP Group'
    case 'ap':
    case 'AP':
      return 'AP'
    default:
      return 'Venue'
  }
}

function getHealthPieChart (
  data: { key: string; value: number; name: string; color: string }[],
  dataFormatter: (value: unknown, tz?: string | undefined) => string
) {
  return (
    data.length > 0
      ? <AutoSizer defaultHeight={150}>
        {({ width, height }) => (
          <DonutChart
            data={data}
            style={{ height, width }}
            dataFormatter={dataFormatter}
            showLabel
            showTotal={false}
            labelFormatter={(data) => {
              const { name, value, percent } = data as {
              name: string;
              value: number;
              percent: number;
            }
              const formattedPercent = formatter('percentFormat')(percent / 100)
              const formattedValue = dataFormatter(value)
              const label = `${name}\n${formattedPercent} (${formattedValue})`
              return label
            }}
          />
        )}
      </AutoSizer>
      : <NoData />
  )
}

export const HealthPieChart = ({
  filters,
  queryType,
  queryFilter
}: {
  filters: AnalyticsFilter;
  queryType: DrilldownSelection;
  queryFilter: string;
}) => {
  const { $t } = useIntl()
  const { startDate: start, endDate: end, path } = filters
  const queryResults = usePieChartQuery(
    {
      start,
      end,
      path,
      queryType: queryType as string,
      queryFilter: stageMapToName[queryFilter!]
    },
    {
      skip: isNull(queryFilter)
    }
  )

  const { nodes, wlans } = transformData(queryResults.data, queryType)
  const singularNetwork = pieNodeMap(path)
  const venueTitle = nodes.length > 1 ? singularNetwork + 's' : singularNetwork
  const wlansTitle = wlans.length > 1 ? 'WLANs' : 'WLAN'
  const name = queryFilter!

  const tabDetails: ContentSwitcherProps['tabDetails'] = []

  if (nodes.length > 1) {
    tabDetails.push({
      label: $t({ defaultMessage: '{venueTitle}' }, { venueTitle }),
      value: 'nodes',
      children: getHealthPieChart(nodes, formatter('countFormat'))
    })
  }

  tabDetails.push({
    label: $t({ defaultMessage: '{wlansTitle}' }, { wlansTitle }),
    value: 'wlans',
    children: getHealthPieChart(wlans, formatter('durationFormat'))
  })

  const [chartKey, setChartKey] = useState('wlans')
  const count = chartKey === 'wlans' ? wlans.length : nodes.length
  const title = chartKey === 'wlans' ? wlansTitle : venueTitle

  useEffect(() => { setChartKey('wlans') }, [tabDetails.length])

  return (
    <Loader states={[queryResults]}>
      <UI.HealthPieChartWrapper>
        <Card
          type='no-border'
          title={$t(
            { defaultMessage: '{name} Top {count} Impacted {title}' },
            { name, count, title }
          )}
        >
          <div style={{ height: '100%' }}>
            <AutoSizer>
              {({ height, width }) => (
                <div
                  style={{
                    display: 'block',
                    height,
                    width,
                    margin: '-38px 0 0 0'
                  }}
                >
                  <ContentSwitcher
                    key={queryFilter}
                    value={chartKey}
                    defaultValue={'wlans'}
                    tabDetails={tabDetails}
                    align='right'
                    size='small'
                    onChange={key => setChartKey(key)}
                  />
                </div>
              )}
            </AutoSizer>
          </div>
        </Card>
      </UI.HealthPieChartWrapper>
    </Loader>
  )
}
