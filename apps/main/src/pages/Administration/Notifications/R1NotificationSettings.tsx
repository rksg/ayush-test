import { useState, useEffect, Dispatch, SetStateAction, MutableRefObject } from 'react'

import { Form, Checkbox }         from 'antd'
import {  cloneDeep, get, set }   from 'lodash'
import { defineMessage, useIntl } from 'react-intl'
import { useParams }              from 'react-router-dom'

import {  showToast }                                            from '@acx-ui/components'
import { Features, useIsSplitOn }                                from '@acx-ui/feature-toggle'
import { useGetTenantDetailsQuery, useUpdateTenantSelfMutation } from '@acx-ui/rc/services'
import { NotificationPreference }                                from '@acx-ui/rc/utils'

const labels = {
  DEVICE_AP_FIRMWARE: defineMessage({ defaultMessage: 'AP Firmware' }),
  DEVICE_SWITCH_FIRMWARE: defineMessage({ defaultMessage: 'Switch Firmware' }),
  DEVICE_EDGE_FIRMWARE: defineMessage({ defaultMessage: 'RUCKUS Edge Firmware' })
}

const apiChanges = {
  API_CHANGES: defineMessage({ defaultMessage: 'API Changes' })
}

const defaultNotification: NotificationPreference = {
  DEVICE_AP_FIRMWARE: true,
  DEVICE_SWITCH_FIRMWARE: true,
  DEVICE_EDGE_FIRMWARE: true,
  API_CHANGES: true
}
const getApplyErrorMsg = () => {
  return defineMessage({ defaultMessage: 'Update failed, please try again later.' })
}

function OptionsList ({ preferences, setState }: {
  preferences: NotificationPreference,
  setState: Dispatch<SetStateAction<NotificationPreference>>
}) {
  const { $t } = useIntl()
  const apiChangesNotificationEnabled =
    useIsSplitOn(Features.NOTIFICATION_CHANNEL_API_CHANGES_TOGGLE)
  const labelsCombined = apiChangesNotificationEnabled ? { ...labels, ...apiChanges } : labels

  return <>{Object.entries(labelsCombined).map(([key, label]) => <div key={key}>
    <Checkbox
      id={key}
      name={key}
      style={{ padding: '5px' }}
      checked={get(preferences, [key])}
      onChange={(e: { target: { checked: boolean } }) =>
        setState((p: NotificationPreference) => {
          const preferences = cloneDeep(p)
          set(preferences, [key], e.target.checked)
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
  const params = useParams()
  const tenantDetailsData = useGetTenantDetailsQuery({ params })
  const [preferences, setState] = useState<NotificationPreference>(defaultNotification)
  const [updatePrefrences] = useUpdateTenantSelfMutation()
  useEffect(() => {
    if (tenantDetailsData?.data?.subscribes) {
      try {
        const jsonData = JSON.parse(tenantDetailsData?.data?.subscribes)
        setState(jsonData)
      } catch {
        setState(defaultNotification)
      }
    }
  }, [tenantDetailsData.data])
  apply.current = async (): Promise<boolean | void> => {
    const payload = {
      id: tenantId,
      subscribes: JSON.stringify(preferences)
    }
    return updatePrefrences({ params, payload: payload })
      .unwrap()
      .then(() => {
        return true
      })
      .catch(() => {
        showToast({ type: 'error', content: $t(getApplyErrorMsg()) })
        return false
      })
  }

  return <Form.Item label={$t({ defaultMessage: 'Notification Type' })}>
    <OptionsList preferences={preferences} setState={setState} />
  </Form.Item>
}
