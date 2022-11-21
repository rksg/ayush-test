import { useEffect, useRef } from 'react'

import {
  Select,
  InputNumber,
  Radio,
  Space,
  DatePicker,
  Form
} from 'antd'
import { useIntl } from 'react-intl'

import { ExpirationDateEntity, ExpirationMode, ExpirationType } from '@acx-ui/rc/utils'

import {
  ExpirationModeLabel
} from './models'
import * as UI from './styledComponents'

export * from './models'

export interface ExpirationDateSelectorProps {
  data?: ExpirationDateEntity,
  inputName?: string,
  label: string,
  isRequired?: boolean
}

export function ExpirationDateSelector (prop: ExpirationDateSelectorProps) {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const { Option } = Select
  const defaultDataRef = useRef<ExpirationDateEntity>(new ExpirationDateEntity())
  const {
    data = defaultDataRef.current,
    label,
    isRequired = true,
    inputName = 'expirationDate'
  } = prop

  const expirationMode = Form.useWatch<ExpirationMode>([inputName, 'mode'])

  useEffect(() => {
    form.setFieldValue(inputName, data)
  }, [data, form, inputName])

  return (
    <Form.Item
      name={[inputName, 'mode']}
      label={label}
      rules={[{ required: isRequired }]}
      initialValue={expirationMode}
    >
      <Radio.Group>
        <Space direction='vertical' size='middle'>
          <Radio key={ExpirationMode.NEVER} value={ExpirationMode.NEVER}>
            { $t(ExpirationModeLabel[ExpirationMode.NEVER]) }
          </Radio>
          <Radio key={ExpirationMode.BY_DATE} value={ExpirationMode.BY_DATE}>
            <UI.FieldLabel columns={'120px 1fr'}>
              { $t(ExpirationModeLabel[ExpirationMode.BY_DATE]) }
              { expirationMode === ExpirationMode.BY_DATE &&
                <Form.Item name={[inputName, 'date']}>
                  <DatePicker />
                </Form.Item>
              }
            </UI.FieldLabel>
          </Radio>
          <Radio key={ExpirationMode.AFTER_TIME} value={ExpirationMode.AFTER_TIME}>
            <UI.FieldLabel columns={'120px auto 120px'}>
              { $t(ExpirationModeLabel[ExpirationMode.AFTER_TIME]) }
              { expirationMode === ExpirationMode.AFTER_TIME &&
                <>
                  <Form.Item name={[inputName, 'offset']}>
                    <InputNumber min={1} max={64} />
                  </Form.Item>
                  <Form.Item name={[inputName, 'type']}>
                    <Select style={{ width: 120 }}>
                      <Option key={ExpirationType.HOURS_AFTER_TIME}>
                        {$t({ defaultMessage: 'Hours' })}
                      </Option>
                      <Option key={ExpirationType.DAYS_AFTER_TIME}>
                        {$t({ defaultMessage: 'Days' })}
                      </Option>
                      <Option key={ExpirationType.WEEKS_AFTER_TIME}>
                        {$t({ defaultMessage: 'Weeks' })}
                      </Option>
                      <Option key={ExpirationType.MONTHS_AFTER_TIME}>
                        {$t({ defaultMessage: 'Months' })}
                      </Option>
                      <Option key={ExpirationType.YEARS_AFTER_TIME}>
                        {$t({ defaultMessage: 'Years' })}
                      </Option>
                    </Select>
                  </Form.Item>
                </>
              }
            </UI.FieldLabel>
          </Radio>
        </Space>
      </Radio.Group>
    </Form.Item>
  )
}
