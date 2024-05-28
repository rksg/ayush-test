import { useState, useEffect, Dispatch, SetStateAction, MutableRefObject, useRef } from 'react'

import { Col, Row, Form }                       from 'antd'
import {  cloneDeep, get, set, unset, isEmpty } from 'lodash'
import { defineMessage, useIntl }               from 'react-intl'

import {
  AnalyticsPreferences,
  AnalyticsPreferenceType,
  useGetPreferencesQuery,
  useSetNotificationMutation
} from '@acx-ui/analytics/services'
import { getUserProfile }                       from '@acx-ui/analytics/utils'
import { Select, showToast, Loader, StepsForm } from '@acx-ui/components'

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

function OptionsList ({ preferences, setState, type }: {
  preferences: AnalyticsPreferences,
  setState: Dispatch<SetStateAction<AnalyticsPreferences>>,
  type: AnalyticsPreferenceType
}) {
  const { $t } = useIntl()
  return <>{Object.entries(labels[type]).map(([key, label]) => <div key={key}>
    <UI.Checkbox
      id={key}
      name={key}
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

export const NotificationSettings = ({
  tenantId,
  showLicenseAndEmail,
  apply
}: {
  tenantId: string,
  showLicenseAndEmail: boolean,
  apply: MutableRefObject<() => Promise<boolean | void>>
}) => {
  const { $t } = useIntl()
  const query = useGetPreferencesQuery({ tenantId })
  const [preferences, setState] = useState<AnalyticsPreferences>({})
  const [updatePrefrences] = useSetNotificationMutation()
  const { email } = getUserProfile()
  useEffect(() => { setState(query.data!) }, [query.data])
  apply.current = (): Promise<boolean | void> => updatePrefrences({ tenantId, preferences })
    .unwrap()
    .then(({ success }) => {
      showToast({ type: success ? 'success' : 'error', content: $t(getApplyMsg(success)) })
    })
    .catch(() => {
      showToast({ type: 'error', content: $t(getApplyMsg()) })
    })
  return <Loader states={[query]}>
    <Form.Item label={$t({ defaultMessage: 'Incidents' })}>
      <OptionsList preferences={preferences} setState={setState} type='incident' />
    </Form.Item>
    <Form.Item label={$t({ defaultMessage: 'Recommendations' })}>
      <OptionsList preferences={preferences} setState={setState} type='configRecommendation' />
    </Form.Item>
    {showLicenseAndEmail && <>
      <Form.Item label={$t({ defaultMessage: 'Licenses' })}>
        <OptionsList preferences={preferences} setState={setState} type='licenses' />
      </Form.Item>
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

// eslint-disable-next-line max-len
const intro = defineMessage({ defaultMessage: 'We\'ll always let you know about important changes, but pick what else you want to hear about.' })

export const NotificationSettingsPage = () => {
  const { $t } = useIntl()
  const { selectedTenant: { id } } = getUserProfile()
  const close = (): Promise<boolean | void> => new Promise(resolve => resolve(false))
  const apply = useRef<() => Promise<boolean | void>>(close)
  return <>
    <UI.Intro>{$t(intro)}</UI.Intro>
    <StepsForm
      buttonLabel={{
        submit: $t({ defaultMessage: 'Save' }),
        cancel: $t({ defaultMessage: 'Reset' })
      }}
      onFinish={apply.current}
      onCancel={() => {}}
    >
      <StepsForm.StepForm>
        <Row gutter={20}>
          <Col span={8}>
            <NotificationSettings tenantId={id} showLicenseAndEmail={true} apply={apply} />
          </Col>
        </Row>
      </StepsForm.StepForm>
    </StepsForm>
  </>
}
