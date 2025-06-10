import { useState, useEffect } from 'react'

import { Checkbox, Form, Typography } from 'antd'
import { defineMessage, useIntl }     from 'react-intl'

import {
  AnalyticsPreferences,
  useGetPreferencesQuery,
  useSetNotificationMutation,
  useUpdateTenantSettingsMutation
} from '@acx-ui/analytics/services'
import { getUserProfile as getRaiUserProfile }           from '@acx-ui/analytics/utils'
import { Drawer, Button, Loader, Transfer, showToast }   from '@acx-ui/components'
import { get }                                           from '@acx-ui/config'
import { AIDrivenRRM, AIOperation, EquiFlex, EcoFlexAI } from '@acx-ui/icons'
import { TenantLink }                                    from '@acx-ui/react-router-dom'
import { getUserProfile as getR1UserProfile }            from '@acx-ui/user'
import { CatchErrorResponse }                            from '@acx-ui/utils'

import { AiFeatures, aiFeaturesLabel }                    from './config'
import { Setting as UI, FeatureIcon, SummaryFeatureIcon } from './styledComponents'
import { IntentSummaryProps, intentSummaryConfig }        from './Table'

type IntentSubscriptions = {
  [AiFeatures.RRM]?: boolean
  [AiFeatures.AIOps]?: boolean
  [AiFeatures.EquiFlex]?: boolean
  [AiFeatures.EcoFlex]?: boolean
}
const iconMap = {
  [AiFeatures.RRM]: <AIDrivenRRM />,
  [AiFeatures.AIOps]: <AIOperation />,
  [AiFeatures.EquiFlex]: <EquiFlex />,
  [AiFeatures.EcoFlex]: <EcoFlexAI />
}
const subscribedIntents = defineMessage({ defaultMessage: 'Subscribed Intents' })
const unsubscribedIntents = defineMessage({ defaultMessage: 'Unsubscribed Intents' })
export const prepareNotificationPreferences = (
  prev: AnalyticsPreferences,
  notificationChecked: boolean
) => {
  const newPreferences = { ...prev }
  if (notificationChecked) {
    newPreferences.intentAI = { all: ['email'] }
  } else {
    delete newPreferences.intentAI
  }
  return newPreferences
}
const defaultIntentSubscriptions: IntentSubscriptions = {
  [AiFeatures.RRM]: true,
  [AiFeatures.AIOps]: true,
  [AiFeatures.EquiFlex]: true,
  [AiFeatures.EcoFlex]: false
}
export const getEnabledIntentSubscriptions = (tenantSettings: string) => {
  const dbConfig = JSON.parse(tenantSettings) as IntentSubscriptions
  const merged = { ...defaultIntentSubscriptions, ...dbConfig }
  const enabledKeys = (Object.keys(merged) as (keyof typeof merged)[])
    .filter((key) => merged[key])
  return enabledKeys
}
export const convertToIntentSubscriptions = (enabledKeys: string[]): string => {
  const dbConfig = {} as IntentSubscriptions
  (Object.values(AiFeatures) as string[]).forEach((key) => {
    dbConfig[key as keyof IntentSubscriptions] = enabledKeys.includes(key)
  })
  return JSON.stringify(dbConfig)
}
export function Settings ({ settings }: { settings: string }) {
  const { $t } = useIntl()
  const [updateSettings, { isLoading: isUpdatingSettings }] = useUpdateTenantSettingsMutation()
  const [updatePreferences, { isLoading: isUpdatingPreferences }] = useSetNotificationMutation()
  const [targetKeys, setTargetKeys] = useState<string[]>([])
  const [notificationChecked, setNotificationChecked] = useState(false)
  const [visible, setVisible] = useState(false)
  const [notificationPreferences, setNotificationPreferences] = useState<AnalyticsPreferences>({})
  const [form] = Form.useForm()
  const aiFeatures = Object.entries(aiFeaturesLabel)
    .map(([key, value]) => ({ name: $t(value), key }))

  useEffect(() => {
    setTargetKeys(getEnabledIntentSubscriptions(settings))
  }, [settings])

  const isRai = get('IS_MLISA_SA')
  const tenantId = isRai
    ? getRaiUserProfile().selectedTenant.id
    : getR1UserProfile().profile.tenantId
  const query = useGetPreferencesQuery({ tenantId })
  const hasIntentEmailNotification = (data: AnalyticsPreferences) => {
    return !!data?.intentAI?.all?.includes('email')
  }
  useEffect(() => {
    setNotificationPreferences(query.data!)
    setNotificationChecked(hasIntentEmailNotification(query.data!))
  }, [query.data])
  useEffect(() => {
    setNotificationPreferences((prev: AnalyticsPreferences) => {
      return prepareNotificationPreferences(prev, notificationChecked)
    })
  }, [notificationChecked])

  const saveData = async () => {
    const [tenantSettingsResult, notificationPreferencesResult] = await Promise.all([
      updateSettings({
        'enabled-intent-features': convertToIntentSubscriptions(targetKeys)
      }),
      updatePreferences({ tenantId, preferences: notificationPreferences })
    ])
    // tenantSettingsResult is text format, notificationPreferencesResult is json format
    if (tenantSettingsResult?.data === 'Created' && notificationPreferencesResult?.data?.success) {
      showToast({
        type: 'success',
        content: $t({ defaultMessage: 'Subscriptions saved successfully!' })
      })
      closeDrawer(undefined)
    } else {
      const getErrorMsgFromErrorResponse = (respData: CatchErrorResponse) => {
        return respData.data.errors.map((error) => error.message).join(', ')
      }
      // rbac service hasn't followed CatchErrorResponse yet
      const tenantSettingsError =
        tenantSettingsResult?.error && 'data' in tenantSettingsResult.error
          ? tenantSettingsResult.error.data
          : tenantSettingsResult?.error
      const notificationPreferencesError =
        notificationPreferencesResult?.error && 'data' in notificationPreferencesResult.error
          ? getErrorMsgFromErrorResponse(notificationPreferencesResult.error as CatchErrorResponse)
          : notificationPreferencesResult?.error
      const errMsg = [tenantSettingsError, notificationPreferencesError].filter(Boolean).join(', ')
      showToast({
        type: 'error',
        content: errMsg
      })
    }
  }

  const closeDrawer = (e: React.MouseEvent | React.KeyboardEvent | undefined) => {
    e?.stopPropagation()
    setTargetKeys(getEnabledIntentSubscriptions(settings))
    setNotificationPreferences(query.data!)
    setNotificationChecked(hasIntentEmailNotification(query.data!))
    setVisible(false)
  }

  const notificationLinkPath = isRai
    ? '/profile/notifications'
    : '/administration/notifications'

  return <Button
    onClick={() => setVisible(true)}
    icon={<UI.Icon data-testid='intent-subscriptions' />}
    style={{ padding: '4px 0', width: '200px' }}
  >{$t({ defaultMessage: 'Intent Subscriptions' })} {`(${targetKeys.length})`}
    <Drawer
      width='85%'
      title={$t({ defaultMessage: 'Intent Subscriptions' })}
      visible={visible}
      onClose={closeDrawer}
      destroyOnClose
      footer={<div style={{ width: '50%' }}>
        <Button
          type='primary'
          disabled={false}
          onClick={(e) => {
            e.stopPropagation()
            saveData()
          }}>
          {$t({ defaultMessage: 'Save' })}
        </Button>
        <Button type='default' onClick={closeDrawer}>
          {$t({ defaultMessage: 'Cancel' })}
        </Button></div>}
    > <Loader states={[{ isLoading: isUpdatingSettings || isUpdatingPreferences }]}>
        <Form
          style={{ width: '55%' }}
          layout='vertical'
          form={form}>
          <div style={{ display: 'flex' }}>
            <Typography.Text strong style={{ marginTop: '5px' }}>
              {$t({ defaultMessage: 'Choose which Intents to automate' })}
            </Typography.Text>
            <AboutIntentsDrawer />
          </div>
          <br/>
          <Form.Item>
            <Transfer
              listStyle={{
                width: 245,
                height: 200
              }}
              showSelectAll={false}
              dataSource={aiFeatures}
              targetKeys={targetKeys}
              titles={[
                $t({ defaultMessage: 'Available Intents' }),
                $t({ defaultMessage: 'Subscribed Intents' })
              ]}
              operations={[$t({ defaultMessage: 'Add' }), $t({ defaultMessage: 'Remove' })]}
              render={(item) =>
                <FeatureIcon>{iconMap[item.key as keyof typeof iconMap]} {item.name}</FeatureIcon>
              }
              onChange={(targetKeys) => setTargetKeys(targetKeys)}
            />
          </Form.Item>
          <Typography.Text
            style={{
              fontSize: 'var(--acx-body-5-font-size)',
              color: 'var(--acx-neutrals-60)'
            }}
            // eslint-disable-next-line max-len
          ><b>{$t(subscribedIntents)} </b>{$t({ defaultMessage: ' are handled automatically by IntentAI after a one-time confirmation, with ongoing adjustments as needed. ' })} <b>{$t(unsubscribedIntents)} </b>{$t({ defaultMessage: ' pause automation and retain their current settings for manual control via the controller.' })}
          </Typography.Text>
          <br/><br/>
          <Typography.Text strong>{$t({ defaultMessage: 'Notifications' })}</Typography.Text>
          <Form.Item>
            {/* Only R1 non-core tier can view the RAI notification items, but we don't need to check core tier here because this page exists in IntentAI which is accessible to non-core tier */}
            <Checkbox
              style={{ paddingRight: '5px' }}
              checked={notificationChecked}
              onChange={(e: { target: { checked: boolean } }) =>
                setNotificationChecked(e.target.checked)
              }
            />
            {$t({ defaultMessage: 'Get email alerts when Intents status change. (' })}
            <TenantLink
              to={notificationLinkPath}
              onClick={() => {
                if (!isRai) {
                  sessionStorage.setItem('intent-subscription-forward-r1-show-drawer', 'true')
                }
                setVisible(false)
              }}
            >
              <b>
                {$t({ defaultMessage: 'Manage in My Preferences' })}
              </b>
            </TenantLink>
            {')'}
          </Form.Item>
        </Form>
      </Loader>
    </Drawer>
  </Button>
}

const IntentSummaryBlock = (props: IntentSummaryProps) => {
  const { $t } = useIntl()
  const title = $t(props.title)
  const subTitleLeft = $t(props.subTitleLeft)
  const subTitleMiddle = $t(props.subTitleMiddle)
  const subTitleRight = $t(props.subTitleRight)
  const content = $t(props.content)
  return (<div
    style={{
      display: 'flex',
      padding: '10px 0 20px 0',
      borderBottom: '1px solid var(--acx-neutrals-20)'
    }}>
    <SummaryFeatureIcon> {props.icon} </SummaryFeatureIcon>
    <div>
      <b className='title'>{title}</b><br />
      <div style={{ fontSize: 'var(--acx-body-6-font-size)', marginBottom: '5px' }}>
        <b>{subTitleLeft}</b> {subTitleMiddle} <b>{subTitleRight}</b>
      </div>
      <span className='br-size'></span>
      <span style={{
        color: 'var(--acx-neutrals-80)',
        fontSize: 'var(--acx-body-5-font-size)'
      }}>{content}</span>
    </div>
  </div>)
}
function AboutIntentsDrawer () {
  const { $t } = useIntl()
  const [visible, setVisible] = useState(false)
  const closeDrawer = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation()
    setVisible(false)
  }
  return <Button
    onClick={() => setVisible(true)}
    type='link'
    style={{ margin: '0 0 0 auto', alignSelf: 'end' }}
    data-testid='about-intents'
  ><Typography.Text
      style={{
        fontSize: 'var(--acx-body-4-font-size)',
        margin: '3px 20px 0 auto',
        color: 'var(--acx-accents-blue-50)'
      }}>{$t({ defaultMessage: 'About the Intents' })}</Typography.Text>
    <Drawer
      width='35%'
      title={$t({ defaultMessage: 'About the Intents' })}
      visible={visible}
      onClose={closeDrawer}
      destroyOnClose
      data-testid='about-intents'
    >
      {
        Object.entries(intentSummaryConfig).map(
          ([key, value]: [string, IntentSummaryProps]) =>
            <IntentSummaryBlock key={key} {...value} />
        )
      }
    </Drawer>
  </Button>
}
