import { useMemo } from 'react'

import { Form, FormInstance, Radio, Select, Space } from 'antd'
import { useIntl }                                  from 'react-intl'

import { Button }                                             from '@acx-ui/components'
import { getWanLinkDownCriteriaString, getWanProtocolString } from '@acx-ui/edge/components'
import {
  EdgeLinkDownCriteriaEnum,
  EdgeMultiWanProtocolEnum,
  EdgeWanLinkHealthCheckPolicy,
  networkWifiIpRegExp
} from '@acx-ui/rc/utils'

import { InputInlineEditor }                    from './InputInlineEditor'
import { StyledFormItem, StyledHiddenFormItem } from './styledComponents'

const MIN_HEALTH_CHECK_INTERVAL = 1 // seconds
const MAX_HEALTH_CHECK_INTERVAL = 10 // seconds
const MIN_COUNT_DOWN = 2 // seconds
const MAX_COUNT_DOWN = 10  // seconds
const MIN_COUNT_UP = 2  // seconds
const MAX_COUNT_UP = 10  // seconds
const MAX_TARGET_IP = 3

interface LinkHealthMonitorSettingFormProps {
  form: FormInstance
  onFinish: (values: EdgeWanLinkHealthCheckPolicy) => Promise<void>
  editData?: EdgeWanLinkHealthCheckPolicy
}

export const LinkHealthMonitorSettingForm = (props: LinkHealthMonitorSettingFormProps) => {
  const { $t } = useIntl()
  const { form, onFinish, editData } = props

  const initialValues = useMemo(() => {
    return {
      ...editData,
      protocol: editData?.protocol ?? EdgeMultiWanProtocolEnum.PING,
      linkDownCriteria: editData?.linkDownCriteria ?? EdgeLinkDownCriteriaEnum.ALL_TARGETS_DOWN,
      intervalSeconds: editData?.intervalSeconds ?? 3,
      maxCountToDown: editData?.maxCountToDown ?? 3,
      maxCountToUp: editData?.maxCountToUp ?? 3
    }
  }, [editData])

  const handleOnFinish = async (formValues: EdgeWanLinkHealthCheckPolicy) => {
    try {
      await onFinish({
        ...formValues,
        intervalSeconds: Number(formValues.intervalSeconds),
        maxCountToDown: Number(formValues.maxCountToDown),
        maxCountToUp: Number(formValues.maxCountToUp)
      })
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }

  return <Form
    layout='vertical'
    form={form}
    onFinish={handleOnFinish}
    initialValues={initialValues}
  >
    <Form.Item
      name='protocol'
      label={$t({ defaultMessage: 'Protocol' })}
    >
      <Select
        disabled
        children={
          Object.keys(EdgeMultiWanProtocolEnum).map((key) => {
            return <Select.Option key={key} value={key}>
              {getWanProtocolString(key as EdgeMultiWanProtocolEnum)}
            </Select.Option>
          })}
      />
    </Form.Item>

    <Form.List name='targetIpAddresses'>
      {(fields, { add, remove }) => {
        return <>
          {fields?.map((field, index) =>
            <StyledFormItem
              {...field}
              rules={[
                { required: true },
                { validator: (_, value) => networkWifiIpRegExp(value) }
              ]}
            >
              <InputInlineEditor
                index={index}
                onDelete={remove}
              />
            </StyledFormItem>
          )}
          <Button type='link' onClick={() => add()}>
            {$t({ defaultMessage: 'Add Target' })}
          </Button>
        </>
      }}
    </Form.List>

    <StyledHiddenFormItem
      name='validateTargetIpAddresses'
      dependencies={['targetIpAddresses']}
      rules={[{ validator: async () => {
        const ips = form.getFieldValue(['targetIpAddresses'])
        return ips && ips.length > 0 && ips.length <= MAX_TARGET_IP
          ? Promise.resolve()
        // eslint-disable-next-line max-len
          : Promise.reject(new Error($t({ defaultMessage: 'Target IP must be between 1 and {max} addresses' }, { max: MAX_TARGET_IP })))
      } }]}
      children={
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <></>
      }
      style={{ marginBottom: 10 }}
    />

    <Form.Item
      name='linkDownCriteria'
      label={$t({ defaultMessage: 'Failure Condition' })}
    >
      <Radio.Group style={{ width: '100%' }}>
        {Object.keys(EdgeLinkDownCriteriaEnum).map((key) =>
          key === EdgeLinkDownCriteriaEnum.INVALID ? null : <Radio
            key={key}
            value={key}
          >
            {getWanLinkDownCriteriaString(key as EdgeLinkDownCriteriaEnum)}
          </Radio>)}
      </Radio.Group>
    </Form.Item>

    <Form.Item label={$t({ defaultMessage: 'Check Interval' })}>
      <Space>
        <Form.Item
          name='intervalSeconds'
          noStyle
          rules={[{
            type: 'number',
            transform: Number,
            max: MAX_HEALTH_CHECK_INTERVAL,
            min: MIN_HEALTH_CHECK_INTERVAL
          }]}
        >
          <Select style={{ width: '60px' }}>
            {getNumberOptions(MIN_HEALTH_CHECK_INTERVAL, MAX_HEALTH_CHECK_INTERVAL)}
          </Select>
        </Form.Item>
        <span>{$t({ defaultMessage: 'Seconds' })}</span>
      </Space>
    </Form.Item>

    <Form.Item label={$t({ defaultMessage: 'Mark link as DOWN after ...' })}>
      <Space>
        <Form.Item
          name='maxCountToDown'
          noStyle
          rules={[{
            type: 'number',
            transform: Number,
            max: MAX_COUNT_DOWN,
            min: MIN_COUNT_DOWN
          }]}
        >
          <Select style={{ width: '60px' }}>
            {getNumberOptions(MIN_COUNT_DOWN, MAX_COUNT_DOWN)}
          </Select>
        </Form.Item>
        <span>{$t({ defaultMessage: 'tries' })}</span>
      </Space>
    </Form.Item>

    <Form.Item label={$t({ defaultMessage: 'Mark link as UP after ...' })}>
      <Space>
        <Form.Item
          name='maxCountToUp'
          noStyle
          rules={[{
            type: 'number',
            transform: Number,
            max: MAX_COUNT_UP,
            min: MIN_COUNT_UP
          }]}
        >
          <Select style={{ width: '60px' }}>
            {getNumberOptions(MIN_COUNT_UP, MAX_COUNT_UP)}
          </Select>
        </Form.Item>
        <span>{$t({ defaultMessage: 'tries' })}</span>
      </Space>
    </Form.Item>
  </Form>
}

const getNumberOptions = (min: number, max: number) => {
  return Array.from({ length: max - min + 1 }, (_, i) => min + i)
    .map((val) => <Select.Option key={val} value={val}>
      {val}
    </Select.Option>)
}