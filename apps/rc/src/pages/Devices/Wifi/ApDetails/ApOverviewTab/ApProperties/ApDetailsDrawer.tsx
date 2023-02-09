/* eslint-disable max-len */
import { Divider, Input }       from 'antd'
import { capitalize, includes } from 'lodash'
import { useIntl }              from 'react-intl'

import { ContentSwitcher, ContentSwitcherProps, Drawer, Descriptions }                          from '@acx-ui/components'
import { useApLanPortsQuery, useGetApRadioCustomizationQuery, useGetVenueQuery }                from '@acx-ui/rc/services'
import { ApDetails, ApLanPort, ApRadio, ApVenueStatusEnum, ApViewModel, DeviceGps, gpsToFixed } from '@acx-ui/rc/utils'
import { TenantLink }                                                                           from '@acx-ui/react-router-dom'

import { useApContext } from '../../ApContext'

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
  const { tenantId, serialNumber } = useApContext()
  const { visible, setVisible, currentAP, apDetails } = props
  const { APSystem, cellularInfo: currentCellularInfo } = currentAP?.apStatusData || {}
  const ipTypeDisplay = (APSystem?.ipType) ? ` [${capitalize(APSystem?.ipType)}]` : ''
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

  const { data: radioSetting } = useGetApRadioCustomizationQuery({
    params: { tenantId, serialNumber }
  },
  {
    skip: currentAP?.deviceStatusSeverity !== ApVenueStatusEnum.OPERATIONAL
  })

  const onClose = () => {
    setVisible(false)
  }

  const PropertiesTab = () => {
    return (<>
      <Descriptions labelWidthPercent={50}>
        <Descriptions.Item
          label={$t({ defaultMessage: 'Venue' })}
          children={
            <TenantLink to={`/venues/${currentAP?.venueId}/venue-details/overview`}>
              {currentAP?.venueName}
            </TenantLink>
          }
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'AP Group' })}
          children={
            currentAP?.deviceGroupName || $t({ defaultMessage: 'None' })
          }
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'Description' })}
          children={
            apDetails?.description || $t({ defaultMessage: 'None' })
          }
        />
        {/* <Descriptions.Item  TODO: Wait tags feature support
          label={$t({ defaultMessage: 'Tags:' })}
          children={
            currentAP?.tags || '--'
          }
        /> */}
        <Descriptions.Item
          label={$t({ defaultMessage: 'GPS Coordinates' })}
          children={
            getGpsFieldStatus(apDetails.deviceGps as DeviceGps, currentAP.venueId)
          }
        />
      </Descriptions>
      <Divider/>
      <Descriptions labelWidthPercent={50}>
        {
          currentAP.password &&
          <Descriptions.Item
            label={$t({ defaultMessage: 'Admin Password' })}
            children={<Input.Password
              readOnly
              bordered={false}
              value={currentAP.password}
            />}
          />
        }
        <Descriptions.Item
          label={$t({ defaultMessage: 'S/N' })}
          children={
            currentAP?.serialNumber || '--'
          }
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'MAC Address' })}
          children={
            (currentAP?.apMac && (currentAP?.apMac !== currentAP?.serialNumber)) ? currentAP.apMac : '--'
          }
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'IP Address' })}
          children={
            (currentAP?.IP)? `${currentAP.IP}${ipTypeDisplay}` : '--'
          }
        />
        { includes(ipTypeDisplay, 'Static') && (
          <>
            <Descriptions.Item
              label={$t({ defaultMessage: 'Network Mask' })}
              children={
                APSystem?.netmask || '--'
              }
            />
            <Descriptions.Item
              label={$t({ defaultMessage: 'Gateway' })}
              children={
                APSystem?.gateway || '--'
              }
            />
          </>
        )}
        <Descriptions.Item
          label={$t({ defaultMessage: 'Primary DNS' })}
          children={
            APSystem?.primaryDnsServer || '--'
          }
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'Secondary DNS' })}
          children={
            APSystem?.secondaryDnsServer || '--'
          }
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'Ext. IP Address' })}
          children={
            currentAP?.extIp || '--'
          }
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'Model' })}
          children={
            currentAP?.model || '--'
          }
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'Type' })}
          children={
            currentAP?.deviceModelType || '--'
          }
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'Version' })}
          children={
            currentAP?.fwVersion || '--'
          }
        />
      </Descriptions>
      {
        currentAP?.isMeshEnable && (
          <>
            <Divider/>
            <Descriptions labelWidthPercent={50}>
              <Descriptions.Item
                label={$t({ defaultMessage: 'Mesh Role' })}
                children={
                  currentAP?.meshRole ?
                    currentAP.meshRole + $t({ defaultMessage: ' ({hops} hop)' }, { hops: currentAP.hops }) :
                    $t({ defaultMessage: 'AP' })
                }
              />
              { currentAP?.rootAP?.name &&
                <Descriptions.Item
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
                <Descriptions.Item
                  label={$t({ defaultMessage: 'Signal to previous hop' })}
                  children={
                    currentAP?.apDownRssi
                  }
                />
              }
              {
                currentAP?.apUpRssi &&
                <Descriptions.Item
                  label={$t({ defaultMessage: 'Signal from previous hop' })}
                  children={
                    currentAP?.apUpRssi
                  }
                />
              }
            </Descriptions>
          </>
        )
      }
      {
        currentAP.deviceStatusSeverity === ApVenueStatusEnum.OPERATIONAL &&
        <>
          <Divider/>
          <Descriptions labelWidthPercent={50}>
            <Descriptions.Item
              label={$t({ defaultMessage: 'Uptime' })}
              children={currentAP?.uptime}
            />
            <Descriptions.Item
              label={$t({ defaultMessage: 'Last Seen' })}
              children={currentAP?.lastSeenTime}
            />
          </Descriptions>
        </>
      }
      {
        currentCellularInfo &&
         <>
           <Divider/>
           <ApCellularProperties currentCellularInfo={currentCellularInfo} currentAP={currentAP} />
         </>
      }
    </>)
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


