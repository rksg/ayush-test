import { createContext } from 'react'

import type { Filter } from '@acx-ui/types'

export const SwitchClientContext = createContext({} as {
  setSwitchCount: (data: number) => void
  tableQueryFilters?: Filter
  setTableQueryFilters: (data: Filter) => void
})
