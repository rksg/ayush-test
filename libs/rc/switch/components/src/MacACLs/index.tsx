import { useState } from 'react'

import { useIntl } from 'react-intl'

import {
  Button,
  Table,
  TableProps,
  Loader,
  Drawer
} from '@acx-ui/components'
import { Features, useIsSplitOn }   from '@acx-ui/feature-toggle'
import { useGetSwitchMacAclsQuery } from '@acx-ui/rc/services'
import {
  Acl,
  MacAcl,
  SwitchRbacUrlsInfo,
  SwitchViewModel,
  useTableQuery
} from '@acx-ui/rc/utils'
import { SwitchScopes }   from '@acx-ui/types'
import { filterByAccess } from '@acx-ui/user'
import { getOpsApi }      from '@acx-ui/utils'

import { AclDetail }    from './macACLDetail'
import { MacACLDrawer } from './macACLDrawer'

export function MacACLs (props: {
  switchDetail?: SwitchViewModel
}) {
  const { $t } = useIntl()
  const { switchDetail } = props
  const [currentRow, setCurrentRow] = useState({} as MacAcl)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const [macACLData, setMacACLData] = useState({} as unknown as MacAcl)
  const [editMode, setEditMode] = useState(false)
  const [macAClsDrawerVisible, setMacAClsDrawerVisible] = useState(false)

  const tableQuery = useTableQuery({
    useQuery: useGetSwitchMacAclsQuery,
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

  const columns: TableProps<MacAcl>['columns'] = [
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
    }
  ]


  const tableActions = [{
    label: $t({ defaultMessage: 'Add MAC ACL' }),
    scopeKey: [SwitchScopes.CREATE],
    rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.addSwitchVlans)],
    onClick: () => {
      setEditMode(false)
      setMacACLData({} as Acl)
      setMacAClsDrawerVisible(true)
    }
  }]

  return (
    <Loader
      states={[tableQuery]}
    >
      <Table
        rowKey='id'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        columns={columns as any}
        type={'tall'}
        onChange={tableQuery.handleTableChange}
        pagination={tableQuery.pagination}
        dataSource={tableQuery.data?.data}
        actions={filterByAccess(tableActions)}
      />

      <Drawer
        title={$t({ defaultMessage: 'View ACL' })}
        visible={drawerVisible}
        onClose={onClose}
        children={
          <AclDetail
            row={currentRow}
          />
        }
      />

      {macAClsDrawerVisible && <MacACLDrawer
        visible={macAClsDrawerVisible}
        setVisible={setMacAClsDrawerVisible}
        isEditMode={editMode}
        macACLData={macACLData}
      />}

    </Loader>
  )
}
