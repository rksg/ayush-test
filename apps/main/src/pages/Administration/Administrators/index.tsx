import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { Tabs }                     from '@acx-ui/components'
import { Features, useIsSplitOn }   from '@acx-ui/feature-toggle'
import { useGetMspEcProfileQuery }  from '@acx-ui/msp/services'
import { MSPUtils }                 from '@acx-ui/msp/utils'
import { useGetTenantDetailsQuery } from '@acx-ui/rc/services'
import { TenantType }               from '@acx-ui/rc/utils'
import { useTenantLink }            from '@acx-ui/react-router-dom'
import { useUserProfileContext }    from '@acx-ui/user'
// import { useTenantId }              from '@acx-ui/utils'

import AdminGroups         from './AdminGroups'
import AdministratorsTable from './AdministratorsTable'
import DelegationsTable    from './DelegationsTable'
import * as UI             from './styledComponents'

const Administrators = () => {
  const { $t } = useIntl()
  // const params = { tenantId: useTenantId() }
  const params = useParams()
  const navigate = useNavigate()
  const basePath = useTenantLink('/administration/administrators')
  const mspUtils = MSPUtils()
  const isGroupBasedLoginEnabled = useIsSplitOn(Features.GROUP_BASED_LOGIN_TOGGLE)

  const { data: userProfileData, isPrimeAdmin } = useUserProfileContext()

  const tenantDetailsData = useGetTenantDetailsQuery({ params })
  const mspEcProfileData = useGetMspEcProfileQuery({ params })

  const isVAR = userProfileData?.var && !userProfileData?.support
  const tenantType = tenantDetailsData.data?.tenantType
  const isNonVarMsp = (tenantType === TenantType.MSP_NON_VAR)
  let isMspEc = mspUtils.isMspEc(mspEcProfileData.data)
  let currentUserMail = userProfileData?.email

  if (mspEcProfileData.data) {
    if (isMspEc === true) {
      currentUserMail = ''
    }
  }

  const isPrimeAdminUser = isPrimeAdmin()
  const isDelegationReady = (!isVAR && !isNonVarMsp) || isMspEc

  const tabs = {
    localAdmins: {
      title: $t({ defaultMessage: 'Local Admins' }),
      content: <AdministratorsTable
        currentUserMail={currentUserMail}
        isPrimeAdminUser={isPrimeAdminUser}
        isMspEc={isMspEc}
        tenantType={tenantType}
      />,
      visible: true
    },
    adminGroups: {
      title: $t({ defaultMessage: 'Admin Groups' }),
      content: <AdminGroups
        currentUserMail={currentUserMail}
        isPrimeAdminUser={isPrimeAdminUser}
        tenantType={tenantType}
      />,
      visible: true
    },
    delegatedAdmins: {
      title: $t({ defaultMessage: 'Delegated Admins' }),
      content: <DelegationsTable
        isMspEc={isMspEc}
        userProfileData={userProfileData}/>,
      visible: true
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
