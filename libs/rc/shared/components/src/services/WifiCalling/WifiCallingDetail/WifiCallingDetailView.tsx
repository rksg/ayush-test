import { createContext, useEffect, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  GridRow,
  GridCol,
  Button,
  PageHeader
} from '@acx-ui/components'
import { useGetWifiCallingServiceQuery, useGetWifiCallingServiceTemplateQuery } from '@acx-ui/rc/services'
import {
  getServiceDetailsLink,
  ServiceOperation,
  ServiceType, useConfigTemplateQueryFnSwitcher, useServiceListBreadcrumb,
  WifiCallingDetailContextType
} from '@acx-ui/rc/utils'
import { TenantLink }     from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'

import WifiCallingDetailContent  from './WifiCallingDetailContent'
import WifiCallingNetworksDetail from './WifiCallingNetworksDetail'

export const WifiCallingDetailContext = createContext({} as WifiCallingDetailContextType)

export const WifiCallingDetailView = () => {
  const { $t } = useIntl()
  const params = useParams()
  const [networkIds, setNetworkIds] = useState([] as string[])
  const { data } = useConfigTemplateQueryFnSwitcher(
    useGetWifiCallingServiceQuery, useGetWifiCallingServiceTemplateQuery
  )

  const breadcrumb = useServiceListBreadcrumb(ServiceType.WIFI_CALLING)

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
        breadcrumb={breadcrumb}
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
