import { useIntl } from 'react-intl'
import { ContentSwitcher, ContentSwitcherProps, Drawer }                  from '@acx-ui/components'
import { Divider, Form } from 'antd'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'
import * as UI from './styledComponents'
import { DeviceGps, GpsFieldStatus } from '@acx-ui/rc/utils'

interface ApDetailsDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  currentAP: any
}

export const ApDetailsDrawer = (props: ApDetailsDrawerProps) => {
  const { $t } = useIntl()
  const { visible, setVisible, currentAP } = props
  const { venueId } = useParams()
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
            </TenantLink>}
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
            currentAP?.description || $t({ defaultMessage: 'None' })
          }
        />
        {/* <Form.Item
          label={$t({ defaultMessage: 'Tags:' })}
          children={
            currentAP?.tags || '--'
          }
        /> */}
        <Form.Item
          label={$t({ defaultMessage: 'GPS Coordinates:' })}
          children={
            getGpsFieldStatus(currentAP.deviceGps, venueId as string)
          }
        />
        <Divider/>
     </Form>
    )
   }
   
   const SettingsTab = () => {
     return (
       <>SettingsTab</>
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

const getGpsFieldStatus = (deviceGps: DeviceGps, venueId: string) => {
  let gpsFieldStatus // TODO: check apDetails
  if (deviceGps?.latitude && deviceGps?.longitude) {
    gpsFieldStatus = GpsFieldStatus.MANUAL
    return deviceGps.latitude+ ', ' + deviceGps.longitude
  } else if (venueId) {
    gpsFieldStatus = GpsFieldStatus.FROM_VENUE
    // TODO: getVenueQuery rc-ui: applyVenueGpsCoordinates()
    return '(As venue)'
  } else {
    gpsFieldStatus = GpsFieldStatus.INITIAL
    return '--'
  }
}

 
