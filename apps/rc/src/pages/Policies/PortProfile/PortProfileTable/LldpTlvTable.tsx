import { useIntl } from 'react-intl'

import { Loader, Table, TableProps, showActionModal, Tooltip } from '@acx-ui/components'
import {
  useDeleteEthernetPortProfileMutation,
  useSwitchPortProfileLldpTlvsListQuery,
  useSwitchPortProfilesListQuery
}                     from '@acx-ui/rc/services'
import {
  EthernetPortProfileViewData,
  getEthernetPortTypeString,
  getPolicyDetailsLink,
  LldpTlvs,
  MacOuis,
  PolicyOperation,
  PolicyType,
  SwitchPortProfiles,
  useTableQuery
}                                                                  from '@acx-ui/rc/utils'
import { Path, TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { SwitchScopes }                                              from '@acx-ui/types'
import { filterByAccess, hasPermission }                           from '@acx-ui/user'
import { Pagination } from 'antd'
import { useEffect, useState } from 'react'

type PortProfileMap = {
  [key: string]: string
}

export default function MacOuiTable () {
  const { $t } = useIntl()
  const params = useParams()
  const basePath: Path = useTenantLink('')
  const navigate = useNavigate()
  const settingsId = 'mac-ouis-table'
  const [ portProfileMap, setPortProfileMap ] = useState<PortProfileMap>({})

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

  const [deleteEthernetPortProfile] = useDeleteEthernetPortProfileMutation()

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
      // Default Ethernet Port Profile cannot Edit
      visible: (selectedRows) => selectedRows.length === 1
            && !selectedRows[0].id,
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
      // Default Ethernet Port Profile cannot Delete
      visible: (selectedRows) => {
        return !selectedRows.some(row => row.id)
      },
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        // showActionModal({
        //   type: 'confirm',
        //   customContent: {
        //     action: 'DELETE',
        //     entityName: $t({ defaultMessage: 'Profile' }),
        //     entityValue: rows.length === 1 ? rows[0].name : undefined,
        //     numOfEntities: rows.length
        //   },
        //   onOk: () => {
        //     Promise.all(rows.map(row => deleteEthernetPortProfile({ params: { id: row.id } })))
        //       .then(clearSelection)
        //   }
        // })
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
      />
    </Loader>
  )
}