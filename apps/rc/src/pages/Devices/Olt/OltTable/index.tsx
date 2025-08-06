import { useIntl } from 'react-intl'

import { Button }                 from '@acx-ui/components'
import { OltTable }               from '@acx-ui/olt/components'
import { Olt }                    from '@acx-ui/olt/utils'
import { transformDisplayNumber } from '@acx-ui/rc/utils'
import { TenantLink }             from '@acx-ui/react-router-dom'
import { filterByAccess }         from '@acx-ui/user'

import { oltList } from '../mockdata'

export default function useOltTable () {
  const { $t } = useIntl()
  const data = oltList as Olt[] //TODO: temp, remove when api is ready

  return {
    title: $t({ defaultMessage: 'Optical List ({count})' },
      { count: transformDisplayNumber(data?.length) }),
    headerExtra: filterByAccess([
      <TenantLink
        to='/devices/optical/add'
        //rbacOpsIds={[getOpsApi()]}
      >
        <Button type='primary'>{ $t({ defaultMessage: 'Add' }) }</Button>
      </TenantLink>
    ]),
    component: <OltTable
      data={data}
      isLoading={false} //TODO: replace with actual loading state
      isFetching={false}
    />
  }
}

