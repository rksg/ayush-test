import { useEffect, useState } from 'react'

import { FormattedMessage, useIntl } from 'react-intl'

import { Loader, Table, TableProps, showActionModal } from '@acx-ui/components'
import { CountAndNamesTooltip }                       from '@acx-ui/rc/components'
import {
  useDeleteSwitchPortProfileMacOuiMutation,
  useSwitchPortProfileMacOuisListQuery,
  useSwitchPortProfilesListQuery
}                     from '@acx-ui/rc/services'
import {
  MacOuis,
  SwitchPortProfiles,
  SwitchUrlsInfo,
  useTableQuery
}                                                                  from '@acx-ui/rc/utils'
import { useParams }    from '@acx-ui/react-router-dom'
import { SwitchScopes } from '@acx-ui/types'
import {
  filterByAccess,
  getUserProfile,
  hasCrossVenuesPermission,
  hasAllowedOperations,
  hasPermission
} from '@acx-ui/user'
import { getOpsApi } from '@acx-ui/utils'

import { MacOuiDrawer } from '../PortProfileForm/MacOuiDrawer'

type PortProfileMap = {
  [key: string]: string
}

export default function MacOuiTable () {
  const { $t } = useIntl()
  const params = useParams()
  const { rbacOpsApiEnabled } = getUserProfile()

  const settingsId = 'mac-ouis-table'
  const [ visible, setVisible ] = useState(false)
  const [ isEditMode, setIsEditMode ] = useState(false)
  const [ editData, setEditData ] = useState<MacOuis>()
  const [ portProfileMap, setPortProfileMap ] = useState<PortProfileMap>({})

  const defaultPayload = {
    fields: [ 'oui' ],
    Pagination: { settingsId }
  }

  const tableQuery = useTableQuery({
    useQuery: useSwitchPortProfileMacOuisListQuery,
    defaultPayload: defaultPayload,
    sorter: {
      sortField: 'oui',
      sortOrder: 'ASC'
    },
    search: {
      searchString: '',
      searchTargetFields: ['oui']
    }
  })

  const switchPortProfilesList = useSwitchPortProfilesListQuery({
    params: { tenantId: params.tenantId },
    payload: { fields: ['id'] }
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

  const [deleteSwitchPortProfileMacOui] = useDeleteSwitchPortProfileMacOuiMutation()

  const columns: TableProps<MacOuis>['columns'] = [
    {
      title: $t({ defaultMessage: 'MAC OUI' }),
      key: 'oui',
      dataIndex: 'oui',
      searchable: true,
      sorter: true,
      defaultSortOrder: 'ascend'
    },
    {
      title: $t({ defaultMessage: 'Note' }),
      key: 'note',
      dataIndex: 'note',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Profile Name' }),
      key: 'portProfiles',
      dataIndex: 'portProfiles',
      sorter: false,
      render: (_, row) => {
        return <CountAndNamesTooltip
          data={{
            count: row.portProfiles?.length || 0,
            names: row.portProfiles?.map(item => portProfileMap[item]) || [] }}
          maxShow={25}
        />
      }
    }
  ]

  const rowActions: TableProps<MacOuis>['rowActions'] = [
    {
      scopeKey: [SwitchScopes.UPDATE],
      rbacOpsIds: [getOpsApi(SwitchUrlsInfo.editSwitchPortProfileMacOui)],
      label: $t({ defaultMessage: 'Edit' }),
      visible: (selectedRows) => selectedRows.length === 1,
      onClick: (selectedRows) => {
        setEditData(selectedRows[0])
        setIsEditMode(true)
        setVisible(true)
      }
    },
    {
      scopeKey: [SwitchScopes.DELETE],
      rbacOpsIds: [getOpsApi(SwitchUrlsInfo.deleteSwitchPortProfileMacOui)],
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (rows, clearSelection) => {
        const portProfileCount = rows.filter(item => item.portProfiles).length

        if(portProfileCount > 0){
          const portProfileNames = Array.from(new Set(
            rows
              .filter(item => item.portProfiles)
              .flatMap(item => item.portProfiles?.map(profile => portProfileMap[profile]))
          )).join(', ')
          showActionModal({
            type: 'confirm',
            title: $t({ defaultMessage: 'Delete {macoui}' },
              { macoui: rows.length === 1 ?
                rows[0].oui : $t({ defaultMessage: '{count} MAC OUIs' }, { count: rows.length }) }),
            // eslint-disable-next-line max-len
            content: $t({ defaultMessage: '{count, plural, one {This MAC OUI} other {These MAC OUIs}} {count, plural, one {is} other {are}} used in the following profile(s). Delete {count, plural, one {this MAC OUI} other {them}} will result in profiles getting updated: {profilesNames}' }, {
              count: rows.length,
              profilesNames:
              <FormattedMessage
                defaultMessage='{profileNames}'
                values={{
                  profileNames: <div><br/><ul style={{ listStyleType: 'disc' }}>
                    <li>{portProfileNames}</li></ul></div>
                }} />
            }),
            okText: $t({ defaultMessage: 'Delete' }),
            cancelText: $t({ defaultMessage: 'Cancel' }),
            onOk: () => {
              Promise.all(rows.map(row =>
                deleteSwitchPortProfileMacOui({ params: { macOuiId: row.id } })))
                .then(clearSelection)
            }
          })
        }else{
          showActionModal({
            type: 'confirm',
            title: $t({ defaultMessage: 'Delete {macoui}' },
              { macoui: rows.length === 1 ?
                rows[0].oui : $t({ defaultMessage: '{count} MAC OUIs' }, { count: rows.length }) }),
            // eslint-disable-next-line max-len
            content: $t({ defaultMessage: 'Are you sure you want to delete {count, plural, one {} other {these}}?' }, { count: rows.length }),
            okText: $t({ defaultMessage: 'Delete' }),
            cancelText: $t({ defaultMessage: 'Cancel' }),
            onOk: () => {
              Promise.all(rows.map(row =>
                deleteSwitchPortProfileMacOui({ params: { macOuiId: row.id } })))
                .then(clearSelection)
            }
          })
        }
      }
    }
  ]

  const isSelectionVisible = rbacOpsApiEnabled
    ? hasAllowedOperations([
      getOpsApi(SwitchUrlsInfo.editSwitchPortProfileMacOui),
      getOpsApi(SwitchUrlsInfo.deleteSwitchPortProfileMacOui)
    ])
    : hasCrossVenuesPermission() && hasPermission({
      scopes: [SwitchScopes.UPDATE, SwitchScopes.DELETE]
    })

  const hasCreatePermission = rbacOpsApiEnabled
    ? hasAllowedOperations([ getOpsApi(SwitchUrlsInfo.addSwitchPortProfileMacOui) ])
    : hasCrossVenuesPermission() && hasPermission({ scopes: [SwitchScopes.CREATE] })

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
        actions={hasCreatePermission ? [{
          label: $t({ defaultMessage: 'Add MAC OUI' }),
          scopeKey: [SwitchScopes.CREATE],
          onClick: () => {
            setIsEditMode(false)
            setVisible(true)
          }
        }] : []}
      />

      <MacOuiDrawer
        visible={visible}
        setVisible={setVisible}
        isEdit={isEditMode}
        editData={isEditMode ? editData : undefined}
      />
    </Loader>
  )
}