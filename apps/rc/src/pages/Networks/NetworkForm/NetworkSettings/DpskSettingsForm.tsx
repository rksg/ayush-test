import { useState, useContext, useEffect } from 'react'

import { Radio, RadioChangeEvent, Space } from 'antd'
import {
  Col,
  Form,
  InputNumber,
  Row,
  Select
} from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import { StepsForm, Subtitle, Tooltip }                             from '@acx-ui/components'
import { QuestionMarkCircleOutlined }                               from '@acx-ui/icons'
import { WlanSecurityEnum, PassphraseFormatEnum, DpskNetworkType,
  transformDpskNetwork, PassphraseExpirationEnum, NetworkSaveData }      from '@acx-ui/rc/utils'

import { NetworkDiagram } from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext from '../NetworkFormContext'

import { NetworkMoreSettingsForm } from './../NetworkMoreSettings/NetworkMoreSettingsForm'
import { CloudpathServerForm }     from './CloudpathServerForm'

const { Option } = Select

const { useWatch } = Form

export function DpskSettingsForm (props: {
  saveState: NetworkSaveData
}) {
  const { editMode, cloneMode, data } = useContext(NetworkFormContext)
  const form = Form.useFormInstance()
  useEffect(()=>{
    if((editMode || cloneMode) && data){
      form.setFieldsValue({
        isCloudpathEnabled: data.isCloudpathEnabled,
        dpskPassphraseGeneration: data?.dpskPassphraseGeneration,
        dpskWlanSecurity: data?.wlan?.wlanSecurity
      })
    }
  }, [data])

  return (
    <Row gutter={20}>
      <Col span={10}>
        <SettingsForm />
        {!(editMode) && <NetworkMoreSettingsForm wlanData={props.saveState} />}
      </Col>
      <Col span={14} style={{ height: '100%' }}>
        <NetworkDiagram />
      </Col>
    </Row>
  )
}

function SettingsForm () {
  const form = Form.useFormInstance()
  const { editMode, data, setData } = useContext(NetworkFormContext)
  const { $t } = useIntl()
  const [
    isCloudpathEnabled
  ] = [
    useWatch('isCloudpathEnabled')
  ]

  const onCloudPathChange = (e: RadioChangeEvent) => {
    if(e.target.value){
      form.setFieldsValue({
        cloudpathServerId: ''
      })
    }
    setData && setData({ ...data, isCloudpathEnabled: e.target.value })
  }

  return (
    <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
      <div>
        <StepsForm.Title>{ $t({ defaultMessage: 'DPSK Settings' }) }</StepsForm.Title>
        <Form.Item
          label={$t({ defaultMessage: 'Security Protocol' })}
          name='dpskWlanSecurity'
          initialValue={WlanSecurityEnum.WPA2Personal}
        >
          <Select>
            <Option value={WlanSecurityEnum.WPA2Personal}>
              { $t({ defaultMessage: 'WPA2 (Recommended)' }) }
            </Option>
            <Option value={WlanSecurityEnum.WPAPersonal}>{ $t({ defaultMessage: 'WPA' }) }</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name='isCloudpathEnabled'
          initialValue={false}
        >
          <Radio.Group onChange={onCloudPathChange}>
            <Space direction='vertical'>
              <Radio value={false} disabled={editMode}>
                { $t({ defaultMessage: 'Use the DPSK Service' }) }
              </Radio>
              <Radio value={true} disabled={editMode}>
                { $t({ defaultMessage: 'Use Cloudpath Server' }) }
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
      </div>
      <div>
        {isCloudpathEnabled ? <><CloudpathServerForm /><PassphraseGeneration /></> :
          <PassphraseGeneration />}
      </div>
    </Space>
  )
}

function PassphraseGeneration () {
  const [
    isCloudpathEnabled
  ] = [
    useWatch('isCloudpathEnabled')
  ]
  const intl = useIntl()
  const $t = intl.$t
  const [state, updateState] = useState<NetworkSaveData>({
    dpskPassphraseGeneration: {
      format: PassphraseFormatEnum.MOST_SECURED,
      length: 18,
      expiration: PassphraseExpirationEnum.UNLIMITED
    }
  })

  const updateData = (newData: Partial<typeof state>) => {
    updateState({ ...state, ...newData })
  }

  const passphraseOptions = Object.keys(PassphraseFormatEnum).map((key =>
    <Option key={key}>{transformDpskNetwork(intl, DpskNetworkType.FORMAT, key)}</Option>
  ))

  const expirationOptions = Object.keys(PassphraseExpirationEnum).map((key =>
    <Option key={key}>{transformDpskNetwork(intl, DpskNetworkType.EXPIRATION, key)}</Option>
  ))

  const onFormatChange = function (format: PassphraseFormatEnum) {
    updateData({ dpskPassphraseGeneration: { format } })
  }

  const onExpirationChange = function (expiration: PassphraseExpirationEnum) {
    updateData({ dpskPassphraseGeneration: { expiration } })
  }

  const passphraseFormatDescription = {
    [PassphraseFormatEnum.MOST_SECURED]:
      $t({ defaultMessage: 'Letters, numbers and symbols can be used' }),
    [PassphraseFormatEnum.KEYBOARD_FRIENDLY]:
      $t({ defaultMessage: 'Only letters and numbers can be used' }),
    [PassphraseFormatEnum.NUMBERS_ONLY]: $t({ defaultMessage: 'Only numbers can be used' })
  }

  return (
    <div style={{ display: isCloudpathEnabled ? 'none' : 'block' }}>
      <Subtitle level={3}>{ $t({ defaultMessage: 'Passphrase Generation Parameters' }) }</Subtitle>

      <Form.Item
        name={['dpskPassphraseGeneration', 'format']}
        label={<>
          { $t({ defaultMessage: 'Passphrase format' }) }
          <Tooltip
            placement='bottom'
            title={<FormattedMessage
              defaultMessage={`<p>Format options:</p>
                <p>Most secured - all printable ASCII characters can be used</p>
                <p>Keyboard friendly - only letters and numbers will be used</p>
                <p>Numbers only - only numbers will be used</p>
              `}
              values={{ p: (chunks) => <p>{chunks}</p> }}
            />}
            children={<QuestionMarkCircleOutlined />}
          />
        </>}
        rules={[{ required: true }]}
        initialValue={state.dpskPassphraseGeneration?.format}
        extra={passphraseFormatDescription[
          state.dpskPassphraseGeneration?.format?
            state?.dpskPassphraseGeneration?.format:
            PassphraseFormatEnum.MOST_SECURED]}
      >
        <Select
          onChange={onFormatChange}
        >
          {passphraseOptions}
        </Select>
      </Form.Item>

      <Form.Item
        name={['dpskPassphraseGeneration', 'length']}
        label={<>
          { $t({ defaultMessage: 'Passphrase length' }) }
          <Tooltip
            title={$t({ defaultMessage: 'Number of characters in passphrase. Valid range 8-63' })}
            placement='bottom'
            children={<QuestionMarkCircleOutlined />}
          />
        </>}
        rules={[{ required: true }]}
        initialValue={state.dpskPassphraseGeneration?.length}
        children={<InputNumber min={8} max={63} style={{ width: '100%' }}/>}
      />

      <Form.Item
        name={['dpskPassphraseGeneration', 'expiration']}
        label={$t({ defaultMessage: 'Passphrase expiration' })}
        rules={[{ required: true }]}
        initialValue={state.dpskPassphraseGeneration?.expiration}
      >
        <Select
          style={{ width: '100%' }}
          onChange={onExpirationChange}
        >
          {expirationOptions}
        </Select>
      </Form.Item>
    </div>
  )
}

