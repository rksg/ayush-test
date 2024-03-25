/* eslint-disable max-len */
import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Loader, Table, TableProps, Button } from '@acx-ui/components'
import {
  useActivityApCompatibilitiesQuery
} from '@acx-ui/rc/services'
import {
  ActivityApCompatibilityExtraParams,
  ActivityIncompatibleFeatures,
  useTableQuery
} from '@acx-ui/rc/utils'
import { RequestPayload } from '@acx-ui/types'

import { TableStyleWrapper } from '../styledComponents'

interface ActivityApCompatibilityTableProps {
  requestId: string,
  updateActivityDesc: (description: string) => void
}

export const ActivityApCompatibilityTable = ({
  requestId,
  updateActivityDesc
}: ActivityApCompatibilityTableProps) => {
  const { $t } = useIntl()
  const [visible, setVisible] = useState(true)
  const tableQuery = useTableQuery<ActivityIncompatibleFeatures, RequestPayload<unknown>, ActivityApCompatibilityExtraParams>({
    useQuery: useActivityApCompatibilitiesQuery,
    defaultPayload: { pageSize: 10 },
    apiParams: { activityId: requestId }
  })

  useEffect(() => {
    setVisible(true)
    updateActivityDesc('')
  },[requestId])

  useEffect(() => {
    if (tableQuery.data?.data) {
      const count = tableQuery.data?.totalCount ?? 0
      let incompatibleCount = tableQuery.data?.extra?.incompatibleCount ?? count
      if (incompatibleCount === 0) {
        incompatibleCount = count
      }
      if (count !== 0) {
        const percent = Math.round(incompatibleCount / count * 100 )
        setVisible(true)
        updateActivityDesc(`(${incompatibleCount}/${count} devices, ${percent}%)`)
      } else if (count === 0) setVisible(false)
    } else setVisible(false)
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

  return (<TableStyleWrapper>
    <Button
      type='link'
      data-testid='showBtn'
      style={{ marginTop: '12px', fontSize: '13px' }}
      onClick={() => {
        setVisible(!visible)
      }}>
      {visible ? $t({ defaultMessage: 'Hide incompatible report' }) : $t({ defaultMessage: 'See incompatible report' })}
    </Button>
    {visible && <Loader states={[tableQuery]}>
      <Table<ActivityIncompatibleFeatures>
        type='form'
        className='ActivityApCompatibilityTable'
        rowKey='id'
        columns={columns}
        dataSource={tableQuery.data?.data}
        pagination={{ ...tableQuery.pagination, showSizeChanger: false }}
        onChange={tableQuery.handleTableChange}
        enableApiFilter={false}
        enablePagination
      />
    </Loader>}
  </TableStyleWrapper>)
}