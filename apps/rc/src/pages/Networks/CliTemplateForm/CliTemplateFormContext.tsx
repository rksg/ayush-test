import { createContext } from 'react'

export interface CliTemplateFormContextType {
  editMode: boolean,
  data: any | null
  setData?: (data: any) => void
}
const CliTemplateFormContext = createContext({} as CliTemplateFormContextType)

export default CliTemplateFormContext