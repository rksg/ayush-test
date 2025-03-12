import { createContext, useEffect, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  GridRow,
  GridCol,
  Button,
  PageHeader
} from '@acx-ui/components'
import { Features, useIsSplitOn }                                               from '@acx-ui/feature-toggle'
import { useGetWifiCallingServiceQuery, useGetWifiCallingServiceTemplateQuery } from '@acx-ui/rc/services'
import {
  filterByAccessForServicePolicyMutation,
  getScopeKeyByService,
  ServiceOperation,
  ServiceType, useConfigTemplateQueryFnSwitcher,
  useServiceListBreadcrumb,
  WifiCallingDetailContextType,
  useTemplateAwareServiceAllowedOperation
} from '@acx-ui/rc/utils'

import { ServiceConfigTemplateLinkSwitcher } from '../../../configTemplates'

import WifiCallingDetailContent  from './WifiCallingDetailContent'
import WifiCallingNetworksDetail from './WifiCallingNetworksDetail'

export const WifiCallingDetailContext = createContext({} as WifiCallingDetailContextType)

export const WifiCallingDetailView = () => {
  const { $t } = useIntl()
  const params = useParams()
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const [networkIds, setNetworkIds] = useState([] as string[])
  const { data } = useConfigTemplateQueryFnSwitcher({
    useQueryFn: useGetWifiCallingServiceQuery,
    useTemplateQueryFn: useGetWifiCallingServiceTemplateQuery,
    enableRbac
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
        extra={filterByAccessForServicePolicyMutation([
          <ServiceConfigTemplateLinkSwitcher
            // eslint-disable-next-line max-len
            rbacOpsIds={useTemplateAwareServiceAllowedOperation(ServiceType.WIFI_CALLING, ServiceOperation.EDIT)}
            scopeKey={getScopeKeyByService(ServiceType.WIFI_CALLING, ServiceOperation.EDIT)}
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
