import { useState } from 'react'

import { useIntl } from 'react-intl'

import {
  Button,
  Table,
  TableProps,
  Loader,
  Drawer
} from '@acx-ui/components'
import { useGetSwitchAclsQuery }   from '@acx-ui/rc/services'
import { Acl, transformTitleCase } from '@acx-ui/rc/utils'
import {  useParams }              from '@acx-ui/react-router-dom'

import { AclDetail } from './aclDetail'

export function SwitchOverviewACLs () {
  const { $t } = useIntl()
  const { tenantId, switchId } = useParams()
  const { data, isLoading } = useGetSwitchAclsQuery({ params: { tenantId, switchId } })
  const [currentRow, setCurrentRow] = useState({} as Acl)
  const [drawerVisible, setDrawerVisible] = useState(false)


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
      states={[
        { isLoading }
      ]}
    >
      <Table
        columns={columns}
        type={'tall'}
        dataSource={data}
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
