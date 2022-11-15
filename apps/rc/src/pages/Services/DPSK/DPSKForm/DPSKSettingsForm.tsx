import { useState } from 'react'

import {
  Form,
  Input,
  Col,
  Row,
  Select,
  InputNumber,
  Tooltip,
  Radio,
  Space,
  RadioChangeEvent
} from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import { StepsForm, Subtitle }        from '@acx-ui/components'
import { QuestionMarkCircleOutlined } from '@acx-ui/icons'
import {
  PassphraseFormatEnum,
  PassphraseExpirationEnum,
  transformDpskNetwork,
  DpskNetworkType
} from '@acx-ui/rc/utils'

enum ListExpirationType {
  NEVER,
  BY_DATE,
  AFTER_DATE
}

export default function DPSKSettingsForm () {
  const { $t } = useIntl()
  const intl = useIntl()
  const [state, updateState] = useState({
    passphraseFormat: PassphraseFormatEnum.MOST_SECURED,
    passphraseLength: 18,
    expiration: PassphraseExpirationEnum.UNLIMITED
  })
  const [ listExpirationType, setListExpirationType ] = useState<ListExpirationType>()

  const { Option } = Select
  const nameValidator = async (value: string) => {
    return Promise.resolve(value)
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

  // const onExpirationChange = function (expiration: PassphraseExpirationEnum) {
  //   updateData({ expiration })
  // }
  const onExpirationChange = function (e: RadioChangeEvent) {
    setListExpirationType(e.target.value)
  }

  const passphraseOptions = Object.keys(PassphraseFormatEnum).map((key =>
    <Option key={key}>{transformDpskNetwork(intl, DpskNetworkType.FORMAT, key)}</Option>
  ))

  // const expirationOptions = Object.keys(PassphraseExpirationEnum).map((key =>
  //   <Option key={key}>{transformDpskNetwork(intl, DpskNetworkType.EXPIRATION, key)}</Option>
  // ))
  return (
    <Row>
      <Col span={6}>
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
        <Subtitle level={3}>{ $t({ defaultMessage: 'Passphrase Generation Parameters' }) }
        </Subtitle>
        <Form.Item
          name='passphraseFormat'
          label={
            <>
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
              >
                <QuestionMarkCircleOutlined />
              </Tooltip>
            </>
          }
          rules={[{ required: true }]}
          initialValue={state.passphraseFormat}
          extra={passphraseFormatDescription[state.passphraseFormat]}
        >
          <Select onChange={onFormatChange}>
            {passphraseOptions}
          </Select>
        </Form.Item>
        <Form.Item
          name='passphraseLength'
          rules={[{ required: true }]}
          label={
            <>
              { $t({ defaultMessage: 'Passphrase length' }) }
              <Tooltip
                // eslint-disable-next-line max-len
                title={$t({ defaultMessage: 'Number of characters in passphrase. Valid range 8-63' })}
                placement='bottom'
              >
                <QuestionMarkCircleOutlined />
              </Tooltip>
            </>
          }
          initialValue={state.passphraseLength}
        >
          <InputNumber min={8} max={63}/>
        </Form.Item>
        <Form.Item
          name='expiration'
          label={$t({ defaultMessage: 'List Expiration' })}
          rules={[{ required: true }]}
          initialValue={state.expiration}
        >
          {/* <Select onChange={onExpirationChange}>
            {expirationOptions}
          </Select> */}
          <Radio.Group onChange={onExpirationChange} value={listExpirationType}>
            <Space direction='vertical'>
              <Radio key={ListExpirationType.NEVER} value={ListExpirationType.NEVER}>
                {ListExpirationType.NEVER}
              </Radio>
              <Radio key={ListExpirationType.BY_DATE} value={ListExpirationType.BY_DATE}>
                {ListExpirationType.BY_DATE}
              </Radio>
              <Radio key={ListExpirationType.AFTER_DATE} value={ListExpirationType.AFTER_DATE}>
                {ListExpirationType.AFTER_DATE}
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
      </Col>
    </Row>
  )
}
