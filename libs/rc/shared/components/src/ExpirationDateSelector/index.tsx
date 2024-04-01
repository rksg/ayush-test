import {
  Select,
  InputNumber,
  Radio,
  Form,
  DatePickerProps,
  RadioChangeEvent
} from 'antd'
import { RangePickerProps } from 'antd/lib/date-picker'
import moment               from 'moment-timezone'
import { StoreValue }       from 'rc-field-form/lib/interface'
import { useIntl }          from 'react-intl'

import { DatePicker }                                             from '@acx-ui/components'
import { ExpirationMode, ExpirationType, EXPIRATION_DATE_FORMAT } from '@acx-ui/rc/utils'

import {
  ExpirationModeLabel
} from './contentsMap'
import * as UI from './styledComponents'

export * from './contentsMap'

export interface ExpirationDateSelectorProps {
  inputName?: string,
  label: string,
  isRequired?: boolean,
  initialValue?: ExpirationMode,
  modeLabel?: {
    [ExpirationMode.NEVER]?: string
    [ExpirationMode.BY_DATE]?: string
    [ExpirationMode.AFTER_TIME]?: string
  },
  modeAvailability?: {
    [ExpirationMode.NEVER]?: boolean
    [ExpirationMode.BY_DATE]?: boolean
    [ExpirationMode.AFTER_TIME]?: boolean
  }
}

export const ExpirationTypeLimitation = {
  [ExpirationType.HOURS_AFTER_TIME]: 720, // 30 days
  [ExpirationType.DAYS_AFTER_TIME]: 365, // 1 year
  [ExpirationType.WEEKS_AFTER_TIME]: 102, // 2 years
  [ExpirationType.MONTHS_AFTER_TIME]: 60, // 5 years
  [ExpirationType.YEARS_AFTER_TIME]: 5
} as Record<ExpirationType, number>

function ExpirationDatePickerWrapper (props: DatePickerProps) {
  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    // Can not select days before today
    return current && current < moment().endOf('day')
  }

  return (
    <DatePicker
      disabledDate={disabledDate}
      {...props}
      value={props.value ? moment(props.value) : null}
    />
  )
}

export function ExpirationDateSelector (props: ExpirationDateSelectorProps) {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const { Option } = Select
  const {
    label,
    isRequired = true,
    inputName = 'expirationDate',
    initialValue = ExpirationMode.NEVER
  } = props
  const modeLabel = {
    ...{
      [ExpirationMode.NEVER]: $t(ExpirationModeLabel[ExpirationMode.NEVER]),
      [ExpirationMode.BY_DATE]: $t(ExpirationModeLabel[ExpirationMode.BY_DATE]),
      [ExpirationMode.AFTER_TIME]: $t(ExpirationModeLabel[ExpirationMode.AFTER_TIME])
    },
    ...props.modeLabel
  }
  const modeAvailability = {
    ...{
      [ExpirationMode.NEVER]: true,
      [ExpirationMode.BY_DATE]: true,
      [ExpirationMode.AFTER_TIME]: true
    },
    ...props.modeAvailability
  }

  const expirationMode = Form.useWatch<ExpirationMode>([inputName, 'mode'])

  const normalizeDate = (value: StoreValue) => {
    return value && value.startOf('day').toISOString()
  }

  const onModeChange = (e: RadioChangeEvent) => {
    const expirationType = form.getFieldValue([inputName, 'type'])
    // eslint-disable-next-line max-len
    if (e.target.value === ExpirationMode.AFTER_TIME && expirationType === ExpirationType.SPECIFIED_DATE) {
      form.setFieldValue([inputName, 'type'], '')
    }
  }

  const offsetValidator = (value: number) => {
    const type = form.getFieldValue([inputName, 'type'])
    const min = 1
    const max = ExpirationTypeLimitation[type as ExpirationType]

    if (!max) {
      return Promise.reject($t({
        defaultMessage: 'This expiration type does not support validation for maximum values.'
      }))
    }

    if (value < min || value > max) {
      return Promise.reject($t({
        defaultMessage: 'Offset must be between {min} and {max}' }, { min, max }))
    }
    return Promise.resolve()
  }

  return (
    <Form.Item
      name={[inputName, 'mode']}
      label={label}
      rules={[{ required: isRequired }]}
      initialValue={initialValue}
      style={{ height: 'auto' }}
    >
      <Radio.Group onChange={onModeChange}>
        { modeAvailability[ExpirationMode.NEVER] &&
          <UI.FieldSpace columns={'auto'}>
            <Radio key={ExpirationMode.NEVER} value={ExpirationMode.NEVER}>
              { modeLabel[ExpirationMode.NEVER] }
            </Radio>
          </UI.FieldSpace>
        }
        { modeAvailability[ExpirationMode.BY_DATE] &&
          <UI.FieldSpace columns={'140px 1fr'}>
            <Radio key={ExpirationMode.BY_DATE} value={ExpirationMode.BY_DATE}>
              { modeLabel[ExpirationMode.BY_DATE] }
            </Radio>
            { expirationMode === ExpirationMode.BY_DATE &&
              <Form.Item
                name={[inputName, 'date']}
                rules={[
                  {
                    required: expirationMode === ExpirationMode.BY_DATE,
                    message: $t({ defaultMessage: 'Please enter Expiration Date' })
                  }
                ]}
                normalize={normalizeDate}
              >
                <ExpirationDatePickerWrapper format={EXPIRATION_DATE_FORMAT} />
              </Form.Item>
            }
          </UI.FieldSpace>
        }
        { modeAvailability[ExpirationMode.AFTER_TIME] &&
          <UI.FieldSpace columns={'140px auto 120px'}>
            <Radio key={ExpirationMode.AFTER_TIME} value={ExpirationMode.AFTER_TIME}>
              { modeLabel[ExpirationMode.AFTER_TIME] }
            </Radio>
            { expirationMode === ExpirationMode.AFTER_TIME &&
              <>
                <Form.Item
                  name={[inputName, 'offset']}
                  initialValue={1}
                  rules={[
                    {
                      required: expirationMode === ExpirationMode.AFTER_TIME,
                      message: $t({ defaultMessage: 'Please enter Offset' })
                    },
                    { validator: (_, value) => offsetValidator(value) }
                  ]}
                >
                  <InputNumber />
                </Form.Item>
                <Form.Item
                  name={[inputName, 'type']}
                  initialValue={ExpirationType.HOURS_AFTER_TIME}
                  rules={[
                    {
                      required: expirationMode === ExpirationMode.AFTER_TIME,
                      message: $t({ defaultMessage: 'Please enter Type' })
                    }
                  ]}
                >
                  <Select
                    onChange={() => form.validateFields()}
                    style={{ width: 120 }}>
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
          </UI.FieldSpace>
        }
      </Radio.Group>
    </Form.Item>
  )
}
