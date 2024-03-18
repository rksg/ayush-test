/* eslint-disable max-len */
import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, Table, TableProps }  from '@acx-ui/components'
import {
  useActivityApCompatibilitiesQuery
} from '@acx-ui/rc/services'
import {
  ActivityApCompatibilityExtraParams,
  ActivityIncompatibleFeatures,
  useTableQuery
} from '@acx-ui/rc/utils'
import { RequestPayload } from '@acx-ui/types'

interface ActivityApCompatibilityTableProps {
  requestId: string,
  updateActivityDesc: (description: string) => void
}

export const ActivityApCompatibilityTable = ({
  requestId,
  updateActivityDesc
}: ActivityApCompatibilityTableProps) => {
  const { $t } = useIntl()
  const [totalCount, setTotalCount] = useState(-1)
  const tableQuery = useTableQuery<ActivityIncompatibleFeatures, RequestPayload<unknown>, ActivityApCompatibilityExtraParams>({
    useQuery: useActivityApCompatibilitiesQuery,
    defaultPayload: { pageSize: 10 },
    apiParams: { activityId: requestId }
  })

  useEffect(() => {
    if (tableQuery.data?.data) {
      if (totalCount === -1) {
        const count = tableQuery.data?.totalCount ?? 0
        let incompatibleCount = tableQuery.data?.extra?.incompatibleCount ?? count
        if (incompatibleCount === 0) {
          incompatibleCount = count
        }
        setTotalCount(count)
        if (count !== 0) {
          const percent = Math.round(incompatibleCount / count )
          updateActivityDesc(`(${incompatibleCount}/(${count} devices, ${percent}%)`)
        }
      }
    }
  },[tableQuery.data?.data])

  const columns: TableProps<ActivityIncompatibleFeatures>['columns'] = [
    {
      key: 'name',
      width: 135,
      title: $t({ defaultMessage: 'Device Name' }),
      dataIndex: 'name',
      sorter: false,
      fixed: 'left'
    },
    {
      key: 'incompatibleFeatures',
      title: $t({ defaultMessage: 'Incompatible Features' }),
      dataIndex: 'incompatibleFeatures',
      sorter: false,
      render: function (_, row) {
        return row.incompatibleFeatures && row.incompatibleFeatures.join(', ')
      }
    }
  ]

  return <Loader states={[tableQuery]}>
    <Table<ActivityIncompatibleFeatures>
      settingsId='ActivityApCompatibilityTable'
      rowKey='id'
      columns={columns}
      dataSource={tableQuery?.data?.data}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
      enableApiFilter={false}
    />
  </Loader>
}