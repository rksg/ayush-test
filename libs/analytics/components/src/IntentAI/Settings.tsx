import { useState, useEffect, useCallback } from 'react'

import { Checkbox, Form, Typography } from 'antd'
import { defineMessage, useIntl }     from 'react-intl'

import { useUpdateTenantSettingsMutation }               from '@acx-ui/analytics/services'
import { Drawer, Button, Loader, Transfer, showToast }   from '@acx-ui/components'
import { AIDrivenRRM, AIOperation, EquiFlex, EcoFlexAI } from '@acx-ui/icons'

import { AiFeatures, aiFeaturesLabel }                    from './config'
import { Setting as UI, FeatureIcon, SummaryFeatureIcon } from './styledComponents'
import { IntentSummaryProps, intentSummaryConfig }        from './Table'

const iconMap = {
  [AiFeatures.RRM]: <AIDrivenRRM />,
  [AiFeatures.AIOps]: <AIOperation />,
  [AiFeatures.EquiFlex]: <EquiFlex />,
  [AiFeatures.EcoFlex]: <EcoFlexAI />
}
const subscribedIntents = defineMessage({ defaultMessage: 'Subscribed Intents' })
const unsubscribedIntents = defineMessage({ defaultMessage: 'Unsubscribed Intents' })
export function Settings ({ settings }: { settings: string }) {
  const { $t } = useIntl()
  const aiFeatures = Object.entries(aiFeaturesLabel)
    .map(([key, value]) => ({ name: $t(value), key }))
  const [targetKeys, setTargetKeys] = useState<string[]>([])
  const [notificationChecked, setNotificationChecked] = useState(false)
  const [visible, setVisible] = useState(false)
  const [form] = Form.useForm()

  const [updateSettings, result] = useUpdateTenantSettingsMutation()
  const saveSettings = useCallback(() => {
    return updateSettings({
      'enabled-intent-features': JSON.stringify(targetKeys)
    })
      .unwrap()
      .then(() => {
        showToast({
          type: 'success',
          content: $t({ defaultMessage: 'Subscriptions saved successfully!' })
        })
        closeDrawer(undefined)
      })
      .catch((error) => {
        showToast({ type: 'error', content: JSON.stringify(error) })
      })
  }, [targetKeys, updateSettings, showToast])

  useEffect(() => {
    setTargetKeys(JSON.parse(settings))
  }, [settings])

  const closeDrawer = (e: React.MouseEvent | React.KeyboardEvent | undefined) => {
    e?.stopPropagation()
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
