import { useContext, useEffect } from 'react'

import { Space } from 'antd'
import {
  Col,
  Form,
  Row,
  Select,
  Switch
} from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import {
  StepsForm,
  Subtitle,
  Tooltip
} from '@acx-ui/components'
import { Features, useSplitTreatment }                  from '@acx-ui/feature-toggle'
import { InformationSolid, QuestionMarkCircleOutlined } from '@acx-ui/icons'
import {
  WlanSecurityEnum,
  AaaServerTypeEnum,
  AaaServerOrderEnum,
  NetworkSaveData
} from '@acx-ui/rc/utils'

import { IpPortSecretForm } from '../../../../components/IpPortSecretForm'
import { ToggleButton }     from '../../../../components/ToggleButton'
import { NetworkDiagram }   from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext   from '../NetworkFormContext'

import { NetworkMoreSettingsForm } from './../NetworkMoreSettings/NetworkMoreSettingsForm'
import { CloudpathServerForm }     from './CloudpathServerForm'

const { Option } = Select

const { useWatch } = Form

export function AaaSettingsForm (props: {
  saveState: NetworkSaveData
}) {
  const { editMode, cloneMode, data } = useContext(NetworkFormContext)
  const form = Form.useFormInstance()
  useEffect(()=>{
    if((editMode || cloneMode) && data){
      form.setFieldsValue({
        isCloudpathEnabled: data.isCloudpathEnabled,
        enableAuthProxy: data.enableAuthProxy,
        enableAccountingProxy: data.enableAccountingProxy,
        enableAccountingService: data.enableAccountingService,
        enableSecondaryAuthServer: data.authRadius?.secondary !== undefined,
        enableSecondaryAcctServer: data.accountingRadius?.secondary !== undefined,
        authRadius: data.authRadius,
        accountingRadius: data.accountingRadius,
        wlanSecurity: data?.wlan?.wlanSecurity
      })
    }
  }, [data])

  return (
    <Row gutter={20}>
      <Col span={10}>
        <SettingsForm />
        {!data && <NetworkMoreSettingsForm wlanData={props.saveState} />}
      </Col>
      <Col span={14} style={{ height: '100%' }}>
        <NetworkDiagram />
      </Col>
    </Row>
  )
}

function SettingsForm () {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const { data, setData } = useContext(NetworkFormContext)
  const [
    isCloudpathEnabled,
    wlanSecurity,
    enableSecondaryAuthServer,
    enableAccountingService,
    enableSecondaryAcctServer
  ] = [
    useWatch('isCloudpathEnabled'),
    useWatch('wlanSecurity'),
    useWatch('enableSecondaryAuthServer'),
    useWatch('enableAccountingService'),
    useWatch('enableSecondaryAcctServer')
  ]

  const triBandRadioFeatureFlag = useSplitTreatment(Features.TRI_RADIO)
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

  const onCloudPathChange = (checked: boolean) => {
    if(checked){
      delete data?.authRadius
      delete data?.accountingRadius
    }else{
      delete data?.cloudpathServerId
      form.setFieldsValue({
        cloudpathServerId: ''
      })
    }
    setData && setData({ ...data, isCloudpathEnabled: checked })
  }

  return (
    <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
      <div>
        <StepsForm.Title>{ $t({ defaultMessage: 'AAA Settings' }) }</StepsForm.Title>
        {triBandRadioFeatureFlag &&
          <Form.Item
            label='Security Protocol'
            name='wlanSecurity'
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
        }
        <Form.Item>
          <Form.Item noStyle name='isCloudpathEnabled' valuePropName='checked'>
            <Switch onChange={onCloudPathChange}/>
          </Form.Item>
          <span>{ $t({ defaultMessage: 'Use Cloudpath Server' }) }</span>
        </Form.Item>
      </div>
      <div>
        {isCloudpathEnabled ? <CloudpathServerForm /> : <AaaService />}
      </div>
    </Space>
  )

  function AaaService () {
    const { $t } = useIntl()
    const { data, setData } = useContext(NetworkFormContext)

    const onChange = (value: boolean, fieldName: string) => {
      setData && setData({ ...data, [fieldName]: value })
    }

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
          <IpPortSecretForm
            serverType={AaaServerTypeEnum.AUTHENTICATION}
            order={AaaServerOrderEnum.PRIMARY}
          />

          <Form.Item noStyle name='enableSecondaryAuthServer'>
            <ToggleButton
              enableText={$t({ defaultMessage: 'Remove Secondary Server' })}
              disableText={$t({ defaultMessage: 'Add Secondary Server' })}
            />
          </Form.Item>

          {enableSecondaryAuthServer &&
            <IpPortSecretForm
              serverType={AaaServerTypeEnum.AUTHENTICATION}
              order={AaaServerOrderEnum.SECONDARY}
            />
          }

          <Form.Item>
            <Form.Item
              noStyle
              name='enableAuthProxy'
              valuePropName='checked'
              initialValue={false}
              children={<Switch onChange={
                (checked)=>onChange(checked, 'enableAuthProxy')}/>}
            />
            <span>{ $t({ defaultMessage: 'Proxy Service' }) }</span>
            {proxyServiceTooltip}
          </Form.Item>
        </div>
        <div>

          <Form.Item>
            <Subtitle level={3}>{ $t({ defaultMessage: 'Accounting Service' }) }</Subtitle>
            <Form.Item
              name='enableAccountingService'
              valuePropName='checked'
              initialValue={false}
              children={<Switch onChange={
                (checked)=>onChange(checked, 'enableAccountingService')}/>}
            />
          </Form.Item>
          {enableAccountingService && (
            <>
              <IpPortSecretForm
                serverType={AaaServerTypeEnum.ACCOUNTING}
                order={AaaServerOrderEnum.PRIMARY}
              />

              <Form.Item noStyle name='enableSecondaryAcctServer'>
                <ToggleButton
                  enableText={$t({ defaultMessage: 'Remove Secondary Server' })}
                  disableText={$t({ defaultMessage: 'Add Secondary Server' })}
                />
              </Form.Item>

              {enableSecondaryAcctServer &&
                <IpPortSecretForm
                  serverType={AaaServerTypeEnum.ACCOUNTING}
                  order={AaaServerOrderEnum.SECONDARY}
                />
              }

              <Form.Item>
                <Form.Item
                  noStyle
                  name='enableAccountingProxy'
                  valuePropName='checked'
                  initialValue={false}
                  children={<Switch onChange={
                    (checked)=>onChange(checked, 'enableAccountingProxy')}/>}
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
