import React from 'react'

import { Checkbox, Form, Slider } from 'antd'
import { CheckboxChangeEvent }    from 'antd/lib/checkbox'
import { useIntl }                from 'react-intl'
import styled                     from 'styled-components/macro'

const { useWatch } = Form

export const Label = styled.span`
  font-size: var(--acx-body-4-font-size);
  line-height: 34px;
`

export interface ClientRateLimitProps {
  inputName?: string[]
}

const Unlimited = () => {
  const { $t } = useIntl()
  return (
    <Label
      style={{ lineHeight: '50px' }}>
      {$t({ defaultMessage: 'Unlimited' })}
    </Label>
  )
}

const ClientRateLimit = (props: ClientRateLimitProps) => {
  const { $t } = useIntl()
  const { inputName = [] } = props
  const form = Form.useFormInstance()
  const DEFAULT_VALUE = 20

  const [
    enableDownloadLimit,
    enableUploadLimit
  ] = [
    useWatch<boolean>([...inputName, 'enableDownloadLimit']),
    useWatch<boolean>([...inputName, 'enableUploadLimit'])
  ]

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '175px 1fr' }}>
        <Form.Item
          name={[...inputName, 'enableUploadLimit']}
          valuePropName='checked'
          initialValue={false}
          style={{ lineHeight: '50px' }}
          children={
            <Checkbox data-testid='enableUploadLimit'
              onChange={async (e: CheckboxChangeEvent) => {
                const value = e.target.checked ? DEFAULT_VALUE : 0
                form.setFieldValue(
                  [...inputName, 'uplinkLimit'], value)
                try {
                  await form.validateFields(['clientRateLimitWarningMessage'])
                } catch (error) {
                  return
                }
              }}
              children={$t({ defaultMessage: 'Upload Limit' })} />}
        />
        { enableUploadLimit
          ? <Form.Item
            name={[...inputName, 'uplinkLimit']}
            initialValue={DEFAULT_VALUE}
            children={
              <Slider
                tooltipVisible={false}
                style={{ width: '245px' }}
                step={1}
                min={1}
                max={200}
                marks={{
                  1: { label: '1 Mbps' },
                  200: { label: '200 Mbps' }
                }}
              />
            }
          />
          : <Unlimited /> }
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '175px 1fr' }}>
        <Form.Item
          name={[...inputName, 'enableDownloadLimit']}
          valuePropName='checked'
          initialValue={false}
          style={{ lineHeight: '50px' }}
          children={
            <Checkbox data-testid='enableDownloadLimit'
              onChange={async (e: CheckboxChangeEvent) => {
                const value = e.target.checked ? DEFAULT_VALUE : 0
                form.setFieldValue(
                  [...inputName, 'downlinkLimit'], value)
                try {
                  await form.validateFields(['clientRateLimitWarningMessage'])
                } catch (error) {
                  return
                }
              }}
              children={$t({ defaultMessage: 'Download Limit' })} />}
        />
        { enableDownloadLimit
          ? <Form.Item
            name={[...inputName, 'downlinkLimit']}
            initialValue={DEFAULT_VALUE}
            children={
              <Slider
                tooltipVisible={false}
                style={{ width: '245px' }}
                step={1}
                min={1}
                max={200}
                marks={{
                  1: { label: '1 Mbps' },
                  200: { label: '200 Mbps' }
                }}
              />
            }
          />
          : <Unlimited /> }
      </div>
      <Form.Item
        name={'clientRateLimitWarningMessage'}
        rules={[
          { validator: () => {
            if (form.getFieldValue([...inputName, 'enableUploadLimit'])
                || form.getFieldValue([...inputName, 'enableDownloadLimit'])) {
              return Promise.resolve()
            }

            return Promise.reject($t({
              defaultMessage: 'One of the client rate limit setting should be chosen'
            }))
          } }
        ]}
        children={<></>}
      />
    </div>
  )
}

export default ClientRateLimit
