
import { useEffect, useState } from 'react'

import { DefaultOptionType } from 'antd/lib/select'
import { useIntl }           from 'react-intl'

import { SwitchesTrafficByVolume, SwitchesTrafficByVolumeLegacy } from '@acx-ui/analytics/components'
import { SwitchStatusByTime }                                     from '@acx-ui/analytics/components'
import { Button, GridCol, GridRow }                               from '@acx-ui/components'
import { Features, useIsSplitOn }                                 from '@acx-ui/feature-toggle'
import { TopologyFloorPlanWidget, isLAGMemberPort }               from '@acx-ui/rc/components'
import {
  SwitchBlinkLEDsDrawer,
  SwitchInfo
}
  from '@acx-ui/rc/components'
import { useSwitchPortlistQuery } from '@acx-ui/rc/services'
import {
  NetworkDevice,
  NetworkDevicePosition,
  ShowTopologyFloorplanOn,
  StackMember,
  SwitchPortViewModel,
  SwitchViewModel,
  sortPortFunction,
  SwitchStatusEnum,
  SwitchPortViewModelQueryFields,
  SwitchUrlsInfo } from '@acx-ui/rc/utils'
import { useParams }                                    from '@acx-ui/react-router-dom'
import { RolesEnum }                                    from '@acx-ui/types'
import { hasPermission, hasRoles }                      from '@acx-ui/user'
import { getOpsApi, TABLE_QUERY_LONG_POLLING_INTERVAL } from '@acx-ui/utils'
import type { AnalyticsFilter }                         from '@acx-ui/utils'


import { ResourceUtilization } from './ResourceUtilization'
import { SwitchFrontRearView } from './SwitchFrontRearView'
import { TopPorts }            from './TopPorts'


export function SwitchOverviewPanel (props:{
  filters: AnalyticsFilter,
  switchDetail: SwitchViewModel,
  currentSwitchDevice: NetworkDevice,
  stackMember: StackMember[]
}) {
  const { filters, switchDetail, currentSwitchDevice, stackMember } = props
  const { $t } = useIntl()
  const [blinkDrawerVisible, setBlinkDrawerVisible] = useState(false)
  const [blinkData, setBlinkData] = useState([] as SwitchInfo[])
  const enableSwitchBlinkLed = useIsSplitOn(Features.SWITCH_BLINK_LED)

  return <>
    {enableSwitchBlinkLed && (
      hasPermission({ rbacOpsIds: [getOpsApi(SwitchUrlsInfo.blinkLeds)] })
    || hasRoles([RolesEnum.READ_ONLY])) &&
      <div style={{ textAlign: 'right' }}>
        <Button
          style={{ marginLeft: '20px' }}
          type='link'
          size='small'
          disabled={switchDetail?.deviceStatus!== SwitchStatusEnum.OPERATIONAL}
          onClick={() => {

            const transformedSwitchRows: SwitchInfo[] = [{
              switchId: switchDetail.id,
              venueId: switchDetail.venueId,
              stackMembers: stackMember
            }]
            setBlinkData(transformedSwitchRows)
            setBlinkDrawerVisible(true)

          }}>
          {$t({ defaultMessage: 'Blink LEDs' })}
        </Button>
      </div>
    }

    <GridRow>
      <GridCol col={{ span: 24 }}>
        <SwitchFrontRearView stackMember={stackMember} />
      </GridCol>
    </GridRow>
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ height: '380px' }}>
        { switchDetail && <TopologyFloorPlanWidget
          showTopologyFloorplanOn={ShowTopologyFloorplanOn.SWITCH_OVERVIEW}
          currentDevice={currentSwitchDevice}
          venueId={switchDetail?.venueId}
          devicePosition={switchDetail?.position as NetworkDevicePosition}/>
        }
      </GridCol>
    </GridRow>
    <GridRow>
      { switchDetail && filters &&
      <SwitchWidgets filters={{ ...filters }} switchDetailHeader={switchDetail} /> }
    </GridRow>

    {enableSwitchBlinkLed &&
      <SwitchBlinkLEDsDrawer
        visible={blinkDrawerVisible}
        setVisible={setBlinkDrawerVisible}
        switches={blinkData}
        isStack={stackMember.length > 0}
      />}
  </>
}

function SwitchWidgets (props: { filters: AnalyticsFilter, switchDetailHeader: SwitchViewModel }) {
  const { filters, switchDetailHeader } = props
  const { $t } = useIntl()
  const { tenantId, serialNumber } = useParams()
  const portPayload = {
    page: 1,
    pageSize: 10000,
    filters: { switchId: [serialNumber] },
    sortField: 'portIdentifierFormatted',
    sortOrder: 'ASC',
    fields: SwitchPortViewModelQueryFields
  }

  const supportPortTraffic = useIsSplitOn(Features.SWITCH_PORT_TRAFFIC)
  const portList = useSwitchPortlistQuery({ params: { tenantId }, payload: portPayload })
  const [portOptions, setPortOptions] = useState([] as DefaultOptionType[])
  const [selectedPorts, setSelectedPorts] = useState([] as string[])

  const getPortLabel = (port: SwitchPortViewModel) => {
    const id = port.portIdentifier
    let suffix:string[] = []

    if (port.cloudPort) {
      suffix.push('UpLink')
    }
    if((switchDetailHeader.isStack || switchDetailHeader.formStacking) && port.usedInFormingStack) {
      suffix.push('S')
    }
    if(isLAGMemberPort(port)) {
      suffix.push('L')
    }

    const suffixString = suffix.length ? ' (' + suffix.join(', ') + ')' : ''

    return id + suffixString
  }

  useEffect(() => {
    if (!portList.isLoading && switchDetailHeader) {
      setPortOptions([
        { label: $t({ defaultMessage: 'All Ports' }), value: null },
        ...(portList?.data?.data?.map(port => ({
          id: port.portIdentifier,
          label: getPortLabel(port)
        }))
          .sort(sortPortFunction)
          .map(item => ({
            label: item.label, value: item.id
          }))
      ?? [])
      ])
    }
  }, [portList, switchDetailHeader])

  const onPortChange = (value: string) =>{
    const ports = value ? [value] : []
    setSelectedPorts(ports)
  }

  return (
    <>
      <GridCol col={{ span: 24 }} style={{ height: '100px' }}>
        <SwitchStatusByTime filters={filters}
          refreshInterval={TABLE_QUERY_LONG_POLLING_INTERVAL} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        {
          supportPortTraffic ?
            <SwitchesTrafficByVolume filters={filters}
              refreshInterval={TABLE_QUERY_LONG_POLLING_INTERVAL}
              enableSelectPort={true}
              portOptions={portOptions}
              onPortChange={onPortChange}
              selectedPorts={selectedPorts}
            />
            :
            <SwitchesTrafficByVolumeLegacy filters={filters}
              refreshInterval={TABLE_QUERY_LONG_POLLING_INTERVAL} />
        }

      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <ResourceUtilization filters={filters} />
      </GridCol>
      <GridCol col={{ span: 8 }} style={{ height: '280px' }}>
        <TopPorts filters={{ ...filters, by: 'traffic' }} type='donut' />
      </GridCol>
      <GridCol col={{ span: 16 }} style={{ height: '280px' }}>
        <TopPorts filters={{ ...filters, by: 'traffic' }} type='line' />
      </GridCol>
      <GridCol col={{ span: 8 }} style={{ height: '280px' }}>
        <TopPorts filters={{ ...filters, by: 'error' }} type='donut' />
      </GridCol>
      <GridCol col={{ span: 16 }} style={{ height: '280px' }}>
        <TopPorts filters={{ ...filters, by: 'error' }} type='line' />
      </GridCol>
    </>
  )
}
