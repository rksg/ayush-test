
import { useState } from 'react'

import {
  QuestionCircleOutlined
} from '@ant-design/icons'
import { Form, Input, Col, Row, Select, InputNumber, Tooltip } from 'antd'
import { FormattedMessage, useIntl }                           from 'react-intl'

import { StepsForm, Subtitle }                                                                                         from '@acx-ui/components'
import { useLazyServiceListQuery }                                                                                     from '@acx-ui/rc/services'
import { PassphraseFormatEnum, PassphraseExpirationEnum, transformDpskNetwork, DpskNetworkType, checkObjectNotExists } from '@acx-ui/rc/utils'
import { useParams }                                                                                                   from '@acx-ui/react-router-dom'

import { FieldExtraTooltip } from '../styledComponents'

export function DPSKDetailForm () {
  const { $t } = useIntl()
  const intl = useIntl()
  const [state, updateState] = useState({
    passphraseFormat: PassphraseFormatEnum.MOST_SECURED,
    passphraseLength: 18,
    expiration: PassphraseExpirationEnum.UNLIMITED
  })
  const serviceListPayload = {
    searchString: '',
    fields: ['name', 'id'],
    searchTargetFields: ['name'],
    filters: {},
    pageSize: 10000
  }
  const [getServiceList] = useLazyServiceListQuery()
  const params = useParams()
  const { Option } = Select
  const nameValidator = async (value: string) => {
    // const payload = { ...serviceListPayload, searchString: value }
    // const list = (await getServiceList({ params, payload }, true)
    //   .unwrap()).data.map(n => ({ name: n.name }))
    // return checkObjectNotExists(list, value, 'Service')
    return Promise.resolve()
  }
  const passphraseFormatDescription = {
    [PassphraseFormatEnum.MOST_SECURED]:
      $t({ defaultMessage: 'Letters, numbers and symbols can be used' }),
    [PassphraseFormatEnum.KEYBOARD_FRIENDLY]:
      $t({ defaultMessage: 'Only letters and numbers can be used' }),
    [PassphraseFormatEnum.NUMBERS_ONLY]: $t({ defaultMessage: 'Only numbers can be used' })
  }
  const updateData = (newData: Partial<typeof state>) => {
    updateState({ ...state, ...newData })
  }
  const onFormatChange = function (passphraseFormat: PassphraseFormatEnum) {
    updateData({ passphraseFormat })
  }

  const onExpirationChange = function (expiration: PassphraseExpirationEnum) {
    updateData({ expiration })
  }
  const passphraseOptions = Object.keys(PassphraseFormatEnum).map((key =>
    <Option key={key}>{transformDpskNetwork(intl, DpskNetworkType.FORMAT, key)}</Option>
  ))

  const expirationOptions = Object.keys(PassphraseExpirationEnum).map((key =>
    <Option key={key}>{transformDpskNetwork(intl, DpskNetworkType.EXPIRATION, key)}</Option>
  ))
  return (
    <Row gutter={20}>
      <Col span={10}>
        <StepsForm.Title>{$t({ defaultMessage: 'Settings' })}</StepsForm.Title>
        <Form.Item
          name='name'
          label={$t({ defaultMessage: 'Service Name' })}
          rules={[
            { required: true },
            { min: 2 },
            { max: 32 },
            { validator: (_, value) => nameValidator(value) }
          ]}
          validateFirst
          hasFeedback
          children={<Input />}
        />
        <Form.Item
          name='tags'
          label={$t({ defaultMessage: 'Tags' })}
          children={<Input />}
        />
        <Subtitle level={3}>{ $t({ defaultMessage: 'Passphrase Generation Parameters' }) }
        </Subtitle>
        <Row align='middle' gutter={8}>
          <Col span={23}>
            <Form.Item
              name='passphraseFormat'
              label={$t({ defaultMessage: 'Passphrase format' })}
              rules={[{ required: true }]}
              initialValue={state.passphraseFormat}
              extra={passphraseFormatDescription[state.passphraseFormat]}
            >
              <Select onChange={onFormatChange}>
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
              rules={[{ required: true }]}
              label={$t({ defaultMessage: 'Passphrase length' })}
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
          <Select onChange={onExpirationChange}>
            {expirationOptions}
          </Select>
        </Form.Item>
      </Col>
    </Row>
  )
}
