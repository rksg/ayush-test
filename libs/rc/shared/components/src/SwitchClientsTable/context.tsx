import { createContext } from 'react'

import { Filter } from '@acx-ui/components'

export const SwitchClientContext = createContext({} as {
  setSwitchCount: (data: number) => void
  tableQueryFilters?: Filter
  setTableQueryFilters: (data: Filter) => void
})
