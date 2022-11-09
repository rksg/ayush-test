import { useIntl } from 'react-intl'
import { ContentSwitcher, ContentSwitcherProps, Drawer }                  from '@acx-ui/components'
import { Divider, Form } from 'antd'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'
import * as UI from './styledComponents'
import { AP, ApDetails, ApVenueStatusEnum, DeviceGps, GpsFieldStatus, gpsToFixed } from '@acx-ui/rc/utils'
import { useGetVenueQuery } from '@acx-ui/rc/services'

interface ApDetailsDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  currentAP: any,
  apDetails: ApDetails
}

export const ApDetailsDrawer = (props: ApDetailsDrawerProps) => {
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const { visible, setVisible, currentAP, apDetails } = props
  const onClose = () => {
    setVisible(false)
  }

  const PropertiesTab = () => {
    return (
     <Form
       labelCol={{ span: 10 }}
       labelAlign='left'
       style={{ marginTop: '25px' }}
     >
        <Form.Item
          label={$t({ defaultMessage: 'Venue:' })}
          children={
            <TenantLink to={`/venues/${currentAP?.venueId}/venue-details/overview`}>
              {currentAP?.venueName}
            </TenantLink>
          }
        />
        <Form.Item
          label={$t({ defaultMessage: 'AP Group:' })}
          children={
            currentAP?.deviceGroupName || $t({ defaultMessage: 'None' })
          }
        />
        <Form.Item
          label={$t({ defaultMessage: 'Description:' })}
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
          label={$t({ defaultMessage: 'GPS Coordinates:' })}
          children={
            getGpsFieldStatus(apDetails.deviceGps, currentAP.venueId)
          }
        />
        <Divider/>
        <Form.Item
          label={$t({ defaultMessage: 'S/N:' })}
          children={
            currentAP?.serialNumber || '--'
          }
        />
        <Form.Item
          label={$t({ defaultMessage: 'MAC Address:' })}
          children={
            (currentAP?.apMac && (currentAP?.apMac !== currentAP?.serialNumber)) ? currentAP.apMac : '--'
          }
        />
        <Form.Item
          label={$t({ defaultMessage: 'IP Address:' })}
          children={
            currentAP?.IP || '--'
          }
        />
        <Form.Item
          label={$t({ defaultMessage: 'Ext. IP Address:' })}
          children={
            currentAP?.extIp || '--'
          }
        />
        <Form.Item
          label={$t({ defaultMessage: 'Model:' })}
          children={
            currentAP?.model || '--'
          }
        />
        <Form.Item
          label={$t({ defaultMessage: 'Type:' })}
          children={
            currentAP?.deviceModelType || '--'
          }
        />
        <Form.Item
          label={$t({ defaultMessage: 'Version:' })}
          children={
            currentAP?.fwVersion || '--'
          }
        />
        {
          currentAP?.isMeshEnable && (
            <>
             <Divider/>
              <Form.Item
                label={$t({ defaultMessage: 'Mesh Role:' })}
                children={
                  currentAP?.meshRole ? 
                  currentAP.meshRole + ' (' + currentAP.hops + ' hop)' : $t({ defaultMessage: 'AP' })
                }
              />
              { currentAP?.rootAP?.name && 
                <Form.Item
                  label={$t({ defaultMessage: 'Root AP:' })}
                  children={
                    <TenantLink to={`/devices/aps/${currentAP.rootAP.serialNumber}/details/overview`}>
                      {currentAP.rootAP.name}
                    </TenantLink>
                  }
                />
              }
              {
                currentAP?.apDownRssi && 
                <Form.Item
                  label={$t({ defaultMessage: 'Signal to previous hop:' })}
                  children={
                    currentAP?.apDownRssi
                  }
                />
              }
              {
                currentAP?.apUpRssi && 
                <Form.Item
                  label={$t({ defaultMessage: 'Signal from previous hop:' })}
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
              label={$t({ defaultMessage: 'Uptime:' })}
              children={currentAP?.uptime}
            />
            <Form.Item
              label={$t({ defaultMessage: 'Last Seen:' })}
              children={currentAP?.lastSeenTime}
            />
          </>
        }
     </Form>
    )
   }

   const getGpsFieldStatus = (deviceGps: DeviceGps, venueId: string) => {
      if (deviceGps?.latitude && deviceGps?.longitude) {
        return deviceGps.latitude+ ', ' + deviceGps.longitude
      } else if (venueId) {
        const { data } = useGetVenueQuery({ params: { tenantId, venueId } })
        const latitude = gpsToFixed(data?.address.latitude)
        const longitude = gpsToFixed(data?.address.longitude)
        return <>{ latitude + ', ' + longitude } <br/> {$t({ defaultMessage: '(As venue)' }) }</>
      } else {
        return '--'
      }
   }
   
   const SettingsTab = () => {
    return (
      <Form
        labelCol={{ span: 10 }}
        labelAlign='left'
        style={{ marginTop: '25px' }}
      >
         <Form.Item
           label={$t({ defaultMessage: 'Venue:' })}
           children={
             <TenantLink to={`/venues/${currentAP?.venueId}/venue-details/overview`}>
               {currentAP?.venueName}
             </TenantLink>
           }
         />
         <Form.Item
           label={$t({ defaultMessage: 'AP Group:' })}
           children={
             currentAP?.deviceGroupName || $t({ defaultMessage: 'None' })
           }
         />
         <Form.Item
           label={$t({ defaultMessage: 'Description:' })}
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
           label={$t({ defaultMessage: 'GPS Coordinates:' })}
           children={
             getGpsFieldStatus(apDetails.deviceGps, currentAP.venueId)
           }
         />
         <Divider/>
         <Form.Item
           label={$t({ defaultMessage: 'S/N:' })}
           children={
             currentAP?.serialNumber || '--'
           }
         />
         <Form.Item
           label={$t({ defaultMessage: 'MAC Address:' })}
           children={
             (currentAP?.apMac && (currentAP?.apMac !== currentAP?.serialNumber)) ? currentAP.apMac : '--'
           }
         />
         <Form.Item
           label={$t({ defaultMessage: 'IP Address:' })}
           children={
             currentAP?.IP || '--'
           }
         />
         <Form.Item
           label={$t({ defaultMessage: 'Ext. IP Address:' })}
           children={
             currentAP?.extIp || '--'
           }
         />
         <Form.Item
           label={$t({ defaultMessage: 'Model:' })}
           children={
             currentAP?.model || '--'
           }
         />
         <Form.Item
           label={$t({ defaultMessage: 'Type:' })}
           children={
             currentAP?.deviceModelType || '--'
           }
         />
         <Form.Item
           label={$t({ defaultMessage: 'Version:' })}
           children={
             currentAP?.fwVersion || '--'
           }
         />
         {
           currentAP?.isMeshEnable && (
             <>
              <Divider/>
               <Form.Item
                 label={$t({ defaultMessage: 'Mesh Role:' })}
                 children={
                   currentAP?.meshRole ? 
                   currentAP.meshRole + ' (' + currentAP.hops + ' hop)' : $t({ defaultMessage: 'AP' })
                 }
               />
               { currentAP?.rootAP?.name && 
                 <Form.Item
                   label={$t({ defaultMessage: 'Root AP:' })}
                   children={
                     <TenantLink to={`/devices/aps/${currentAP.rootAP.serialNumber}/details/overview`}>
                       {currentAP.rootAP.name}
                     </TenantLink>
                   }
                 />
               }
               {
                 currentAP?.apDownRssi && 
                 <Form.Item
                   label={$t({ defaultMessage: 'Signal to previous hop:' })}
                   children={
                     currentAP?.apDownRssi
                   }
                 />
               }
               {
                 currentAP?.apUpRssi && 
                 <Form.Item
                   label={$t({ defaultMessage: 'Signal from previous hop:' })}
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
               label={$t({ defaultMessage: 'Uptime:' })}
               children={currentAP?.uptime}
             />
             <Form.Item
               label={$t({ defaultMessage: 'Last Seen:' })}
               children={currentAP?.lastSeenTime}
             />
           </>
         }
      </Form>
     )
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
      children: <SettingsTab />
    }
  ]
  const content = <ContentSwitcher tabDetails={tabDetails} size='large' space={5} />

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



 
