import React from 'react'

import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { Button, GridCol, GridRow, Card }                           from '@acx-ui/components'
import { EdgeAlarmWidget, EdgeClusterNodesWidget, EdgePortsWidget } from '@acx-ui/edge/components'
import {
  EdgeClusterStatus,
  EdgePortStatus,
  EdgeStatus,
  getEdgeModelDisplayText
} from '@acx-ui/rc/utils'

import { EdgeClusterDetailsDrawer } from './ClusterDetailsDrawer'

interface EdgeClusterInfoWidgetProps {
  currentCluster: EdgeClusterStatus | undefined
  clusterPortsSetting: EdgePortStatus[] | undefined
  isEdgeClusterLoading: boolean
  isPortListLoading: boolean
  onClickWidget?: (widget: string) => void
}

export const EdgeClusterInfoWidget = (props: EdgeClusterInfoWidgetProps) => {
  const {
    currentCluster,
    clusterPortsSetting,
    isEdgeClusterLoading,
    isPortListLoading,
    onClickWidget
  } = props
  const { $t } = useIntl()
  const [visible, setVisible] = React.useState(false)

  const moreDetailsHandler = () => {
    setVisible(true)
  }

  const getClusterEdgeModel = (edgeList?: EdgeStatus[]) => {
    if (edgeList?.length) {
      return edgeList[0]?.model
    }
    return ''
  }

  return (
    <Card type='solid-bg' >
      <GridRow style={{ height: 152 }}>
        <GridCol col={{ span: 4 }}>
          <Typography.Title level={4} style={{ fontWeight: 800 }}>
            {getEdgeModelDisplayText(getClusterEdgeModel(currentCluster?.edgeList))}
          </Typography.Title>
        </GridCol>
        <GridCol col={{ span: 5 }}>
          <EdgeAlarmWidget
            isLoading={isEdgeClusterLoading}
            serialNumber={currentCluster?.edgeList?.map((edge) => edge.serialNumber)}
            onClick={onClickWidget}
          />
        </GridCol>
        <GridCol col={{ span: 5 }}>
          <EdgeClusterNodesWidget
            isLoading={isPortListLoading}
            clusterData={currentCluster}
          />
        </GridCol>
        <GridCol col={{ span: 5 }}>
          <EdgePortsWidget
            isLoading={isPortListLoading}
            edgePortsSetting={clusterPortsSetting}
            onClick={onClickWidget}
          />
        </GridCol>
        <GridCol col={{ span: 5 }} style={{ justifyContent: 'center' }}>
          <Button key='moreDetailsBtn' type='link' onClick={moreDetailsHandler} >
            {$t({ defaultMessage: 'More Details' })}
          </Button>
        </GridCol>

        <EdgeClusterDetailsDrawer
          visible={visible}
          setVisible={setVisible}
          currentCluster={currentCluster}
        />
      </GridRow>
    </Card>
  )
}