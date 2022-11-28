import { createContext } from 'react'

import { MacRegistrationPool } from '@acx-ui/rc/utils'
export interface MacRegistrationFormContextType {
  editMode: boolean,
  data: MacRegistrationPool,
  setData: (data: MacRegistrationPool) => void
}
const MacRegistrationListFormContext = createContext({} as MacRegistrationFormContextType)

export default MacRegistrationListFormContext

