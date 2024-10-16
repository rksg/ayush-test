import { createContext } from 'react'

import { UIConfiguration } from '@acx-ui/rc/utils'

export interface EnrollmentPortalContextType {
  value: UIConfiguration,
  setValue: (v:UIConfiguration) =>void
  reset: ()=>void
}

const EnrollmentPortalContext = createContext({} as EnrollmentPortalContextType)
export default EnrollmentPortalContext