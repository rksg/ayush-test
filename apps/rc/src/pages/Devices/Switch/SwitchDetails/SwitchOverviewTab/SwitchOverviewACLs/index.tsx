import { useState } from 'react'

import { useIntl } from 'react-intl'

import {
  Button,
  Table,
  TableProps,
  Loader,
  Drawer
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { useGetSwitchAclsQuery }  from '@acx-ui/rc/services'
import {
  Acl,
  AclTypeEnum,
  SwitchViewModel,
  transformIPv6,
  transformTitleCase
} from '@acx-ui/rc/utils'
import { useTableQuery } from '@acx-ui/utils'

import { AclDetail } from './aclDetail'

export function SwitchOverviewACLs (props: {
  switchDetail?: SwitchViewModel
}) {
  const { $t } = useIntl()
  const { switchDetail } = props
  const [currentRow, setCurrentRow] = useState({} as Acl)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)

  const tableQuery = useTableQuery({
    useQuery: useGetSwitchAclsQuery,
    defaultPayload: {},
    enableRbac: isSwitchRbacEnabled,
    apiParams: { venueId: (switchDetail?.venueId || '') as string },
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
      render: (_, row) =>
        <Button
          type='link'
          size='small'
          onClick={() => {
            setCurrentRow(row)
            setDrawerVisible(true)
          }}
        >
          {row.name}
        </Button>
    },
    {
      key: 'aclType',
      title: $t({ defaultMessage: 'ACL Type' }),
      dataIndex: 'aclType',
      sorter: true,
      render: (_, { aclType }) => aclType === AclTypeEnum.IPv6
        ? transformIPv6(aclType)
        : transformTitleCase(aclType)
    }
  ]
  return (
    <Loader
      states={[tableQuery]}
    >
      <Table
        columns={columns}
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
        children={
          <AclDetail
            row={currentRow}
          />
        }
      />

    </Loader>
  )
}
