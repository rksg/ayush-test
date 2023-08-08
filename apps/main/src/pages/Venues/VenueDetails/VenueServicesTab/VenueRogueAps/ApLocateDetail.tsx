import React, { useEffect, useState } from 'react'

import { Badge, Divider, Tooltip } from 'antd'
import { useIntl }                 from 'react-intl'
import { useParams }               from 'react-router-dom'

import { Alert, Button, Card, Descriptions, Modal }                      from '@acx-ui/components'
import { VenueMarkerGrey, VenueMarkerRed }                               from '@acx-ui/icons'
import { ApFloorplan }                                                   from '@acx-ui/rc/components'
import { useApDetailsQuery, useApViewModelQuery, useGetAllDevicesQuery } from '@acx-ui/rc/services'
import {
  NetworkDevice,
  NetworkDevicePayload,
  NetworkDevicePosition,
  NetworkDeviceType,
  RogueDeviceCategory,
  RogueOldApResponseType
} from '@acx-ui/rc/utils'

import { handleCategoryColor } from './index'

const ApLocateDetail = (props: { row: RogueOldApResponseType }) => {
  const params = useParams()
  const { row } = props
  const { $t } = useIntl()
  const [visible, setVisible] = useState(false)
  const [currentApDevice, setCurrentApDevice] = useState<NetworkDevice>({} as NetworkDevice)

  const apViewModelPayload = {
    fields: ['name', 'venueName', 'deviceGroupName', 'description', 'lastSeenTime',
      'serialNumber', 'apMac', 'IP', 'extIp', 'model', 'fwVersion',
      'meshRole', 'hops', 'apUpRssi', 'deviceStatus', 'deviceStatusSeverity',
      'isMeshEnable', 'lastUpdTime', 'deviceModelType', 'apStatusData.APSystem.uptime',
      'venueId', 'uplink', 'apStatusData', 'apStatusData.cellularInfo', 'tags'],
    filters: { serialNumber: [row.closestAp.apSerialNumber] }
  }
  const { data: currentAP }
    = useApViewModelQuery({
      payload: apViewModelPayload
    }, { skip: !row.closestAp.apSerialNumber })
  const { data: apDetails }
    = useApDetailsQuery({
      params: {
        activeTab: 'overview',
        apId: currentAP?.serialNumber,
        apMac: currentAP?.apMac,
        serialNumber: currentAP?.serialNumber,
        tenantId: params.tenantId,
        venueName: currentAP?.venueName
      }
    }, { skip: !currentAP })

  const networkDevicePayload: NetworkDevicePayload = {
    // eslint-disable-next-line max-len
    fields: ['id', 'name', 'switchName', 'deviceStatus', 'serialNumber', 'rogueCategory', 'floorplanId', 'xPercent', 'yPercent'],
    pageSize: 10000,
    sortField: 'name',
    sortOrder: 'ASC'
  }

  const getNetworkDevices = useGetAllDevicesQuery({ params, payload: networkDevicePayload })

  useEffect(() => {
    if(currentAP) {
      const _currentApDevice: NetworkDevice = {
        ...currentAP,
        networkDeviceType: NetworkDeviceType.ap
      } as NetworkDevice
      _currentApDevice.position = apDetails?.position
      setCurrentApDevice(_currentApDevice)
    }
  }, [currentAP, apDetails])

  const showModal = () => {
    setVisible(true)
  }

  const handleCancel = () => {
    setVisible(false)
  }

  const footer = [
    <Button key='back' onClick={handleCancel}>
      {$t({ defaultMessage: 'Cancel' })}
    </Button>
  ]

  return (
    <>
      { row.locatable ? <Button style={{ borderStyle: 'none' }} onClick={showModal}>
        <VenueMarkerRed />
      </Button> : <Button style={{ borderStyle: 'none' }} ><Tooltip
        title={$t({
          // eslint-disable-next-line max-len
          defaultMessage: 'Cannot locate this rogue AP since the detecting APs are not placed in any floor plans.'
        })}>
        <VenueMarkerGrey />
      </Tooltip></Button> }
      <Modal
        title={$t({ defaultMessage: 'RogueAP: {apMac}' }, { apMac: row.rogueMac })}
        visible={visible}
        onCancel={handleCancel}
        width={800}
        footer={footer}
      >
        <Descriptions>
          <Descriptions.Item
            label={$t({ defaultMessage: 'Rogue MAC Address' })}
            children={row.rogueMac}
          />
          <Descriptions.Item
            label={$t({ defaultMessage: 'Category' })}
            children={<Badge
              color={handleCategoryColor(row.category as RogueDeviceCategory)}
              text={row.category}
            />}
          />
          <Descriptions.Item
            label={$t({ defaultMessage: 'Classification Policy' })}
            children={row.classificationPolicyName}
          />
          <Descriptions.Item
            label={$t({ defaultMessage: 'SSID' })}
            children={row.ssid}
          />
        </Descriptions>
        <Divider />
        <Card>
          { apDetails?.venueId ? <ApFloorplan
            activeDevice={currentApDevice}
            venueId={apDetails?.venueId as string}
            apPosition={apDetails?.position as NetworkDevicePosition}
            allDevices={getNetworkDevices?.data?.data[0].ap as NetworkDevice[]}
          /> : null }
          {/* eslint-disable-next-line max-len */}
          <Alert message={$t({ defaultMessage: 'Note: Rogue AP placement is intended as an approximation, many factors can affect the output of this visualization.' })} type='warning' showIcon />
        </Card>
      </Modal>
    </>
  )
}

export default ApLocateDetail
