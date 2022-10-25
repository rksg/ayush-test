import React from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  GridRow,
  GridCol,
  Button,
  PageHeader
} from '@acx-ui/components'
import { ClockOutlined } from '@acx-ui/icons'
import { TenantLink }    from '@acx-ui/react-router-dom'

import WifiCallingDetailContent from './WifiCallingDetailContent'
// import WifiCallingNetworks       from './WifiCallingNetworks'
import WifiCallingNetworksDetail from './WifiCallingNetworksDetail'

const WifiCallingDetailView = () => {
  const { $t } = useIntl()
  const params = useParams()

  return (
    <>
      <PageHeader
        title={`${$t({ defaultMessage: 'Wi-Fi Calling Service' })}`}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Services' }), link: '/services' }
        ]}
        extra={[
          <Button key={'last24'} icon={<ClockOutlined />}>
            {$t({ defaultMessage: 'Last 24 hours' })}
          </Button>,
          <TenantLink to={`/services/wifiCalling/${params.serviceId}/edit`} key='edit'>
            <Button key={'configure'} type={'primary'}>
              {$t({ defaultMessage: 'Configure' })}
            </Button>
          </TenantLink>
        ]}
      />

      <GridRow>
        <GridCol col={{ span: 24 }}>
          <WifiCallingDetailContent tenantId={params.tenantId as string}/>
        </GridCol>
        {/*TODO: Temporarily hidden this component until Health api is ready*/}
        {/*<GridCol col={{ span: 24 }}>*/}
        {/*  <WifiCallingNetworks tenantId={params.tenantId as string} />*/}
        {/*</GridCol>*/}
        <GridCol col={{ span: 24 }}>
          <WifiCallingNetworksDetail tenantId={params.tenantId as string}/>
        </GridCol>
      </GridRow>
    </>
  )
}

export default WifiCallingDetailView
