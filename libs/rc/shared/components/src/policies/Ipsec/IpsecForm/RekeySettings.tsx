import { useEffect, useState } from 'react'

import { Form, InputNumber, Space }      from 'antd'
import Checkbox, { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { get }                           from 'lodash'
import { useIntl }                       from 'react-intl'

import { GridCol, GridRow, Tooltip, Select } from '@acx-ui/components'
import { defaultIpsecFormData, Ipsec }       from '@acx-ui/rc/utils'

import { messageMapping }          from './messageMapping'
import { getRekeyTimeUnitOptions } from './utils'


interface ReKeySettingsFormProps {
  editData?: Ipsec,
}

export default function RekeySettings (props: ReKeySettingsFormProps) {
  const { $t } = useIntl()
  const { editData } = props

  const form = Form.useFormInstance()
  const [loadReKeySettings, setLoadReKeySettings] = useState(true)
  const [ikeRekeyTimeEnabled, setIkeRekeyTimeEnabled] = useState(false)
  const [espRekeyTimeEnabled, setEspRekeyTimeEnabled] = useState(false)
  const rekeyTimeUnitOptions = getRekeyTimeUnitOptions()

  useEffect(() => {
    const ikeRekeyTimeEnabledChk = form.getFieldValue('ikeRekeyTimeEnabledCheckbox')
    setIkeRekeyTimeEnabled(ikeRekeyTimeEnabledChk)
    const espRekeyTimeEnabledChk = form.getFieldValue('espRekeyTimeEnabledCheckbox')
    setEspRekeyTimeEnabled(espRekeyTimeEnabledChk)

    if (loadReKeySettings && editData) {
      if (editData?.ikeRekeyTime || editData?.ikeRekeyTime !== 0) {
        setIkeRekeyTimeEnabled(true)
        form.setFieldValue('ikeRekeyTimeEnabledCheckbox', true)
      } else {
        setIkeRekeyTimeEnabled(false)
        form.setFieldValue('ikeRekeyTimeEnabledCheckbox', false)
      }
      if (editData?.espRekeyTime || editData?.espRekeyTime !== 0) {
        setEspRekeyTimeEnabled(true)
        form.setFieldValue('espRekeyTimeEnabledCheckbox', true)
      } else {
        setEspRekeyTimeEnabled(false)
        form.setFieldValue('espRekeyTimeEnabledCheckbox', false)
      }
    }
    setLoadReKeySettings(false)
  }, [editData])

  const handleIkeRekeyTimeChange = async (e: CheckboxChangeEvent) => {
    const isChecked = e.target.checked
    setIkeRekeyTimeEnabled(e.target.checked)
    form.setFieldValue('ikeRekeyTimeEnabledCheckbox', e.target.checked)
    if (isChecked) {
      let originalValue = form.getFieldValue(['ikeRekeyTime'])
      if (originalValue === 0) {
        // Set default value when checkbox is checked
        form.setFieldValue(['ikeRekeyTime'], get(defaultIpsecFormData, 'ikeRekeyTime'))
        form.setFieldValue(['ikeRekeyTimeUnit'], get(defaultIpsecFormData, 'ikeRekeyTimeUnit'))
      }
    }
  }

  const handleEspRekeyTimeChange = async (e: CheckboxChangeEvent) => {
    const isChecked = e.target.checked
    setEspRekeyTimeEnabled(e.target.checked)
    form.setFieldValue('espRekeyTimeEnabledCheckbox', e.target.checked)
    if (isChecked) {
      let originalValue = form.getFieldValue(['espRekeyTime'])
      if (originalValue === 0) {
        // Set default value when checkbox is checked
        form.setFieldValue(['espRekeyTime'], get(defaultIpsecFormData, 'espRekeyTime'))
        form.setFieldValue(['espRekeyTimeUnit'], get(defaultIpsecFormData, 'espRekeyTimeUnit'))
      }
    }
  }

  return (
    <>
      <GridRow style={{ height: '60px', marginTop: '10px' }}>
        <GridCol col={{ span: 12 }}>
          <Form.Item
            style={{ marginTop: '-5px' }}
            children={
              <>
                <Checkbox
                  checked={ikeRekeyTimeEnabled}
                  data-testid='ikeRekeyTimeEnabled'
                  onChange={handleIkeRekeyTimeChange}
                  children={
                    <div style={{ color: 'var(--acx-neutrals-60)' }}>
                      {$t({ defaultMessage: 'Internet Key Exchange (IKE)' })}
                    </div>
                  } />
                <Tooltip.Question
                  title={$t(messageMapping.ike_rekey_tooltip)}
                  placement='bottom' />
              </>
            }
          />
        </GridCol>
        <GridCol col={{ span: 12 }}>
          {ikeRekeyTimeEnabled &&
            <Form.Item
              style={{ marginTop: '-27px' }}
              children={
                <Space>
                  <Form.Item
                    label={' '}
                    data-testid='ikeRekeyTime'
                    name={['ikeRekeyTime']}
                    children={
                      <InputNumber min={1} max={16384} style={{ width: 80 }}/>
                    } />
                  <Form.Item name={'ikeRekeyTimeUnit'}
                    children={
                      <Select
                        style={{ width: 120, marginTop: '23px' }}
                        options={rekeyTimeUnitOptions}
                        children={
                          rekeyTimeUnitOptions.map((item) =>
                            <Select.Option key={item.value} value={item.value}>
                              {item.label}
                            </Select.Option>)
                        } />
                    } />
                </Space>
              } />
          }
        </GridCol>
      </GridRow>
      <GridRow style={{ height: '60px' }}>
        <GridCol col={{ span: 12 }}>
          <Form.Item
            style={{ marginTop: '-5px' }}
            children={
              <>
                <Checkbox
                  checked={espRekeyTimeEnabled}
                  data-testid='espRekeyTimeEnabled'
                  onChange={handleEspRekeyTimeChange}
                  children={
                    <div style={{ color: 'var(--acx-neutrals-60)' }}>
                      {$t({ defaultMessage: 'Encapsulating Security Payload (ESP)' })}
                    </div>
                  } />
                <Tooltip.Question
                  title={$t(messageMapping.esp_rekey_tooltip)}
                  placement='bottom' />
              </>
            }
          />
        </GridCol>
        <GridCol col={{ span: 12 }}>
          {espRekeyTimeEnabled &&
            <Form.Item
              style={{ marginTop: '-27px' }}
              children={
                <Space>
                  <Form.Item
                    label={' '}
                    data-testid='espRekeyTime'
                    name={['espRekeyTime']}
                    children={
                      <InputNumber min={1} max={16384} style={{ width: 80 }}/>
                    } />
                  <Form.Item name={'espRekeyTimeUnit'}
                    children={
                      <Select
                        style={{ width: 120, marginTop: '23px' }}
                        options={rekeyTimeUnitOptions}
                        children={
                          rekeyTimeUnitOptions.map((item) =>
                            <Select.Option key={item.value} value={item.value}>
                              {item.label}
                            </Select.Option>)
                        } />
                    } />
                </Space>
              } />
          }
        </GridCol>
      </GridRow>
    </>
  )
}