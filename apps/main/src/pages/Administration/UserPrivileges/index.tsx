import { useEffect, useState } from 'react'

import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { Tabs }                    from '@acx-ui/components'
import { Features, useIsSplitOn }  from '@acx-ui/feature-toggle'
import { useGetMspEcProfileQuery } from '@acx-ui/msp/services'
import { MSPUtils }                from '@acx-ui/msp/utils'
import {
  useGetAdminGroupsQuery,
  useGetAdminListQuery,
  useGetCustomRolesQuery,
  useGetDelegationsQuery,
  useGetPrivilegeGroupsQuery,
  useGetTenantAuthenticationsQuery,
  useGetTenantDetailsQuery
} from '@acx-ui/rc/services'
import {
  AdministrationUrlsInfo,
  AdminRbacUrlsInfo,
  TenantAuthenticationType,
  TenantType
} from '@acx-ui/rc/utils'
import { useTenantLink }                               from '@acx-ui/react-router-dom'
import { hasAllowedOperations, useUserProfileContext } from '@acx-ui/user'
import { getOpsApi }                                   from '@acx-ui/utils'

import DelegationsTable from '../Administrators/DelegationsTable'

import CustomRoles        from './CustomRoles'
import PriviledgeGroups   from './PrivilegeGroups'
import NewPrivilegeGroups from './PrivilegeGroups/NewPrivilegeGroups'
import SsoGroups          from './SsoGroups'
import UsersTable         from './UsersTable'


const UserPrivileges = () => {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('/administration/userPrivileges')
  const mspUtils = MSPUtils()
  const [isSsoConfigured, setSsoConfigured] = useState(false)
  const isGroupBasedLoginEnabled = useIsSplitOn(Features.GROUP_BASED_LOGIN_TOGGLE)
  const usePrivilegeGrouspPaginatedAPI
  = useIsSplitOn(Features.ACX_UI_USE_PAGIATED_PRIVILEGE_GROUP_API)

  const { data: userProfileData, isPrimeAdmin } = useUserProfileContext()

  const tenantDetailsData = useGetTenantDetailsQuery({ params })
  const mspEcProfileData = useGetMspEcProfileQuery({ params })
  const adminList = useGetAdminListQuery(
    { params }, { skip: !isGroupBasedLoginEnabled })
  const ssoGroupList = useGetAdminGroupsQuery(
    { params }, { skip: !isGroupBasedLoginEnabled })
  const thirdPartyAdminList = useGetDelegationsQuery(
    { params }, { skip: !isGroupBasedLoginEnabled })
  const privilegeGroupList = useGetPrivilegeGroupsQuery(
    { params }, { skip: !isGroupBasedLoginEnabled })

  const customRoleList = useGetCustomRolesQuery(
    { params }, { skip: !isGroupBasedLoginEnabled })

  const adminCount = adminList?.data?.length! || 0
  const ssoGroupCount = ssoGroupList?.data?.length! || 0
  const delegatedAdminCount = thirdPartyAdminList.data?.length! || 0
  const privilegeGroupCount = privilegeGroupList.data?.length! || 0
  const customRoleCount = customRoleList.data?.length! || 0

  const tenantType = tenantDetailsData.data?.tenantType
  const isVAR = tenantType === TenantType.VAR && !userProfileData?.support
  const isMsp = (tenantType === TenantType.MSP)
  const isNonVarMsp = (tenantType === TenantType.MSP_NON_VAR)
  let isMspEc = mspUtils.isMspEc(mspEcProfileData.data)
  let currentUserMail = userProfileData?.email
  const tenantAuthenticationData =
    useGetTenantAuthenticationsQuery({ params })

  if (mspEcProfileData.data) {
    if (isMspEc === true) {
      currentUserMail = ''
    }
  }

  useEffect(() => {
    if (tenantAuthenticationData) {
      const ssoData = tenantAuthenticationData.data?.filter(n =>
        n.authenticationType === TenantAuthenticationType.saml)
      if (ssoData?.length && ssoData?.length > 0) {
        setSsoConfigured(true)
      }
    }
  }, [tenantAuthenticationData])


  const isPrimeAdminUser = isPrimeAdmin()
  const isDelegationReady = (!isVAR && !isMsp && !isNonVarMsp) || isMspEc

  const tabs = {
    users: {
      title: $t({ defaultMessage: 'Users ({adminCount})' }, { adminCount }),
      content: <UsersTable
        currentUserMail={currentUserMail}
        isPrimeAdminUser={isPrimeAdminUser}
        isMspEc={isMspEc}
        tenantType={tenantType}
      />,
      visible: hasAllowedOperations([getOpsApi(AdministrationUrlsInfo.getAdministrators)])
    },
    ssoGroups: {
      title: $t({ defaultMessage: 'SSO Groups ({ssoGroupCount})' }, { ssoGroupCount }),
      content: <SsoGroups
        isPrimeAdminUser={isPrimeAdminUser}
        tenantType={tenantType}
      />,
      visible: isSsoConfigured ? true : false
    },
    delegatedAdmins: {
      title: $t({ defaultMessage: 'Delegated Admins ({delegatedAdminCount})' },
        { delegatedAdminCount }),
      content: <DelegationsTable
        isMspEc={isMspEc}
        userProfileData={userProfileData}/>,
      visible: (isDelegationReady ? true : false) &&
        hasAllowedOperations([getOpsApi(AdministrationUrlsInfo.getDelegations)])
    },
    privilegeGroups: {
      title: $t({ defaultMessage: 'Privilege Groups ({privilegeGroupCount})' },
        { privilegeGroupCount }),
      content: usePrivilegeGrouspPaginatedAPI ?
        <NewPrivilegeGroups
          isPrimeAdminUser={isPrimeAdminUser}
          tenantType={tenantType}
        />
        : <PriviledgeGroups
          isPrimeAdminUser={isPrimeAdminUser}
          tenantType={tenantType}
        />,
      visible: hasAllowedOperations([getOpsApi(AdminRbacUrlsInfo.getPrivilegeGroups)])
    },
    customRoles: {
      title: $t({ defaultMessage: 'Roles ({customRoleCount})' }, { customRoleCount }),
      content: <CustomRoles
        isPrimeAdminUser={isPrimeAdminUser}
        tenantType={tenantType}
      />,
      visible: hasAllowedOperations([getOpsApi(AdministrationUrlsInfo.getCustomRoles)])
    }
  }

  const onTabChange = (activeKey: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${activeKey}`
    })
  }

  return (
    <Tabs
      defaultActiveKey='users'
      type='card'
      onChange={onTabChange}
      activeKey={params.activeSubTab}
    >
      {
        Object.entries(tabs).map((item) =>
          item[1].visible &&
          <Tabs.TabPane
            key={item[0]}
            tab={item[1].title}
            children={item[1].content}
          />)
      }
    </Tabs>
  )
}

export default UserPrivileges
