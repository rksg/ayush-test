import { useState } from 'react'

import { MutationTrigger }    from '@reduxjs/toolkit/dist/query/react/buildHooks'
import { MutationDefinition } from '@reduxjs/toolkit/query'
import moment                 from 'moment'
import { useIntl }            from 'react-intl'


import {
  Table,
  TableProps,
  Loader,
  showActionModal,
  Button
} from '@acx-ui/components'
import { DateFormatEnum, userDateTimeFormat } from '@acx-ui/formatter'
import {
  renderConfigTemplateDetailsComponent
} from '@acx-ui/rc/components'
import {
  useDeleteDpskTemplateMutation,
  useDeleteAAAPolicyTemplateMutation,
  useDeleteNetworkTemplateMutation,
  useDeleteVenueTemplateMutation,
  useGetConfigTemplateListQuery,
  useDeleteDhcpTemplateMutation, useDeleteAccessControlProfileTemplateMutation
} from '@acx-ui/rc/services'
import {
  useTableQuery,
  ConfigTemplate,
  ConfigTemplateType,
  getConfigTemplateEditPath
} from '@acx-ui/rc/utils'
import { useLocation, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess }               from '@acx-ui/user'

import { AppliedToTenantDrawer }   from './AppliedToTenantDrawer'
import { ApplyTemplateDrawer }     from './ApplyTemplateDrawer'
import { useAddTemplateMenuProps } from './useAddTemplateMenuProps'

export function ConfigTemplateList () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const location = useLocation()
  const [ applyTemplateDrawerVisible, setApplyTemplateDrawerVisible ] = useState(false)
  const [ appliedToTenantDrawerVisible, setAppliedToTenantDrawerVisible ] = useState(false)
  const [ selectedTemplates, setSelectedTemplates ] = useState<ConfigTemplate[]>([])
  const deleteMutationMap = useDeleteMutation()
  const mspTenantLink = useTenantLink('', 'v')

  const tableQuery = useTableQuery({
    useQuery: useGetConfigTemplateListQuery,
    defaultPayload: {},
    search: {
      searchTargetFields: ['name']
    }
  })
  const addTemplateMenuProps = useAddTemplateMenuProps()

  const rowActions: TableProps<ConfigTemplate>['rowActions'] = [
    {
      label: $t({ defaultMessage: 'Edit' }),
      onClick: ([ selectedRow ]) => {
        const editPath = getConfigTemplateEditPath(selectedRow.type, selectedRow.id!)
        navigate(`${mspTenantLink.pathname}/${editPath}`, { state: { from: location } })
      }
    },
    {
      label: $t({ defaultMessage: 'Apply Template' }),
      onClick: (rows: ConfigTemplate[]) => {
        setSelectedTemplates(rows)
        setApplyTemplateDrawerVisible(true)
      }
    },
    {
      label: $t({ defaultMessage: 'Delete' }),
      onClick: (selectedRows, clearSelection) => {
        const selectedRow = selectedRows[0]

        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t({ defaultMessage: 'Config Template' }),
            entityValue: selectedRow.name,
            numOfEntities: selectedRows.length
          },
          onOk: async () => {
            const deleteFn = deleteMutationMap[selectedRow.type]

            if (!deleteFn) return

            deleteFn({ params: { templateId: selectedRow.id! } }).then(clearSelection)
          }
        })
      }
    }
  ]

  const actions: TableProps<ConfigTemplate>['actions'] = [
    {
      label: $t({ defaultMessage: 'Add Template' }),
      dropdownMenu: addTemplateMenuProps
    }
  ]

  return (
    <>
      <Loader states={[tableQuery]}>
        <Table<ConfigTemplate>
          columns={useColumns({
            setAppliedToTenantDrawerVisible, setSelectedTemplates
          })}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          actions={filterByAccess(actions)}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowActions={filterByAccess(rowActions)}
          rowSelection={hasAccess() && { type: 'radio' }}
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter={true}
        />
      </Loader>
      {applyTemplateDrawerVisible &&
      <ApplyTemplateDrawer
        setVisible={setApplyTemplateDrawerVisible}
        selectedTemplates={selectedTemplates}
      />}
      {appliedToTenantDrawerVisible &&
      <AppliedToTenantDrawer
        setVisible={setAppliedToTenantDrawerVisible}
        selectedTemplates={selectedTemplates}
      />}
    </>
  )
}

interface templateColumnProps {
  setAppliedToTenantDrawerVisible: (visible: boolean) => void,
  setSelectedTemplates: (row: ConfigTemplate[]) => void
}

function useColumns (props: templateColumnProps) {
  const { $t } = useIntl()
  const { setAppliedToTenantDrawerVisible, setSelectedTemplates } = props
  const dateFormat = userDateTimeFormat(DateFormatEnum.DateTimeFormatWithSeconds)

  const typeFilterOptions = Object.keys(ConfigTemplateType).map((key =>
    ({ key, value: key })
  ))

  const columns: TableProps<ConfigTemplate>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      render: (_, row) => {
        return renderConfigTemplateDetailsComponent(row.type, row.id!, row.name)
      }
    },
    {
      key: 'type',
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'type',
      filterable: typeFilterOptions,
      sorter: true
    },
    {
      key: 'appliedOnTenants',
      title: $t({ defaultMessage: 'Applied To' }),
      dataIndex: 'appliedOnTenants',
      sorter: true,
      align: 'center',
      render: function (_, row) {
        if (!row.appliedOnTenants) return 0
        if (!row.appliedOnTenants.length) return row.appliedOnTenants.length
        return <Button
          type='link'
          onClick={() => {
            setSelectedTemplates([row])
            setAppliedToTenantDrawerVisible(true)
          }}>
          {row.appliedOnTenants.length}
        </Button>
      }
    },
    {
      key: 'createdBy',
      title: $t({ defaultMessage: 'Created By' }),
      dataIndex: 'createdBy',
      sorter: true
    },
    {
      key: 'createdOn',
      title: $t({ defaultMessage: 'Created On' }),
      dataIndex: 'createdOn',
      sorter: true,
      render: function (_, row) {
        return moment(row.createdOn).format(dateFormat)
      }
    },
    {
      key: 'lastModified',
      title: $t({ defaultMessage: 'Last Modified' }),
      dataIndex: 'lastModified',
      sorter: true,
      render: function (_, row) {
        return moment(row.lastModified).format(dateFormat)
      }
    },
    {
      key: 'lastApplied',
      title: $t({ defaultMessage: 'Last Applied' }),
      dataIndex: 'lastApplied',
      sorter: true,
      render: function (_, row) {
        return row.lastApplied ? moment(row.lastApplied).format(dateFormat) : ''
      }
    }
  ]

  return columns
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DeleteTemplateMutationDefinition = MutationDefinition<any, any, any, any>
// eslint-disable-next-line max-len
function useDeleteMutation (): Partial<Record<ConfigTemplateType, MutationTrigger<DeleteTemplateMutationDefinition>>> {
  const [ deleteNetworkTemplate ] = useDeleteNetworkTemplateMutation()
  const [ deleteAaaTemplate ] = useDeleteAAAPolicyTemplateMutation()
  const [ deleteVenueTemplate ] = useDeleteVenueTemplateMutation()
  const [ deleteDpskTemplate ] = useDeleteDpskTemplateMutation()
  const [ deleteAccessControlSet ] = useDeleteAccessControlProfileTemplateMutation()
  const [ deleteDhcpTemplate ] = useDeleteDhcpTemplateMutation()

  return {
    [ConfigTemplateType.NETWORK]: deleteNetworkTemplate,
    [ConfigTemplateType.RADIUS]: deleteAaaTemplate,
    [ConfigTemplateType.VENUE]: deleteVenueTemplate,
    [ConfigTemplateType.DPSK]: deleteDpskTemplate,
    [ConfigTemplateType.ACCESS_CONTROL]: deleteAccessControlSet,
    [ConfigTemplateType.DHCP]: deleteDhcpTemplate
  }
}
