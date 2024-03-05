import { useIntl } from 'react-intl'

import { Button, Loader, PageHeader }         from '@acx-ui/components'
import { useGetEdgeSdLanP2ViewDataListQuery } from '@acx-ui/rc/services'
import {
  ServiceOperation,
  ServiceType,
  getServiceDetailsLink,
  getServiceListRoutePath,
  getServiceRoutePath
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'
import { filterByAccess }        from '@acx-ui/user'

import { DcSdLanDetailContent }  from './DcSdLanDetailContent'
import { DmzSdLanDetailContent } from './DmzSdLanDetailContent'

const EdgeSdLanDetail = () => {
  const { $t } = useIntl()
  const params = useParams()
  const { edgeSdLanData, isLoading, isFetching } = useGetEdgeSdLanP2ViewDataListQuery(
    { payload: {
      filters: { id: [params.serviceId] }
    } },
    {
      selectFromResult: ({ data, isLoading, isFetching, isUninitialized }) => ({
        edgeSdLanData: data?.data?.[0],
        isLoading: isUninitialized || isLoading,
        isFetching
      })
    }
  )

  const isDMZEnabled = edgeSdLanData?.isGuestTunnelEnabled

  return (
    <>
      <PageHeader
        title={edgeSdLanData?.name}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          {
            text: $t({ defaultMessage: 'SD-LAN' }),
            link: getServiceRoutePath({
              type: ServiceType.EDGE_SD_LAN_P2,
              oper: ServiceOperation.LIST
            })
          }
        ]}
        extra={filterByAccess([
          <TenantLink to={getServiceDetailsLink({
            type: ServiceType.EDGE_SD_LAN_P2,
            oper: ServiceOperation.EDIT,
            serviceId: params.serviceId!
          })}>
            <Button type='primary'>{$t({ defaultMessage: 'Configure' })}</Button>
          </TenantLink>
        ])}
      />
      <Loader states={[{
        isLoading: isLoading,
        isFetching: isFetching
      }]}>
        {isDMZEnabled
          ? <DmzSdLanDetailContent data={edgeSdLanData} />
          : <DcSdLanDetailContent data={edgeSdLanData} />
        }
      </Loader>
    </>
  )
}

export default EdgeSdLanDetail
