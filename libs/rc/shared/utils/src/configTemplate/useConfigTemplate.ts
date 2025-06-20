import { useConfigTemplateContext } from './ConfigTemplateContext'

export function useConfigTemplate () {
  const {
    isTemplate = false,
    setSaveEnforcementConfigFn = () => {},
    saveEnforcementConfig = () => {}
  } = useConfigTemplateContext()

  return {
    isTemplate,
    setSaveEnforcementConfigFn,
    saveEnforcementConfig
  }
}
