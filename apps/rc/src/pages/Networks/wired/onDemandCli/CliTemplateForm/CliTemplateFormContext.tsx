import { createContext } from 'react'

import { CliConfiguration } from '@acx-ui/rc/utils'

export interface CliValidation {
  valid: boolean,
  tooltip: string
}

export interface ApplySwitches {
  id: string
  name?: string
  venueName: string
}

export interface CliTemplateFormContextType {
  editMode: boolean,
  cliValidation: CliValidation
  setCliValidation: (data: CliValidation) => void
  data?: CliConfiguration | null
  setData?: (data?: CliConfiguration) => void
  initCodeMirror?: boolean
  setInitCodeMirror?: (data?: boolean) => void
  applySwitches?: Record<string, ApplySwitches[]>
  setApplySwitches?: (data: Record<string, ApplySwitches[]>) => void
  applyModels?: string[]
  setApplyModels?: (data: string[]) => void
}

const CliTemplateFormContext = createContext({} as CliTemplateFormContextType)

export default CliTemplateFormContext