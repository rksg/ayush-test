import {
  Select,
  InputNumber,
  Radio,
  Form,
  DatePickerProps
} from 'antd'
import { RangePickerProps } from 'antd/lib/date-picker'
import moment               from 'moment-timezone'
import { StoreValue }       from 'rc-field-form/lib/interface'
import { useIntl }          from 'react-intl'

import { DatePicker }                     from '@acx-ui/components'
import { ExpirationMode, ExpirationType } from '@acx-ui/rc/utils'

import {
  ExpirationModeLabel
} from './models'
import * as UI from './styledComponents'

export * from './models'

export interface ExpirationDateSelectorProps {
  inputName?: string,
  label: string,
  isRequired?: boolean,
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

const DATE_FORMAT = 'YYYY-MM-DD'

type ExpirationDatePickerWrapperProps = Omit<DatePickerProps, 'value'> & { value?: string }

function ExpirationDatePickerWrapper (props: ExpirationDatePickerWrapperProps) {
  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    // Can not select days before today
    return current && current < moment().endOf('day')
  }

  return (
    <DatePicker
      disabledDate={disabledDate}
      {...props}
      value={props.value ? moment(props.value, DATE_FORMAT) : null}
    />
  )
}

export function ExpirationDateSelector (props: ExpirationDateSelectorProps) {
  const { $t } = useIntl()
  const { Option } = Select
  const {
    label,
    isRequired = true,
    inputName = 'expirationDate'
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
    return value && value.format(DATE_FORMAT)
  }

  return (
    <Form.Item
      name={[inputName, 'mode']}
      label={label}
      rules={[{ required: isRequired }]}
      initialValue={expirationMode}
    >
      <Radio.Group>
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
                <ExpirationDatePickerWrapper format={DATE_FORMAT} />
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
                  rules={[
                    {
                      required: expirationMode === ExpirationMode.AFTER_TIME,
                      message: $t({ defaultMessage: 'Please enter Time Offset' })
                    }
                  ]}
                >
                  <InputNumber min={1} max={64} />
                </Form.Item>
                <Form.Item
                  name={[inputName, 'type']}
                  rules={[
                    {
                      required: expirationMode === ExpirationMode.AFTER_TIME,
                      message: $t({ defaultMessage: 'Please enter Time Type' })
                    }
                  ]}
                >
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
          </UI.FieldSpace>
        }
      </Radio.Group>
    </Form.Item>
  )
}
