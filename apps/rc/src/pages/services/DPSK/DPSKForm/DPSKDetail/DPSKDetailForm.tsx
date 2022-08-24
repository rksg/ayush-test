
import { Form, Input, Col, Row, Select, InputNumber } from 'antd'
import { useIntl }                       from 'react-intl'

import { StepsForm }                                      from '@acx-ui/components'
import { useLazyServiceListQuery }                        from '@acx-ui/rc/services'
import { checkObjectNotExists }                           from '@acx-ui/rc/utils'
import { PassphraseFormatEnum, PassphraseExpirationEnum } from '@acx-ui/rc/utils'
import { useParams }                                      from '@acx-ui/react-router-dom'
import { useState } from 'react'

export function DPSKDetailForm () {
  const { $t } = useIntl()
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
  const updateData = (newData: Partial<typeof state>) => {
    updateState({ ...state, ...newData })
  }
  const onFormatChange = function (passphraseFormat: PassphraseFormatEnum) {
    updateData({ passphraseFormat })
  }

  const onExpirationChange = function (expiration: PassphraseExpirationEnum) {
    updateData({ expiration })
  }
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
        <Form.Item
          name='type'
          label={$t({ defaultMessage: 'Passphrase Generation Parameters' })}
        >
        </Form.Item>
        <Form.Item
          name='passphraseFormat'
          label={$t({ defaultMessage: 'Passphrase format' })}
          rules={[{ required: true }]}
          initialValue={state.passphraseFormat}
        >
          <Select onChange={onFormatChange}>
            <Option value={PassphraseFormatEnum.MOST_SECURED}>
              { $t({ defaultMessage: 'Most secured' }) }
            </Option>
            <Option value={PassphraseFormatEnum.KEYBOARD_FRIENDLY}>
              { $t({ defaultMessage: 'Keyboard friendly' }) }
            </Option>
            <Option value={PassphraseFormatEnum.NUMBERS_ONLY}>
              { $t({ defaultMessage: 'Numbers only' }) }
            </Option>
          </Select>
        </Form.Item>
        <Form.Item
          name='passphraseLength'
          rules={[{ required: true }]}
          label={$t({ defaultMessage: 'Passphrase length' })}
          initialValue={state.passphraseLength}
          children={<InputNumber min={8} max={63} style={{ width: '100%' }}/>}
        />
        <Form.Item
          name='expiration'
          label={$t({ defaultMessage: 'Passphrase expiration' })}
          rules={[{ required: true }]}
          initialValue={state.expiration}
        >
          <Select onChange={onExpirationChange}>
            <Option value={PassphraseExpirationEnum.UNLIMITED}>
              { $t({ defaultMessage: 'Unlimited' }) }
            </Option>
            <Option value={PassphraseExpirationEnum.ONE_DAY}>
              { $t({ defaultMessage: '1 day' }) }
            </Option>
            <Option value={PassphraseExpirationEnum.TWO_DAYS}>
              { $t({ defaultMessage: '2 days' }) }
            </Option>
            <Option value={PassphraseExpirationEnum.ONE_WEEK}>
              { $t({ defaultMessage: '1 week' }) }
            </Option>
            <Option value={PassphraseExpirationEnum.TWO_WEEKS}>
              { $t({ defaultMessage: '2 weeks' }) }
            </Option>
            <Option value={PassphraseExpirationEnum.ONE_MONTH}>
              { $t({ defaultMessage: '1 month' }) }
            </Option>
            <Option value={PassphraseExpirationEnum.SIX_MONTHS}>
              { $t({ defaultMessage: '6 months' }) }
            </Option>
            <Option value={PassphraseExpirationEnum.ONE_YEAR}>
              { $t({ defaultMessage: '1 year' }) }
            </Option>
            <Option value={PassphraseExpirationEnum.TWO_YEARS}>
              { $t({ defaultMessage: '2 years' }) }
            </Option>
          </Select>
        </Form.Item>
      </Col>
    </Row>
  )
}
