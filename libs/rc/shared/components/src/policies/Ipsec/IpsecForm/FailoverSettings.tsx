import { useEffect, useState } from 'react'

import { Form, InputNumber, Select, Space } from 'antd'
import { useIntl }                          from 'react-intl'

import { Tooltip }                                              from '@acx-ui/components'
import { QuestionMarkCircleOutlined }                           from '@acx-ui/icons'
import { Ipsec, IpSecFailoverModeEnum, IpSecRetryDurationEnum } from '@acx-ui/rc/utils'

import { messageMapping } from './messageMapping'

interface FailoverSettingsFormProps {
  initIpSecData?: Ipsec
}

export default function FailoverSettings (props: FailoverSettingsFormProps) {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const { initIpSecData } = props

  const [retryDuration, setRetryDuration] =
  useState<IpSecRetryDurationEnum>(IpSecRetryDurationEnum.FOREVER)
  const [retryMode, setRetryMode] =
  useState<IpSecFailoverModeEnum>(IpSecFailoverModeEnum.NON_REVERTIVE)

  useEffect(() => {
    if (initIpSecData?.advancedOption?.failoverRetryPeriod !== 0) {
      setRetryDuration(IpSecRetryDurationEnum.SPECIFIC)
      form.setFieldValue('retryDuration', IpSecRetryDurationEnum.SPECIFIC)
    }
    if (initIpSecData?.advancedOption?.failoverMode === IpSecFailoverModeEnum.REVERTIVE) {
      setRetryMode(initIpSecData.advancedOption.failoverMode)
    }
  }, [form, initIpSecData])

  const retryDurationOptions = [
    { label: $t({ defaultMessage: 'Forever' }), value: IpSecRetryDurationEnum.FOREVER },
    { label: $t({ defaultMessage: 'Specific Period' }), value: IpSecRetryDurationEnum.SPECIFIC }
  ]

  const failoverModeOptions = [
    { label: $t({ defaultMessage: 'Non-revertive' }), value: IpSecFailoverModeEnum.NON_REVERTIVE },
    { label: $t({ defaultMessage: 'Revertive' }), value: IpSecFailoverModeEnum.REVERTIVE }
  ]

  return (
    <>
      <Space>
        <Form.Item
          label={$t({ defaultMessage: 'Retry Duration' })}
          name={'retryDuration'}
          initialValue={retryDuration}
          children={
            <Select style={{ width: '150px' }}
              onChange={setRetryDuration}
              children={retryDurationOptions.map((option) =>
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>)} />
          } />
        { retryDuration === IpSecRetryDurationEnum.SPECIFIC && <>&nbsp;&nbsp;
          <Space>
            <Form.Item
              label={' '}
              name={['advancedOption','failoverRetryPeriod']}
              initialValue={0}
              children={
                <InputNumber min={0} max={365} />
              } />
            <span> {$t({ defaultMessage: 'days' })} </span>
          </Space>
        </>
        }
      </Space>
      <Form.Item
        label={
          <>
            {$t({ defaultMessage: 'Retry Interval' })}
            <Tooltip title={$t(messageMapping.failover_retry_interval_tooltip)} placement='bottom'>
              <QuestionMarkCircleOutlined />
            </Tooltip>
          </>
        }
        rules={[{ required: true }]}
        children={<Space>
          <Form.Item
            name={['advancedOption','failoverRetryInterval']}
            initialValue={1}
            children={<InputNumber min={1} max={30} />} />
          <span> {$t({ defaultMessage: 'minute(s)' })} </span>
        </Space>} />
      <Form.Item
        name={['advancedOption','failoverMode']}
        label={$t({ defaultMessage: 'Retry Mode' })}
        tooltip={$t(messageMapping.failover_retry_mode_tooltip)}
        initialValue={IpSecFailoverModeEnum.NON_REVERTIVE}
        children={
          <Select
            style={{ width: '150px' }}
            onChange={setRetryMode}
            children={failoverModeOptions.map((option) =>
              <Select.Option key={option.value} value={option.value}>
                {option.label}</Select.Option>)} />
        }
      />
      {retryMode === IpSecFailoverModeEnum.REVERTIVE &&
        <Form.Item
          label={$t({ defaultMessage: 'Check Interval' })}
          rules={[{ required: true }]}
          children={
            <Space>
              <Form.Item
                name={['advancedOption','failoverPrimaryCheckInterval']}
                initialValue={1}
                children={<InputNumber min={1} max={30} />} />
              <span> {$t({ defaultMessage: 'minute(s)' })} </span>
            </Space>} />
      }
    </>
  )
}