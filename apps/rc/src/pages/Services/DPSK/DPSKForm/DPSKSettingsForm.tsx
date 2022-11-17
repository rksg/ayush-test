import { useState } from 'react'

import {
  Form,
  Input,
  Col,
  Row,
  Select,
  InputNumber,
  Tooltip
} from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import { StepsForm, Subtitle }        from '@acx-ui/components'
import { QuestionMarkCircleOutlined } from '@acx-ui/icons'
import {
  ExpirationDateEntity,
  ExpirationDateSelector
} from '@acx-ui/rc/components'
import {
  PassphraseFormatEnum,
  transformDpskNetwork,
  DpskNetworkType
} from '@acx-ui/rc/utils'

import {
  passphraseFormatDescription
} from '../contentsMap'

export default function DPSKSettingsForm () {
  const intl = useIntl()
  const [state, updateState] = useState({
    passphraseFormat: PassphraseFormatEnum.MOST_SECURED,
    passphraseLength: 18
  })
  const { Option } = Select
  const [ expirationDateEntity, setExpirationDateEntity ] = useState(new ExpirationDateEntity())
  const form = Form.useFormInstance()

  const nameValidator = async (value: string) => {
    return Promise.resolve(value)
  }

  const updateData = (newData: Partial<typeof state>) => {
    updateState({ ...state, ...newData })
  }
  const onFormatChange = function (passphraseFormat: PassphraseFormatEnum) {
    updateData({ passphraseFormat })
  }

  const passphraseOptions = Object.keys(PassphraseFormatEnum).map((key =>
    <Option key={key}>{transformDpskNetwork(intl, DpskNetworkType.FORMAT, key)}</Option>
  ))

  const onExpirationDateChange = (data: ExpirationDateEntity) => {
    setExpirationDateEntity(data)
  }

  return (
    <Row>
      <Col span={8}>
        <StepsForm.Title>{intl.$t({ defaultMessage: 'Settings' })}</StepsForm.Title>
        <Form.Item
          name='name'
          label={intl.$t({ defaultMessage: 'Service Name' })}
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
        <Subtitle level={3}>
          { intl.$t({ defaultMessage: 'Passphrase Generation Parameters' }) }
        </Subtitle>
        <Form.Item
          name='passphraseFormat'
          label={
            <>
              { intl.$t({ defaultMessage: 'Passphrase format' }) }
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
          extra={intl.$t(passphraseFormatDescription[state.passphraseFormat])}
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
              { intl.$t({ defaultMessage: 'Passphrase length' }) }
              <Tooltip
                // eslint-disable-next-line max-len
                title={intl.$t({ defaultMessage: 'Number of characters in passphrase. Valid range 8-63' })}
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
          name='listExpiration'
          label={intl.$t({ defaultMessage: 'List Passphrase' })}
          rules={[{ required: true }]}
          // initialValue={state.listExpiration}
        >
          <ExpirationDateSelector data={expirationDateEntity} setData={onExpirationDateChange} />
          {/* <Radio.Group onChange={onListExpirationChange}>
            <Space direction='vertical' size='middle'>
              <Radio key={ListExpirationType.NEVER} value={ListExpirationType.NEVER}>
                {intl.$t(listExpirationLabel[ListExpirationType.NEVER])}
              </Radio>
              <Radio key={ListExpirationType.BY_DATE} value={ListExpirationType.BY_DATE}>
                <UI.FieldLabel columns={'120px 1fr'}>
                  {intl.$t(listExpirationLabel[ListExpirationType.BY_DATE])}
                  {state.listExpiration === ListExpirationType.BY_DATE &&
                    <Form.Item name={['listExpirationByDate', 'date']}>
                      <DatePicker />
                    </Form.Item>
                  }
                </UI.FieldLabel>
              </Radio>
              <Radio key={ListExpirationType.AFTER_DATE} value={ListExpirationType.AFTER_DATE}>
                <UI.FieldLabel columns={'120px auto 120px'}>
                  {intl.$t(listExpirationLabel[ListExpirationType.AFTER_DATE])}
                  {state.listExpiration === ListExpirationType.AFTER_DATE &&
                    <>
                      <Form.Item name={['listExpirationAfterDate', 'quantity']}>
                        <InputNumber min={1} max={64}/>
                      </Form.Item>
                      <Form.Item name={['listExpirationAfterDate', 'unit']}>
                        <Select style={{ width: 120 }}>
                          <Option key={'hours'}>{intl.$t({ defaultMessage: 'Hours' })}</Option>
                          <Option key={'days'}>{intl.$t({ defaultMessage: 'Days' })}</Option>
                          <Option key={'weeks'}>{intl.$t({ defaultMessage: 'Weeks' })}</Option>
                          <Option key={'months'}>{intl.$t({ defaultMessage: 'Months' })}</Option>
                          <Option key={'years'}>{intl.$t({ defaultMessage: 'Years' })}</Option>
                        </Select>
                      </Form.Item>
                    </>
                  }
                </UI.FieldLabel>
              </Radio>
            </Space>
          </Radio.Group> */}
        </Form.Item>
      </Col>
    </Row>
  )
}
