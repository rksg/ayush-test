import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader, Button, DisabledButton, GridRow, Loader, GridCol } from '@acx-ui/components'
import { ClockOutlined }                                                from '@acx-ui/icons'
import { useGetPortalProfileDetailQuery }                               from '@acx-ui/rc/services'
import { Demo }                                                         from '@acx-ui/rc/utils'
import { TenantLink }                                                   from '@acx-ui/react-router-dom'
import { hasAccesses }                                                  from '@acx-ui/user'

import PortalInstancesTable from './PortalInstancesTable'
import PortalOverview       from './PortalOverview'


export default function PortalServiceDetail () {
  const { $t } = useIntl()
  const params = useParams()
  const queryResults = useGetPortalProfileDetailQuery({ params })
  return (
    <>
      <PageHeader
        title={queryResults.data?.serviceName||''}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Services' }), link: '/services' }
        ]}
        extra={hasAccesses([
          <DisabledButton key={'last24'} icon={<ClockOutlined />}>
            {$t({ defaultMessage: 'Last 24 hours' })}
          </DisabledButton>,
          <TenantLink to={`/services/portal/${queryResults.data?.id}/edit`}>
            <Button key={'configure'} type={'primary'}>
              {$t({ defaultMessage: 'Configure' })}
            </Button></TenantLink>
        ])}
      />
      <GridRow>
        <GridCol col={{ span: 24 }}>
          <Loader states={[queryResults]}>
            <PortalOverview demoValue={queryResults.data?.content as Demo} />
          </Loader>
        </GridCol>
        <GridCol col={{ span: 24 }}>
          <PortalInstancesTable/>
        </GridCol>
      </GridRow>
    </>
  )
}
