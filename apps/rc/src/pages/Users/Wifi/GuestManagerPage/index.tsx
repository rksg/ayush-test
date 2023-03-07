import { useEffect } from 'react'

import { useIntl } from 'react-intl'

import { PageHeader }                 from '@acx-ui/components'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { RolesEnum }                  from '@acx-ui/types'
import { useUserProfileContext }      from '@acx-ui/user'

import { GuestsTable } from '../ClientList/GuestsTab/GuestsTable'


export default function GuestManagerPage () {
  const { $t } = useIntl()
  const { data: userProfile } = useUserProfileContext()
  const basePath = useTenantLink('/users/guestsManager')
  const navigate = useNavigate()
  useEffect(() => {
    return () => {
      if(userProfile && userProfile.role === RolesEnum.GUEST_MANAGER) {
        navigate({
          ...basePath,
          pathname: `${basePath.pathname}`
        })
      }
    }
  }, [userProfile])

  return <>
    <PageHeader
      title={$t({ defaultMessage: 'Guest Management' })}
    />
    <GuestsTable type='guests-manager'/>
  </>
}