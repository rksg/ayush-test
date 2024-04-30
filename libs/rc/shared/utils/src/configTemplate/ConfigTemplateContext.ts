import { createContext, useContext } from 'react'

interface ConfigTemplateContextType {
  isTemplate: boolean;
}
export const ConfigTemplateContext = createContext({} as ConfigTemplateContextType)

export function useConfigTemplateContext () {
  return useContext(ConfigTemplateContext)
}
