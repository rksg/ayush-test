import React, { createContext, useEffect, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  GridRow,
  GridCol,
  Button,
  PageHeader
} from '@acx-ui/components'
import { ClockOutlined }                 from '@acx-ui/icons'
import { hasAccesses }                   from '@acx-ui/user'
import { useGetWifiCallingServiceQuery } from '@acx-ui/rc/services'
import { WifiCallingDetailContextType }  from '@acx-ui/rc/utils'
import { TenantLink }                    from '@acx-ui/react-router-dom'

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
          { text: $t({ defaultMessage: 'Services' }), link: '/services' }
        ]}
        extra={hasAccesses([
          <Button key={'last24'} icon={<ClockOutlined />}>
            {$t({ defaultMessage: 'Last 24 hours' })}
          </Button>,
          <TenantLink to={`/services/wifiCalling/${params.serviceId}/edit`}>
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
