import React from 'react'

import { useIntl } from 'react-intl'

import { Button, GridCol, GridRow } from '@acx-ui/components'
import { useGetDnsServersQuery }    from '@acx-ui/rc/services'
import {
  EdgeResourceUtilizationEnum
} from '@acx-ui/rc/utils'

import OltDetailsDrawer       from './DetailsDrawer'
import { EdgeAlarmWidget }    from './EdgeAlarmWidget'
import { EdgePortsWidget }    from './EdgePortsWidget'
import { EdgeSysResourceBox } from './EdgeSysResourceBox'

interface OltDetailsPageHeaderProps {
  serialNumber: string
}

export const OltDetailsPageHeader = (props: OltDetailsPageHeaderProps) => {
  const {
    serialNumber
  } = props
  const { $t } = useIntl()
  const [visible, setVisible] = React.useState(false)

  const onClickDetailsHandler = () => {
    setVisible(true)
  }

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
        <img src='' alt='OLT device' />
      </GridCol>
      <GridCol col={{ span: 4 }}>
        <Button type='link' onClick={onClickDetailsHandler} >
          {$t({ defaultMessage: 'Device Details' })}
        </Button>
        <OltDetailsDrawer
          visible={visible}
          setVisible={setVisible}
          currentOlt={currentOlt}
        />
      </GridCol>
    </GridRow>
  )
}