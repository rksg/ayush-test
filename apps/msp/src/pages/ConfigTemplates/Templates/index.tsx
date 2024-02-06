import { useState } from 'react'

import { MenuProps } from 'antd'
import moment        from 'moment'
import { useIntl }   from 'react-intl'


import {
  Table,
  TableProps,
  Loader,
  showActionModal,
  Button
} from '@acx-ui/components'
import { DateFormatEnum, userDateTimeFormat }                                            from '@acx-ui/formatter'
import { ConfigTemplateLink, PolicyConfigTemplateLink, renderConfigTemplateDetailsLink } from '@acx-ui/rc/components'
import {
  useDeleteAAAPolicyTemplateMutation,
  useDeleteNetworkTemplateMutation,
  useDeleteVenueTemplateMutation,
  useGetConfigTemplateListQuery
} from '@acx-ui/rc/services'
import {
  PolicyOperation,
  PolicyType,
  policyTypeLabelMapping,
  useTableQuery,
  ConfigTemplate,
  ConfigTemplateType,
  getConfigTemplateEditPath
} from '@acx-ui/rc/utils'
import { useLocation, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess }               from '@acx-ui/user'
import { getIntl }                                 from '@acx-ui/utils'

import { AppliedToTenantDrawer } from './AppliedToTenantDrawer'
import { ApplyTemplateDrawer }   from './ApplyTemplateDrawer'
import * as UI                   from './styledComponents'


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
            deleteFn({ params: { templateId: selectedRow.id! } }).then(clearSelection)
          }
        })
      }
    }
  ]

  const actions: TableProps<ConfigTemplate>['actions'] = [
    {
      label: $t({ defaultMessage: 'Add Template' }),
      dropdownMenu: getAddTemplateMenuProps()
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

  const columns: TableProps<ConfigTemplate>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      render: (_, row) => {
        return renderConfigTemplateDetailsLink(row.type, row.id!, row.name)
      }
    },
    {
      key: 'type',
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'type',
      sorter: true
    },
    {
      key: 'ecTenants',
      title: $t({ defaultMessage: 'Applied To' }),
      dataIndex: 'ecTenants',
      sorter: true,
      align: 'center',
      render: function (_, row) {
        if (!row.ecTenants) return 0
        if (!row.ecTenants.length) return row.ecTenants.length
        return <Button
          type='link'
          onClick={() => {
            setSelectedTemplates([row])
            setAppliedToTenantDrawerVisible(true)
          }}>
          {row.ecTenants.length}
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

function useDeleteMutation () {
  const [ deleteNetworkTemplate ] = useDeleteNetworkTemplateMutation()
  const [ deleteAaaTemplate ] = useDeleteAAAPolicyTemplateMutation()
  const [ deleteVenueTemplate ] = useDeleteVenueTemplateMutation()

  return {
    [ConfigTemplateType.NETWORK]: deleteNetworkTemplate,
    [ConfigTemplateType.RADIUS]: deleteAaaTemplate,
    [ConfigTemplateType.VENUE]: deleteVenueTemplate
  }
}

function getAddTemplateMenuProps (): Omit<MenuProps, 'placement'> {
  const { $t } = getIntl()

  return {
    expandIcon: <UI.MenuExpandArrow />,
    items: [
      {
        key: 'add-wifi-network',
        label: <ConfigTemplateLink to='networks/wireless/add'>
          {$t({ defaultMessage: 'Wi-Fi Network' })}
        </ConfigTemplateLink>
      }, {
        key: 'add-venue',
        label: <ConfigTemplateLink to='venues/add'>
          {$t({ defaultMessage: 'Venue' })}
        </ConfigTemplateLink>
      }, {
        key: 'add-policy',
        label: $t({ defaultMessage: 'Policies' }),
        children: [{
          key: 'add-aaa',
          label: <PolicyConfigTemplateLink type={PolicyType.AAA} oper={PolicyOperation.CREATE}>
            {$t(policyTypeLabelMapping[PolicyType.AAA])}
          </PolicyConfigTemplateLink>
        }]
      }
    ]
  }
}
