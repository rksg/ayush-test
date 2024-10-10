import { Key, useEffect, useState } from 'react'

import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import {
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import {
  MspAdministrator
} from '@acx-ui/msp/utils'
import {
  defaultSort,
  sortProp
} from '@acx-ui/rc/utils'
import { useParams }                                  from '@acx-ui/react-router-dom'
import { RolesEnum }                                  from '@acx-ui/types'
import { PrivilegeGroup, useGetPrivilegeGroupsQuery } from '@acx-ui/user'

import * as UI from './styledComponents'

import { SystemRoles } from '.'

interface SelectPGsProps {
  tenantId?: string
  setSelected?: (selected: PrivilegeGroup[]) => void
}

export const SelectPGs = (props: SelectPGsProps) => {
  const { $t } = useIntl()
  const params = useParams()

  const { setSelected } = props
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([])
  const [selectedRows, setSelectedRows] = useState<PrivilegeGroup[]>([])
  const [privilegeGroupData, setPrivilegeGroupData] = useState([] as PrivilegeGroup[])

  const { data: privilegeGroupList, isLoading, isFetching }
    = useGetPrivilegeGroupsQuery({ params })

  useEffect(() => {
    if (privilegeGroupList) {
      const pgs = privilegeGroupList?.filter(pg =>
        !SystemRoles.includes(pg.name as RolesEnum))
      setPrivilegeGroupData(pgs ?? [])
    }
  }, [privilegeGroupList])

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
      sorter: { compare: sortProp('id', defaultSort) },
      searchable: true
    }
  ]

  return <Space direction='vertical'>
    <Loader states={[
      { isLoading: isLoading,
        isFetching: isFetching
      }
    ]}>
      <UI.TableWrapper>
        <Table
          columns={columns}
          dataSource={privilegeGroupData}
          rowKey='id'
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: selectedKeys,
            onChange (selectedRowKeys, selRows) {
              setSelectedRows(selRows)
            }
          }}
        />
      </UI.TableWrapper>
    </Loader>
  </Space>
}
