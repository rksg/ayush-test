import React, { useState } from 'react'

import { Switch }  from 'antd'
import { useIntl } from 'react-intl'

import { showToast }                              from '@acx-ui/components'
import { TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { DetailsActions }         from '../../DetailsActions'
import {
  RecommendationListItem,
  useDeleteRecommendationMutation,
  useMuteRecommendationMutation
} from '../services'
import { getDeleteTooltipText, enabledDeleteStatus } from '../Table'

import { RecommendationSettingTitle, DeleteOutlinedIcon } from './styledComponents'

import type { RecommendationDetails } from './services'

type Props = Pick<RecommendationDetails, 'id' | 'status' | 'trigger' | 'isMuted'> & {
  link: string
  type: string
  actions: React.ReactNode
}
function RecommendationSetting ({ ...props }: Props) {
  const { id, status, trigger, link, type, actions } = props
  const { $t } = useIntl()
  const [ muteRecommendation ] = useMuteRecommendationMutation()
  const [deleteRecommendation] = useDeleteRecommendationMutation()
  const [ isMuted, setIsMuted ] = useState(props.isMuted)

  const navigate = useNavigate()
  const basePath = useTenantLink('/analytics')

  const toggleCallback = async (checked: boolean) => {
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
  }

  const elements = [
    {
      title: $t({ defaultMessage: 'Actions' }),
      content: actions
    },
    {
      title: $t({ defaultMessage: 'Mute Recommendation' }),
      content: <>
        <Switch
          checked={isMuted}
          onChange={async checked => {
            setIsMuted(checked)
            toggleCallback(checked)
          }}
        />
        <p>{$t({ defaultMessage: `While this recommendation is muted, it will be hidden in the UI.
          You can unmute this recommendation via setting icon in the {link}.` },
        { link: <TenantLink to={link}>
          {$t({ defaultMessage: '{type} table' }, { type })}
        </TenantLink> })
        }</p>
      </>
    },
    ...((trigger === 'daily' && enabledDeleteStatus.includes(status))
      ? [{
        title: <RecommendationSettingTitle>
          <DeleteOutlinedIcon
            onClick={async () => {
              await deleteRecommendation({ id }).unwrap()
              navigate({
                ...basePath,
                pathname: `${basePath.pathname}/recommendations/crrm`
              })
              // TODO: add toast ?
            }} />
          {$t({ defaultMessage: 'Delete Recommendation' })}
        </RecommendationSettingTitle>,
        content: <p>{getDeleteTooltipText({ status } as RecommendationListItem)}</p>
      }]
      : [])
  ]

  return <DetailsActions overlayElements={elements}/>
}
export default RecommendationSetting
