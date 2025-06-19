import { createContext, useContext } from 'react'

export type SaveEnforcementConfigFnType = (templateId: string) => Promise<void>

export interface ConfigTemplateContextType {
  isTemplate: boolean
  setSaveEnforcementConfigFn?: (fn: SaveEnforcementConfigFnType) => void
  saveEnforcementConfig?: SaveEnforcementConfigFnType
  templateContext?: 'MSP' | 'REC'
}
export const ConfigTemplateContext = createContext({} as ConfigTemplateContextType)

export function useConfigTemplateContext () {
  return useContext(ConfigTemplateContext)
}
