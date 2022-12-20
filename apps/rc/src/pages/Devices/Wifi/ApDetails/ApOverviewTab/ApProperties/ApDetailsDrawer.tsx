/* eslint-disable max-len */
import { Divider, Form, Input } from 'antd'
import { useIntl }              from 'react-intl'

import { ContentSwitcher, ContentSwitcherProps, Drawer }                                        from '@acx-ui/components'
import { useApLanPortsQuery, useApRadioCustomizationQuery, useGetVenueQuery }                   from '@acx-ui/rc/services'
import { ApDetails, ApLanPort, ApRadio, ApVenueStatusEnum, ApViewModel, DeviceGps, gpsToFixed } from '@acx-ui/rc/utils'
import { TenantLink, useParams }                                                                from '@acx-ui/react-router-dom'


import { ApCellularProperties } from './ApCellularProperties'
import { ApDetailsSettings }    from './ApDetailsSettings'

interface ApDetailsDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  currentAP: ApViewModel,
  apDetails: ApDetails
}

export const ApDetailsDrawer = (props: ApDetailsDrawerProps) => {
  const { $t } = useIntl()
  const { tenantId, serialNumber } = useParams()
  const { visible, setVisible, currentAP, apDetails } = props
  const currentCellularInfo = currentAP?.apStatusData?.cellularInfo
  const { data: venueData } = useGetVenueQuery({
    params: { tenantId, venueId: currentAP?.venueId }
  },
  {
    skip: !currentAP?.venueId
  })

  const { data: lanPortsSetting } = useApLanPortsQuery({
    params: { tenantId, serialNumber }
  },
  {
    skip: currentAP?.deviceStatusSeverity !== ApVenueStatusEnum.OPERATIONAL
  })

  const { data: radioSetting } = useApRadioCustomizationQuery({
    params: { tenantId, serialNumber }
  },
  {
    skip: currentAP?.deviceStatusSeverity !== ApVenueStatusEnum.OPERATIONAL
  })

  const onClose = () => {
    setVisible(false)
  }

  const PropertiesTab = () => {
    return (
      <Form
        labelCol={{ span: 10 }}
        labelAlign='left'
        style={{ marginTop: currentAP?.deviceStatusSeverity === ApVenueStatusEnum.OPERATIONAL ? '15px' : 0 }}
      >
        <Form.Item
          label={$t({ defaultMessage: 'Venue' })}
          children={
            <TenantLink to={`/venues/${currentAP?.venueId}/venue-details/overview`}>
              {currentAP?.venueName}
            </TenantLink>
          }
        />
        <Form.Item
          label={$t({ defaultMessage: 'AP Group' })}
          children={
            currentAP?.deviceGroupName || $t({ defaultMessage: 'None' })
          }
        />
        <Form.Item
          label={$t({ defaultMessage: 'Description' })}
          children={
            apDetails?.description || $t({ defaultMessage: 'None' })
          }
        />
        {/* <Form.Item  TODO: Wait tags feature support
          label={$t({ defaultMessage: 'Tags:' })}
          children={
            currentAP?.tags || '--'
          }
        /> */}
        <Form.Item
          label={$t({ defaultMessage: 'GPS Coordinates' })}
          children={
            getGpsFieldStatus(apDetails.deviceGps as DeviceGps, currentAP.venueId)
          }
        />
        <Divider/>
        {
          currentAP.password &&
          <Form.Item
            label={$t({ defaultMessage: 'Admin Password' })}
            children={<Input.Password
              readOnly
              bordered={false}
              value={currentAP.password}
            />}
          />
        }
        <Form.Item
          label={$t({ defaultMessage: 'S/N' })}
          children={
            currentAP?.serialNumber || '--'
          }
        />
        <Form.Item
          label={$t({ defaultMessage: 'MAC Address' })}
          children={
            (currentAP?.apMac && (currentAP?.apMac !== currentAP?.serialNumber)) ? currentAP.apMac : '--'
          }
        />
        <Form.Item
          label={$t({ defaultMessage: 'IP Address' })}
          children={
            currentAP?.IP || '--'
          }
        />
        <Form.Item
          label={$t({ defaultMessage: 'Ext. IP Address' })}
          children={
            currentAP?.extIp || '--'
          }
        />
        <Form.Item
          label={$t({ defaultMessage: 'Model' })}
          children={
            currentAP?.model || '--'
          }
        />
        <Form.Item
          label={$t({ defaultMessage: 'Type' })}
          children={
            currentAP?.deviceModelType || '--'
          }
        />
        <Form.Item
          label={$t({ defaultMessage: 'Version' })}
          children={
            currentAP?.fwVersion || '--'
          }
        />
        {
          currentAP?.isMeshEnable && (
            <>
              <Divider/>
              <Form.Item
                label={$t({ defaultMessage: 'Mesh Role' })}
                children={
                  currentAP?.meshRole ?
                    currentAP.meshRole + $t({ defaultMessage: ' ({hops} hop)' }, { hops: currentAP.hops }) :
                    $t({ defaultMessage: 'AP' })
                }
              />
              { currentAP?.rootAP?.name &&
                <Form.Item
                  label={$t({ defaultMessage: 'Root AP' })}
                  children={
                    <TenantLink to={`/devices/wifi/${currentAP.rootAP.serialNumber}/details/overview`}>
                      {currentAP.rootAP.name}
                    </TenantLink>
                  }
                />
              }
              {
                currentAP?.apDownRssi &&
                <Form.Item
                  label={$t({ defaultMessage: 'Signal to previous hop' })}
                  children={
                    currentAP?.apDownRssi
                  }
                />
              }
              {
                currentAP?.apUpRssi &&
                <Form.Item
                  label={$t({ defaultMessage: 'Signal from previous hop' })}
                  children={
                    currentAP?.apUpRssi
                  }
                />
              }
            </>
          )
        }
        {
          currentAP.deviceStatusSeverity === ApVenueStatusEnum.OPERATIONAL &&
          <>
            <Divider/>
            <Form.Item
              label={$t({ defaultMessage: 'Uptime' })}
              children={currentAP?.uptime}
            />
            <Form.Item
              label={$t({ defaultMessage: 'Last Seen' })}
              children={currentAP?.lastSeenTime}
            />
          </>
        }
        {
          currentCellularInfo &&
           <>
             <Divider/>
             <ApCellularProperties currentCellularInfo={currentCellularInfo} currentAP={currentAP} />
           </>
        }
      </Form>
    )
  }

  const getGpsFieldStatus = (deviceGps: DeviceGps, venueId: string) => {
    if (deviceGps?.latitude && deviceGps?.longitude) {
      return deviceGps.latitude+ ', ' + deviceGps.longitude
    } else if (venueId) {
      const latitude = gpsToFixed(venueData?.address.latitude)
      const longitude = gpsToFixed(venueData?.address.longitude)
      return <>{ latitude + ', ' + longitude } <br/> {$t({ defaultMessage: '(As venue)' }) }</>
    } else {
      return '--'
    }
  }

  const tabDetails: ContentSwitcherProps['tabDetails'] = [
    {
      label: $t({ defaultMessage: 'Properties' }),
      value: 'properties',
      children: <PropertiesTab />
    },
    {
      label: $t({ defaultMessage: 'Settings' }),
      value: 'settings',
      children: <ApDetailsSettings
        lanPortsSetting={lanPortsSetting as ApLanPort}
        radioSetting={radioSetting as ApRadio}
      />
    }
  ]
  const content = currentAP?.deviceStatusSeverity === ApVenueStatusEnum.OPERATIONAL ?
    <ContentSwitcher tabDetails={tabDetails} size='small' /> :
    <PropertiesTab />

  return (
    <Drawer
      title={$t({ defaultMessage: 'AP Details' })}
      visible={visible}
      onClose={onClose}
      children={content}
      width={'400px'}
    />
  )
}


