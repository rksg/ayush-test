import { Loader }             from '@acx-ui/components'
import { ConfigTemplateType } from '@acx-ui/rc/utils'

import { useVenueActivationNames } from './VenueActivationViewer'

export function ApGroupVenueViewer ({ templateId }: { templateId: string }) {
  const { names, isLoading } = useVenueActivationNames(ConfigTemplateType.AP_GROUP, templateId)

  return (
    <Loader states={[{ isLoading }]} style={{ width: '100%', backgroundColor: 'transparent' }}>
      {names[0]}
    </Loader>
  )
}