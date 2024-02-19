import { Dispatch, SetStateAction, useState } from 'react'

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
import { DateFormatEnum, userDateTimeFormat } from '@acx-ui/formatter'
import {
  ConfigTemplateLink,
  PolicyConfigTemplateLink,
  ServiceConfigTemplateLink,
  renderConfigTemplateDetailsComponent
} from '@acx-ui/rc/components'
import {
  useDeleteAAAPolicyTemplateMutation,
  useDelAppPolicyMutation,
  useDelDevicePolicyMutation,
  useDeleteAccessControlProfileMutation,
  useDeleteDpskTemplateMutation,
  useDeleteNetworkTemplateMutation,
  useDeleteVenueTemplateMutation, useDelL2AclPolicyMutation, useDelL3AclPolicyMutation,
  useGetConfigTemplateListQuery
} from '@acx-ui/rc/services'
import {
  PolicyOperation,
  PolicyType,
  policyTypeLabelMapping,
  useTableQuery,
  ConfigTemplate,
  ConfigTemplateType,
  getConfigTemplateEditPath,
  ServiceType,
  ServiceOperation,
  serviceTypeLabelMapping
} from '@acx-ui/rc/utils'
import { useLocation, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess, hasAccess }               from '@acx-ui/user'
import { getIntl }                                 from '@acx-ui/utils'

import {
  AccessControlSubPolicyDrawers,
  AccessControlSubPolicyVisibility, createAccessControlPolicyMenuItem,
  useAccessControlSubPolicyVisible
} from './AccessControlPolicy'
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
  // eslint-disable-next-line max-len
  const [ accessControlSubPolicyVisible, setAccessControlSubPolicyVisible ] = useAccessControlSubPolicyVisible()

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
      dropdownMenu: getAddTemplateMenuProps({ setAccessControlSubPolicyVisible })
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
      <AccessControlSubPolicyDrawers
        accessControlSubPolicyVisible={accessControlSubPolicyVisible}
        setAccessControlSubPolicyVisible={setAccessControlSubPolicyVisible}
      />
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
        return renderConfigTemplateDetailsComponent(row.type, row.id!, row.name)
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
  const [ deleteDpskTemplate ] = useDeleteDpskTemplateMutation()
  const [ deleteLayer2 ] = useDelL2AclPolicyMutation()
  const [ deleteLayer3 ] = useDelL3AclPolicyMutation()
  const [ deleteDevice ] = useDelDevicePolicyMutation()
  const [ deleteApplication ] = useDelAppPolicyMutation()
  const [ deleteAccessControlSet ] = useDeleteAccessControlProfileMutation()

  return {
    [ConfigTemplateType.NETWORK]: deleteNetworkTemplate,
    [ConfigTemplateType.RADIUS]: deleteAaaTemplate,
    [ConfigTemplateType.VENUE]: deleteVenueTemplate,
    [ConfigTemplateType.DPSK]: deleteDpskTemplate,
    [ConfigTemplateType.LAYER_2_POLICY]: deleteLayer2,
    [ConfigTemplateType.LAYER_3_POLICY]: deleteLayer3,
    [ConfigTemplateType.DEVICE_POLICY]: deleteDevice,
    [ConfigTemplateType.APPLICATION_POLICY]: deleteApplication,
    [ConfigTemplateType.ACCESS_CONTROL_SET]: deleteAccessControlSet
  }
}

function getAddTemplateMenuProps (props: {
  setAccessControlSubPolicyVisible: Dispatch<SetStateAction<AccessControlSubPolicyVisibility>>
}): Omit<MenuProps, 'placement'> {
  const { setAccessControlSubPolicyVisible } = props
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
        children: [
          createPolicyMenuItem(PolicyType.AAA, 'add-aaa'),
          createAccessControlPolicyMenuItem(setAccessControlSubPolicyVisible)
        ]
      }, {
        key: 'add-service',
        label: $t({ defaultMessage: 'Services' }),
        children: [{
          key: 'add-dpsk',
          label: <ServiceConfigTemplateLink type={ServiceType.DPSK} oper={ServiceOperation.CREATE}>
            {$t(serviceTypeLabelMapping[ServiceType.DPSK])}
          </ServiceConfigTemplateLink>
        }]
      }
    ]
  }
}

export function createPolicyMenuItem (policyType: PolicyType, key: string) {
  const { $t } = getIntl()

  return {
    key,
    label: <PolicyConfigTemplateLink type={policyType} oper={PolicyOperation.CREATE}>
      {$t(policyTypeLabelMapping[policyType])}
    </PolicyConfigTemplateLink>
  }
}
