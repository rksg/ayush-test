import { useState, useEffect } from 'react'

import { Drawer, Button }         from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import {
  AnalyticsPreferences,
  IncidentStates,
  useSetIncidentNotificationMutation,
  RecommendationStates
} from '@acx-ui/analytics/services'
import { useGetPreferencesQuery } from '@acx-ui/analytics/services'
import { showToast, Loader }      from '@acx-ui/components'
import { getUserProfile }         from '@acx-ui/user'

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
  if (!pref || !pref.recommendation) return base
  const { recommendation } = pref
  Object.entries(recommendation).forEach(([key, method]) => {
    if (method.includes('email')) {
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
  Object.entries(incident).forEach(([key, method]) => {
    if (method.includes('email')) {
      base[key as unknown as keyof IncidentStates] = true
    }
  })
  return base
}

const useIncidentsList = (state: IncidentStates): ListLabel[] => {
  const { $t } = useIntl()
  const labels: Record<keyof IncidentStates, ListLabel['label']> = {
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
  const labels: Record<keyof RecommendationStates, ListLabel['label']> = {
    crrm: $t({ defaultMessage: 'Cloud RRM' }),
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
      <UI.Checkbox
        checked={checked}
        onChange={(e) => setState((s: { [x: string]: boolean }) =>
          ({ ...s, [key]: e.target.checked }))} />
      {label}
    </UI.List.Item>))}
  </UI.List>
}

export const IncidientNotificationDrawer = ({
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
  const [updatePrefrences] = useSetIncidentNotificationMutation()
  const priorities = useIncidentsList(state)
  const recommendations = useRecommendationList(recState)
  const title =
    $t({ defaultMessage: 'Select the incident priority levels to receive notifications about:' })
  const afterMsg =
    $t({ defaultMessage: 'This will apply to all the recipients defined for this account.' })
  const onClose = () => setShowDrawer(false)
  const onApply = () => {
    updatePrefrences({
      states: [state, recState],
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
        {title}
        <OptionsList labels={priorities} setState={setState} />
        <OptionsList labels={recommendations} setState={setRecState} />
        <UI.AfterMsg>{afterMsg}</UI.AfterMsg>
      </UI.IncidentNotificationWrapper>
    </Loader>
  </Drawer>
}
