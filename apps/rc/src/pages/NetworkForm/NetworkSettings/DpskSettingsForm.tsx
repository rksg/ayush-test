import { useState, useContext } from 'react'


import {
  QuestionCircleOutlined
} from '@ant-design/icons'
import { Radio, Space } from 'antd'
import {
  Col,
  Form,
  InputNumber,
  Row,
  Select,
  Tooltip
} from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import { StepsForm, Subtitle }                     from '@acx-ui/components'
import { useCloudpathListQuery }                   from '@acx-ui/rc/services'
import { WlanSecurityEnum, NetworkTypeEnum, PassphraseFormatEnum, DpskNetworkType,
  transformDpskNetwork, PassphraseExpirationEnum }      from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { NetworkDiagram }    from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext    from '../NetworkFormContext'
import { FieldExtraTooltip } from '../styledComponents'

import { CloudpathServerForm } from './CloudpathServerForm'

const { Option } = Select

const { useWatch } = Form

export function DpskSettingsForm () {
  const { data } = useContext(NetworkFormContext)
  const form = Form.useFormInstance()
  if(data){
    form.setFieldsValue({
      isCloudpathEnabled: data.cloudpathServerId !== undefined,
      passphraseFormat: data?.dpskPassphraseGeneration?.format,
      passphraseLength: data?.dpskPassphraseGeneration?.length,
      expiration: data?.dpskPassphraseGeneration?.expiration
    })
  }
  const selectedId = useWatch('cloudpathServerId')
  const { selected } = useCloudpathListQuery({ params: useParams() }, {
    selectFromResult ({ data }) {
      return {
        selected: data?.find((item) => item.id === selectedId)
      }
    }
  })

  return (
    <Row gutter={20}>
      <Col span={10}>
        <SettingsForm />
      </Col>
      <Col span={14}>
        <NetworkDiagram
          type={NetworkTypeEnum.DPSK}
          cloudpathType={selected?.deploymentType}
        />
      </Col>
    </Row>
  )
}

function SettingsForm () {
  const { editMode, cloneMode, data } = useContext(NetworkFormContext)
  const { $t } = useIntl()
  const [
    isCloudpathEnabled
  ] = [
    useWatch('isCloudpathEnabled')
  ]

  return (
    <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
      <div>
        <StepsForm.Title>{ $t({ defaultMessage: 'DPSK Settings' }) }</StepsForm.Title>
        <Form.Item
          label={$t({ defaultMessage: 'Security Protocol' })}
          name='dpskWlanSecurity'
          initialValue={(editMode || cloneMode) ?
            data?.wlan?.wlanSecurity : WlanSecurityEnum.WPA2Personal}
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
          <Radio.Group>
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
        {isCloudpathEnabled ? <CloudpathServerForm /> : <PassphraseGeneration />}
        { /*TODO: <div><Button type='link'>Show more settings</Button></div> */ }
      </div>
    </Space>
  )
}

function PassphraseGeneration () {
  const intl = useIntl()
  const $t = intl.$t
  const [state, updateState] = useState({
    passphraseFormat: PassphraseFormatEnum.MOST_SECURED,
    passphraseLength: 18,
    expiration: PassphraseExpirationEnum.UNLIMITED
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

  const onFormatChange = function (passphraseFormat: PassphraseFormatEnum) {
    updateData({ passphraseFormat })
  }

  const onExpirationChange = function (expiration: PassphraseExpirationEnum) {
    updateData({ expiration })
  }

  const passphraseFormatDescription = {
    [PassphraseFormatEnum.MOST_SECURED]:
      $t({ defaultMessage: 'Letters, numbers and symbols can be used' }),
    [PassphraseFormatEnum.KEYBOARD_FRIENDLY]:
      $t({ defaultMessage: 'Only letters and numbers can be used' }),
    [PassphraseFormatEnum.NUMBERS_ONLY]: $t({ defaultMessage: 'Only numbers can be used' })
  }

  return (
    <>
      <Subtitle level={3}>{ $t({ defaultMessage: 'Passphrase Generation Parameters' }) }</Subtitle>
      <Row align='middle' gutter={8}>
        <Col span={23}>
          <Form.Item
            name='passphraseFormat'
            label={$t({ defaultMessage: 'Passphrase format' })}
            rules={[{ required: true }]}
            initialValue={state.passphraseFormat}
            extra={passphraseFormatDescription[state.passphraseFormat]}
          >
            <Select
              onChange={onFormatChange}
            >
              {passphraseOptions}
            </Select>
          </Form.Item>
        </Col>
        <Col span={1}>
          <FieldExtraTooltip>
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
              children={<QuestionCircleOutlined />}
            />
          </FieldExtraTooltip>
        </Col>
      </Row>

      <Row align='middle' gutter={8}>
        <Col span={23}>
          <Form.Item
            name='passphraseLength'
            label={$t({ defaultMessage: 'Passphrase length' })}
            rules={[{ required: true }]}
            initialValue={state.passphraseLength}
            children={<InputNumber min={8} max={63} style={{ width: '100%' }}/>}
          />
        </Col>
        <Col span={1}>
          <Tooltip
            title={$t({ defaultMessage: 'Number of characters in passphrase. Valid range 8-63' })}
            placement='bottom'
            children={<QuestionCircleOutlined />}
          />
        </Col>
      </Row>

      <Form.Item
        name='expiration'
        label={$t({ defaultMessage: 'Passphrase expiration' })}
        rules={[{ required: true }]}
        initialValue={state.expiration}
      >
        <Select
          style={{ width: '100%' }}
          onChange={onExpirationChange}
        >
          {expirationOptions}
        </Select>
      </Form.Item>
    </>
  )
}
