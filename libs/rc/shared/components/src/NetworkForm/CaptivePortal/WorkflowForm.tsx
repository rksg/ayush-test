import React, { useContext } from 'react'

import { Form, Space, Switch } from 'antd'
import { useIntl }             from 'react-intl'

import {
  GridCol,
  GridRow,
  Select,
  StepsFormLegacy,
  Subtitle,
  Tooltip
} from '@acx-ui/components'
import {
  GuestNetworkTypeEnum,
  NetworkSaveData,
  NetworkTypeEnum,
  useConfigTemplate,
  WifiNetworkMessages
} from '@acx-ui/rc/utils'

import { AAAInstance }             from '../AAAInstance'
import { NetworkDiagram }          from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext          from '../NetworkFormContext'
import { NetworkMoreSettingsForm } from '../NetworkMoreSettings/NetworkMoreSettingsForm'
import * as UI                     from '../styledComponents'

import {
  BypassCaptiveNetworkAssistantCheckbox
} from './SharedComponent/BypassCNA/BypassCaptiveNetworkAssistantCheckbox'
import { WalledGardenTextArea }  from './SharedComponent/WalledGarden/WalledGardenTextArea'
import { WlanSecurityFormItems } from './SharedComponent/WlanSecurity/WlanSecuritySettings'


const { useWatch } = Form

export function WorkflowForm () {
  const labelWidth = '250px'
  const { data, setData, editMode, isRuckusAiMode, cloneMode } =
    useContext(NetworkFormContext)
  const form = Form.useFormInstance()

  const onProxyChange = (value: boolean, fieldName: string) => {
    setData && setData({ ...data, [fieldName]: value })
  }
  const enableAccountingService = useWatch('enableAccountingService', form)

  const { isTemplate } = useConfigTemplate()
  const { $t } = useIntl()

  // SANTODO: implement editing logic
  return (
    <>
      <GridRow>
        <GridCol col={{ span: 10 }}>
          <StepsFormLegacy.Title
            children={$t({ defaultMessage: 'Settings' })}
          />
          {/*SANTODO: Check with backend*/}
          <Form.Item
            label={$t({ defaultMessage: 'Workflow' })}
            name={''}
            rules={[{ required: true }]}
            children={
              <Select
                data-testid={'workflow-profile-select'}
                options={[
                  { label: 'Workflow-1', value: 1 },
                  { label: 'Workflow-2', value: 2 }
                ]}
              />
            }
          />
          <WlanSecurityFormItems />
          <BypassCaptiveNetworkAssistantCheckbox />
          <WalledGardenTextArea
            enableDefaultWalledGarden={true}
          />
          <div>
            <UI.FieldLabel width={labelWidth}>
              <Subtitle level={3}>{$t({ defaultMessage: 'Accounting Service' })}</Subtitle>
              <Form.Item
                name='enableAccountingService'
                valuePropName='checked'
                style={{ marginTop: '-5px', marginBottom: '0' }}
                initialValue={false}
                children={<Switch
                  onChange={(value) => onProxyChange(value,'enableAccountingService')}
                />}
              />
            </UI.FieldLabel>
            {enableAccountingService && <>
              <AAAInstance serverLabel={$t({ defaultMessage: 'Accounting Server' })}
                type='accountingRadius'
                networkType={data?.type}
              />
              <UI.FieldLabel width={labelWidth}>
                <Space align='start'>
                  { $t({ defaultMessage: 'Proxy Service' }) }
                  <Tooltip.Question
                    placement='bottom'
                    title={$t(WifiNetworkMessages.ENABLE_PROXY_IN_CAPTIVE_PORTAL_TOOLTIP)}
                    iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
                  />
                </Space>
                <Form.Item
                  name='enableAccountingProxy'
                  valuePropName='checked'
                  initialValue={false}
                  children={<Switch
                    data-testid='enable-accounting-proxy'
                    onChange={(value)=>onProxyChange(value,'enableAccountingProxy')}
                  />}
                />
              </UI.FieldLabel>
            </>}
          </div>
        </GridCol>
        {/*SANTODO: Images need update, no psk and owe.*/}
        <GridCol col={{ span: 14 }}>
          <NetworkDiagram
            type={NetworkTypeEnum.CAPTIVEPORTAL}
            networkPortalType={GuestNetworkTypeEnum.Workflow}
            wlanSecurity={data?.wlan?.wlanSecurity}
            forceHideAAAButton={true}
          />
        </GridCol>
      </GridRow>
      {!editMode && !isRuckusAiMode && (
        <GridRow>
          <GridCol col={{ span: 24 }}>
            <NetworkMoreSettingsForm wlanData={data as NetworkSaveData} />
          </GridCol>
        </GridRow>
      )}
    </>
  )
}
