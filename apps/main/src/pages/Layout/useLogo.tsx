import React, { useMemo } from 'react'

import { Logo }                                              from '@acx-ui/main/components'
import { useGetMspEcProfileQuery, useGetParentLogoUrlQuery } from '@acx-ui/msp/services'
import { MSPUtils }                                          from '@acx-ui/msp/utils'

const { isMspEc } = MSPUtils()

export function useLogo (tenantId: string | undefined): React.ReactNode {
  const { data: mspEcProfile } = useGetMspEcProfileQuery({ params: { tenantId } })
  const { data: mspLogo } =
    useGetParentLogoUrlQuery({ params: { tenantId } }, { skip: !isMspEc(mspEcProfile) })
  return useMemo(() => {
    if (mspEcProfile) {
      if (isMspEc(mspEcProfile) && mspLogo && Boolean(mspLogo.logo_url)) {
        return <img src={mspLogo!.logo_url} alt={mspEcProfile.msp_label} />
      }
      if (!isMspEc(mspEcProfile) || mspLogo) return <Logo />
    }
    return null
  }, [mspEcProfile, mspLogo])
}
