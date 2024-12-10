import { useEffect, useState } from 'react'

import { FormattedMessage, useIntl } from 'react-intl'

import { Loader, showActionModal, Table, TableProps, Tooltip } from '@acx-ui/components'
import {
  useDeleteSwitchPortProfileLldpTlvMutation,
  useSwitchPortProfileLldpTlvsListQuery,
  useSwitchPortProfilesListQuery
} from '@acx-ui/rc/services'
import {
  LldpTlvs,
  SwitchPortProfiles,
  useTableQuery
} from '@acx-ui/rc/utils'
import { useParams }                     from '@acx-ui/react-router-dom'
import { SwitchScopes }                  from '@acx-ui/types'
import { filterByAccess, hasPermission } from '@acx-ui/user'
import { LldpTlvDrawer } from '../PortProfileForm/LldpTlvDrawer'

type PortProfileMap = {
  [key: string]: string
}

export default function LldpTlvTable () {
  const { $t } = useIntl()
  const params = useParams()
  const settingsId = 'lldp--table'
  const [ portProfileMap, setPortProfileMap ] = useState<PortProfileMap>({})
  const [ visible, setVisible ] = useState(false)
  const [ isEditMode, setIsEditMode ] = useState(false)
  const [ editData, setEditData ] = useState<LldpTlvs>()

  const defaultPayload = {
    fields: [
      'id'
    ],
    Pagination: { settingsId }
  }

  const tableQuery = useTableQuery({
    useQuery: useSwitchPortProfileLldpTlvsListQuery,
    defaultPayload: defaultPayload,
    sorter: {
      sortField: 'id',
      sortOrder: 'ASC'
    }
  })

  const switchPortProfilesList = useSwitchPortProfilesListQuery({
    params: { tenantId: params.tenantId },
    payload: { fields: ['id'] },
    enableRbac: true
  })

  useEffect(() => {
    if(switchPortProfilesList.data){
      const portProfileMap: PortProfileMap = {}

      switchPortProfilesList.data.data.forEach((profile: SwitchPortProfiles) => {
        if(profile.id){
          portProfileMap[profile.id] = profile.name
        }
      })

      setPortProfileMap(portProfileMap)
    }
  }, [switchPortProfilesList])

  const [deleteSwitchPortProfileLldpTlv] = useDeleteSwitchPortProfileLldpTlvMutation()

  const columns: TableProps<LldpTlvs>['columns'] = [
    {
      title: $t({ defaultMessage: 'System Name' }),
      key: 'systemName',
      dataIndex: 'systemName',
      searchable: true,
      sorter: true,
      defaultSortOrder: 'ascend'
    },
    {
      title: $t({ defaultMessage: 'Name Match' }),
      key: 'nameMatchingType',
      dataIndex: 'nameMatchingType',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'System Description' }),
      key: 'systemDescription',
      dataIndex: 'systemDescription',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Description Match' }),
      key: 'descMatchingType',
      dataIndex: 'descMatchingType',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Profile Name' }),
      key: 'portProfiles',
      dataIndex: 'portProfiles',
      sorter: false,
      render: (_, row) => {
        return <Tooltip
          title={row.portProfiles?.map(item => portProfileMap[item]).join('\n')}
          dottedUnderline={row.portProfiles && row.portProfiles.length > 0}
        >
          {row.portProfiles ? row.portProfiles.length : 0}
        </Tooltip>
      }
    }
  ]

  const rowActions: TableProps<LldpTlvs>['rowActions'] = [
    {
      scopeKey: [SwitchScopes.UPDATE],
      visible: (selectedRows) => selectedRows.length === 1,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: (selectedRows) => {
        // navigate({
        //   ...basePath,
        //   pathname: `${basePath.pathname}/` + getPolicyDetailsLink({
        //     type: PolicyType.ETHERNET_PORT_PROFILE,
        //     oper: PolicyOperation.EDIT,
        //     policyId: selectedRows[0].id
        //   })
        // })
      }
    },
    {
      scopeKey: [SwitchScopes.DELETE],
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        const portProfileCount = rows.filter(item => item.portProfiles).length

        if(portProfileCount > 0){
          const portProfileNames = rows.filter(item => item.portProfiles).map(
            item => item.portProfiles?.map(item => portProfileMap[item])).join(', ')

          showActionModal({
            type: 'confirm',
            title: $t({ defaultMessage: 'Delete {lldptlv}' },
              { lldptlv: rows.length === 1 ?
                rows[0].systemName:
                $t({ defaultMessage: '{count} LLDP TLVs' }, { count: rows.length }) }),
            // eslint-disable-next-line max-len
            content: $t({ defaultMessage: '{count, plural, one {This} other {These}} OUIs {count, plural, one {is} other {are}} used in the following profile(s). Delete {count, plural, one {this LLDP TLV} other {them}} will result in profiles getting updated: {profilesNames}' }, {
              count: rows.length,
              profilesNames: <FormattedMessage
                defaultMessage='{profileNames}'
                values={{
                  profileNames: <div><br/><ul style={{ listStyleType: 'disc' }}>
                    <li>{portProfileNames}</li></ul></div>
                }} /> }),
            okText: $t({ defaultMessage: 'Delete' }),
            cancelText: $t({ defaultMessage: 'Cancel' }),
            onOk: () => {
              Promise.all(rows.map(row =>
                deleteSwitchPortProfileLldpTlv({ params: { lldpTlvId: row.id } })))
                .then(clearSelection)
            }
          })
        }else{
          showActionModal({
            type: 'confirm',
            title: $t({ defaultMessage: 'Delete {lldptlv}' },
              { lldptlv: rows.length === 1 ?
                rows[0].systemName:
                $t({ defaultMessage: '{count} LLDP TLVs' }, { count: rows.length }) }),
            // eslint-disable-next-line max-len
            content: $t({ defaultMessage: 'Are you sure you want to delete {count, plural, one {} other {these}}?' }, { count: rows.length }),
            okText: $t({ defaultMessage: 'Delete' }),
            cancelText: $t({ defaultMessage: 'Cancel' }),
            onOk: () => {
              Promise.all(rows.map(row =>
                deleteSwitchPortProfileLldpTlv({ params: { lldpTlvId: row.id } })))
                .then(clearSelection)
            }
          })
        }
      }
    }
  ]

  const isSelectionVisible = hasPermission({
    scopes: [SwitchScopes.UPDATE, SwitchScopes.DELETE]
  })

  return (
    <Loader states={[tableQuery]}>
      <Table
        rowKey='id'
        columns={columns}
        rowActions={filterByAccess(rowActions)}
        rowSelection={isSelectionVisible && { type: 'checkbox' }}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        onFilterChange={tableQuery.handleFilterChange}
        enableApiFilter={true}
        actions={hasPermission({ scopes: [SwitchScopes.CREATE] }) ? [{
          label: $t({ defaultMessage: 'Add LLDP TLV' }),
          scopeKey: [SwitchScopes.CREATE],
          onClick: () => {
            setIsEditMode(false)
            setVisible(true)
          }
        }] : []}
      />
      <LldpTlvDrawer
        visible={visible}
        setVisible={setVisible}
        isEdit={isEditMode}
        editData={isEditMode ? editData : undefined}
      />
    </Loader>
  )
}