/* eslint-disable max-len */
import { useEffect, useState } from 'react'

import { Row , Col } from 'antd'
import { useIntl }   from 'react-intl'

import { Loader, Table, TableProps, Button } from '@acx-ui/components'
import {
  useActivityApCompatibilitiesQuery
} from '@acx-ui/rc/services'
import {
  ActivityApCompatibilityExtraParams,
  ActivityIncompatibleFeatures
} from '@acx-ui/rc/utils'
import { RequestPayload } from '@acx-ui/types'
import { useTableQuery }  from '@acx-ui/utils'

import * as UI from '../styledComponents'

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
  const [hidden, setHidden] = useState(false)
  const [incompatibleCount, setIncompatibleCount] = useState(0)
  const tableQuery = useTableQuery<ActivityIncompatibleFeatures, RequestPayload<unknown>, ActivityApCompatibilityExtraParams>({
    useQuery: useActivityApCompatibilitiesQuery,
    defaultPayload: { pageSize: 10 },
    apiParams: { activityId: requestId }
  })

  useEffect(() => {
    setVisible(false)
    setHidden(false)
    setIncompatibleCount(0)
    updateActivityDesc('')
  },[requestId])

  useEffect(() => {
    if (tableQuery.data?.data) {
      const count = tableQuery.data?.totalCount ?? 0
      const impactedCount = tableQuery.data?.extra?.impactedCount ?? count
      setIncompatibleCount(count)

      if (count !== 0) {
        let percent = 0
        const compatibiliyCount = impactedCount - count
        if (compatibiliyCount !== 0 && impactedCount !== 0) {
          percent = Math.round(compatibiliyCount / impactedCount * 100 )
        }
        setVisible(true)
        updateActivityDesc(`(${compatibiliyCount} / ${impactedCount} devices, ${percent}%)`)
      } else if (count === 0) {
        setVisible(false)
        setHidden(true)
        if (impactedCount !== 0) {
          updateActivityDesc(`(${impactedCount} / ${impactedCount} devices, 100%)`)
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

  return (<UI.TableStyleWrapper>
    {!hidden &&
    <UI.RowStyleWrapper>
      <Row align='middle' >
        <Col span={12}>
          <Button
            type='link'
            data-testid='showBtn'
            style={{ marginTop: '12px', fontSize: '13px' }}
            onClick={() => {
              setVisible(!visible)
            }}>
            {visible ? $t({ defaultMessage: 'Hide incompatible report' }) : $t({ defaultMessage: 'See incompatible report' })}
          </Button>
        </Col>
        <UI.RowRightStyleWrapper>
          <UI.TotalStyleWrapper>
            {$t({ defaultMessage: 'Total' })}: {incompatibleCount}
          </UI.TotalStyleWrapper>
        </UI.RowRightStyleWrapper>
      </Row>
    </UI.RowStyleWrapper>}
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
  </UI.TableStyleWrapper>)
}