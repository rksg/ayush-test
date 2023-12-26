import { useState, useEffect, useCallback } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { useUpdateTenantSettingsMutation } from '@acx-ui/analytics/services'
import { Settings }                        from '@acx-ui/analytics/utils'
import { Drawer, Button, Tooltip, Loader } from '@acx-ui/components'

import { ComplianceSetting as UI } from './styledComponents'

export const isRegExp = (input: string) => {
  try {
    // eslint-disable-next-line no-new
    new RegExp(input)
    return true
  } catch (e) {
    return false
  }
}

const ssidField = 'ssidPattern'

export function ComplianceSetting ({ settings }: { settings: Settings }) {
  const { $t } = useIntl()
  const ssidRegex = settings['brand-ssid-compliance-matcher']
  const [visible, setVisible] = useState(false)
  const [form] = Form.useForm()
  const ssidValue = Form.useWatch(ssidField, form)
  const isDisabled = ssidValue === ''
    || ssidValue === ssidRegex
    || !isRegExp(ssidValue)
  const [updateSlas, result] = useUpdateTenantSettingsMutation()
  const saveSSIDRegex = useCallback(() => {
    updateSlas({
      ...settings,
      'brand-ssid-compliance-matcher': ssidValue
    })
  }, [settings, ssidValue])

  useEffect(() => {
    form && form.setFieldValue(ssidField, ssidRegex)
  }, [ssidRegex, form])

  return <UI.Wrapper>
    <UI.Icon data-testid='ssidSettings' onClick={() => setVisible(!visible)} />
    <Drawer
      width={500}
      title={$t({ defaultMessage: 'Compliance Rules' })}
      visible={visible}
      onClose={() => setVisible(false)}
      destroyOnClose
      footer={<>
        <Button
          type='primary'
          disabled={isDisabled}
          onClick={() => saveSSIDRegex()}>
          {$t({ defaultMessage: 'Save' })}
        </Button>
        <Button type='default' onClick={() => setVisible(false)}>
          {$t({ defaultMessage: 'Cancel' })}
        </Button></>}
    > <Loader states={[result]}>
        <Form
          initialValues={{ [ssidField]: ssidValue || ssidRegex }}
          layout='vertical'
          form={form}>
          <Form.Item
            name={ssidField}
            label={<>
              {$t({ defaultMessage: 'Choose a pattern to validate Brand SSID compliance' })}
              <Tooltip.Question
                title={$t(
                  { defaultMessage:
                      'Regular expression should be compatible with Java standards' })}
                placement='top' />
            </>}
            rules={[{
              required: true,
              message: $t({ defaultMessage: 'SSID Regular Expression is required!' })
            },
            {
              validator (_, value) {
                const check = isRegExp(value)
                return check ? Promise.resolve() : Promise.reject()
              },
              message: $t({ defaultMessage: 'Input is not a valid Java Regular Expression!' })
            }]}
            children={<Input.TextArea data-testid='ssidRegex' />}
          />
        </Form>
      </Loader>
    </Drawer>
  </UI.Wrapper>
}
