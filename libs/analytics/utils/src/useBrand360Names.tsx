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
    let names: Brand360Names = {
      brand: $t({ defaultMessage: 'Brand 360' }),
      lsp: $t({ defaultMessage: 'LSP' }),
      property: $t({ defaultMessage: 'Property' })
    }

    const keys = Object.keys(names) as Array<keyof Brand360Names>
    if (settings) {
      for (const key of keys) {
        if (mapper[key] in settings) {
          names = { ...names, [key]: settings![mapper[key]]! }
        }
      }
    }

    return names
  }, [settings, $t])
}
