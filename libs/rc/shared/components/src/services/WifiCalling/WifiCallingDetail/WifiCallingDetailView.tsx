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
  ServiceOperation,
  ServiceType, useConfigTemplateQueryFnSwitcher, useServiceListBreadcrumb,
  WifiCallingDetailContextType
} from '@acx-ui/rc/utils'
import { WifiScopes }     from '@acx-ui/types'
import { filterByAccess } from '@acx-ui/user'

import { ServiceConfigTemplateLinkSwitcher } from '../../../configTemplates'

import WifiCallingDetailContent  from './WifiCallingDetailContent'
import WifiCallingNetworksDetail from './WifiCallingNetworksDetail'

export const WifiCallingDetailContext = createContext({} as WifiCallingDetailContextType)

export const WifiCallingDetailView = () => {
  const { $t } = useIntl()
  const params = useParams()
  const [networkIds, setNetworkIds] = useState([] as string[])
  const { data } = useConfigTemplateQueryFnSwitcher({
    useQueryFn: useGetWifiCallingServiceQuery,
    useTemplateQueryFn: useGetWifiCallingServiceTemplateQuery
  })

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
          <ServiceConfigTemplateLinkSwitcher
            scopeKey={[WifiScopes.UPDATE]}
            type={ServiceType.WIFI_CALLING}
            oper={ServiceOperation.EDIT}
            serviceId={params.serviceId!}
            children={
              <Button key={'configure'} type={'primary'}>
                {$t({ defaultMessage: 'Configure' })}
              </Button>
            }
          />
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
