import { createContext } from 'react'

import { Band } from '@acx-ui/components'

export interface NetworkFilterData{
    paths: unknown | null
    bands: Band[] | null
}

export interface NetworkFilterContextType {
    data: NetworkFilterData | null
    setData: (data: NetworkFilterData) => void
}

export const NetworkFilterContext = createContext({} as NetworkFilterContextType)