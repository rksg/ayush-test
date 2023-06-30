import { Form, Input, InputNumber, Radio, Select, Space, Switch } from 'antd'
import { defineMessage, useIntl }                                 from 'react-intl'

import { Tooltip }                                                    from '@acx-ui/components'
import { QuestionMarkCircleOutlined }                                 from '@acx-ui/icons'
import { CalledStationIdTypeEnum, NasIdDelimiterEnum, NasIdTypeEnum } from '@acx-ui/rc/utils'

const NasIdTypeOptions = [
  { label: defineMessage({ defaultMessage: 'WLAN BSSID' }), value: NasIdTypeEnum.BSSID },
  { label: defineMessage({ defaultMessage: 'Venue Name' }), value: NasIdTypeEnum.VENUE_NAME },
  { label: defineMessage({ defaultMessage: 'AP MAC' }), value: NasIdTypeEnum.AP_MAC },
  { label: defineMessage({ defaultMessage: 'User-defined' }), value: NasIdTypeEnum.USER }
]

const CalledStationIdTypeOptions = [
  { label: defineMessage({ defaultMessage: 'WLAN BSSID' }), value: CalledStationIdTypeEnum.BSSID },
  { label: defineMessage({ defaultMessage: 'AP MAC' }), value: CalledStationIdTypeEnum.AP_MAC },
  { label: defineMessage({ defaultMessage: 'AP Group' }), value: CalledStationIdTypeEnum.AP_GROUP },
  { label: defineMessage({ defaultMessage: 'None' }), value: CalledStationIdTypeEnum.NONE }
]

const DelimiterRadioGroup = (props: { fieldName: string[], onChanged?: (()=> void) }) => {
  const { $t } = useIntl()

  const options = [
    { label: defineMessage({ defaultMessage: 'Dash' }), value: NasIdDelimiterEnum.DASH },
    { label: defineMessage({ defaultMessage: 'Colon' }), value: NasIdDelimiterEnum.COLON }
  ]

  const handleChanged = () => {
    props.onChanged?.()
  }

  return <Form.Item
    label={$t({ defaultMessage: 'Delimiter' })}
    name={props.fieldName}
    initialValue={options[0].value}
    children={
      <Radio.Group onChange={handleChanged}>
        <Space size='large'>
          {
            options.map(o => {
              const { value, label } = o
              return <Radio key={value} value={value} children={$t(label)} />
            })
          }
        </Space>
      </Radio.Group>
    }
  />
}

const { useWatch } = Form

type RadiusOptionsFormProps = {
  context: string,
  showSingleSessionIdAccounting: boolean,
  isWispr?: boolean,
  onDataChanged?: (()=> void)
}

export const RadiusOptionsForm = (props: RadiusOptionsFormProps) => {
  const { $t } = useIntl()

  const { context, showSingleSessionIdAccounting, isWispr=false } = props

  const fieldDataKey = (context === 'network')
    ? ['wlan','advancedCustomization', 'radiusOptions']
    : []

  const nasIdTypeFieldName = [...fieldDataKey, 'nasIdType']
  const nasIdDelimiterFieldName = [...fieldDataKey, 'nasIdDelimiter']
  const userDefinedNasIdFieldName = [...fieldDataKey, 'userDefinedNasId']
  const nasRequestTimeoutSecFieldName = [...fieldDataKey, 'nasRequestTimeoutSec']
  const nasMaxRetryFieldName = [...fieldDataKey, 'nasMaxRetry']
  const nasReconnectPrimaryMinFieldName = [...fieldDataKey, 'nasReconnectPrimaryMin']
  const calledStationIdTypeFieldName = [...fieldDataKey, 'calledStationIdType']
  const singleSessionIdAccountingFieldName = [...fieldDataKey, 'singleSessionIdAccounting']

  const nasIdType = useWatch(nasIdTypeFieldName)

  const userDefinedNasIdValidator = (value: string) => {
    const re = new RegExp('(?=^((?!(`|\\$\\()).){2,64}$)^(\\S.*\\S)$')
    if (value!=='' && !re.test(value)) {
      return Promise.reject($t({ defaultMessage: 'Invalid NAS ID' }))
    }
    return Promise.resolve()
  }

  const handleChanged = () => {
    props?.onDataChanged?.()
  }

  return (
    <>
      <Form.Item
        name={nasIdTypeFieldName}
        label={
          <>
            {$t({ defaultMessage: 'NAS ID' })}
            <Tooltip
              title={$t({ defaultMessage: 'NAS ID will identify clients to a RADIUS server' })}
              placement='bottom'
            >
              <QuestionMarkCircleOutlined/>
            </Tooltip>
          </>
        }
        style={{ width: '150px' }}
        initialValue={NasIdTypeEnum.BSSID}
      >
        <Select onChange={handleChanged}>{NasIdTypeOptions.map(o => {
          const { value, label } = o
          return <Select.Option key={value} value={value}>{$t(label)}</Select.Option>
        })}
        </Select>
      </Form.Item>

      {(nasIdType === NasIdTypeEnum.BSSID || nasIdType === NasIdTypeEnum.AP_MAC) &&
        <DelimiterRadioGroup fieldName={nasIdDelimiterFieldName} onChanged={handleChanged}/>
      }
      {nasIdType === NasIdTypeEnum.USER && <Form.Item
        name={userDefinedNasIdFieldName}
        label={$t({ defaultMessage: 'Custom NAS ID' })}
        rules={[
          { required: true },
          { min: 2 },
          { max: 64 },
          { validator: (_, value) => userDefinedNasIdValidator(value) }
        ]}
        children={<Input onChange={handleChanged}
          style={{ width: '412px' }}
          placeholder={$t({ defaultMessage: 'Maximun is 64 characters' })}/>}
      />
      }
      <Form.Item required label={$t({ defaultMessage: 'NAS Request Timeout' })}>
        <Space>
          <Form.Item
            name={nasRequestTimeoutSecFieldName}
            initialValue={3}
            rules={[{
              required: true,
              message: $t({
                defaultMessage: 'Please enter a number between 2 and 20'
              })
            }]}
            children={<InputNumber
              min={2}
              max={20}
              style={{ width: '150px' }}
              onChange={handleChanged} />}
          />
          <div style={{ height: '32px' }}>
            {$t({ defaultMessage: 'Seconds' })}
          </div>
        </Space>
      </Form.Item>
      <Form.Item required label={$t({ defaultMessage: 'NAS Max Number of Retries' })}>
        <Space>
          <Form.Item
            name={nasMaxRetryFieldName}
            initialValue={2}
            rules={[{
              required: true,
              message: $t({
                defaultMessage: 'Please enter a number between 2 and 10'
              })
            }]}
            children={<InputNumber
              min={2}
              max={10}
              style={{ width: '150px' }}
              onChange={handleChanged}/>}
          />
          <div style={{ height: '32px' }}>
            {$t({ defaultMessage: 'Retries' })}
          </div>
        </Space>
      </Form.Item>
      <Form.Item required label={$t({ defaultMessage: 'NAS Reconnect Primary' })}>
        <Space>
          <Form.Item
            name={nasReconnectPrimaryMinFieldName}
            rules={[{
              required: true,
              message: $t({
                defaultMessage: 'Please enter a number between 1 and 300'
              })
            }]}
            initialValue={5}
            children={<InputNumber
              min={1}
              max={300}
              style={{ width: '150px' }}
              onChange={handleChanged}/>}
          />
          <div style={{ height: '32px' }}>
            {$t({ defaultMessage: 'Minutes' })}
          </div>
        </Space>
      </Form.Item>
      <Form.Item
        name={calledStationIdTypeFieldName}
        label={$t({ defaultMessage: 'Called Station ID' })}
        style={{ width: '150px' }}
        initialValue={isWispr? CalledStationIdTypeEnum.AP_MAC : CalledStationIdTypeEnum.BSSID}
      >
        <Select onChange={handleChanged}>{CalledStationIdTypeOptions.map(o => {
          const { value, label } = o
          return <Select.Option key={value} value={value}>{$t(label)}</Select.Option>
        })}
        </Select>
      </Form.Item>
      {showSingleSessionIdAccounting &&
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr' }} >
          <Space>
            {$t({ defaultMessage: 'Single Session ID Accounting' })}
            <Tooltip
            // eslint-disable-next-line max-len
              title={$t({ defaultMessage: 'Enabling this feature allows the APs to maintain one accounting session for a client roaming between APs. If the client roams from one AP to another, the accounting session ID and statistics will be carried while roaming from one AP to the other.' })}
              placement='bottom'>
              <QuestionMarkCircleOutlined style={{ height: '14px', marginBottom: -3 }} />
            </Tooltip>
          </Space>
          <Form.Item
            name={singleSessionIdAccountingFieldName}
            valuePropName='checked'
            initialValue={false}
            style={{ marginBottom: 0 }}
            children={<Switch onChange={handleChanged} />}
          />
        </div>
      }
    </>
  )
}
