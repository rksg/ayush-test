import { useParams } from 'react-router-dom'

import { ApTable }              from '@acx-ui/rc/components'
import { useApGroupsListQuery } from '@acx-ui/rc/services'


export function NetworkApsTab () {
  const { tenantId } = useParams()

  const { apgroupFilterOptions } = useApGroupsListQuery(
    {
      params: { tenantId },
      payload: {
        fields: ['name', 'id'],
        pageSize: 10000,
        sortField: 'name',
        sortOrder: 'ASC',
        filters: { isDefault: [false] }
      }
    },
    {
      selectFromResult: ({ data }) => ({
        apgroupFilterOptions: data?.data.map((v) => ({ key: v.id, value: v.name })) || true
      })
    }
  )

  return (
    <ApTable
      searchable={true}
      enableGroups={false}
      filterables={{
        deviceGroupId: apgroupFilterOptions
      }}
    />
  )
}
