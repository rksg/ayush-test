import { useState, useEffect, Dispatch, SetStateAction, MutableRefObject, useRef } from 'react'

import { Form }                                 from 'antd'
import {  cloneDeep, get, set, unset, isEmpty } from 'lodash'
import { defineMessage, useIntl }               from 'react-intl'

import {
  AnalyticsPreferences,
  AnalyticsPreferenceType,
  useGetPreferencesQuery,
  useSetNotificationMutation
} from '@acx-ui/analytics/services'
import { getUserProfile }    from '@acx-ui/analytics/utils'
import { showToast, Loader } from '@acx-ui/components'

import * as UI from './styledComponents'

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
  },
  licenses: {
    '60D': defineMessage({ defaultMessage: 'Licenses expiring in 60 days' }),
    '30D': defineMessage({ defaultMessage: 'Licenses expiring in 30 days' }),
    '7D': defineMessage({ defaultMessage: 'Licenses expiring in 7 days' })
  }
}

const getApplyMsg = (success?: boolean) => {
  return success
    ? defineMessage({ defaultMessage: 'Incident notifications updated succesfully.' })
    : defineMessage({ defaultMessage: 'Update failed, please try again later.' })
}

type Preferences = { preferences: AnalyticsPreferences }
function OptionsList ({ preferences, setState, type }: {
  preferences: AnalyticsPreferences,
  setState: Dispatch<SetStateAction<Preferences>>,
  type: AnalyticsPreferenceType
}) {
  const { $t } = useIntl()
  return <>{Object.entries(labels[type]).map(([key, label]) => <div key={key}>
    <UI.Checkbox
      id={key}
      name={key}
      checked={get(preferences, [type, key], []).includes('email')}
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
  </div>
  )}</>
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
  return <Loader states={[query]}>
    <Form layout='vertical' autoComplete='off'>
      <Form.Item label={$t({ defaultMessage: 'Incidents' })}>
        <OptionsList preferences={preferences} setState={setState} type='incident' />
      </Form.Item>
      <Form.Item label={$t({ defaultMessage: 'Recommendations' })}>
        <OptionsList preferences={preferences} setState={setState} type='configRecommendation' />
      </Form.Item>
      {showLicense && <Form.Item label={$t({ defaultMessage: 'Licenses' })}>
        <OptionsList preferences={preferences} setState={setState} type='licenses' />
      </Form.Item>}
    </Form>
  </Loader>
}

export const NotificationSettingsPage = () => {
  const { selectedTenant: { id } } = getUserProfile()
  const close = () => {}
  const apply = useRef(close)
  return <NotificationSettings tenantId={id} showLicense={true} apply={apply} />
}
