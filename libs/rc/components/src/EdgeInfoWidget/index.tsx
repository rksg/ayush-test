/* eslint-disable max-len */
import React from 'react'

import { useIntl } from 'react-intl'
// import AutoSizer   from 'react-virtualized-auto-sizer'
import styled from 'styled-components'

import type { DonutChartData, DonutChartProps }                                                             from '@acx-ui/components'
import { Button, cssStr, DonutChart, GridCol, GridRow, Loader, NoActiveData, onChartClick }                 from '@acx-ui/components'
import { EdgeDnsServers, EdgePortAdminStatusEnum, EdgePortStatus, EdgeResourceUtilizationEnum, EdgeStatus } from '@acx-ui/rc/utils'

import { SpaceWrapper } from '../SpaceWrapper/index'

import EdgeDetailsDrawer      from './EdgeDetailsDrawer'
import EdgePortsListDrawer    from './EdgePortsListDrawer'
import { EdgeSysResourceBox } from './EdgeSysResourceBox'

interface EdgeInfoWidgetProps {
  className?: string
  currentEdge: EdgeStatus | undefined
  edgePortsSetting: EdgePortStatus[] | undefined
  dnsServers: EdgeDnsServers | undefined
  isEdgeStatusLoading: boolean
  isPortListLoading: boolean
}

interface EdgePortsWidgetProps {
  isLoading: boolean
  edgePortsSetting: EdgePortStatus[] | undefined
}

function EdgeOverviewDonutWidget ({ title, data, isLoading, chartDataTransformer, onClick }:
   { title:string, data: Array<DonutChartData>,
    isLoading: boolean, chartDataTransformer?:Function, onClick?: DonutChartProps['onClick'] }) {
  const { $t } = useIntl()
  if (chartDataTransformer)
    data = chartDataTransformer(data)

  return (
    <Loader states={[{ isLoading }]}>
      <SpaceWrapper>
        { data && data.length > 0
          ?
          <DonutChart
            title={title}
            style={{ width: 100, height: 100 }}
            legend={'name-value'}
            data={data}
            onClick={onClick}
          />
          : <NoActiveData text={$t({ defaultMessage: 'No data' })}/>
        }
      </SpaceWrapper>
    </Loader>
  )
}

const EdgeAlarmWidget = () => {
  const { $t } = useIntl()

  // TODO: Alarms list query by API
  const chartData: DonutChartData[] = []

  return (<EdgeOverviewDonutWidget title={$t({ defaultMessage: 'Alarms' })} data={chartData} isLoading={false} chartDataTransformer={() => {}} />)
}

type ReduceReturnType = Record<string, number>

export const getPortsAdminStatusChartData = (ports: EdgePortStatus[] | undefined): DonutChartData[] => {
  const seriesMapping = [
    { key: EdgePortAdminStatusEnum.Enabled,
      name: EdgePortAdminStatusEnum.Enabled,
      color: cssStr('--acx-semantics-green-50') },
    { key: EdgePortAdminStatusEnum.Disabled,
      name: EdgePortAdminStatusEnum.Disabled,
      color: cssStr('--acx-accents-orange-30') }
  ] as Array<{ key: string, name: string, color: string }>

  const chartData: DonutChartData[] = []

  if (ports && ports.length > 0) {
    const portsSummary = ports.reduce<ReduceReturnType>((acc, { adminStatus }) => {
      acc[adminStatus] = (acc[adminStatus] || 0) + 1
      return acc
    }, {})

    seriesMapping.forEach(({ key, name, color }) => {
      if (portsSummary[key]) {
        chartData.push({
          name,
          value: portsSummary[key],
          color
        })
      }
    })
  }

  return chartData
}

const EdgePortsWidget = ({ isLoading, edgePortsSetting }: EdgePortsWidgetProps) => {
  const { $t } = useIntl()
  const [visible, setVisible] = React.useState(false)
  const handleDonutClick = () => {
    setVisible(true)
  }

  const chartData = getPortsAdminStatusChartData(edgePortsSetting)

  return (<>
    <EdgeOverviewDonutWidget title={$t({ defaultMessage: 'Ports' })} data={chartData} isLoading={isLoading} onClick={onChartClick(handleDonutClick)}/>
    <EdgePortsListDrawer
      visible={visible}
      setVisible={setVisible}
      edgePortsSetting={edgePortsSetting as EdgePortStatus[]}
    />
  </>)
}

export const EdgeInfoWidget = styled(({
  className,
  currentEdge,
  edgePortsSetting,
  dnsServers,
  isEdgeStatusLoading,
  isPortListLoading }: EdgeInfoWidgetProps) => {
  const { $t } = useIntl()
  const [visible, setVisible] = React.useState(false)
  const moreDetailsHandler = () => {
    setVisible(true)
  }

  return (
    <GridRow className={className}>
      <GridCol col={{ span: 4 }}>
        <EdgeAlarmWidget />
      </GridCol>
      <GridCol col={{ span: 4 }}>
        <EdgePortsWidget isLoading={isPortListLoading} edgePortsSetting={edgePortsSetting} />
      </GridCol>
      <GridCol col={{ span: 4 }}>
        <EdgeSysResourceBox
          isLoading={isEdgeStatusLoading}
          type={EdgeResourceUtilizationEnum.STORAGE}
          title={$t({ defaultMessage: 'Storage Usage' })}
          value={currentEdge?.diskUsed}
          totalVal={currentEdge?.diskTotal}
        />
      </GridCol>
      <GridCol col={{ span: 4 }}>
        <EdgeSysResourceBox
          isLoading={isEdgeStatusLoading}
          type={EdgeResourceUtilizationEnum.MEMORY}
          title={$t({ defaultMessage: 'Memory Usage' })}
          value={currentEdge?.memUsed}
          totalVal={currentEdge?.memTotal}
        />
      </GridCol>
      <GridCol col={{ span: 4 }}>
        <EdgeSysResourceBox
          isLoading={isEdgeStatusLoading}
          type={EdgeResourceUtilizationEnum.CPU}
          title={$t({ defaultMessage: 'CPU Usage' })}
          value={currentEdge?.cpuUsed}
          totalVal={currentEdge?.cpuTotal}
        />
      </GridCol>
      <GridCol col={{ span: 4 }} className='moreBtn'>
        <Button key='moreDetailsBtn' type='link' onClick={moreDetailsHandler} >
          {$t({ defaultMessage: 'More Details' })}
        </Button>
      </GridCol>

      <EdgeDetailsDrawer
        visible={visible}
        setVisible={setVisible}
        currentEdge={currentEdge}
        edgePortsSetting={edgePortsSetting}
        dnsServers={dnsServers}
      />
    </GridRow>
  )
})`
background-color: var(--acx-neutrals-10);

& > .ant-col {
  height: 176px;

  & .moreBtn {
    justify-content: center;
  }
}
`
