import { useState, useEffect } from 'react'


import { Form,  Switch, Space } from 'antd'
import _                        from 'lodash'
import { useIntl }              from 'react-intl'

import { Tooltip }                                 from '@acx-ui/components'
import {
  useLazyGetSoftGreProfileConfigurationOnAPQuery
} from '@acx-ui/rc/services'
import { LanPortSoftGreProfileSettings } from '@acx-ui/rc/utils'

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
  sourceData?: LanPortSoftGreProfileSettings // Add prop for source data (Venue level)
}

export const DhcpOption82Settings = (props: DhcpOption82SettingsProps) => {
  const { $t } = useIntl()

  const [ iconVisible, setIconVisible ] = useState<boolean>(false)
  const [ drawerVisible, setDrawerVisible ] = useState<boolean>(false)
  const form = Form.useFormInstance()

  const {
    index,
    onGUIChanged,
    isUnderAPNetworking,
    serialNumber,
    venueId,
    portId,
    readonly,
    sourceData
  } = props
  /* eslint-disable max-len */
  const [ getAPSoftGreProfileConfiguration ] = useLazyGetSoftGreProfileConfigurationOnAPQuery()
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

  // Function to set form data from settings
  const setFormDataFromSettings = (settings: LanPortSoftGreProfileSettings) => {
    if (settings?.dhcpOption82Enabled) {
      form.setFieldValue(dhcpOption82FieldName, true)
      const dhcpSettings = settings?.dhcpOption82Settings

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

      setIconVisible(true)
    }
  }

  // Listen for source data changes from upper layer (Venue level)
  useEffect(() => {
    if (!isUnderAPNetworking && sourceData && !_.isEmpty(sourceData)) {
      setFormDataFromSettings(sourceData)
    }
  }, [sourceData, isUnderAPNetworking])

  // Handle API data fetching (AP level)
  useEffect(() => {
    if (isUnderAPNetworking) {
      const setData = async () => {
        let lanPortSoftGreProfileSettings = {} as LanPortSoftGreProfileSettings | undefined
        const { data } = await getAPSoftGreProfileConfiguration({
          params: { serialNumber, venueId, portId }
        })
        lanPortSoftGreProfileSettings = data?.softGreSettings

        if(lanPortSoftGreProfileSettings && !_.isEmpty(lanPortSoftGreProfileSettings) &&
          lanPortSoftGreProfileSettings?.dhcpOption82Enabled) {
          setFormDataFromSettings(lanPortSoftGreProfileSettings)
        }
      }
      setData()
    }
  }, [isUnderAPNetworking, serialNumber, venueId, portId])

  const applyCallbackFn = () => {
    form.setFieldValue(dhcpOption82FieldName, true)
    setIconVisible(true)
  }

  const cancelCallbackFn = () => {
    if(!iconVisible) {
      form.setFieldValue(dhcpOption82FieldName, false)
    }
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
                      setDrawerVisible(true)
                    } else {
                      setIconVisible(false)
                      form.setFieldValue(dhcpOption82FieldName, false)
                    }
                  }}
                />
              </Form.Item>
              {
                iconVisible && <ConfigIcon
                  style={{ cursor: 'pointer' }}
                  data-testid={'dhcp82toption-icon'}
                  onClick={() => {
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
