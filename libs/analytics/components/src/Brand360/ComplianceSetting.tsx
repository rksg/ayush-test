import { useState } from 'react'

import { Form }     from 'antd'
import {  useIntl } from 'react-intl'

import { useUpdateTenantSettingsMutation } from '@acx-ui/analytics/services'
import { Settings }                        from '@acx-ui/analytics/utils'
import { Drawer, Button, Tooltip, Loader } from '@acx-ui/components'

import { ComplianceSetting as UI } from './styledComponents'

export const isRegExp = (input: string) => {
  const checker = () => {
    try {
      // eslint-disable-next-line no-new
      new RegExp(input)
      return true
    } catch (e) {
      return false
    }
  }
  return checker()
}

export function ComplianceSetting ({ settings }: { settings: Settings }) {
  const { $t } = useIntl()
  const [visible, setVisible] = useState(false)
  const ssidRegex = settings['brand-ssid-compliance-matcher']
  const [ssidPattern, setSSIDPattern] = useState<string>(ssidRegex)
  const [updateSlas, result] = useUpdateTenantSettingsMutation()
  const saveSSIDRegex = () => {
    const payload = { ...settings, 'brand-ssid-compliance-matcher': ssidPattern }
    updateSlas(payload)
  }
  return <UI.Wrapper>
    <UI.Icon data-testid='ssidSettings' onClick={()=>setVisible(!visible)} />
    <Drawer
      width={500}
      title={$t({ defaultMessage: 'Compliance Rules' })}
      visible={visible}
      onClose={() => setVisible(false)}
      footer={<>
        <Button
          type='primary'
          disabled={!isRegExp(ssidPattern)}
          onClick={() => saveSSIDRegex()}>
          {$t({ defaultMessage: 'Save' })}
        </Button>
        <Button type='default' onClick={() => setVisible(false)}>
          {$t({ defaultMessage: 'Cancel' })}
        </Button></>}
    > <Loader states={[result]}>
        <Form layout='vertical'>
          <Form.Item
            name='ssidPattern'
            label={<>
              {$t({ defaultMessage: 'Choose a pattern to validate Brand SSID compliance' })}
              <Tooltip.Question
                title={$t(
                  { defaultMessage: 'Regular expression should be compatible with java standards' }
                )}
                placement='top'
              />
            </>}
            children={<textarea
              style={{ width: '100%', outline: 'none' }}
              rows={5}
              defaultValue={ssidPattern || ssidRegex}
              value={ssidPattern}
              onChange={({ target: { value } }) => setSSIDPattern(value)}
            />}
          />
        </Form>
      </Loader>
    </Drawer>
  </UI.Wrapper>
}
