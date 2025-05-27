import { Descriptions, Subtitle }           from '@acx-ui/components'
import { getDeviceTypeIcon, getOsTypeIcon } from '@acx-ui/rc/utils'
import { TenantLink }                       from '@acx-ui/react-router-dom'
import { getIntl, noDataDisplay }           from '@acx-ui/utils'

import { useApWiredClientContext } from '../ApWiredClientContextProvider'

import * as UI from './styledComponents'

const getAuthStatus = (status: number | undefined) => {
  let authStatus = noDataDisplay as string
  const { $t } = getIntl()
  if (status === 1) {
    authStatus = $t({ defaultMessage: 'Authorized' })
  } else if (status === 0) {
    authStatus = $t({ defaultMessage: 'Unauthorized' })
  } else if (status === -1) {
    authStatus = $t({ defaultMessage: 'N/A' })
  }
  return authStatus
}

const ApWiredClientOverviewTab = () => {
  const { $t } = getIntl()

  const { clientInfo } = useApWiredClientContext()

  return (
    <>
      <Subtitle level={4}>
        {$t({ defaultMessage: 'Client Details' })}
      </Subtitle>
      <Descriptions labelWidthPercent={7}>
        <Descriptions.Item
          label={$t({ defaultMessage: 'MAC Address' })}
          children={clientInfo?.macAddress || noDataDisplay}
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'OS' })}
          children={clientInfo?.osType ? <UI.OsType size={4}>
            {getOsTypeIcon(clientInfo?.osType)}
            {clientInfo?.osType}
          </UI.OsType> : noDataDisplay}
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'Device Type' })}
          children={clientInfo?.deviceType ? <UI.IconContainer>
            {getDeviceTypeIcon(clientInfo?.deviceType)}
            {clientInfo?.deviceType}
          </UI.IconContainer> : noDataDisplay}
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'Auth Status' })}
          children={
            getAuthStatus(clientInfo?.authStatus)
          }
        />
      </Descriptions>
      <Subtitle level={4} style={{ marginTop: '2em' }}>
        {$t({ defaultMessage: 'Connection' })}
      </Subtitle>
      <Descriptions labelWidthPercent={7}>
        <Descriptions.Item
          label={$t({ defaultMessage: 'IP Address' })}
          children={clientInfo?.ipAddress || noDataDisplay}
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'AP' })}
          children={
            clientInfo?.apName && clientInfo?.apId ?
              <TenantLink to={`/devices/wifi/${clientInfo?.apId}/details/overview`}>
                {clientInfo?.apName}
              </TenantLink> :
              <span>{clientInfo?.apName || noDataDisplay}</span>
          }
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'Port' })}
          children={clientInfo?.portNumber ?
            `LAN ${clientInfo?.portNumber}` : noDataDisplay
          }
        />
        <Descriptions.Item
          label={$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
          children={
            clientInfo?.venueName && clientInfo?.venueId ?
              <TenantLink to={`/venues/${clientInfo?.venueId}/venue-details/overview`}>
                {clientInfo?.venueName}
              </TenantLink> :
              <span>{clientInfo?.venueName || noDataDisplay}</span>
          }
        />
        <Descriptions.Item
          label={$t({ defaultMessage: 'VLAN' })}
          children={clientInfo?.vlanId || noDataDisplay}
        />
      </Descriptions>
    </>)
}

export default ApWiredClientOverviewTab
