import { useState, useEffect, Dispatch, SetStateAction, MutableRefObject } from 'react'

import { Form, Checkbox }              from 'antd'
import {  cloneDeep, get, set, unset } from 'lodash'
import { defineMessage, useIntl }      from 'react-intl'
import { useParams }                   from 'react-router-dom'

import {  showToast }                                            from '@acx-ui/components'
import { useGetTenantDetailsQuery, useUpdateTenantSelfMutation } from '@acx-ui/rc/services'
import { NotificationPreference }                                from '@acx-ui/rc/utils'

type PreferenceType = 'notificationType'

const labels = {
  notificationType: {
    DEVICE_AP_FIRMWARE: defineMessage({ defaultMessage: 'AP Firmware' }),
    DEVICE_SWITCH_FIRMWARE: defineMessage({ defaultMessage: 'Switch Firmware' }),
    DEVICE_EDGE_FIRMWARE: defineMessage({ defaultMessage: 'Edge Firmware' }),
    DEVICE_API_CHANGES: defineMessage({ defaultMessage: 'API Changes' })
  }
}

const defaultNotification: NotificationPreference = {
  DEVICE_AP_FIRMWARE: true,
  DEVICE_SWITCH_FIRMWARE: true,
  DEVICE_EDGE_FIRMWARE: true,
  DEVICE_API_CHANGES: true
}
const getApplyMsg = (success?: boolean) => {
  return success
    ? defineMessage({ defaultMessage: 'Incident notifications updated succesfully.' })
    : defineMessage({ defaultMessage: 'Update failed, please try again later.' })
}

function OptionsList ({ preferences, setState, type }: {
  preferences: NotificationPreference,
  setState: Dispatch<SetStateAction<NotificationPreference>>,
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
        setState((p: NotificationPreference) => {
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
  const params = useParams()
  const tenantDetailsData = useGetTenantDetailsQuery({ params })
  const [preferences, setState] = useState<NotificationPreference>({})
  const [updatePrefrences] = useUpdateTenantSelfMutation()
  useEffect(() => {
    setState(tenantDetailsData?.data?.subscribes || defaultNotification)
  }, [tenantDetailsData.data])
  apply.current = async (): Promise<boolean | void> => {
    const payload = {
      id: tenantId,
      subscribe: preferences
    }
    return updatePrefrences({ params, payload: payload })
      .unwrap()
      .then(() => {
        // showToast({ type: success ? 'success' : 'error', content: $t(getApplyMsg(success)) })
        return true
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
