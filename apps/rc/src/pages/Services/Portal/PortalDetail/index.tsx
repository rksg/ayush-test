import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader, Button, GridRow, Loader, GridCol } from '@acx-ui/components'
import { useGetPortalProfileDetailQuery }               from '@acx-ui/rc/services'
import {
  Demo,
  getServiceDetailsLink,
  getServiceListRoutePath,
  getServiceRoutePath,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import { TenantLink }     from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'

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
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          {
            text: $t({ defaultMessage: 'Guest Portal' }),
            link: getServiceRoutePath({ type: ServiceType.PORTAL, oper: ServiceOperation.LIST })
          }
        ]}
        extra={filterByAccess([
          <TenantLink
            to={getServiceDetailsLink({
              type: ServiceType.PORTAL,
              oper: ServiceOperation.EDIT,
              serviceId: params.serviceId!
            })}
          >
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
