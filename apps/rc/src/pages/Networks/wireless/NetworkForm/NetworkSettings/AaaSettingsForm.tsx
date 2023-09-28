import { useContext, useEffect } from 'react'

import { Space } from 'antd'
import {
  Col,
  Form,
  Row,
  Select,
  Switch
} from 'antd'
import { isUndefined }               from 'lodash'
import { FormattedMessage, useIntl } from 'react-intl'

import {
  StepsFormLegacy,
  Subtitle,
  Tooltip
} from '@acx-ui/components'
import { Features, useIsSplitOn }                       from '@acx-ui/feature-toggle'
import { InformationSolid, QuestionMarkCircleOutlined } from '@acx-ui/icons'
import {
  WlanSecurityEnum
} from '@acx-ui/rc/utils'

import AAAInstance                 from '../AAAInstance'
import { NetworkDiagram }          from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext          from '../NetworkFormContext'
import { NetworkMoreSettingsForm } from '../NetworkMoreSettings/NetworkMoreSettingsForm'

const { Option } = Select

const { useWatch } = Form

export function AaaSettingsForm () {
  const { editMode, cloneMode, data } = useContext(NetworkFormContext)
  const form = Form.useFormInstance()
  useEffect(()=>{
    if((editMode || cloneMode) && data){
      form.setFieldsValue({
        enableAuthProxy: data.enableAuthProxy,
        enableAccountingProxy: data.enableAccountingProxy,
        enableAccountingService: data.enableAccountingService,
        authRadius: data.authRadius,
        accountingRadius: data.accountingRadius,
        wlanSecurity: data?.wlan?.wlanSecurity,
        accountingRadiusId: data.accountingRadiusId,
        authRadiusId: data.authRadiusId
      })
    }
  }, [data])

  return (<>
    <Row gutter={20}>
      <Col span={10}>
        <SettingsForm />
      </Col>
      <Col span={14} style={{ height: '100%' }}>
        <NetworkDiagram />
      </Col>
    </Row>
    {!(editMode) && <Row>
      <Col span={24}>
        <NetworkMoreSettingsForm wlanData={data} />
      </Col>
    </Row>}
  </>)
}

function SettingsForm () {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const wlanSecurity = useWatch(['wlan', 'wlanSecurity'])
  const triBandRadioFeatureFlag = useIsSplitOn(Features.TRI_RADIO)
  const wpa2Description = <FormattedMessage
    /* eslint-disable max-len */
    defaultMessage={`
      WPA2 is strong Wi-Fi security that is widely available on all mobile devices manufactured after 2006.
      WPA2 should be selected unless you have a specific reason to choose otherwise.
      <highlight>
        6GHz radios are only supported with WPA3.
      </highlight>
    `}
    /* eslint-enable */
    values={{
      highlight: (chunks) => <Space align='start'>
        <InformationSolid />
        {chunks}
      </Space>
    }}
  />

  const wpa3Description = $t({
    // eslint-disable-next-line max-len
    defaultMessage: 'WPA3 is the highest level of Wi-Fi security available but is supported only by devices manufactured after 2019.'
  })

  useEffect(() => {
    if (!isUndefined(wlanSecurity)) {
      form.setFieldValue(['wlanSecurity'], wlanSecurity)
    }
  })

  return (
    <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
      <div>
        <StepsFormLegacy.Title>{ $t({ defaultMessage: 'AAA Settings' }) }</StepsFormLegacy.Title>
        {triBandRadioFeatureFlag &&
          (
            <>
              <Form.Item
                name='wlanSecurity'
                initialValue={wlanSecurity}
                hidden
              />
              <Form.Item
                label='Security Protocol'
                name={['wlan', 'wlanSecurity']}
                initialValue={WlanSecurityEnum.WPA2Enterprise}
                extra={
                  wlanSecurity === WlanSecurityEnum.WPA2Enterprise
                    ? wpa2Description
                    : wpa3Description
                }
              >
                <Select>
                  <Option value={WlanSecurityEnum.WPA2Enterprise}>
                    { $t({ defaultMessage: 'WPA2 (Recommended)' }) }
                  </Option>
                  <Option value={WlanSecurityEnum.WPA3}>{ $t({ defaultMessage: 'WPA3' }) }</Option>
                </Select>
              </Form.Item>
            </>
          )
        }
      </div>
      <div>
        <AaaService />
      </div>
    </Space>
  )

  function AaaService () {
    const { $t } = useIntl()
    const form = Form.useFormInstance()
    const enableAccountingService = form.getFieldValue('enableAccountingService')
    const proxyServiceTooltip = <Tooltip
      placement='bottom'
      children={<QuestionMarkCircleOutlined />}
      title={$t({
        // eslint-disable-next-line max-len
        defaultMessage: 'Use the controller as proxy in 802.1X networks. A proxy AAA server is used when APs send authentication/accounting messages to the controller and the controller forwards these messages to an external AAA server.'
      })}
    />
    return (
      <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
        <div>
          <Subtitle level={3}>{ $t({ defaultMessage: 'Authentication Service' }) }</Subtitle>
          <AAAInstance serverLabel={$t({ defaultMessage: 'Authentication Server' })}
            type='authRadius'/>
          <Form.Item>
            <Form.Item
              noStyle
              name='enableAuthProxy'
              valuePropName='checked'
              initialValue={false}
              children={<Switch />}
            />
            <span>{ $t({ defaultMessage: 'Proxy Service' }) }</span>
            {proxyServiceTooltip}
          </Form.Item>
        </div>
        <div>
          <Subtitle level={3}>{ $t({ defaultMessage: 'Accounting Service' }) }</Subtitle>
          <Form.Item
            name='enableAccountingService'
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}
          />
          {enableAccountingService && (
            <>
              <AAAInstance serverLabel={$t({ defaultMessage: 'Accounting Server' })}
                type='accountingRadius'/>
              <Form.Item>
                <Form.Item
                  noStyle
                  name='enableAccountingProxy'
                  valuePropName='checked'
                  initialValue={false}
                  children={<Switch />}
                />
                <span>{ $t({ defaultMessage: 'Proxy Service' }) }</span>
                {proxyServiceTooltip}
              </Form.Item>
            </>
          )}
        </div>
      </Space>
    )
  }
}
