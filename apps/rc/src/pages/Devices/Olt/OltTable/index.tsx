import { useIntl } from 'react-intl'

import { Button }                       from '@acx-ui/components'
import { OltTable as NewOltTable }      from '@acx-ui/olt/components' //TODO
import { Olt }                          from '@acx-ui/olt/utils'
import { useGetEdgeOltListQuery }       from '@acx-ui/rc/services'
import { transformDisplayNumber }       from '@acx-ui/rc/utils'
import { TenantLink }                   from '@acx-ui/react-router-dom'
import { filterByAccess }               from '@acx-ui/user'
import { TABLE_QUERY_POLLING_INTERVAL } from '@acx-ui/utils'

export default function useOltTable () {
  const { $t } = useIntl()
  const { data, isLoading, isFetching } = useGetEdgeOltListQuery({}, {
    pollingInterval: TABLE_QUERY_POLLING_INTERVAL
  })

  return {
    title: $t({ defaultMessage: 'Optical List ({count})' },
      { count: transformDisplayNumber(data?.length) }),
    headerExtra: filterByAccess([
      <TenantLink to='/devices/optical/add'
        //rbacOpsIds={[getOpsApi()]} //TODO
      >
        <Button type='primary'>{ $t({ defaultMessage: 'Add' }) }</Button>
      </TenantLink>
    ]),
    component: <NewOltTable
      data={data as unknown as Olt[]} //TODO: temp
      isLoading={isLoading}
      isFetching={isFetching}
    />
  }
}

