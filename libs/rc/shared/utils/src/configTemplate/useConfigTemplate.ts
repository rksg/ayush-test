import { useConfigTemplateContext } from './ConfigTemplateContext'

export function useConfigTemplate () {
  const {
    isTemplate = false,
    templateContext = 'MSP',
    setSaveEnforcementConfigFn = () => {},
    saveEnforcementConfig = () => {}
  } = useConfigTemplateContext()

  return {
    isTemplate,
    templateContext,
    setSaveEnforcementConfigFn,
    saveEnforcementConfig
  }
}
