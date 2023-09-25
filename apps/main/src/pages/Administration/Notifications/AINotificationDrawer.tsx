import { useState, useEffect } from 'react'

import { Button }                 from 'antd'
import { forOwn }                 from 'lodash'
import { defineMessage, useIntl } from 'react-intl'

import {
  AnalyticsPreferences,
  IncidentStates,
  useGetPreferencesQuery,
  useSetNotificationMutation,
  RecommendationStates
} from '@acx-ui/analytics/services'
import { showToast, Loader, Drawer } from '@acx-ui/components'
import { useIsSplitOn, Features }    from '@acx-ui/feature-toggle'
import { getUserProfile }            from '@acx-ui/user'

import * as UI from './styledComponents'

type ListLabel = {
  label: string
  key: string
  checked: boolean
}

const getRecommendationPreferences = (pref?: AnalyticsPreferences): RecommendationStates => {
  const base: RecommendationStates = {
    crrm: false,
    aiOps: false
  }
  if (!pref || !pref.configRecommendation) return base
  const { configRecommendation } = pref
  forOwn(configRecommendation, (method, key) => {
    if (method && method.includes('email')) {
      base[key as unknown as keyof RecommendationStates] = true
    }
  })
  return base
}

const getIncidentsPreferences = (pref?: AnalyticsPreferences): IncidentStates => {
  const base: IncidentStates = {
    P1: false,
    P2: false,
    P3: false,
    P4: false
  }
  if (!pref || !pref.incident) return base
  const { incident } = pref
  forOwn(incident, (method, key) => {
    if (method && method.includes('email')) {
      base[key as unknown as keyof IncidentStates] = true
    }
  })
  return base
}

const useIncidentsList = (state: IncidentStates): ListLabel[] => {
  const { $t } = useIntl()
  const labels = {
    P1: $t({ defaultMessage: 'P1 Incidents' }),
    P2: $t({ defaultMessage: 'P2 Incidents' }),
    P3: $t({ defaultMessage: 'P3 Incidents' }),
    P4: $t({ defaultMessage: 'P4 Incidents' })
  }
  return Object.entries(state).map(([key, checked]) => ({
    key,
    checked,
    label: labels[key as keyof IncidentStates]
  }))
}

const useRecommendationList = (state: RecommendationStates): ListLabel[] => {
  const { $t } = useIntl()
  const labels = {
    crrm: $t({ defaultMessage: 'AI-Driven RRM' }),
    aiOps: $t({ defaultMessage: 'AI Operations' })
  }
  return Object.entries(state).map(([key, checked]) => ({
    key,
    checked,
    label: labels[key as keyof RecommendationStates]
  }))
}

const getSuccessMsg = (success?: boolean) => {
  return success
    ? defineMessage({ defaultMessage: 'Incident notifications updated succesfully.' })
    : defineMessage({ defaultMessage: 'Update failed, please try again later.' })
}

function OptionsList ({ labels, setState }:
  { labels: ListLabel[], setState: CallableFunction }) {
  return <UI.List bordered={false}>
    {labels.map((({ label, key, checked }) => <UI.List.Item key={key}>
      <span>
        <UI.Checkbox
          id={key}
          name={key}
          checked={checked}
          onChange={(e) => setState((s: { [x: string]: boolean }) =>
            ({ ...s, [key]: e.target.checked }))} />
        <label htmlFor={key}>{label}</label>
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
  const query = useGetPreferencesQuery({
    tenantId: tenantId
  })
  const initIncidentPref = getIncidentsPreferences(query.data)
  const [state, setState] = useState<IncidentStates>(initIncidentPref)
  const initRecPref = getRecommendationPreferences(query.data)
  const [recState, setRecState] = useState<RecommendationStates>(initRecPref)
  useEffect(() => {
    setState(getIncidentsPreferences(query.data))
    setRecState(getRecommendationPreferences(query.data))
  }, [query.data])
  const [updatePrefrences] = useSetNotificationMutation()
  const priorities = useIncidentsList(state)
  const recommendations = useRecommendationList(recState)
  const allowRecommandations = useIsSplitOn(Features.INCIDENTS_EMAIL_NOTIFICATION_TOGGLE)
  const title =
    // eslint-disable-next-line max-len
    $t({ defaultMessage: 'Set your AI notification preferences. These notifications are only sent through email:' })
  const afterMsg =
    $t({ defaultMessage: 'This will apply to all the recipients defined for this account.' })
  const onClose = () => setShowDrawer(false)
  const onApply = () => {
    updatePrefrences({
      states: {
        incident: state,
        configRecommendation: recState
      },
      tenantId,
      preferences: query.data!
    })
      .unwrap()
      .then(({ success }) => {
        showToast({
          type: success ? 'success' : 'error',
          content: $t(getSuccessMsg(success))
        })
        setShowDrawer(false)
      })
      .catch(() => {
        showToast({
          type: 'error',
          content: $t(getSuccessMsg())
        })
        setShowDrawer(false)
      })
  }
  return <Drawer
    title={$t({ defaultMessage: 'AI Notifications' })}
    visible={showDrawer}
    onClose={onClose}
    destroyOnClose
    footer={<>
      <Button
        type='primary'
        onClick={() => onApply()}>
        {$t({ defaultMessage: 'Apply' })}
      </Button>
      <Button type='default' onClick={() => onClose()}>{$t({ defaultMessage: 'Cancel' })}</Button>
    </>}
  >
    <Loader states={[query]}>
      <UI.IncidentNotificationWrapper>
        <div>{title}</div>
        <UI.SectionTitle>{$t({ defaultMessage: 'Incidents' })}</UI.SectionTitle>
        <OptionsList labels={priorities} setState={setState} />
        { allowRecommandations && <>
          <UI.SectionTitle>{$t({ defaultMessage: 'Recommendations' })}</UI.SectionTitle>
          <OptionsList labels={recommendations} setState={setRecState} />
        </>}
        <UI.AfterMsg>{afterMsg}</UI.AfterMsg>
      </UI.IncidentNotificationWrapper>
    </Loader>
  </Drawer>
}
