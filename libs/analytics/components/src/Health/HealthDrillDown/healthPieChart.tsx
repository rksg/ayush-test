import { useEffect, useState } from 'react'

import { isNull }                 from 'lodash'
import { useIntl, defineMessage } from 'react-intl'
import AutoSizer                  from 'react-virtualized-auto-sizer'

import { AnalyticsFilter } from '@acx-ui/analytics/utils'
import {
  ContentSwitcher,
  ContentSwitcherProps,
  DonutChart,
  Loader,
  NoData,
  qualitativeColorSet
} from '@acx-ui/components'
import { formatter }   from '@acx-ui/formatter'
import { NetworkPath } from '@acx-ui/utils'

import {
  stageLabels,
  DrilldownSelection,
  stageNameToCodeMap,
  showTopResult
} from './config'
import { ImpactedNodesAndWlans, usePieChartQuery } from './services'
import * as UI                                     from './styledComponents'

const topCount = 5

type PieChartData = {
  key: string
  value: number
  name: string
  color: string
}

function getTopPieChartData (nodeData: Omit<PieChartData, 'color' | 'name'>[])
: PieChartData[] {
  const colors = qualitativeColorSet()
  return nodeData
    .map((val, index) => ({
      ...val,
      name: val.key,
      color: colors[index]
    }))
}

const transformData = (
  data: ImpactedNodesAndWlans | undefined
): {
  nodes: PieChartData[];
  wlans: PieChartData[];
} => {
  if (data) {
    let { wlans: rawWlans, nodes: rawNodes } = data.network.hierarchyNode
    const nodes = rawNodes ? getTopPieChartData(rawNodes) : []
    const wlans = getTopPieChartData(rawWlans)
    return { nodes, wlans }
  }
  return { nodes: [], wlans: [] }
}

export function pieNodeMap (node: NetworkPath) {
  const lastPath = node[node.length - 1]
  const type = lastPath.type
  switch (type) {
    case 'zone':
      return defineMessage({ defaultMessage: `{ count, plural,
        one {AP Group}
        other {AP Groups}
      }` })
    case 'ap':
    case 'AP':
      return defineMessage({ defaultMessage: `{ count, plural,
        one {AP}
        other {APs}
      }` })
    default:
      return defineMessage({ defaultMessage: `{ count, plural,
        one {Venue}
        other {Venues}
      }` })
  }
}

function pieWlanMap () {
  return defineMessage({ defaultMessage: ` { count, plural,
    one {WLAN}
    other {WLANs}
  }` })
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
            data={data.slice(0, topCount)}
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
              return `${name}\n${formattedPercent} (${formattedValue})`
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
      queryFilter: stageNameToCodeMap[queryFilter!]
    },
    {
      skip: isNull(queryFilter)
    }
  )

  const { nodes, wlans } = transformData(queryResults.data)
  const venueTitle = $t(pieNodeMap(path), { count: nodes.length })
  const wlansTitle = $t(pieWlanMap(), { count: wlans.length })
  const name = queryFilter!

  const tabDetails: ContentSwitcherProps['tabDetails'] = []

  if (nodes.length > 0) {
    tabDetails.push({
      label: venueTitle,
      value: 'nodes',
      children: getHealthPieChart(nodes, formatter('countFormat'))
    })
  }

  tabDetails.push({
    label: wlansTitle,
    value: 'wlans',
    children: getHealthPieChart(wlans, formatter('durationFormat'))
  })

  const [chartKey, setChartKey] = useState('wlans')
  const count = showTopResult($t, chartKey === 'wlans' ? wlans.length : nodes.length, topCount)
  const lastPath = filters.path[filters.path.length - 1]
  const title = (lastPath.type === 'ap' || lastPath.type === 'AP')
    ? wlansTitle
    : venueTitle + ' / ' + wlansTitle

  useEffect(() => { setChartKey('wlans') }, [tabDetails.length])

  return (
    <Loader states={[queryResults]}>
      <UI.HealthPieChartWrapper>
        <UI.PieChartTitle>
          <b>{$t(stageLabels[name])}</b>{' '}
          {$t({ defaultMessage: '{count} Impacted {title}' }, { count, title })}
        </UI.PieChartTitle>
        <div style={{ height: '100%' }}>
          <AutoSizer>
            {({ height, width }) => (
              <div
                style={{
                  height,
                  width
                }}
              >
                {(tabDetails.length === 2)
                  ? <ContentSwitcher
                    key={queryFilter}
                    value={chartKey}
                    defaultValue={'wlans'}
                    tabDetails={tabDetails}
                    align='center'
                    size='small'
                    onChange={key => setChartKey(key)}
                  />
                  : <UI.SinglePieChartWrapper>
                    {tabDetails[0].children}
                  </UI.SinglePieChartWrapper>
                }
              </div>
            )}
          </AutoSizer>
        </div>
      </UI.HealthPieChartWrapper>
    </Loader>
  )
}
