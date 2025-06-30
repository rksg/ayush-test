import { Key, useEffect, useState } from 'react'

import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import {
  Table,
  TableProps
} from '@acx-ui/components'
import {
  defaultSort,
  PrivilegeGroup,
  sortProp
} from '@acx-ui/rc/utils'
import { noDataDisplay } from '@acx-ui/utils'

import * as UI from './styledComponents'

interface SelectPGsProps {
  tenantId?: string
  setSelected: (selected: PrivilegeGroup[]) => void
  selected?: PrivilegeGroup[]
  data?: PrivilegeGroup[]
}

export const SelectPGs = (props: SelectPGsProps) => {
  const { $t } = useIntl()

  const { setSelected, selected, data } = props
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([])
  const [selectedRows, setSelectedRows] = useState<PrivilegeGroup[]>([])

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
    <UI.TableWrapper>
      <Table
        columns={columns}
        dataSource={data}
        rowKey='id'
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
  </Space>
}
