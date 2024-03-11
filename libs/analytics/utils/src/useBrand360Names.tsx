import { useMemo } from 'react'

import { useIntl } from 'react-intl'

import type { Settings } from './user/types'

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

export function useBrand360Names (settings: Partial<Settings> | undefined): Brand360Names {
  const { $t } = useIntl()
  return useMemo(() => {
    const names: Brand360Names = {
      brand: $t({ defaultMessage: 'Brand 360' }),
      lsp: $t({ defaultMessage: 'LSP' }),
      property: $t({ defaultMessage: 'Property' })
    }

    if (!settings) return names

    return Object.entries(mapper).reduce((acc, [key, settingKey]) => {
      const value = settings[settingKey]
      if (value) acc[key as keyof Brand360Names] = value
      return acc
    }, names)
  }, [settings, $t])
}
