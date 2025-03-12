import { ReactNode, useState } from 'react'

import { TypedMutationTrigger } from '@reduxjs/toolkit/query/react'
import { useIntl }              from 'react-intl'


import {
  Table,
  TableProps,
  Loader,
  showActionModal,
  Button
} from '@acx-ui/components'
import { Features, useIsSplitOn }    from '@acx-ui/feature-toggle'
import { MspUrlsInfo }               from '@acx-ui/msp/utils'
import {
  useAccessControlSubPolicyVisible,
  ACCESS_CONTROL_SUB_POLICY_INIT_STATE,
  isAccessControlSubPolicy,
  AccessControlSubPolicyDrawers,
  subPolicyMappingType, isNotAllowToApplyPolicy,
  AccessControlSubPolicyVisibility
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
  useDelDevicePolicyTemplateMutation,
  useDeleteWifiCallingServiceTemplateMutation,
  useDeletePortalTemplateMutation,
  useDelVlanPoolPolicyTemplateMutation,
  useDelSyslogPolicyTemplateMutation,
  useDelRoguePolicyTemplateMutation,
  useDeleteSwitchConfigProfileTemplateMutation,
  useDeleteApGroupsTemplateMutation,
  useDelEthernetPortProfileTemplateMutation
} from '@acx-ui/rc/services'
import {
  useTableQuery,
  ConfigTemplate,
  ConfigTemplateType,
  getConfigTemplateEditPath,
  PolicyType,
  ConfigTemplateDriftType,
  hasConfigTemplateAllowedOperation,
  ConfigTemplateUrlsInfo
} from '@acx-ui/rc/utils'
import { useLocation, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess, hasAllowedOperations }    from '@acx-ui/user'
import { getOpsApi }                               from '@acx-ui/utils'

import { AppliedToTenantDrawer }                            from './AppliedToTenantDrawer'
import { ApplyTemplateDrawer }                              from './ApplyTemplateDrawer'
import { ConfigTemplateCloneModal, useCloneConfigTemplate } from './CloneModal'
import { ProtectedDetailsDrawer }                           from './DetailsDrawer'
import { ShowDriftsDrawer }                                 from './ShowDriftsDrawer'
import {
  ConfigTemplateDriftStatus, getConfigTemplateEnforcementLabel,
  getConfigTemplateDriftStatusLabel, getConfigTemplateTypeLabel,
  ViewConfigTemplateDetailsLink, useFormatTemplateDate
} from './templateUtils'
import { useAddTemplateMenuProps } from './useAddTemplateMenuProps'

export function ConfigTemplateList () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const location = useLocation()
  const [ applyTemplateDrawerVisible, setApplyTemplateDrawerVisible ] = useState(false)
  const [ showDriftsDrawerVisible, setShowDriftsDrawerVisible ] = useState(false)
  const [ appliedToTenantDrawerVisible, setAppliedToTenantDrawerVisible ] = useState(false)
  // eslint-disable-next-line max-len
  const { visible: cloneModalVisible, setVisible: setCloneModalVisible, canClone } = useCloneConfigTemplate()
  const [ selectedTemplates, setSelectedTemplates ] = useState<ConfigTemplate[]>([])
  const [ detailsDrawerVisible, setDetailsDrawerVisible ] = useState(false)
  const deleteMutationMap = useDeleteMutation()
  const mspTenantLink = useTenantLink('', 'v')
  // eslint-disable-next-line max-len
  const [ accessControlSubPolicyVisible, setAccessControlSubPolicyVisible ] = useAccessControlSubPolicyVisible()
  const enableRbac = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const driftsEnabled = useIsSplitOn(Features.CONFIG_TEMPLATE_DRIFTS)
  const cloneEnabled = useIsSplitOn(Features.CONFIG_TEMPLATE_CLONE)

  const tableQuery = useTableQuery({
    useQuery: useGetConfigTemplateListQuery,
    defaultPayload: {},
    search: {
      searchTargetFields: ['name']
    },
    enableRbac
  })
  const addTemplateMenuProps = useAddTemplateMenuProps()

  const isDeleteAllowed = (selectedRows: ConfigTemplate[]) => {
    const targetRow = selectedRows[0]
    return targetRow
      && !!deleteMutationMap[targetRow.type]
      && hasConfigTemplateAllowedOperation(targetRow.type, 'Delete')
  }

  const isEditAllowed = (selectedRows: ConfigTemplate[]) => {
    const targetRow = selectedRows[0]
    return targetRow && hasConfigTemplateAllowedOperation(targetRow.type, 'Edit')
  }

  const rowActions: TableProps<ConfigTemplate>['rowActions'] = [
    {
      visible: isEditAllowed,
      label: $t({ defaultMessage: 'Edit' }),
      onClick: ([ selectedRow ]) => {
        if (isAccessControlSubPolicy(selectedRow.type)) {
          setAccessControlSubPolicyVisible({
            ...ACCESS_CONTROL_SUB_POLICY_INIT_STATE,
            [subPolicyMappingType[selectedRow.type] as PolicyType]: {
              visible: true, id: selectedRow.id
            }
          })
        } else {
          const editPath = getConfigTemplateEditPath(selectedRow.type, selectedRow.id!)
          navigate(`${mspTenantLink.pathname}/${editPath}`, { state: { from: location } })
        }
      }
    },
    ...(cloneEnabled ? [{
      visible: (selectedRows: ConfigTemplate[]) => canClone(selectedRows[0]?.type),
      label: $t({ defaultMessage: 'Clone' }),
      onClick: (rows: ConfigTemplate[]) => {
        setSelectedTemplates(rows)
        setCloneModalVisible(true)
      }
    }] : []),
    {
      rbacOpsIds: [getOpsApi(ConfigTemplateUrlsInfo.applyConfigTemplateRbac)],
      label: $t({ defaultMessage: 'Apply Template' }),
      disabled: (selectedRows) => selectedRows.some(row => isNotAllowToApplyPolicy(row.type)),
      onClick: (rows: ConfigTemplate[]) => {
        setSelectedTemplates(rows)
        setApplyTemplateDrawerVisible(true)
      }
    },
    ...(driftsEnabled ? [{
      // eslint-disable-next-line max-len
      visible: (selectedRows: ConfigTemplate[]) => selectedRows[0]?.driftStatus === ConfigTemplateDriftType.DRIFT_DETECTED,
      rbacOpsIds: [getOpsApi(ConfigTemplateUrlsInfo.getDriftReport)],
      label: $t({ defaultMessage: 'Show Drifts' }),
      onClick: (rows: ConfigTemplate[]) => {
        setSelectedTemplates(rows)
        setShowDriftsDrawerVisible(true)
      }
    }] : []),
    {
      label: $t({ defaultMessage: 'Delete' }),
      visible: isDeleteAllowed,
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
            const deleteFn = deleteMutationMap[selectedRow.type]!
            deleteFn({ params: { templateId: selectedRow.id! }, enableRbac }).then(clearSelection)
          }
        })
      }
    }
  ]

  const allowedActions = addTemplateMenuProps ? [
    {
      label: $t({ defaultMessage: 'Add Template' }),
      dropdownMenu: addTemplateMenuProps
    }
  ] : undefined
  const allowedRowActions = filterByAccess(rowActions)

  return (
    <>
      <Loader states={[tableQuery]}>
        <Table<ConfigTemplate>
          columns={useColumns({
            setAppliedToTenantDrawerVisible,
            setSelectedTemplates,
            setAccessControlSubPolicyVisible,
            setDetailsDrawerVisible,
            setShowDriftsDrawerVisible
          })}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          actions={allowedActions}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowActions={allowedRowActions}
          rowSelection={allowedRowActions.length > 0 && { type: 'radio' }}
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter={true}
        />
      </Loader>
      {applyTemplateDrawerVisible &&
      <ApplyTemplateDrawer
        setVisible={setApplyTemplateDrawerVisible}
        selectedTemplate={selectedTemplates[0]}
      />}
      {showDriftsDrawerVisible &&
      <ShowDriftsDrawer
        setVisible={setShowDriftsDrawerVisible}
        selectedTemplate={selectedTemplates[0]}
      />}
      {appliedToTenantDrawerVisible &&
      <AppliedToTenantDrawer
        setVisible={setAppliedToTenantDrawerVisible}
        selectedTemplates={selectedTemplates}
      />}
      {cloneModalVisible &&
      <ConfigTemplateCloneModal
        selectedTemplate={selectedTemplates[0]}
        setVisible={setCloneModalVisible}
      />}
      <AccessControlSubPolicyDrawers
        accessControlSubPolicyVisible={accessControlSubPolicyVisible}
        setAccessControlSubPolicyVisible={setAccessControlSubPolicyVisible}
      />
      {detailsDrawerVisible &&
      <ProtectedDetailsDrawer
        setVisible={setDetailsDrawerVisible}
        selectedTemplate={selectedTemplates[0]}
        setAccessControlSubPolicyVisible={setAccessControlSubPolicyVisible}
      />}
    </>
  )
}

interface TemplateColumnProps {
  setAppliedToTenantDrawerVisible: (visible: boolean) => void,
  setSelectedTemplates: (row: ConfigTemplate[]) => void,
  // eslint-disable-next-line max-len
  setAccessControlSubPolicyVisible: (accessControlSubPolicyVisibility: AccessControlSubPolicyVisibility) => void,
  setShowDriftsDrawerVisible: (visible: boolean) => void
  setDetailsDrawerVisible: (visible: boolean) => void
}

function useColumns (props: TemplateColumnProps) {
  const { $t } = useIntl()
  const {
    setAppliedToTenantDrawerVisible,
    setSelectedTemplates,
    setAccessControlSubPolicyVisible,
    setShowDriftsDrawerVisible,
    setDetailsDrawerVisible
  } = props
  const dateFormatter = useFormatTemplateDate()
  const driftsEnabled = useIsSplitOn(Features.CONFIG_TEMPLATE_DRIFTS)
  const enforcementEnabled = useIsSplitOn(Features.CONFIG_TEMPLATE_ENFORCED)

  const typeFilterOptions = Object.entries(ConfigTemplateType).map((type =>
    ({ key: type[1], value: getConfigTemplateTypeLabel(type[1]) })
  ))

  const driftStatusFilterOptions = Object.entries(ConfigTemplateDriftType).map((status =>
    ({ key: status[1], value: getConfigTemplateDriftStatusLabel(status[1]) })
  ))

  const enforcementFilterOptions = [
    { key: true, value: getConfigTemplateEnforcementLabel(true) },
    { key: false, value: getConfigTemplateEnforcementLabel(false) }
  ]

  const columns: TableProps<ConfigTemplate>['columns'] = [
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: true,
      searchable: true,
      render: (_, row) => {
        return <NameLink
          template={row}
          setSelectedTemplates={setSelectedTemplates}
          setAccessControlSubPolicyVisible={setAccessControlSubPolicyVisible}
          setDetailsDrawerVisible={setDetailsDrawerVisible}
        />
      }
    },
    {
      key: 'type',
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'type',
      filterable: typeFilterOptions,
      sorter: true,
      render: function (_, row) {
        return getConfigTemplateTypeLabel(row.type)
      }
    },
    {
      key: 'appliedOnTenants',
      title: $t({ defaultMessage: 'Applied To' }),
      dataIndex: 'appliedOnTenants',
      sorter: true,
      align: 'center',
      render: function (_, row) {
        const count = row.appliedOnTenants?.length ?? 0

        if (count === 0) return 0

        if (!hasAllowedOperations([getOpsApi(MspUrlsInfo.getMspCustomersList)])) return count

        return <Button
          type='link'
          onClick={() => {
            setSelectedTemplates([row])
            setAppliedToTenantDrawerVisible(true)
          }}>
          {count}
        </Button>
      }
    },
    ...(enforcementEnabled ? [{
      key: 'isEnforced',
      title: $t({ defaultMessage: 'Enforcement' }),
      dataIndex: 'isEnforced',
      filterable: enforcementFilterOptions,
      sorter: true,
      render: function (_: ReactNode, row: ConfigTemplate) {
        return getConfigTemplateEnforcementLabel(row.isEnforced)
      }
    }] : []),
    ...(driftsEnabled ? [{
      key: 'driftStatus',
      title: $t({ defaultMessage: 'Drift Status' }),
      dataIndex: 'driftStatus',
      filterable: driftStatusFilterOptions,
      sorter: true,
      render: function (_: ReactNode, row: ConfigTemplate) {
        return <ConfigTemplateDriftStatus
          row={row}
          callbackMap={{
            [ConfigTemplateDriftType.DRIFT_DETECTED]: () => {
              setSelectedTemplates([row])
              setShowDriftsDrawerVisible(true)
            }
          }}
        />
      }
    }] : []),
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
        return dateFormatter(row.createdOn)
      }
    },
    {
      key: 'lastModified',
      title: $t({ defaultMessage: 'Last Modified' }),
      dataIndex: 'lastModified',
      sorter: true,
      render: function (_, row) {
        return dateFormatter(row.lastModified)
      }
    },
    {
      key: 'lastApplied',
      title: $t({ defaultMessage: 'Last Applied' }),
      dataIndex: 'lastApplied',
      sorter: true,
      render: function (_, row) {
        return dateFormatter(row.lastApplied)
      }
    }
  ]

  return columns
}

interface NameLinkProps {
  template: ConfigTemplate
  setSelectedTemplates: (row: ConfigTemplate[]) => void,
  // eslint-disable-next-line max-len
  setAccessControlSubPolicyVisible: (accessControlSubPolicyVisibility: AccessControlSubPolicyVisibility) => void,
  setDetailsDrawerVisible: (visible: boolean) => void
}
function NameLink (props: NameLinkProps) {
  // eslint-disable-next-line max-len
  const { template, setSelectedTemplates, setAccessControlSubPolicyVisible, setDetailsDrawerVisible } = props
  const nameDrawerEnabled = useIsSplitOn(Features.CONFIG_TEMPLATE_NAME_DRAWER)
  return nameDrawerEnabled
    ? <Button
      type='link'
      size={'small'}
      onClick={() => {
        setSelectedTemplates([template])
        setDetailsDrawerVisible(true)
      }}>{template.name}</Button>
    : <ViewConfigTemplateDetailsLink
      template={template}
      setAclSubPolicyVisible={setAccessControlSubPolicyVisible}
    />
}

// eslint-disable-next-line max-len, @typescript-eslint/no-explicit-any
function useDeleteMutation (): Partial<Record<ConfigTemplateType, TypedMutationTrigger<any, any, any>>> {
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
  const [ deletePortalTemplate ] = useDeletePortalTemplateMutation()
  const [ deleteWifiCalling ] = useDeleteWifiCallingServiceTemplateMutation()
  const [ deleteVlanPoolTemplate ] = useDelVlanPoolPolicyTemplateMutation()
  const [ deleteSyslogTemplate ] = useDelSyslogPolicyTemplateMutation()
  const [ deleteRogueAPTemplate ] = useDelRoguePolicyTemplateMutation()
  const [ deleteSwitchConfigProfileTemplate ] = useDeleteSwitchConfigProfileTemplateMutation()
  const [ deleteApGroupTemplate ] = useDeleteApGroupsTemplateMutation()
  const [ deleteEthernetPortTemplate ] = useDelEthernetPortProfileTemplateMutation()

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
    [ConfigTemplateType.DHCP]: deleteDhcpTemplate,
    [ConfigTemplateType.PORTAL]: deletePortalTemplate,
    [ConfigTemplateType.WIFI_CALLING]: deleteWifiCalling,
    [ConfigTemplateType.VLAN_POOL]: deleteVlanPoolTemplate,
    [ConfigTemplateType.SYSLOG]: deleteSyslogTemplate,
    [ConfigTemplateType.ROGUE_AP_DETECTION]: deleteRogueAPTemplate,
    [ConfigTemplateType.SWITCH_REGULAR]: deleteSwitchConfigProfileTemplate,
    [ConfigTemplateType.SWITCH_CLI]: deleteSwitchConfigProfileTemplate,
    [ConfigTemplateType.AP_GROUP]: deleteApGroupTemplate,
    [ConfigTemplateType.ETHERNET_PORT_PROFILE]: deleteEthernetPortTemplate
  }
}
