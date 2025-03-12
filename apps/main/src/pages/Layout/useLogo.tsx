import React, { useMemo } from 'react'

import { baseUrlFor }                                        from '@acx-ui/config'
import { Features, useIsSplitOn }                            from '@acx-ui/feature-toggle'
import { useGetMspEcProfileQuery, useGetParentLogoUrlQuery } from '@acx-ui/msp/services'
import { MSPUtils }                                          from '@acx-ui/msp/utils'

const { isMspEc } = MSPUtils()

export function useLogo (tenantId: string | undefined): React.ReactNode {
  const isRbacEnabled = useIsSplitOn(Features.ABAC_POLICIES_TOGGLE)
  const { data: mspEcProfile } = useGetMspEcProfileQuery({ params: { tenantId } })
  const { data: mspLogo } =
    useGetParentLogoUrlQuery({ params: { tenantId }, enableRbac: isRbacEnabled },
      { skip: !isMspEc(mspEcProfile) })
  return useMemo(() => {
    if (mspEcProfile) {
      if (isMspEc(mspEcProfile) && mspLogo && Boolean(mspLogo.logo_url)) {
        return <img src={mspLogo!.logo_url} alt={mspEcProfile.msp_label} />
      }
      if (!isMspEc(mspEcProfile) || mspLogo) return <img
        src={baseUrlFor('/assets/Logo.svg')}
        alt='logo'
        width={180}
        height={60}
      />
    }
    return null
  }, [mspEcProfile, mspLogo])
}
