import { createContext } from 'react'

export interface HeaderContextType {
  setSearchExpanded?: (isExpanded: boolean) => void,
  setLicenseExpanded: (isExpanded: boolean) => void,
  searchExpanded?: boolean,
  licenseExpanded: boolean
}

export const HeaderContext = createContext({} as HeaderContextType)



