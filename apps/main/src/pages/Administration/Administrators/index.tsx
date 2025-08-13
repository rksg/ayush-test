import { useEffect, useState } from 'react'

import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { Tabs }                    from '@acx-ui/components'
import { Features, useIsSplitOn }  from '@acx-ui/feature-toggle'
import { useGetMspEcProfileQuery } from '@acx-ui/msp/services'
import { MSPUtils }                from '@acx-ui/msp/utils'
import {
  useGetAdminGroupsQuery,
  useGetAdminListPaginatedQuery,
  useGetDelegationsQuery,
  useGetTenantAuthenticationsQuery,
  useGetTenantDetailsQuery
} from '@acx-ui/rc/services'
import { TenantAuthenticationType, TenantType } from '@acx-ui/rc/utils'
import { useTenantLink }                        from '@acx-ui/react-router-dom'
import { useUserProfileContext }                from '@acx-ui/user'

import AdminGroups         from './AdminGroups'
import AdministratorsTable from './AdministratorsTable'
import DelegationsTable    from './DelegationsTable'
import * as UI             from './styledComponents'

const Administrators = () => {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('/administration/administrators')
  const mspUtils = MSPUtils()
  const [isSsoConfigured, setSsoConfigured] = useState(false)
  const isGroupBasedLoginEnabled = useIsSplitOn(Features.GROUP_BASED_LOGIN_TOGGLE)

  const { data: userProfileData, isPrimeAdmin } = useUserProfileContext()

  const tenantDetailsData = useGetTenantDetailsQuery({ params })
  const mspEcProfileData = useGetMspEcProfileQuery({ params })

  const countPayload = {
    page: 1,
    pageSize: 10,
    sortField: 'name',
    sortOrder: 'ASC',
    searchTargetFields: ['name', 'username'],
    searchString: '',
    filters: {}
  }

  const adminList = useGetAdminListPaginatedQuery(
    { params, payload: countPayload }, { skip: !isGroupBasedLoginEnabled })
  const adminGroupList = useGetAdminGroupsQuery(
    { params }, { skip: !isGroupBasedLoginEnabled })
  const thirdPartyAdminList = useGetDelegationsQuery(
    { params }, { skip: !isGroupBasedLoginEnabled }
  )

  const adminCount = adminList?.data?.totalCount || 0
  const adminGroupCount = adminGroupList?.data?.length! || 0
  const delegatedAdminCount = thirdPartyAdminList.data?.length! || 0

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
        n.authenticationType === TenantAuthenticationType.saml ||
        n.authenticationType === TenantAuthenticationType.google_workspace)
      if (ssoData?.length && ssoData?.length > 0) {
        setSsoConfigured(true)
      }
    }
  }, [tenantAuthenticationData])


  const isPrimeAdminUser = isPrimeAdmin()
  const isDelegationReady = (!isVAR && !isMsp && !isNonVarMsp) || isMspEc

  const tabs = {
    localAdmins: {
      title: $t({ defaultMessage: 'Local Admins ({adminCount})' }, { adminCount }),
      content: <AdministratorsTable
        currentUserMail={currentUserMail}
        isPrimeAdminUser={isPrimeAdminUser}
        isMspEc={isMspEc}
        tenantType={tenantType}
      />,
      visible: true
    },
    adminGroups: {
      title: $t({ defaultMessage: 'Admin Groups ({adminGroupCount})' }, { adminGroupCount }),
      content: <AdminGroups
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
      visible: isDelegationReady ? true : false
    }
  }

  const onTabChange = (activeKey: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${activeKey}`
    })
  }

  return (
    isGroupBasedLoginEnabled
      ? <Tabs
        defaultActiveKey='localAdmins'
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
      : <UI.Wrapper
        direction='vertical'
        justify-content='space-around'
        size={36}
      >
        <AdministratorsTable
          currentUserMail={currentUserMail}
          isPrimeAdminUser={isPrimeAdminUser}
          isMspEc={isMspEc}
          tenantType={tenantType}
        />
        {isDelegationReady &&
      <DelegationsTable
        isMspEc={isMspEc}
        userProfileData={userProfileData}/>
        }
      </UI.Wrapper>
  )
}

export default Administrators
