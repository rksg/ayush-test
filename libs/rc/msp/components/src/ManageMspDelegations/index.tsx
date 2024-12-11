import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import {
  Button,
  Drawer,
  Loader,
  Tabs
} from '@acx-ui/components'
import {
  useGetMspEcDelegatedAdminsQuery,
  useMspAdminListQuery,
  useUpdateMspEcDelegationsMutation,
  useUpdateMspMultipleEcDelegationsMutation
} from '@acx-ui/msp/services'
import {
  AssignedMultiEcMspAdmins,
  MspAdministrator,
  MspEcDelegatedAdmins,
  SelectedMspMspAdmins
} from '@acx-ui/msp/utils'
import { useGetMspEcDelegatePrivilegeGroupsQuery, useGetPrivilegeGroupsWithAdminsQuery } from '@acx-ui/rc/services'
import { PrivilegeGroup }                                                                from '@acx-ui/rc/utils'
import { useParams }                                                                     from '@acx-ui/react-router-dom'
import { RolesEnum }                                                                     from '@acx-ui/types'
import { AccountType }                                                                   from '@acx-ui/utils'

import { SelectPGs }   from './SelectPGs'
import { SelectUsers } from './SelectUsers'

interface ManageMspDelegationDrawerProps {
  visible: boolean
  tenantIds?: string[]
  setVisible: (visible: boolean) => void
  setSelectedUsers: (selected: MspAdministrator[]) => void
  selectedUsers?: MspAdministrator[]
  setSelectedPrivilegeGroups: (selected: PrivilegeGroup[]) => void
  selectedPrivilegeGroups?: PrivilegeGroup[]
  tenantType?: string
}

export const SystemRoles = [
  RolesEnum.PRIME_ADMIN,
  RolesEnum.ADMINISTRATOR,
  RolesEnum.READ_ONLY,
  RolesEnum.DPSK_ADMIN,
  RolesEnum.GUEST_MANAGER
]

export const ManageMspDelegationDrawer = (props: ManageMspDelegationDrawerProps) => {
  const { $t } = useIntl()
  const params = useParams()

  const { visible, tenantIds, setVisible,
    setSelectedUsers: setAdminUsers,
    selectedUsers: selectedAdminUsers,
    setSelectedPrivilegeGroups: setAdminPGs,
    selectedPrivilegeGroups: selectedAdminPGs,
    tenantType } = props
  const [resetField, setResetField] = useState(false)
  const [selectedRoles, setSelectedRoles] = useState<{ id: string, role: string }[]>([])
  const [selectedUsers, setSelectedUsers] = useState<MspAdministrator[]>(selectedAdminUsers ?? [])
  const [selectedPrivilegeGroups, setSelectedPrivilegeGroups] =
    useState<PrivilegeGroup[]>(selectedAdminPGs ?? [])
  const [currentTab, setCurrentTab] = useState('users')
  const [usersData, setUsersData] = useState([] as MspAdministrator[])
  const [delegatedAdminsData, setDelegatedAdminsData] = useState([] as MspEcDelegatedAdmins[])
  const [privilegeGroupData, setPrivilegeGroupData] = useState([] as PrivilegeGroup[])

  const isSkip = tenantIds?.length !== 1
  const isTechPartner =
    (tenantType === AccountType.MSP_INSTALLER ||
     tenantType === AccountType.MSP_INTEGRATOR)

  const { data: privilegeGroupList, isLoading, isFetching }
    = useGetPrivilegeGroupsWithAdminsQuery({ params })

  const { data: delegatedPGs } = useGetMspEcDelegatePrivilegeGroupsQuery({
    params: { mspEcTenantId: tenantIds?.[0] } }, { skip: isSkip })

  useEffect(() => {
    if (privilegeGroupList) {
      const pgs = privilegeGroupList?.filter(pg =>
        !SystemRoles.includes(pg.name as RolesEnum))
      setPrivilegeGroupData(pgs ?? [])
    }
    const allCustomersPGs = privilegeGroupList?.filter(pg => pg.allCustomers === true) ?? []
    const selectedPGS = allCustomersPGs
      .concat(selectedPrivilegeGroups.filter(pg => !allCustomersPGs.map(c => c.id).includes(pg.id)))
    setSelectedPrivilegeGroups(isSkip ? selectedPGS : (delegatedPGs ?? []))
  }, [privilegeGroupList, delegatedPGs])

  const delegatedAdmins =
      useGetMspEcDelegatedAdminsQuery({
        params: { mspEcTenantId: tenantIds ? tenantIds[0] : undefined },
        enableRbac: true }, { skip: isSkip })
  const queryResults = useMspAdminListQuery({ params: useParams() })

  useEffect(() => {
    setUsersData(queryResults.data?.filter(admin => SystemRoles.includes(admin.role)) ?? [])
    setDelegatedAdminsData(delegatedAdmins?.data ?? [])
  }, [queryResults?.data, delegatedAdmins?.data])

  const onClose = () => {
    setVisible(false)
    setSelectedUsers([])
    setSelectedPrivilegeGroups([])
    setSelectedRoles([])
  }

  const resetFields = () => {
    setResetField(true)
    onClose()
  }

  const [ saveMspAdmins ] = useUpdateMspEcDelegationsMutation()
  const [ saveMspMultipleEcAdmins ] = useUpdateMspMultipleEcDelegationsMutation()

  const hasAdminSelected = selectedUsers.length > 0 || (selectedPrivilegeGroups.length > 0 &&
    selectedPrivilegeGroups.some(pg => (pg.admins?.length ?? 0) > 0))
  const handleSave = () => {
    if (!selectedUsers?.length && !selectedPrivilegeGroups?.length)
      return

    // handle save for different cases
    let selAdminList: MspEcDelegatedAdmins[] = []
    let returnRows: MspAdministrator[] = []
    selectedUsers.forEach((element:MspAdministrator) => {
      const role = selectedRoles.find(row => row.id === element.id)?.role ?? element.role
      selAdminList.push ({
        msp_admin_id: element.id,
        msp_admin_role: role
      })
      const rowEntry = { ...element }
      rowEntry.role = role as RolesEnum
      returnRows.push(rowEntry)
    })
    const pgIds = selectedPrivilegeGroups?.map((pg: PrivilegeGroup)=> pg.id)

    if (tenantIds && tenantIds.length > 1) {
      let selMspAdmins: SelectedMspMspAdmins[] = []
      selectedUsers.forEach((element:MspAdministrator) => {
        const role = selectedRoles.find(row => row.id === element.id)?.role ?? element.role
        selMspAdmins.push ({
          mspAdminId: element.id,
          mspAdminRole: role as RolesEnum
        })
      })
      let assignedEcMspAdmins: AssignedMultiEcMspAdmins[] = []
      tenantIds.forEach((id: string) => {
        assignedEcMspAdmins.push ({
          operation: 'ADD',
          mspEcId: id,
          mspAdminRoles: selMspAdmins,
          privilege_group_ids: pgIds.length > 0 ? pgIds : undefined
        })
      })
      saveMspMultipleEcAdmins({ params, payload: { associations: assignedEcMspAdmins } })
        .then(() => {
          setAdminUsers(selectedUsers)
          setAdminPGs(selectedPrivilegeGroups)
          setVisible(false)
          resetFields()
        })
    } else if (tenantIds && tenantIds.length === 1) {
      const assignedPayload = {
        delegation_type: 'MSP',
        mspec_list: selAdminList,
        privilege_group_ids: pgIds.length > 0 ? pgIds : undefined
      }
      saveMspAdmins({ params: { mspEcTenantId: tenantIds[0] }, payload: assignedPayload })
        .then(() => {
          setAdminUsers(selectedUsers)
          setAdminPGs(selectedPrivilegeGroups)
          setVisible(false)
          resetFields()
        })
    } else {
      setAdminUsers(returnRows)
      setAdminPGs(selectedPrivilegeGroups)
    }
    setVisible(false)
  }

  const onTabChange = (tab: string) => {
    setCurrentTab(tab)
  }

  const tabs = [
    {
      key: 'users',
      title: $t({ defaultMessage: 'Users' }),
      component: <Loader states={[queryResults]}>
        <SelectUsers usersData={usersData}
          delegatedAdminsData={delegatedAdminsData}
          setSelected={setSelectedUsers}
          selected={selectedUsers}
        />
      </Loader>
    },
    {
      key: 'privilegeGroup',
      title: $t({ defaultMessage: 'Privilege Groups' }),
      component: <Loader states={[
        { isLoading: isLoading,
          isFetching: isFetching
        }
      ]}>
        <SelectPGs data={privilegeGroupData}
          setSelected={setSelectedPrivilegeGroups}
          selected={selectedPrivilegeGroups}
        />
      </Loader>
    }
  ]

  const ActiveTabPane = tabs.find(({ key }) => key === currentTab)?.component

  const tabContent = <>
    <Tabs
      defaultActiveKey='users'
      activeKey={currentTab}
      onChange={onTabChange}
    >
      {tabs.map(({ key, title }) =>
        <Tabs.TabPane tab={title} key={key} />)}
    </Tabs>
    {ActiveTabPane}
  </>

  const footer =<div>
    <Button
      type='primary'
      disabled={!hasAdminSelected}
      onClick={() => handleSave()}>
      {$t({ defaultMessage: 'Save' })}
    </Button>
    <Button
      onClick={() => {
        setVisible(false)
      }}>
      {$t({ defaultMessage: 'Cancel' })}
    </Button>
  </div>

  return (
    <Drawer
      title={isTechPartner
        ? $t({ defaultMessage: 'Manage Tech Partner Delegations' })
        : $t({ defaultMessage: 'Manage MSP Delegations' })}
      visible={visible}
      onClose={onClose}
      footer={footer}
      destroyOnClose={resetField}
      width={700}
    >
      {tabContent}
    </Drawer>
  )
}
