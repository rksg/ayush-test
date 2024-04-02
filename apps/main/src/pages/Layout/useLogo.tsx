import React, { useMemo } from 'react'

import { Logo }                                              from '@acx-ui/main/components'
import { useGetMspEcProfileQuery, useGetParentLogoUrlQuery } from '@acx-ui/msp/services'
import { MSPUtils }                                          from '@acx-ui/msp/utils'
import { TenantNavLink }                                     from '@acx-ui/react-router-dom'
import { RolesEnum }                                         from '@acx-ui/types'
import { hasRoles }                                          from '@acx-ui/user'

const { isMspEc } = MSPUtils()

export function useLogo (tenantId: string | undefined): React.ReactNode {
  const isGuestManager = hasRoles([RolesEnum.GUEST_MANAGER])
  const indexPath = isGuestManager ? '/users/guestsManager' : '/dashboard'

  const isDPSKAdmin = hasRoles([RolesEnum.DPSK_ADMIN])

  const { data: mspEcProfile } = useGetMspEcProfileQuery({ params: { tenantId } })
  const { data: mspLogo } =
    useGetParentLogoUrlQuery({ params: { tenantId } }, { skip: !isMspEc(mspEcProfile) })
  const logoContent = useMemo(() => {
    if (mspEcProfile) {
      if (isMspEc(mspEcProfile) && mspLogo && Boolean(mspLogo.logo_url)) {
        return <img src={mspLogo!.logo_url} alt={mspEcProfile.msp_label} />
      }
      if (!isMspEc(mspEcProfile) || mspLogo) return <Logo />
    }
    return null
  }, [mspEcProfile, mspLogo])

  if (isDPSKAdmin) {
    return logoContent
  }
  return <TenantNavLink to={indexPath} children={logoContent} />
}
