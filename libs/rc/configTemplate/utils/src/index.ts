import {
  useConfigTemplate,
  useConfigTemplateTenantLink
} from '@acx-ui/rc/utils'
import { Path, useTenantLink } from '@acx-ui/react-router-dom'

export * from './useEnforcedStatus'

// eslint-disable-next-line max-len
export function usePathBasedOnConfigTemplate (regularPath: string, configTemplatePath?: string): Path {
  const { isTemplate } = useConfigTemplate()
  const baseEditPath = useTenantLink(regularPath)
  const baseConfigTemplateEditPath = useConfigTemplateTenantLink(configTemplatePath ?? regularPath)

  return isTemplate ? baseConfigTemplateEditPath : baseEditPath
}
