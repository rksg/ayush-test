import React, { useState } from 'react'

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
import { DateFormatEnum, userDateTimeFormat }              from '@acx-ui/formatter'
import {
  ConfigTemplateLink,
  PolicyConfigTemplateLink,
  ServiceConfigTemplateLink,
  renderConfigTemplateDetailsComponent,
  useAccessControlSubPolicyVisible,
  ACCESS_CONTROL_SUB_POLICY_INIT_STATE,
  isAccessControlSubPolicy,
  AccessControlSubPolicyDrawers,
  AccessControlSubPolicyVisibility, subPolicyMappingType
} from '@acx-ui/rc/components'
import {
  useDeleteDpskTemplateMutation,
  useDeleteAAAPolicyTemplateMutation,
  useDeleteNetworkTemplateMutation,
  useDeleteVenueTemplateMutation,
  useGetConfigTemplateListQuery,
  useDeleteDhcpTemplateMutation,
  useDeleteAccessControlProfileTemplateMutation,
  useDelL2AclPolicyTemplateMutation,
  useDelAppPolicyTemplateMutation,
  useDelL3AclPolicyTemplateMutation,
  useDelDevicePolicyTemplateMutation
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
        if (isAccessControlSubPolicy(selectedRow.type)) {
          setAccessControlSubPolicyVisible({
            ...ACCESS_CONTROL_SUB_POLICY_INIT_STATE,
            [selectedRow.type]: {
              visible: true, id: selectedRow.id
            }
          })
        } else {
          const editPath = getConfigTemplateEditPath(selectedRow.type, selectedRow.id!)
          navigate(`${mspTenantLink.pathname}/${editPath}`, { state: { from: location } })
        }
      }
    },
    {
      label: $t({ defaultMessage: 'Apply Template' }),
      disabled: (selectedRows) => selectedRows.some(row => isAccessControlSubPolicy(row.type)),
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
            setAppliedToTenantDrawerVisible, setSelectedTemplates, setAccessControlSubPolicyVisible
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
  setSelectedTemplates: (row: ConfigTemplate[]) => void,
  // eslint-disable-next-line max-len
  setAccessControlSubPolicyVisible: (accessControlSubPolicyVisibility: AccessControlSubPolicyVisibility) => void
}

function useColumns (props: templateColumnProps) {
  const { $t } = useIntl()
  const {
    setAppliedToTenantDrawerVisible,
    setSelectedTemplates,
    setAccessControlSubPolicyVisible
  } = props
  const dateFormat = userDateTimeFormat(DateFormatEnum.DateTimeFormatWithSeconds)

  const typeFilterOptions = Object.entries(ConfigTemplateType).map((type =>
    ({ key: type[1], value: type[0] })
  ))

  const columns: TableProps<ConfigTemplate>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      render: (_, row) => {
        if (isAccessControlSubPolicy(row.type)) {
          return <Button
            type='link'
            size={'small'}
            onClick={() => {
              setAccessControlSubPolicyVisible({
                ...ACCESS_CONTROL_SUB_POLICY_INIT_STATE,
                [subPolicyMappingType[row.type] as PolicyType]: {
                  id: row.id,
                  visible: true,
                  drawerViewMode: true
                }
              })
            }}>
            {row.name}
          </Button>
        }
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

function useDeleteMutation () {
  const [ deleteNetworkTemplate ] = useDeleteNetworkTemplateMutation()
  const [ deleteAaaTemplate ] = useDeleteAAAPolicyTemplateMutation()
  const [ deleteVenueTemplate ] = useDeleteVenueTemplateMutation()
  const [ deleteDpskTemplate ] = useDeleteDpskTemplateMutation()
  const [ deleteAccessControlSetTemplate ] = useDeleteAccessControlProfileTemplateMutation()
  const [ deleteLayer2Template ] = useDelL2AclPolicyTemplateMutation()
  const [ deleteLayer3Template ] = useDelL3AclPolicyTemplateMutation()
  const [ deleteDeviceTemplate ] = useDelDevicePolicyTemplateMutation()
  const [ deleteApplicationTemplate ] = useDelAppPolicyTemplateMutation()
  const [ deleteDhcpTemplate ] = useDeleteDhcpTemplateMutation()

  return {
    [ConfigTemplateType.NETWORK]: deleteNetworkTemplate,
    [ConfigTemplateType.RADIUS]: deleteAaaTemplate,
    [ConfigTemplateType.VENUE]: deleteVenueTemplate,
    [ConfigTemplateType.DPSK]: deleteDpskTemplate,
    [ConfigTemplateType.ACCESS_CONTROL]: deleteAccessControlSetTemplate,
    [ConfigTemplateType.LAYER_2_POLICY]: deleteLayer2Template,
    [ConfigTemplateType.LAYER_3_POLICY]: deleteLayer3Template,
    [ConfigTemplateType.DEVICE_POLICY]: deleteDeviceTemplate,
    [ConfigTemplateType.APPLICATION_POLICY]: deleteApplicationTemplate,
    [ConfigTemplateType.DHCP]: deleteDhcpTemplate
  }
}

function getAddTemplateMenuProps (): Omit<MenuProps, 'placement'> {
  const { $t } = getIntl()

  return {
    expandIcon: <UI.MenuExpandArrow />,
    subMenuCloseDelay: 0.2,
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
          createPolicyMenuItem(PolicyType.ACCESS_CONTROL, 'add-accessControl')
        ]
      }, {
        key: 'add-service',
        label: $t({ defaultMessage: 'Services' }),
        children: [
          createServiceMenuItem(ServiceType.DPSK, 'add-dpsk'),
          createServiceMenuItem(ServiceType.DHCP, 'add-dhcp')
        ]
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

function createServiceMenuItem (serviceType: ServiceType, key: string) {
  const { $t } = getIntl()

  return {
    key,
    label: <ServiceConfigTemplateLink type={serviceType} oper={ServiceOperation.CREATE}>
      {$t(serviceTypeLabelMapping[serviceType])}
    </ServiceConfigTemplateLink>
  }
}
