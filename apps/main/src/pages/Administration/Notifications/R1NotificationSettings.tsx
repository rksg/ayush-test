import { useState, useEffect, Dispatch, SetStateAction, MutableRefObject } from 'react'

import { Form, Checkbox }              from 'antd'
import {  cloneDeep, get, set, unset } from 'lodash'
import { defineMessage, useIntl }      from 'react-intl'

import {
  AnalyticsPreferences,
  useGetPreferencesQuery,
  useSetNotificationMutation
} from '@acx-ui/analytics/services'
// import { getUserProfile }            from '@acx-ui/analytics/utils'
import {  showToast } from '@acx-ui/components'
// import { NotificationType }          from '@acx-ui/rc/utils'

type PreferenceType = 'notificationType'

const labels = {
  notificationType: {
    apFirmware: defineMessage({ defaultMessage: 'AP Firmware' }),
    switchFirmware: defineMessage({ defaultMessage: 'Switch Firmware' }),
    edgeFirmware: defineMessage({ defaultMessage: 'Edge Firmware' }),
    apiChanges: defineMessage({ defaultMessage: 'API Changes' })
  }
}

const getApplyMsg = (success?: boolean) => {
  return success
    ? defineMessage({ defaultMessage: 'Incident notifications updated succesfully.' })
    : defineMessage({ defaultMessage: 'Update failed, please try again later.' })
}

function OptionsList ({ preferences, setState, type }: {
  preferences: AnalyticsPreferences,
  setState: Dispatch<SetStateAction<AnalyticsPreferences>>,
  type: PreferenceType
}) {
  const { $t } = useIntl()
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
          // if (isEmpty(preferences[type])) {
          //   delete preferences[type]
          // }
          return preferences
        })
      } />
    <label htmlFor={key}>{$t(label)}</label>
  </div>
  )}</>
}

export const R1NotificationSettings = ({ tenantId, apply }: {
  tenantId: string,
  apply: MutableRefObject<undefined | (() => Promise<boolean | void>)>
}) => {
  const { $t } = useIntl()
  const query = useGetPreferencesQuery({ tenantId })
  const [preferences, setState] = useState<AnalyticsPreferences>({})
  const [updatePrefrences] = useSetNotificationMutation()
  // const { email } = getUserProfile()
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

  return <Form.Item label={$t({ defaultMessage: 'Notification Type' })}>
    <OptionsList preferences={preferences} setState={setState} type='notificationType' />
  </Form.Item>
}
