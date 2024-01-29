import React from 'react'

import { useIntl } from 'react-intl'

import { showToast }  from '@acx-ui/components'
import { TenantLink } from '@acx-ui/react-router-dom'

import DetailsActions                    from '../../DetailsActions'
import { useMuteRecommendationMutation } from '../services'

import type { RecommendationDetails } from './services'

type Props = Pick<RecommendationDetails, 'id' | 'isMuted'> & {
  link: string
  type: string
  actions: React.ReactNode
}
function RecommendationSetting ({ ...props }: Props) {
  const { id, isMuted, link, type, actions } = props
  const { $t } = useIntl()
  const [ muteRecommendation ] = useMuteRecommendationMutation()

  return <DetailsActions
    toggleCallback={async (checked: boolean) => {
      const { toggleMute } = await muteRecommendation({ id, mute: checked }).unwrap()
      if (toggleMute.success) {
        showToast({
          type: 'success',
          content: $t(
            { defaultMessage: 'Recommendation {state} successfully' },
            { state: checked ? 'muted' : 'unmuted' }
          )
        })
      } else {
        showToast({ type: 'error', content: toggleMute.errorMsg })
      }
    }}
    muted={isMuted}
    /* eslint-disable max-len */
    overlay={{
      title: $t({ defaultMessage: 'Mute Recommendation' }),
      content: $t({ defaultMessage: 'While this recommendation is muted, it will be hidden in the UI. You can unmute this recommendation via setting icon in the {link}.' }, { link: <TenantLink to={link}>{$t({ defaultMessage: '{type} table' }, { type })}</TenantLink> }) as string
    }}
    /* eslint-enable max-len */
    extraOverlay={{
      title: $t({ defaultMessage: 'Actions' }),
      content: actions
    }}
  />
}
export default RecommendationSetting
