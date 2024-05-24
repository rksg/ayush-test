import { useState, useEffect, Dispatch, SetStateAction, MutableRefObject, useRef } from 'react'

import {  cloneDeep, get, set, unset, isEmpty }      from 'lodash'
import { defineMessage, MessageDescriptor, useIntl } from 'react-intl'

import {
  AnalyticsPreferences,
  useGetPreferencesQuery,
  useSetNotificationMutation,
  NotificationMethod
} from '@acx-ui/analytics/services'
import { getUserProfile }    from '@acx-ui/analytics/utils'
import { showToast, Loader } from '@acx-ui/components'

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

type Preferences = { preferences: AnalyticsPreferences }
function OptionsList ({ labels, setState, type }:
  {
    labels: ListLabel[],
    setState: Dispatch<SetStateAction<Preferences>>,
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
          onChange={(e: { target: { checked: boolean } }) =>
            setState(({ preferences: p }: Preferences) => {
              const preferences = cloneDeep(p)
              const path = [type, key]
              e.target.checked
                ? set(preferences, path, ['email'])
                : unset(preferences, path)
              if (isEmpty(preferences[type])) {
                delete preferences[type]
              }
              return { preferences }
            })
          } />
        <label htmlFor={key}>{$t(label)}</label>
      </span>
    </UI.List.Item>))}
  </UI.List>
}

export const NotificationSettings = (props: {
  tenantId: string,
  showLicense: boolean,
  apply: MutableRefObject<Function>
}) => {
  const { $t } = useIntl()
  const { tenantId, showLicense, apply } = props
  const query = useGetPreferencesQuery({ tenantId })
  const [{ preferences }, setState] = useState<Preferences>({ preferences: {} })
  const [updatePrefrences] = useSetNotificationMutation()
  useEffect(() => { setState({ preferences: query.data! }) }, [query.data])
  apply.current = () => updatePrefrences({ tenantId, preferences })
    .unwrap()
    .then(({ success }) => {
      showToast({
        type: success ? 'success' : 'error',
        content: $t(getApplyMsg(success))
      })
    })
    .catch(() => {
      showToast({
        type: 'error',
        content: $t(getApplyMsg())
      })
    })
  const incidentLabels = getPreferenceLabel(preferences, 'incident')
  const recommendationLabels = getPreferenceLabel(preferences, 'configRecommendation')
  return <Loader states={[query]}>
    <UI.SectionTitle>{$t({ defaultMessage: 'Incidents' })}</UI.SectionTitle>
    <OptionsList labels={incidentLabels} setState={setState} type='incident' />
    <UI.SectionTitle>{$t({ defaultMessage: 'Recommendations' })}</UI.SectionTitle>
    <OptionsList
      labels={recommendationLabels}
      setState={setState}
      type='configRecommendation'
    />
    {showLicense && <>
      <UI.SectionTitle>{$t({ defaultMessage: 'Licenses' })}</UI.SectionTitle>
      <div>licenses list</div>
    </>}
  </Loader>
}

export const NotificationSettingsPage = () => {
  const { selectedTenant: { id } } = getUserProfile()
  const close = () => {}
  const apply = useRef(close)
  return <NotificationSettings tenantId={id} showLicense={true} apply={apply} />
}
