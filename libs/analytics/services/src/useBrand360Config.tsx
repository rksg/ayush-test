
import { useMemo } from 'react'

import { useIntl } from 'react-intl'

import type { Settings } from '@acx-ui/analytics/utils'
import { hasPermission } from '@acx-ui/user'

import { useGetTenantSettingsQuery } from './rbacApi'

interface Brand360Names {
  brand: string
  lsp: string
  property: string
}

const mapper: Record<keyof Brand360Names, keyof Settings> = {
  brand: 'brand-name',
  lsp: 'lsp-name',
  property: 'property-name'
}

export function useBrand360Config () {
  const { $t } = useIntl()
  const settingsQuery = useGetTenantSettingsQuery(undefined, {
    skip: !hasPermission({ permission: 'READ_USERS' })
  })
  const settings = settingsQuery.data

  return useMemo(() => {
    const names: Brand360Names = {
      brand: $t({ defaultMessage: 'Brand 360' }),
      lsp: $t({ defaultMessage: 'LSP' }),
      property: $t({ defaultMessage: 'Property' })
    }

    if (!settings) return {
      names,
      settingsQuery
    }

    return {
      names: Object
        .entries(mapper)
        .reduce((acc, [key, settingKey]) => {
          const value = settings[settingKey]
          if (value) acc[key as keyof Brand360Names] = value
          return acc
        }, names),
      settingsQuery
    }
  }, [settingsQuery, settings, $t])
}
