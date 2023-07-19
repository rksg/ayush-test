import React from 'react'

import { useIntl } from 'react-intl'
import styled      from 'styled-components'

import { Button, GridCol, GridRow }                             from '@acx-ui/components'
import { Features, useIsSplitOn }                               from '@acx-ui/feature-toggle'
import { useGetDnsServersQuery, useGetEdgePasswordDetailQuery } from '@acx-ui/rc/services'
import {
  EdgePortStatus,
  EdgeResourceUtilizationEnum,
  EdgeStatus
} from '@acx-ui/rc/utils'
import { useParams }             from '@acx-ui/react-router-dom'
import { useUserProfileContext } from '@acx-ui/user'

import { EdgeAlarmWidget }    from './EdgeAlarmWidget'
import EdgeDetailsDrawer      from './EdgeDetailsDrawer'
import { EdgePortsWidget }    from './EdgePortsWidget'
import { EdgeSysResourceBox } from './EdgeSysResourceBox'
import { Styles }             from './styledComponents'

interface EdgeInfoWidgetProps {
  className?: string
  currentEdge: EdgeStatus | undefined
  edgePortsSetting: EdgePortStatus[] | undefined
  isEdgeStatusLoading: boolean
  isPortListLoading: boolean
  onClickWidget?: (widget: string) => void
}

export const EdgeInfoWidget = styled((props: EdgeInfoWidgetProps) => {
  const {
    className,
    currentEdge,
    edgePortsSetting,
    isEdgeStatusLoading,
    isPortListLoading,
    onClickWidget
  } = props
  const { $t } = useIntl()
  const { serialNumber } = useParams()
  const [visible, setVisible] = React.useState(false)
  const isEdgeReady = useIsSplitOn(Features.EDGES_TOGGLE)
  const moreDetailsHandler = () => {
    setVisible(true)
  }

  const { data: dnsServers } = useGetDnsServersQuery({ params: { serialNumber } })

  const { data: userProfile } = useUserProfileContext()
  const isShowEdgePassword = userProfile?.support || userProfile?.var || userProfile?.dogfood
  const { data: passwordDetail } = useGetEdgePasswordDetailQuery(
    { params: { serialNumber } },
    {
      skip: !isShowEdgePassword || !isEdgeReady
    }
  )

  return (
    <GridRow className={className}>
      <GridCol col={{ span: 4 }}>
        <EdgeAlarmWidget
          isLoading={isEdgeStatusLoading}
          serialNumber={serialNumber}
          onClick={onClickWidget}
        />
      </GridCol>
      <GridCol col={{ span: 4 }}>
        <EdgePortsWidget
          isLoading={isPortListLoading}
          edgePortsSetting={edgePortsSetting}
          onClick={onClickWidget}
        />
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
        dnsServers={dnsServers}
        passwordDetail={passwordDetail}
      />
    </GridRow>
  )
})`${Styles}`
