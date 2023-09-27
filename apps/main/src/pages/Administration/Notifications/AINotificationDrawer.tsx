import { useState, useEffect, Dispatch, SetStateAction } from 'react'

import { Button }                                    from 'antd'
import {  get, isEmpty }                             from 'lodash'
import { defineMessage, MessageDescriptor, useIntl } from 'react-intl'

import {
  AnalyticsPreferences,
  useGetPreferencesQuery,
  useSetNotificationMutation,
  NotificationMethod
} from '@acx-ui/analytics/services'
import { showToast, Loader, Drawer } from '@acx-ui/components'
import { useIsSplitOn, Features }    from '@acx-ui/feature-toggle'
import { getUserProfile }            from '@acx-ui/user'

import * as UI from './styledComponents'

type ListLabel = {
  label: MessageDescriptor
  key: string
  checked: NotificationMethod[]
}

const labels = {
  incident: {
    P1: defineMessage({ defaultMessage: 'P1 Incidents' }),
    P2: defineMessage({ defaultMessage: 'P2 Incidents' }),
    P3: defineMessage({ defaultMessage: 'P3 Incidents' }),
    P4: defineMessage({ defaultMessage: 'P4 Incidents' })
  },
  configRecommendation: {
    crrm: defineMessage({ defaultMessage: 'AI-Driven RRM' }),
    aiOps: defineMessage({ defaultMessage: 'AI Operations' })
  }
}

function getPreferenceLabel (
  pref: AnalyticsPreferences,
  type: 'incident' | 'configRecommendation'
): ListLabel[] {

  return Object.keys(get(labels, type)).map((key) => ({
    key,
    label: get(labels, [type, key]),
    checked: get(pref, [type, key], [])
  }))
}

const getApplyMsg = (success?: boolean) => {
  return success
    ? defineMessage({ defaultMessage: 'Incident notifications updated succesfully.' })
    : defineMessage({ defaultMessage: 'Update failed, please try again later.' })
}

const title = defineMessage({
  // eslint-disable-next-line max-len
  defaultMessage: 'Set your AI notification preferences. These notifications are only sent through email:'
})
const afterMsg = defineMessage({
  defaultMessage: 'This will apply to all the recipients defined for this account.'
})

function OptionsList ({ labels, setState, type }:
  {
    labels: ListLabel[],
    setState: Dispatch<SetStateAction<AnalyticsPreferences>>,
    type: 'incident' | 'configRecommendation'
  }) {
  const { $t } = useIntl()
  return <UI.List bordered={false}>
    {labels.map((({ label, key, checked }) => <UI.List.Item key={key}>
      <span>
        <UI.Checkbox
          id={key}
          name={key}
          checked={checked.includes('email')}
          onChange={(e) => setState((currPref: AnalyticsPreferences) => {
            const config = get(currPref, type, undefined)
            let method: NotificationMethod[] = get(currPref, [type, key], [])
            if (e.target.checked) {
              method = method.concat(['email'])
            } else {
              method = method.filter(m => m !== 'email')
            }
            return {
              ...(!isEmpty(currPref) ? currPref : {}),
              [type]: {
                ...(!isEmpty(config) ? currPref[type] : {}),
                [key]: method
              }
            }
          })} />
        <label htmlFor={key}>{$t(label)}</label>
      </span>
    </UI.List.Item>))}
  </UI.List>
}

export const AINotificationDrawer = ({
  showDrawer,
  setShowDrawer
}: {
  showDrawer: boolean,
  setShowDrawer: CallableFunction
}) => {
  const { $t } = useIntl()
  const user = getUserProfile()
  const { tenantId } = user.profile
  const query = useGetPreferencesQuery({ tenantId: tenantId })
  const [state, setState] = useState<AnalyticsPreferences>({})
  useEffect(() => { setState(query.data!) }, [query.data])
  const [updatePrefrences] = useSetNotificationMutation()
  const allowRecommandations = useIsSplitOn(Features.RECOMMENDATION_EMAIL_NOTIFICIATION_TOGGLE)
  const onClose = () => setShowDrawer(false)
  const onApply = () => {
    updatePrefrences({
      tenantId,
      preferences: {
        ...query.data!,
        ...state
      }
    })
      .unwrap()
      .then(({ success }) => {
        showToast({
          type: success ? 'success' : 'error',
          content: $t(getApplyMsg(success))
        })
        setShowDrawer(false)
      })
      .catch(() => {
        showToast({
          type: 'error',
          content: $t(getApplyMsg())
        })
        setShowDrawer(false)
      })
  }
  const incidentLabels = getPreferenceLabel(state, 'incident')
  const recommendationLabels = getPreferenceLabel(state, 'configRecommendation')
  return <Drawer
    title={$t({ defaultMessage: 'AI Notifications' })}
    visible={showDrawer}
    onClose={onClose}
    destroyOnClose
    footer={<UI.FooterWrapper>
      <UI.AfterMsg>{$t(afterMsg)}</UI.AfterMsg>
      <UI.ButtonFooterWrapper>
        <Button
          type='primary'
          onClick={() => onApply()}>
          {$t({ defaultMessage: 'Apply' })}
        </Button>
        <Button type='default' onClick={() => onClose()}>
          {$t({ defaultMessage: 'Cancel' })}
        </Button>
      </UI.ButtonFooterWrapper>
    </UI.FooterWrapper>}
  >
    <Loader states={[query]}>
      <UI.IncidentNotificationWrapper>
        <div>{$t(title)}</div>
        <UI.SectionTitle>{$t({ defaultMessage: 'Incidents' })}</UI.SectionTitle>
        <OptionsList labels={incidentLabels} setState={setState} type='incident' />
        { allowRecommandations && <>
          <UI.SectionTitle>{$t({ defaultMessage: 'Recommendations' })}</UI.SectionTitle>
          <OptionsList
            labels={recommendationLabels}
            setState={setState}
            type='configRecommendation' />
        </>}
      </UI.IncidentNotificationWrapper>
    </Loader>
  </Drawer>
}
