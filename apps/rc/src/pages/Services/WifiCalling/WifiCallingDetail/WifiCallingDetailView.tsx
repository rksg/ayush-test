import { createContext, useEffect, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  GridRow,
  GridCol,
  Button,
  PageHeader
} from '@acx-ui/components'
import { useGetWifiCallingServiceQuery } from '@acx-ui/rc/services'
import {
  getServiceDetailsLink,
  getServiceListRoutePath,
  getServiceRoutePath,
  ServiceOperation,
  ServiceType,
  WifiCallingDetailContextType
} from '@acx-ui/rc/utils'
import { TenantLink }     from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'

import WifiCallingDetailContent  from './WifiCallingDetailContent'
import WifiCallingNetworksDetail from './WifiCallingNetworksDetail'

export const WifiCallingDetailContext = createContext({} as WifiCallingDetailContextType)

const WifiCallingDetailView = () => {
  const { $t } = useIntl()
  const params = useParams()
  const [networkIds, setNetworkIds] = useState([] as string[])
  const { data } = useGetWifiCallingServiceQuery({
    params: params
  })

  useEffect(() => {
    if (data && data.hasOwnProperty('networkIds')) {
      setNetworkIds(data.networkIds)
    }
  }, [data, networkIds])

  return (
    <WifiCallingDetailContext.Provider value={{
      networkIds, setNetworkIds
    }}>
      <PageHeader
        title={data?.serviceName}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          {
            text: $t({ defaultMessage: 'Wi-Fi Calling' }),
            link: getServiceRoutePath({
              type: ServiceType.WIFI_CALLING,
              oper: ServiceOperation.LIST
            })
          }
        ]}
        extra={filterByAccess([
          <TenantLink
            to={getServiceDetailsLink({
              type: ServiceType.WIFI_CALLING,
              oper: ServiceOperation.EDIT,
              serviceId: params.serviceId!
            })}
          >
            <Button key={'configure'} type={'primary'}>
              {$t({ defaultMessage: 'Configure' })}
            </Button>
          </TenantLink>
        ])}
      />

      <GridRow>
        <GridCol col={{ span: 24 }}>
          <WifiCallingDetailContent />
        </GridCol>
        <GridCol col={{ span: 24 }}>
          <WifiCallingNetworksDetail />
        </GridCol>
      </GridRow>
    </WifiCallingDetailContext.Provider>
  )
}

export default WifiCallingDetailView
