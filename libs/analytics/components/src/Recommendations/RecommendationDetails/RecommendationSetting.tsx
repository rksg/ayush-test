import React, { useState } from 'react'

import { Switch }                 from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import { Tooltip }                                from '@acx-ui/components'
import { get }                                    from '@acx-ui/config'
import { Features, useIsSplitOn }                 from '@acx-ui/feature-toggle'
import { TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { DetailsActions }          from '../../DetailsActions'
import { RecommendationActions }   from '../RecommendationActions'
import {
  useDeleteRecommendationMutation,
  useMuteRecommendationMutation
} from '../services'
import {
  getDeleteTooltipText,
  enableDeleteStatus,
  toggleMuteFn,
  clickDeleteFn
} from '../Table'

import { DeleteOutlinedIcon } from './styledComponents'

import type { EnhancedRecommendation } from './services'

export const recommendationTypeMapping = {
  aiOps: {
    title: defineMessage({ defaultMessage: 'AI Operations' }),
    link: 'analytics/recommendations/aiOps'
  },
  crrm: {
    title: defineMessage({ defaultMessage: 'AI-Driven RRM' }),
    link: 'analytics/recommendations/crrm'
  }
}
export function RecommendationSetting (
  { recommendationDetails }: { recommendationDetails: EnhancedRecommendation }
) {
  const isRecommendationDeleteEnabled =
    useIsSplitOn(Features.RECOMMENDATION_DELETE) || Boolean(get('IS_MLISA_SA'))

  const { id, status, trigger, code } = recommendationDetails
  const category = code.startsWith('c-crrm-') ? 'crrm' : 'aiOps'
  const { title, link } = recommendationTypeMapping[category]
  const { $t } = useIntl()
  const [ muteRecommendation ] = useMuteRecommendationMutation()
  const [ deleteRecommendation ] = useDeleteRecommendationMutation()
  const [ isMuted, setIsMuted ] = useState( recommendationDetails.isMuted)

  const navigate = useNavigate()
  const basePath = useTenantLink('/analytics')

  const elements = [
    {
      title: $t({ defaultMessage: 'Actions' }),
      content: <RecommendationActions recommendation={{
        ...recommendationDetails, statusEnum: recommendationDetails.status }} />
    },
    {
      title: $t({ defaultMessage: 'Mute Recommendation' }),
      content: <>
        <Switch
          checked={isMuted}
          onChange={async checked => toggleMuteFn(
            id, checked, muteRecommendation, () => setIsMuted(checked))
          }
        />
        <p>{$t({ defaultMessage: `While this recommendation is muted, it will be hidden in the UI.
          You can unmute this recommendation via setting icon in the {link}.` },
        { link: <TenantLink to={link}>
          {$t({ defaultMessage: '{type} table' }, { type: $t(title) })}
        </TenantLink> })
        }</p>
      </>
    },
    ...((trigger === 'daily' &&
    enableDeleteStatus.includes(status) &&
    isRecommendationDeleteEnabled
    ) ? [{
        title: $t({ defaultMessage: 'Delete Recommendation' }),
        content: <>
          <Tooltip
            placement='top'
            title={$t({ defaultMessage: 'Delete' })}
          >
            <DeleteOutlinedIcon onClick={()=> clickDeleteFn(id, deleteRecommendation, () => {
              navigate({
                ...basePath,
                pathname: `${basePath.pathname}/recommendations/crrm`
              })
            })} />
          </Tooltip>
          <p>{getDeleteTooltipText(status)}</p>
        </>
      }]
      : [])
  ]

  return <DetailsActions overlayElements={elements}/>
}
