import { useState, useEffect, Dispatch, SetStateAction, MutableRefObject } from 'react'

import { Form, Checkbox }                       from 'antd'
import {  cloneDeep, get, set, unset, isEmpty } from 'lodash'
import { defineMessage, useIntl }               from 'react-intl'

import {
  AnalyticsPreferences,
  AnalyticsPreferenceType,
  useGetPreferencesQuery,
  useSetNotificationMutation
} from '@acx-ui/analytics/services'
import { getUserProfile }                     from '@acx-ui/analytics/utils'
import { Select, showToast, Loader, Tooltip } from '@acx-ui/components'
import * as config                            from '@acx-ui/config'
import { hasRaiPermission, isCoreTier }       from '@acx-ui/user'

const getApplyMsg = (success?: boolean) => {
  return success
    ? defineMessage({ defaultMessage: 'Notifications updated succesfully.' })
    : defineMessage({ defaultMessage: 'Update failed, please try again later.' })
}

function OptionsList ({ preferences, setState, type }: {
  preferences: AnalyticsPreferences,
  setState: Dispatch<SetStateAction<AnalyticsPreferences>>,
  type: AnalyticsPreferenceType
}) {
  const { $t } = useIntl()
  const labels = {
    incident: {
      P1: defineMessage({ defaultMessage: 'P1 Incidents' }),
      P2: defineMessage({ defaultMessage: 'P2 Incidents' }),
      P3: defineMessage({ defaultMessage: 'P3 Incidents' }),
      P4: defineMessage({ defaultMessage: 'P4 Incidents' })
    },
    licenses: {
      '60D': defineMessage({ defaultMessage: 'Licenses expiring in 60 days' }),
      '30D': defineMessage({ defaultMessage: 'Licenses expiring in 30 days' }),
      '7D': defineMessage({ defaultMessage: 'Licenses expiring in 7 days' })
    },
    intentAI: {
      all: defineMessage({ defaultMessage: 'Intent status change' })
    }
  }
  return <>{Object.entries(labels[type]).map(([key, label]) => <div key={key}>
    <Checkbox
      id={key}
      name={key}
      style={{ padding: '5px' }}
      checked={get(preferences, [type, key], []).includes('email')}
      onChange={(e: { target: { checked: boolean } }) =>
        setState((p: AnalyticsPreferences) => {
          const preferences = cloneDeep(p)
          const path = [type, key]
          e.target.checked
            ? set(preferences, path, ['email'])
            : unset(preferences, path)
          if (isEmpty(preferences[type])) {
            delete preferences[type]
          }
          return preferences
        })
      } />
    <label htmlFor={key}>{$t(label)}</label>
  </div>
  )}</>
}

// eslint-disable-next-line max-len
const emailRegExp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const validateEmail = (email: string) => emailRegExp.test(String(email).toLowerCase())

export const NotificationSettings = ({ tenantId, apply }: {
  tenantId: string,
  apply: MutableRefObject<undefined | (() => Promise<boolean | void>)>
}) => {
  const { $t } = useIntl()
  const query = useGetPreferencesQuery({ tenantId })
  const [preferences, setState] = useState<AnalyticsPreferences>({})
  const [updatePrefrences] = useSetNotificationMutation()
  const { email, accountTier } = getUserProfile()
  const isCore = isCoreTier(accountTier)
  const showIntentAI = hasRaiPermission('READ_INTENT_AI')
  useEffect(() => { setState(query.data!) }, [query.data])
  apply.current = async (): Promise<boolean | void> => {
    if (preferences.recipients?.length === 0) {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'Please select at least one recipient.' })
      })
      return false
    }
    return updatePrefrences({ tenantId, preferences })
      .unwrap()
      .then(({ success }) => {
        showToast({ type: success ? 'success' : 'error', content: $t(getApplyMsg(success)) })
        return success
      })
      .catch(() => {
        showToast({ type: 'error', content: $t(getApplyMsg()) })
        return false
      })
  }
  return <Loader states={[query]}>
    {hasRaiPermission('READ_INCIDENTS') && !isCore &&
      <Form.Item label={$t({ defaultMessage: 'Incidents' })}>
        <OptionsList preferences={preferences} setState={setState} type='incident' />
      </Form.Item>
    }
    {showIntentAI && !isCore && <Form.Item
      label={<>
        {$t({ defaultMessage: 'IntentAI' })}
        <Tooltip.Question
          // eslint-disable-next-line max-len
          title={$t({ defaultMessage: 'AI Features including AI-Driven RRM and all AIOPs Recommendations are available under IntentAI' })}
          placement='right'
        />
      </>}
    >
      <OptionsList preferences={preferences} setState={setState} type='intentAI' />
    </Form.Item>
    }
    {config.get('IS_MLISA_SA') && <>
      {hasRaiPermission('READ_LICENSES') &&
        <Form.Item label={$t({ defaultMessage: 'Licenses' })}>
          <OptionsList preferences={preferences} setState={setState} type='licenses' />
        </Form.Item>
      }
      <Form.Item label={$t({ defaultMessage: 'Recipients' })}>
        <Select
          mode='tags'
          value={get(preferences, ['recipients'], [email])}
          onChange={(emails: string[]) => setState((p: AnalyticsPreferences) => ({
            ...p, recipients: emails.filter(validateEmail)
          }))}
        />
      </Form.Item>
    </>}
  </Loader>
}
