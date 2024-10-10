import { Key, useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import {
  Button,
  Drawer,
  Tabs
} from '@acx-ui/components'
import {
  useGetMspEcDelegatedAdminsQuery,
  useMspAdminListQuery,
  useUpdateMspEcDelegatedAdminsMutation
} from '@acx-ui/msp/services'
import {
  MspAdministrator,
  MspEcDelegatedAdmins
} from '@acx-ui/msp/utils'
import { useParams }   from '@acx-ui/react-router-dom'
import { RolesEnum }   from '@acx-ui/types'
import { AccountType } from '@acx-ui/utils'

import { SelectPGs }   from './selectPGs'
import { SelectUsers } from './selectUsers'

interface ManageMspDelegationDrawerProps {
  visible: boolean
  tenantId?: string
  setVisible: (visible: boolean) => void
  setSelected: (selected: MspAdministrator[]) => void
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

  const { visible, tenantId, setVisible, setSelected, tenantType } = props
  const [resetField, setResetField] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([])
  const [selectedRows, setSelectedRows] = useState<MspAdministrator[]>([])
  const [selectedRoles, setSelectedRoles] = useState<{ id: string, role: string }[]>([])
  const [currentTab, setCurrentTab] = useState('users')

  const onTabChange = (tab: string) => {
    setCurrentTab(tab)
  }

  const isSkip = tenantId === undefined
  const isTechPartner =
    (tenantType === AccountType.MSP_INSTALLER ||
     tenantType === AccountType.MSP_INTEGRATOR)

  function getSelectedKeys (mspAdmins: MspAdministrator[], admins: string[]) {
    return mspAdmins.filter(rec => admins.includes(rec.id)).map(rec => rec.email)
  }

  function getSelectedRows (mspAdmins: MspAdministrator[], admins: string[]) {
    return mspAdmins.filter(rec => admins.includes(rec.id))
  }

  const delegatedAdmins =
      useGetMspEcDelegatedAdminsQuery({ params: { mspEcTenantId: tenantId },
        enableRbac: true }, { skip: isSkip })
  const queryResults = useMspAdminListQuery({ params: useParams() })

  const usersQueryResults = queryResults.data?.filter(admin => SystemRoles.includes(admin.role))

  useEffect(() => {
    if (usersQueryResults && delegatedAdmins?.data) {
      const selRoles = delegatedAdmins?.data?.map((admin) => {
        return { id: admin.msp_admin_id, role: admin.msp_admin_role }
      })
      setSelectedRoles(selRoles)
      const admins = delegatedAdmins?.data.map((admin: MspEcDelegatedAdmins)=> admin.msp_admin_id)
      setSelectedKeys(getSelectedKeys(usersQueryResults as MspAdministrator[], admins))
      const selRows = getSelectedRows(usersQueryResults as MspAdministrator[], admins)
      setSelectedRows(selRows)
    }
  }, [usersQueryResults, delegatedAdmins?.data])

  const onClose = () => {
    setVisible(false)
    setSelectedRows([])
    setSelectedRoles([])
    setSelectedKeys([])
  }

  const resetFields = () => {
    setResetField(true)
    onClose()
  }

  const [ saveMspAdmins ] = useUpdateMspEcDelegatedAdminsMutation()

  const handleSave = () => {
    let payload: MspEcDelegatedAdmins[] = []
    let returnRows: MspAdministrator[] = []
    if (selectedRows && selectedRows.length > 0) {
      selectedRows.forEach((element:MspAdministrator) => {
        const role = selectedRoles.find(row => row.id === element.id)?.role ?? element.role
        payload.push ({
          msp_admin_id: element.id,
          msp_admin_role: role
        })
        const rowEntry = { ...element }
        rowEntry.role = role as RolesEnum
        returnRows.push(rowEntry)
      })
    } else {
      return
    }
    if (tenantId) {
      saveMspAdmins({ payload, params: { mspEcTenantId: tenantId } })
        .then(() => {
          setSelected(selectedRows)
          setVisible(false)
          resetFields()
        })
    } else {
      setSelected(returnRows)
    }
    setVisible(false)
  }

  const tabs = [
    {
      key: 'users',
      title: $t({ defaultMessage: 'Users' }),
      component: <SelectUsers

      />
    },
    {
      key: 'privilegeGroup',
      title: $t({ defaultMessage: 'Privilege Groups' }),
      component: <SelectPGs
      />
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
      disabled={selectedKeys.length === 0}
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
