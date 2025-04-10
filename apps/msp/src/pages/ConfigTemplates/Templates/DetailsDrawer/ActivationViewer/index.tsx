import { Features }                 from '@acx-ui/feature-toggle'
import { withTemplateFeatureGuard } from '@acx-ui/rc/components'
import { ConfigTemplateType }       from '@acx-ui/rc/utils'

import { activationViewerMap, isAllowedDisplayActivationType } from './constants'

export { ApGroupVenueViewer } from './ApGroupVenueViewer'

export interface ActivationViewerProps {
  type: ConfigTemplateType
  templateId: string
}

export function ActivationViewer ({ type, templateId }: ActivationViewerProps) {
  if (!isAllowedDisplayActivationType(type)) {
    return null
  }

  const ActivationViewerComponent = activationViewerMap[type]

  return <ActivationViewerComponent type={type} templateId={templateId} />
}

export const ProtectedActivationViewer = withTemplateFeatureGuard({
  WrappedComponent: ActivationViewer,
  featureId: Features.CONFIG_TEMPLATE_DISPLAYABLE_ACTIVATION
})