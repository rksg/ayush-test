import { useRef } from 'react'

import { useIntl } from 'react-intl'

import { Button }                        from '@acx-ui/components'
import { EdgeNokiaOltTable as OltTable } from '@acx-ui/edge/components'
import { useIsSplitOn, Features }        from '@acx-ui/feature-toggle'
import { useGetEdgeOltListQuery }        from '@acx-ui/rc/services'
import { transformDisplayNumber }        from '@acx-ui/rc/utils'
import { filterByAccess }                from '@acx-ui/user'
import { TABLE_QUERY_POLLING_INTERVAL }  from '@acx-ui/utils'

export default function useEdgeNokiaOltTable () {
  const { $t } = useIntl()
  const isEdgeOltEnabled = useIsSplitOn(Features.EDGE_NOKIA_OLT_MGMT_TOGGLE)
  const oltTableRef = useRef<{ openAddDrawer: () => void }>(null)

  const { data, isLoading, isFetching } = useGetEdgeOltListQuery({}, {
    skip: !isEdgeOltEnabled,
    pollingInterval: TABLE_QUERY_POLLING_INTERVAL
  })

  const handleAddOlt = () => {
    oltTableRef.current?.openAddDrawer()
  }

  return isEdgeOltEnabled
    ? {
      title: $t({ defaultMessage: 'Optical ({count})' },
        { count: transformDisplayNumber(data?.length) }),
      headerExtra: filterByAccess([
        <Button key='add' type='primary' onClick={handleAddOlt}>
          { $t({ defaultMessage: 'Add' }) }
        </Button>
      ]),
      component: <OltTable
        ref={oltTableRef}
        data={data}
        isLoading={isLoading}
        isFetching={isFetching}
      />
    }
    : undefined
}