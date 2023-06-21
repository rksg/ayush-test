import React from 'react'

import { useIntl } from 'react-intl'
import styled      from 'styled-components'

import { Button, GridCol, GridRow } from '@acx-ui/components'
import {
  EdgeDnsServers,
  EdgePortStatus,
  EdgeResourceUtilizationEnum,
  EdgeStatus
} from '@acx-ui/rc/utils'

import { EdgeAlarmWidget }    from './EdgeAlarmWidget'
import EdgeDetailsDrawer      from './EdgeDetailsDrawer'
import { EdgePortsWidget }    from './EdgePortsWidget'
import { EdgeSysResourceBox } from './EdgeSysResourceBox'

interface EdgeInfoWidgetProps {
  className?: string
  currentEdge: EdgeStatus | undefined
  edgePortsSetting: EdgePortStatus[] | undefined
  dnsServers: EdgeDnsServers | undefined
  isEdgeStatusLoading: boolean
  isPortListLoading: boolean
}

export const EdgeInfoWidget = styled((props: EdgeInfoWidgetProps) => {
  const {
    className,
    currentEdge,
    edgePortsSetting,
    dnsServers,
    isEdgeStatusLoading,
    isPortListLoading
  } = props
  const { $t } = useIntl()
  const [visible, setVisible] = React.useState(false)
  const moreDetailsHandler = () => {
    setVisible(true)
  }

  return (
    <GridRow className={className}>
      <GridCol col={{ span: 4 }}>
        <EdgeAlarmWidget isLoading={isEdgeStatusLoading} serialNumber={currentEdge?.serialNumber} />
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
          value={currentEdge?.memoryUsed}
          totalVal={currentEdge?.memoryTotal}
        />
      </GridCol>
      <GridCol col={{ span: 4 }}>
        <EdgeSysResourceBox
          isLoading={isEdgeStatusLoading}
          type={EdgeResourceUtilizationEnum.CPU}
          title={$t({ defaultMessage: 'CPU Usage' })}
          value={currentEdge?.cpuUsedPercentage}
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
