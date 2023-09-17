import { useState, useEffect } from 'react'

import { Drawer, Button, List }   from 'antd'
import { isEqual }                from 'lodash'
import { defineMessage, useIntl } from 'react-intl'

import { AnalyticsPreferences, IncidentStates, useSetIncidentNotificationMutation } from '@acx-ui/analytics/services'
import { useGetPreferencesQuery }                                                   from '@acx-ui/analytics/services'
import { showToast, Loader }                                                        from '@acx-ui/components'
import { getUserProfile }                                                           from '@acx-ui/user'

import * as UI from './styledComponents'

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

const getSuccessMsg = (success?: boolean) => {
  return success
    ? defineMessage({ defaultMessage: 'Incident notifications updated succesfully.' })
    : defineMessage({ defaultMessage: 'Update failed, please try again later.' })
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
  const initialPref = getIncidentsPreferences(query.data)
  const [state, setState] = useState<IncidentStates>(initialPref)
  useEffect(() => {
    setState(getIncidentsPreferences(query.data))
  }, [query.data])
  const [updatePrefrences] = useSetIncidentNotificationMutation()
  const priorities = [
    { label: $t({ defaultMessage: 'P1 Incidents' }), key: 'P1', checked: state.P1 },
    { label: $t({ defaultMessage: 'P2 Incidents' }), key: 'P2', checked: state.P2 },
    { label: $t({ defaultMessage: 'P3 Incidents' }), key: 'P3', checked: state.P3 },
    { label: $t({ defaultMessage: 'P4 Incidents' }), key: 'P4', checked: state.P4 }
  ]
  const title =
    $t({ defaultMessage: 'Select the incident priority levels to receive notifications about:' })
  const afterMsg =
    $t({ defaultMessage: 'This will apply to all the recipients defined for this account.' })
  const onClose = () => setShowDrawer(false)
  const onApply = () => {
    updatePrefrences({
      state,
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
  const enableApply = isEqual(state, initialPref)
  return <Drawer
    title={$t({ defaultMessage: 'Incident Notifications' })}
    visible={showDrawer}
    onClose={onClose}
    destroyOnClose
    footer={<>
      <Button
        type='primary'
        onClick={() => onApply()}
        disabled={enableApply}>
        {$t({ defaultMessage: 'Apply' })}
      </Button>
      <Button type='default' onClick={() => onClose()}>{$t({ defaultMessage: 'Cancel' })}</Button>
    </>}
  >
    <Loader states={[query]}>
      <UI.IncidentNotificationWrapper>
        {title}
        <List bordered={false}>
          {priorities.map((({ label, key, checked }) => <List.Item key={key}>
            <UI.Checkbox
              style={{ paddingRight: '5px' }}
              checked={checked}
              onChange={(e) => setState(s => ({ ...s, [key]: e.target.checked }))}
            />
            {label}
          </List.Item>))}
        </List>
        <UI.AfterMsg>{afterMsg}</UI.AfterMsg>
      </UI.IncidentNotificationWrapper>
    </Loader>
  </Drawer>
}
