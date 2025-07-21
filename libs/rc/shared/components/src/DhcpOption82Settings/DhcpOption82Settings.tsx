import { useState, useEffect, useRef } from 'react'

import { Form,  Switch, Space } from 'antd'
import _                        from 'lodash'
import { useIntl }              from 'react-intl'

import { Tooltip }                                               from '@acx-ui/components'
import { LanPortSoftGreProfileSettings }                         from '@acx-ui/rc/utils'
import type { DhcpOption82Settings as DhcpOption82SettingsType } from '@acx-ui/rc/utils'


import { DhcpOption82SettingsDrawer } from './DhcpOption82SettingsDrawer'
import { FieldLabel, ConfigIcon }     from './styledComponents'

interface DhcpOption82SettingsProps {
  index: number,
  onGUIChanged?: (fieldName: string) => void
  isUnderAPNetworking: boolean
  serialNumber?: string
  venueId?: string
  portId?: string
  apModel?: string
  readonly: boolean
  sourceData?: LanPortSoftGreProfileSettings
}

export const DhcpOption82Settings = (props: DhcpOption82SettingsProps) => {
  const { $t } = useIntl()

  const [ iconVisible, setIconVisible ] = useState<boolean>(false)
  const [ drawerVisible, setDrawerVisible ] = useState<boolean>(false)
  const form = Form.useFormInstance()
  const prevValues = useRef<{
    apModel?: string
    serialNumber?: string
  } | null>(null)
  const originalSettings = useRef<Partial<DhcpOption82SettingsType> | null>(null)
  const isFirstTimeEdit = useRef<boolean>(false)

  const {
    index,
    onGUIChanged,
    readonly,
    sourceData,
    isUnderAPNetworking,
    apModel,
    serialNumber
  } = props
  /* eslint-disable max-len */
  const dhcpOption82FieldName = ['lan', index, 'dhcpOption82', 'dhcpOption82Enabled']
  const dhcpOption82SubOption1EnabledFieldName = ['lan', index, 'dhcpOption82', 'dhcpOption82Settings', 'subOption1Enabled']
  const dhcpOption82SubOption1FormatFieldName = ['lan', index, 'dhcpOption82', 'dhcpOption82Settings', 'subOption1Format']
  const dhcpOption82SubOption2EnabledFieldName = ['lan', index, 'dhcpOption82', 'dhcpOption82Settings', 'subOption2Enabled']
  const dhcpOption82SubOption2FormatFieldName = ['lan', index, 'dhcpOption82', 'dhcpOption82Settings', 'subOption2Format']
  const dhcpOption82SubOption150EnabledFieldName = ['lan', index, 'dhcpOption82', 'dhcpOption82Settings', 'subOption150Enabled']
  const dhcpOption82SubOption151EnabledFieldName = ['lan', index, 'dhcpOption82', 'dhcpOption82Settings', 'subOption151Enabled']
  const dhcpOption82SubOption151FormatFieldName = ['lan', index, 'dhcpOption82', 'dhcpOption82Settings', 'subOption151Format']
  const dhcpOption82SubOption151InputFieldName = ['lan', index, 'dhcpOption82', 'dhcpOption82Settings', 'subOption151Input']
  const dhcpOption82MacFormat = ['lan', index, 'dhcpOption82','dhcpOption82Settings', 'macFormat']
  /* eslint-enable max-len */

  const dhcpOption82EnabledValue = Form.useWatch(dhcpOption82FieldName, form)
  const setDhcpSubOptionsFields = (dhcpSettings: Partial<DhcpOption82SettingsType>) => {
    // Set each field individually to avoid computed property name issues
    form?.setFieldValue(dhcpOption82SubOption1EnabledFieldName, dhcpSettings?.subOption1Enabled)
    form?.setFieldValue(dhcpOption82SubOption1FormatFieldName, dhcpSettings?.subOption1Format)
    form?.setFieldValue(dhcpOption82SubOption2EnabledFieldName, dhcpSettings?.subOption2Enabled)
    form?.setFieldValue(dhcpOption82SubOption2FormatFieldName, dhcpSettings?.subOption2Format)
    form?.setFieldValue(
      dhcpOption82SubOption150EnabledFieldName,
      dhcpSettings?.subOption150Enabled
    )
    form?.setFieldValue(
      dhcpOption82SubOption151EnabledFieldName,
      dhcpSettings?.subOption151Enabled
    )
    form?.setFieldValue(
      dhcpOption82SubOption151FormatFieldName,
      dhcpSettings?.subOption151Format
    )
    form?.setFieldValue(
      dhcpOption82SubOption151InputFieldName,
      dhcpSettings?.subOption151Input
    )
    form?.setFieldValue(dhcpOption82MacFormat, dhcpSettings?.macFormat)
  }

  const setFormDataFromSettings = (settings: LanPortSoftGreProfileSettings) => {
    if (settings?.dhcpOption82Enabled) {
      form.setFieldValue(dhcpOption82FieldName, true)
      const dhcpSettings = settings?.dhcpOption82Settings
      if (dhcpSettings) {
        setDhcpSubOptionsFields(dhcpSettings as Partial<DhcpOption82SettingsType>)
      }
    }
  }

  useEffect(() => {
    setIconVisible(!!dhcpOption82EnabledValue)
  }, [dhcpOption82EnabledValue])

  useEffect(() => {
    if (sourceData && !_.isEmpty(sourceData)) {
      const prev = prevValues.current
      const shouldUpdate =
        !prev ||
        (!isUnderAPNetworking && prev.apModel !== apModel) ||
        (isUnderAPNetworking && prev.serialNumber !== serialNumber)

      if (shouldUpdate) {
        setFormDataFromSettings(sourceData)
        prevValues.current = { apModel, serialNumber }
      }
    }
  }, [sourceData, isUnderAPNetworking, apModel, serialNumber])


  const storeCurrentSettings = () => {
    // Store current form values when drawer opens (only sub-options settings)
    const currentSettings: Partial<DhcpOption82SettingsType> = {
      subOption1Enabled: form.getFieldValue(dhcpOption82SubOption1EnabledFieldName),
      subOption1Format: form.getFieldValue(dhcpOption82SubOption1FormatFieldName),
      subOption2Enabled: form.getFieldValue(dhcpOption82SubOption2EnabledFieldName),
      subOption2Format: form.getFieldValue(dhcpOption82SubOption2FormatFieldName),
      subOption150Enabled: form.getFieldValue(dhcpOption82SubOption150EnabledFieldName),
      subOption151Enabled: form.getFieldValue(dhcpOption82SubOption151EnabledFieldName),
      subOption151Format: form.getFieldValue(dhcpOption82SubOption151FormatFieldName),
      subOption151Input: form.getFieldValue(dhcpOption82SubOption151InputFieldName),
      macFormat: form.getFieldValue(dhcpOption82MacFormat)
    }

    originalSettings.current = currentSettings

    const hasExistingSettings = Object.values(currentSettings).some(value =>
      value !== undefined && value !== null && value !== false
    )
    isFirstTimeEdit.current = !hasExistingSettings
  }

  const applyCallbackFn = () => {
    form.setFieldValue(dhcpOption82FieldName, true)

    originalSettings.current = null
    isFirstTimeEdit.current = false
  }

  const cancelCallbackFn = () => {
    if (isFirstTimeEdit.current) {
      form.setFieldValue(dhcpOption82FieldName, false)
    } else if (originalSettings.current) {
      setDhcpSubOptionsFields(originalSettings.current)
    }

    originalSettings.current = null
    isFirstTimeEdit.current = false
  }

  return (
    <>
      <FieldLabel width='220px'>
        <Space style={{ marginBottom: '10px' }}>
          {$t({ defaultMessage: 'DHCP Option 82' })}
          <Tooltip.Question
            title={
              $t({ defaultMessage: 'When enabled, the AP includes the DHCP ' +
                'request ID in packets forwarded to the DHCP server. ' +
                'The DHCP server then allocates an IP address to the ' +
                'client based on this information.' })
            }
            placement='right'
            iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
          />
        </Space>
        <Form.Item
          style={{ marginTop: '-5px' }}
          children={
            <>
              <Form.Item
                valuePropName='checked'
                name={dhcpOption82FieldName}
                noStyle>
                <Switch
                  data-testid={'dhcpoption82-switch-toggle'}
                  disabled={readonly}
                  onChange={(checked) => {
                    onGUIChanged && onGUIChanged('DHCPOption82Enabled')
                    if (checked) {
                      storeCurrentSettings()
                      setDrawerVisible(true)
                    }
                  }}
                />
              </Form.Item>
              {
                iconVisible && <ConfigIcon
                  style={{ cursor: 'pointer' }}
                  data-testid={'dhcp82toption-icon'}
                  onClick={() => {
                    storeCurrentSettings()
                    setDrawerVisible(true)
                  }}
                />
              }
            </>
          }
        />
      </FieldLabel>
      <DhcpOption82SettingsDrawer
        visible={drawerVisible}
        setVisible={setDrawerVisible}
        applyCallbackFn={applyCallbackFn}
        cancelCallbackFn={cancelCallbackFn}
        index={index}
        onGUIChanged={onGUIChanged}
        readonly={readonly}
      />
    </>
  )
}
