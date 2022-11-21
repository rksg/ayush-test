import { createContext } from 'react'

import { MacRegistrationPoolSaveData } from '@acx-ui/rc/utils'
export interface MacRegistrationFormContextType {
  editMode: boolean,
  data: MacRegistrationPoolSaveData,
  setData: (data: MacRegistrationPoolSaveData) => void
}
const MacRegistrationListFormContext = createContext({} as MacRegistrationFormContextType)

export default MacRegistrationListFormContext

