import { useState, useEffect, useCallback } from 'react'

import { Form, Input }            from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import { useUpdateTenantSettingsMutation } from '@acx-ui/analytics/services'
import { Settings }                        from '@acx-ui/analytics/utils'
import { Drawer, Button, Tooltip, Loader } from '@acx-ui/components'
import { truthy }                          from '@acx-ui/utils'

import { ComplianceSetting as UI } from './styledComponents'

const isRegex = (input: string) => {
  try {
    if (input === '') return false
    // eslint-disable-next-line no-new
    new RegExp(input)
    return true
  } catch (e) {
    return false
  }
}

const getRegexesArray = (input: string | undefined) => {
  if (!input) return []
  const ret = input
    .split('\n')
    .map(reg => reg.trim())
  return ret
}

const getFailureLines = (input: string | undefined) => {
  const ret = getRegexesArray(input)
    .map((regex, ind) => !isRegex(regex) ? (ind + 1).toString() : null)
    .filter(truthy)
  return ret
}

const cleanInput = (input: string) => {
  return getRegexesArray(input).join('\n')
}

const ssidField = 'ssidPattern'
const maxLength = 1000

const tooltipMsg = defineMessage({
  defaultMessage: `
    Regular expression should be compatible with Java standards.
    You can add one rule per line, i.e :
    {br}
    ^[a-zA-Z0-9]'{5}'_GUEST$
    {br}
    ^[a-zA-Z0-9]'{5}'_STAFF$
  `
})

export function ComplianceSetting ({ settings }: { settings: Settings }) {
  const { $t } = useIntl()
  const ssidRegex = settings['brand-ssid-compliance-matcher']
  const [visible, setVisible] = useState(false)
  const [form] = Form.useForm()
  const ssidValue = Form.useWatch(ssidField, form)
  const failureLines = getFailureLines(ssidValue)
  const isDisabled = ssidValue === ''
    || ssidValue === ssidRegex
    || ssidValue?.length >= maxLength
    || failureLines.length > 0
  const [updateSlas, result] = useUpdateTenantSettingsMutation()
  const saveSSIDRegex = useCallback(() => {
    updateSlas({
      ...settings,
      'brand-ssid-compliance-matcher': cleanInput(ssidValue)
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
                title={$t(tooltipMsg, { br: <br/> })}
                placement='top' />
            </>}
            rules={[{
              required: true,
              message: $t({ defaultMessage: 'SSID Regular Expression is required!' })
            },
            {
              type: 'string',
              min: 1,
              max: maxLength,
              message: $t({ defaultMessage: 'Input exceeds 1000 characters!' })
            },
            {
              validator: () => !failureLines.length ? Promise.resolve() : Promise.reject(),
              message: $t(
                { defaultMessage: `{linesCount, plural, one {Line} other {Lines}}:
                {msg} {linesCount, plural, one {is} other { are }} not
                {linesCount, plural, one {a} other {}} valid Java Regular Expression!` },
                { msg: failureLines.join(','), linesCount: failureLines.length })
            }]}
            children={<Input.TextArea data-testid='ssidRegex' />}
          />
        </Form>
      </Loader>
    </Drawer>
  </UI.Wrapper>
}
