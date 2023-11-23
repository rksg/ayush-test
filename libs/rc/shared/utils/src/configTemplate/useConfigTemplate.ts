import { useConfigTemplateContext } from './ConfigTemplateContext'

export function useConfigTemplate () {
  const { isTemplate } = useConfigTemplateContext()

  const genTemplatePayload = (payload: object) => {
    return generateTemplatePayload(isTemplate, payload)
  }

  return {
    isTemplate: !!isTemplate,
    genTemplatePayload
  }
}

function generateTemplatePayload (isTemplate: boolean, payload: object) {
  return isTemplate ? { ...payload, isTemplate: true } : payload
}
