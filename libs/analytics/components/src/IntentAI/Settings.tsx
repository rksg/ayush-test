import { useState, useEffect, useCallback } from 'react'

import { Checkbox, Form, Typography } from 'antd'
import { defineMessage, useIntl }     from 'react-intl'

import { useUpdateTenantSettingsMutation }               from '@acx-ui/analytics/services'
import { Drawer, Button, Loader, Transfer }              from '@acx-ui/components'
import { AIDrivenRRM, AIOperation, EquiFlex, EcoFlexAI } from '@acx-ui/icons'

import { AiFeatures, aiFeaturesLabel }                    from './config'
import { Setting as UI, FeatureIcon, SummaryFeatureIcon } from './styledComponents'
import { intentSummaryProps, intentSummaryConfig }        from './Table'

const iconMap = {
  [AiFeatures.RRM]: <AIDrivenRRM />,
  [AiFeatures.AIOps]: <AIOperation />,
  [AiFeatures.EquiFlex]: <EquiFlex />,
  [AiFeatures.EcoFlex]: <EcoFlexAI />
}
const subscribedIntents = defineMessage({ defaultMessage: 'Subscribed Intents' })
const unSubscribedIntents = defineMessage({ defaultMessage: 'Unsubscribed Intents' })
export function Settings ({ settings }: { settings: string }) {
  const { $t } = useIntl()
  const aiFeatures = Object.entries(aiFeaturesLabel)
    .map(([key, value]) => ({ name: $t(value), key }))
  const [targetKeys, setTargetKeys] = useState<string[]>([])
  const [notificationChecked, setNotificationChecked] = useState(false)
  const [visible, setVisible] = useState(false)
  const [form] = Form.useForm()

  const [updateSettings, result] = useUpdateTenantSettingsMutation()
  const saveSettings = useCallback(async () => {
    await updateSettings({
      'enabled-intent-features': JSON.stringify(targetKeys)
    })
  }, [targetKeys, updateSettings])

  useEffect(() => {
    setTargetKeys(JSON.parse(settings))
  }, [settings])

  const closeDrawer = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation()
    setTargetKeys(JSON.parse(settings))
    setVisible(false)
  }
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
            saveSettings()
          }}>
          {$t({ defaultMessage: 'Save' })}
        </Button>
        <Button type='default' onClick={closeDrawer}>
          {$t({ defaultMessage: 'Cancel' })}
        </Button></div>}
    > <Loader states={[result]}>
        <Form
          style={{ width: '50%' }}
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
                width: 250,
                height: 275
              }}
              showSelectAll={false}
              dataSource={aiFeatures}
              targetKeys={targetKeys}
              titles={[
                $t({ defaultMessage: 'Available Intents' }),
                $t({ defaultMessage: 'Subscribed Intents' })
              ]}
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
          ><b>{$t(subscribedIntents)} </b>{$t({ defaultMessage: ' are handled automatically by InentAI after a onte-time confirmation, with ongoing adjustments as needed. ' })} <b>{$t(unSubscribedIntents)} </b>{$t({ defaultMessage: ' are pause automation and retain their current settings for manual control via the controller.' })}
          </Typography.Text>
          <br/><br/>
          <Typography.Text strong>{$t({ defaultMessage: 'Notifications' })}</Typography.Text>
          <Form.Item>
            <Checkbox
              style={{ paddingRight: '5px' }}
              checked={notificationChecked}
              onChange={(e: { target: { checked: boolean } }) =>
                setNotificationChecked(e.target.checked)
              }
            />
            {$t({
              defaultMessage: 'Get email alerts when Intents status change.(Manage in My Profile)'
            })}
          </Form.Item>
        </Form>
      </Loader>
    </Drawer>
  </Button>
}

const IntentSummaryBlock = (props: intentSummaryProps) => {
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
    style={{ border: 'none', padding: '0', margin: '0 0 0 auto' }}
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
          ([key, value]: [string, intentSummaryProps]) =>
            <IntentSummaryBlock key={key} {...value} />
        )
      }
    </Drawer>
  </Button>
}
