import { useConfigTemplateContext } from './ConfigTemplateContext'

export function useConfigTemplate () {
  const { isTemplate } = useConfigTemplateContext()

  return {
    isTemplate: !!isTemplate
  }
}
