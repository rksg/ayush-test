import { useEffect, useMemo, useState } from 'react'

import { useIntl } from 'react-intl'

import {
  TableProps,
  ProgressBarV2
} from '@acx-ui/components'
import { OltOnt } from '@acx-ui/olt/utils'

import { GreenPercentageBar, StyledTable, ProgressWrapper } from './styledComponents'

interface OntTableProps {
  data: OltOnt[] | undefined
  selectedOnt?: OltOnt
  setSelectedOnt: (onu?: OltOnt) => void
}

export function OntTable (props: OntTableProps) {
  const { $t } = useIntl()
  const { data, selectedOnt, setSelectedOnt } = props
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })

  const pagedData = useMemo(() => {
    return data?.slice(
      (pagination.current - 1) * pagination.pageSize,
      pagination.current * pagination.pageSize
    )
  }, [data, pagination])

  useEffect(() => {
    if (pagedData && pagedData.length > 0) {
      setSelectedOnt(pagedData[0])
      // setSelectedRowKeys(pagedData[0].id)
    }
  }, [pagedData])

  return <StyledTable
    rowKey='name'
    columns={useColumns(props)}
    tableAlertRender={false}
    stickyHeaders={false}
    enableResizableColumn={false}
    enableSettingsColumn={false}
    enableClearFilters={false}
    searchableWidth={250}
    searchPlaceholder={$t({ defaultMessage: 'Search ONT' })}
    pagination={{
      defaultPageSize: 10,
      showSizeChanger: false,
      onChange: (page: number, pageSize: number) => setPagination({ current: page, pageSize })
    }}
    dataSource={data}
    rowClassName={(record: OltOnt) =>
      record.id === selectedOnt?.id ? 'selected-row' : ''
    }
    onRow={(record: OltOnt) => ({
      onClick: () => setSelectedOnt(record)
    })}
  />
}

function useColumns (props: OntTableProps) {
  const { $t } = useIntl()
  const { data } = props

  const columns: TableProps<OltOnt>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'ONT Name ({count})' }, { count: data?.length || 0 }),
      dataIndex: 'name',
      searchable: true,
      sorter: true
    },
    {
      key: 'ports',
      title: $t({ defaultMessage: 'Ports' }),
      dataIndex: 'ports',
      align: 'right',
      width: 70,
      render: (_, row) =>
        <ProgressWrapper>
          <GreenPercentageBar>
            <ProgressBarV2
              strokeWidth={8}
              percent={(row.usedPorts/row.ports) * 100}
            />
          </GreenPercentageBar>
          <span>{row.usedPorts}/{row.ports}</span>
        </ProgressWrapper>
    }
  ]

  return columns
}