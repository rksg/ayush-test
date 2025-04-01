import { useEffect, useState } from 'react'

import { Form, InputNumber, Select, Space } from 'antd'
import { useIntl }                          from 'react-intl'

import { Tooltip }                                              from '@acx-ui/components'
import { QuestionMarkCircleOutlined }                           from '@acx-ui/icons'
import { Ipsec, IpSecFailoverModeEnum, IpSecRetryDurationEnum } from '@acx-ui/rc/utils'

import { messageMapping } from './messageMapping'

interface FailoverSettingsFormProps {
  initIpSecData?: Ipsec,
  loadFailoverSettings: boolean,
  setLoadFailoverSettings: (state: boolean) => void
}

export default function FailoverSettings (props: FailoverSettingsFormProps) {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const { initIpSecData, loadFailoverSettings, setLoadFailoverSettings } = props

  const [retryDuration, setRetryDuration] =
  useState<IpSecRetryDurationEnum>(IpSecRetryDurationEnum.FOREVER)
  const [retryMode, setRetryMode] =
  useState<IpSecFailoverModeEnum>(IpSecFailoverModeEnum.NON_REVERTIVE)

  useEffect(() => {
    setRetryDuration(form.getFieldValue('retryDuration'))
    setRetryMode(form.getFieldValue(['advancedOption', 'failoverMode']))
    if (loadFailoverSettings && initIpSecData?.advancedOption?.failoverRetryPeriod
        && initIpSecData?.advancedOption?.failoverRetryPeriod !== 0) {
      setRetryDuration(IpSecRetryDurationEnum.SPECIFIC)
      form.setFieldValue('retryDuration', IpSecRetryDurationEnum.SPECIFIC)
    }
    if (loadFailoverSettings && initIpSecData?.advancedOption?.failoverMode
        && initIpSecData?.advancedOption?.failoverMode === IpSecFailoverModeEnum.REVERTIVE) {
      setRetryMode(initIpSecData.advancedOption.failoverMode)
      form.setFieldValue(['advancedOption', 'failoverMode'], IpSecFailoverModeEnum.REVERTIVE)
    }

    setLoadFailoverSettings(false)
  }, [initIpSecData])

  const onRetryDurationChange = (value: IpSecRetryDurationEnum) => {
    setRetryDuration(value)
  }

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
              onChange={onRetryDurationChange}
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
              initialValue={3}
              children={
                <InputNumber min={3} max={65536}/>
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
          <div style={{ height: '36px' }}> {$t({ defaultMessage: 'minute(s)' })} </div>
        </Space>} />
      <Form.Item
        name={['advancedOption','failoverMode']}
        label={$t({ defaultMessage: 'Retry Mode' })}
        tooltip={$t(messageMapping.failover_retry_mode_tooltip)}
        initialValue={retryMode}
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
            <Space >
              <Form.Item
                name={['advancedOption','failoverPrimaryCheckInterval']}
                initialValue={1}
                children={<InputNumber min={1} max={60} />} />
              <div style={{ height: '36px' }}> {$t({ defaultMessage: 'minute(s)' })} </div>
            </Space>} />
      }
    </>
  )
}