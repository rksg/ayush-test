import { useState } from 'react'

import { useIntl } from 'react-intl'

import {
  Button,
  Table,
  TableProps,
  Loader,
  Drawer
} from '@acx-ui/components'
import { useGetSwitchAclsQuery }                  from '@acx-ui/rc/services'
import { Acl, transformTitleCase, useTableQuery } from '@acx-ui/rc/utils'

import { AclDetail } from './aclDetail'

export function SwitchOverviewACLs () {
  const { $t } = useIntl()
  const [currentRow, setCurrentRow] = useState({} as Acl)
  const [drawerVisible, setDrawerVisible] = useState(false)

  const tableQuery = useTableQuery({
    useQuery: useGetSwitchAclsQuery,
    defaultPayload: {},
    sorter: {
      sortField: 'name',
      sortOrder: 'ASC'
    }
  })


  const onClose = () => {
    setDrawerVisible(false)
  }

  const columns: TableProps<Acl>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'ACL Name' }),
      dataIndex: 'name',
      defaultSortOrder: 'ascend',
      sorter: true,
      fixed: 'left',
      render: (data, row) =>
        <Button
          type='link'
          size='small'
          onClick={() => {
            setCurrentRow(row)
            setDrawerVisible(true)
          }}
        >
          {data}
        </Button>
    },
    {
      key: 'aclType',
      title: $t({ defaultMessage: 'ACL Type' }),
      dataIndex: 'aclType',
      sorter: true,
      render: (data) => transformTitleCase(data as string)
    }
  ]
  return (
    <Loader
      states={[tableQuery]}
    >
      <Table
        columns={columns}
        columnState={{ hidden: true }}
        type={'tall'}
        onChange={tableQuery.handleTableChange}
        pagination={tableQuery.pagination}
        dataSource={tableQuery.data?.data}
        rowKey='id'
      />

      <Drawer
        title={$t({ defaultMessage: 'View ACL' })}
        visible={drawerVisible}
        onClose={onClose}
        width={443}
        mask={false}
        children={
          <AclDetail
            row={currentRow}
          />
        }
      />

    </Loader>
  )
}
