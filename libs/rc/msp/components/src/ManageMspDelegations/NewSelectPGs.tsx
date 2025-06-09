import { Key, useEffect, useState } from 'react'

import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import {
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import { Features, useIsSplitOn }                   from '@acx-ui/feature-toggle'
import { useGetMspEcPrivilegeGroupsPaginatedQuery } from '@acx-ui/rc/services'
import {
  defaultSort,
  PrivilegeGroup,
  sortProp,
  useTableQuery
} from '@acx-ui/rc/utils'
import { noDataDisplay } from '@acx-ui/utils'

import * as UI from './styledComponents'

interface SelectPGsProps {
  tenantId?: string
  setSelected: (selected: PrivilegeGroup[]) => void
  selected?: PrivilegeGroup[]
  data?: PrivilegeGroup[]
}

export const NewSelectPGs = (props: SelectPGsProps) => {
  const { $t } = useIntl()

  const { setSelected, selected } = props
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([])
  const [selectedRows, setSelectedRows] = useState<PrivilegeGroup[]>([])
  const usePrivilegeGrouspPaginatedAPI
      = useIsSplitOn(Features.ACX_UI_USE_PAGIATED_PRIVILEGE_GROUP_API)

  const settingsId = 'msp-delegation-pg-selection-table'

  const payload = {
    page: 0,
    pageStartZero: true,
    includeAdminAndCounts: true
  }

  const tableQuery = useTableQuery({
    useQuery: useGetMspEcPrivilegeGroupsPaginatedQuery,
    defaultPayload: payload,
    pagination: { settingsId },
    option: {
      skip: !usePrivilegeGrouspPaginatedAPI
    }
  })

  useEffect(() => {
    if (selected) {
      setSelectedRows(selected)
      setSelectedKeys(selected.map(sel => sel.id))
    }
  }, [selected])

  const getPrivilegeGroupAdmins = (row: PrivilegeGroup) => {
    return row.admins ? row.admins.map(admin => admin.email).join(', ') : noDataDisplay
  }

  const columns: TableProps<PrivilegeGroup>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      key: 'name',
      sorter: { compare: sortProp('name', defaultSort) },
      defaultSortOrder: 'ascend',
      searchable: true
    },
    {
      title: $t({ defaultMessage: 'Associated Admins' }),
      dataIndex: 'id',
      key: 'id',
      searchable: true,
      render: function (_, row) {
        return getPrivilegeGroupAdmins(row)
      }
    }
  ]

  return <Space direction='vertical'>
    <Loader states={[tableQuery]}>
      <UI.TableWrapper>
        <Table
          columns={columns}
          dataSource={tableQuery?.data?.data}
          rowKey='id'
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: selectedKeys,
            onChange (selectedRowKeys, selRows) {
              if (selectedRowKeys.length === selRows.length) {
                setSelectedRows(selRows)
                setSelected(selRows)
              }
              else {
                // On row click to deselect (i.e. clicking on row itself not checkbox) selRows is empty array
                if (selRows.length === 0) {
                  setSelectedRows([...selectedRows.filter(row =>
                    selectedRowKeys.includes(row.id))])
                  setSelected([...selectedRows.filter(row =>
                    selectedRowKeys.includes(row.id))])
                }
                // On row click to select (i.e. clicking on row itself not checkbox) selRows only has newly selected row
                else {
                  setSelectedRows([...selectedRows, ...selRows])
                  setSelected([...selectedRows, ...selRows])
                }
              }
              setSelectedKeys(selectedRowKeys)
            },
            getCheckboxProps: (record) => ({
              disabled:
            //   record.roleName === RolesEnum.DPSK_ADMIN ||
            //     (record.roleName === RolesEnum.GUEST_MANAGER && rowNotSelected(record.email)) ||
            // (selectedRoles.find((sel) => sel.id === record.id)
            //   && !SupportedDelegatedRoles.includes(selectedRoles.find((sel) =>
            //     sel.id === record.id)?.role as RolesEnum)) ||
            record.allCustomers
            })
          }}
        />
      </UI.TableWrapper>
    </Loader>
  </Space>
}
