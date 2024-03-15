import { useState, useEffect, useCallback } from 'react'

import { Form, Input, Typography } from 'antd'
import { defineMessage, useIntl }  from 'react-intl'

import { useUpdateTenantSettingsMutation, useBrand360Config } from '@acx-ui/analytics/services'
import { Settings }                                           from '@acx-ui/analytics/utils'
import { Drawer, Button, Tooltip, Loader }                    from '@acx-ui/components'
import { truthy }                                             from '@acx-ui/utils'

import { Setting as UI } from './styledComponents'

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
const maxSSIDLength = 1000
const brandField = 'brandName'
const lspField = 'lspName'
const propertyField = 'propertyName'
const maxNameLength = 100

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

export function ConfigSettings ({ settings }: { settings: Settings }) {
  const { $t } = useIntl()
  const { names: {
    brand: brandName,
    lsp: lspName,
    property: propertyName
  } } = useBrand360Config()
  const ssidRegex = settings['brand-ssid-compliance-matcher']
  const [visible, setVisible] = useState(false)
  const [form] = Form.useForm()
  const ssidValue = Form.useWatch(ssidField, form)
  const brandValue = Form.useWatch(brandField, form)
  const lspValue = Form.useWatch(lspField, form)
  const propertyValue = Form.useWatch(propertyField, form)
  const failureLines = getFailureLines(ssidValue)
  const isDisabled = (ssidValue === ''
    || ssidValue === ssidRegex
    || ssidValue?.length >= maxSSIDLength
    || failureLines.length > 0
  ) && (brandValue === ''
    || brandValue.length >= maxNameLength
    || brandValue === brandName
  ) && (lspValue === ''
    || lspValue.length >= maxNameLength
    || lspValue === lspName
  ) && (propertyValue === ''
    || propertyValue.length >= maxNameLength
    || propertyValue === propertyName
  )
  const [updateSettings, result] = useUpdateTenantSettingsMutation()
  const saveSettings = useCallback(() => {
    updateSettings({
      ...settings,
      'brand-ssid-compliance-matcher': cleanInput(ssidValue),
      'brand-name': brandValue,
      'lsp-name': lspValue,
      'property-name': propertyValue
    })
  }, [settings, ssidValue, brandValue, lspValue, propertyValue])

  useEffect(() => {
    form &&
    form.setFieldValue(ssidField, ssidRegex)
    form.setFieldValue(brandField, brandName)
    form.setFieldValue(lspField, lspName)
    form.setFieldValue(propertyField, propertyName)
  }, [ssidRegex, form, brandName, lspName, propertyName])

  const closeDrawer = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation()
    setVisible(false)
  }
  return <Button onClick={() => setVisible(true)} >
    <UI.Icon data-testid='settings' />
    <Drawer
      width={500}
      title={$t({ defaultMessage: 'Settings' })}
      visible={visible}
      onClose={closeDrawer}
      destroyOnClose
      footer={<>
        <Button
          type='primary'
          disabled={isDisabled}
          onClick={(e) => {
            e.stopPropagation()
            saveSettings()
          }}>
          {$t({ defaultMessage: 'Save' })}
        </Button>
        <Button type='default' onClick={closeDrawer}>
          {$t({ defaultMessage: 'Cancel' })}
        </Button></>}
    > <Loader states={[result]}>
        <Form
          initialValues={{
            [ssidField]: ssidValue || ssidRegex,
            brandName: brandValue || brandName,
            lspName: lspValue || lspName,
            propertyName: propertyValue || propertyName
          }}
          layout='vertical'
          form={form}>
          <Typography.Text strong>{$t({ defaultMessage: 'Naming Convention' })}</Typography.Text>
          <br/>
          <Typography.Text
            type='secondary'
            style={{ fontSize: 'var(--acx-body-4-font-size)' }}
          >{
              $t({
                /* eslint-disable-next-line max-len */
                defaultMessage: 'Choose standard vocabulary for keywords aligned with the common language of your brand'
              })}
          </Typography.Text>
          <br/><br/>
          <Form.Item
            name={brandField}
            label={$t(
              {
                defaultMessage: 'Brand'
              })
            }
            rules={[{
              required: true,
              message: $t({ defaultMessage: 'Brand name is required!' })
            },
            {
              type: 'string',
              min: 1,
              max: 100,
              message: $t({ defaultMessage: 'Input exceeds 100 characters!' })
            }]}
            children={<Input data-testid={brandField} />}
          />
          <Form.Item
            name={lspField}
            label={$t(
              {
                defaultMessage: 'LSP'
              })
            }
            rules={[{
              required: true,
              message: $t({ defaultMessage: 'LSP name is required!' })
            },
            {
              type: 'string',
              min: 1,
              max: 100,
              message: $t({ defaultMessage: 'Input exceeds 100 characters!' })
            }]}
            children={<Input data-testid={lspField} />}
          />
          <Form.Item
            name={propertyField}
            label={$t(
              {
                defaultMessage: 'Property'
              })
            }
            rules={[{
              required: true,
              message: $t({ defaultMessage: 'Property name is required!' })
            },
            {
              type: 'string',
              min: 1,
              max: 100,
              message: $t({ defaultMessage: 'Input exceeds 100 characters!' })
            }]}
            children={<Input data-testid={propertyField} />}
          />
          <UI.Line />
          <Typography.Text strong>{$t({ defaultMessage: 'Compliance Rules' })}</Typography.Text>
          <br/><br/>
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
              max: maxSSIDLength,
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
  </Button>
}
