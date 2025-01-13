import { useConfigTemplateContext } from './ConfigTemplateContext'

export function useConfigTemplate () {
  const { isTemplate, ...rest } = useConfigTemplateContext()

  return {
    isTemplate: !!isTemplate,
    ...rest
  }
}
