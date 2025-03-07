import { createContext, useContext } from 'react'

export type SaveEnforcementConfigFnType = (templateId: string) => Promise<void>

interface ConfigTemplateContextType {
  isTemplate: boolean
  setSaveEnforcementConfigFn?: (fn: SaveEnforcementConfigFnType) => void
  saveEnforcementConfig?: SaveEnforcementConfigFnType
}
export const ConfigTemplateContext = createContext({} as ConfigTemplateContextType)

export function useConfigTemplateContext () {
  return useContext(ConfigTemplateContext)
}
