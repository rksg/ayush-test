import { useEffect, useState } from 'react'

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
  ExpirationDateSelector
} from '@acx-ui/rc/components'
import {
  PassphraseFormatEnum,
  transformDpskNetwork,
  DpskNetworkType,
  DpskSaveData,
  CreateDpskFormFields,
  ExpirationDateEntity
} from '@acx-ui/rc/utils'

import {
  passphraseFormatDescription
} from '../contentsMap'

import { transferSaveDataToFormFields } from './parser'

interface DpskSettingsFormProps {
  data?: DpskSaveData
}

export default function DpskSettingsForm (props: DpskSettingsFormProps) {
  const intl = useIntl()
  const form = Form.useFormInstance()
  const passphraseFormat = Form.useWatch<PassphraseFormatEnum>('passphraseFormat')
  const { data } = props
  const { Option } = Select
  const [ expirationDate, setExpirationDate ] = useState<ExpirationDateEntity>()

  useEffect(() => {
    form.resetFields()

    if (!data) {
      return
    }
    const formData: CreateDpskFormFields = transferSaveDataToFormFields(data)

    form.setFieldsValue(formData)
    setExpirationDate(formData.expiration)
  }, [data, form])

  const nameValidator = async (value: string) => {
    return Promise.resolve(value)
  }

  const passphraseOptions = Object.keys(PassphraseFormatEnum).map((key =>
    <Option key={key}>{transformDpskNetwork(intl, DpskNetworkType.FORMAT, key)}</Option>
  ))

  return (
    <Row>
      <Col span={6}>
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
          extra={passphraseFormat && intl.$t(passphraseFormatDescription[passphraseFormat])}
        >
          <Select>{passphraseOptions}</Select>
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
        >
          <InputNumber min={8} max={63}/>
        </Form.Item>
        <ExpirationDateSelector
          data={expirationDate}
          inputName={'expiration'}
          label={intl.$t({ defaultMessage: 'List Expiration' })}
        />
      </Col>
    </Row>
  )
}
