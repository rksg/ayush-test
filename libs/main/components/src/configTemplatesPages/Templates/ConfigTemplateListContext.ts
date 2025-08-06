import { createContext, useContext } from 'react'

interface ConfigTemplateListContextType {
  setAppliedToViewVisible: (visible: boolean) => void
}
export const ConfigTemplateListContext = createContext({} as ConfigTemplateListContextType)

export function useConfigTemplateListContext () {
  return useContext(ConfigTemplateListContext)
}
