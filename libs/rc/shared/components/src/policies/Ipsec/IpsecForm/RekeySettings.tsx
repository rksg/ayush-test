import { useEffect, useState } from 'react'

import { Form, InputNumber, Space }      from 'antd'
import Checkbox, { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { useIntl }                       from 'react-intl'

import { GridCol, GridRow, Tooltip, Select } from '@acx-ui/components'
import { Ipsec, IpSecRekeyTimeUnitEnum }     from '@acx-ui/rc/utils'

import { messageMapping } from './messageMapping'


interface ReKeySettingsFormProps {
  initIpSecData?: Ipsec,
  loadReKeySettings: boolean,
  setLoadReKeySettings: (state: boolean) => void
}

export default function RekeySettings (props: ReKeySettingsFormProps) {
  const { $t } = useIntl()
  const { initIpSecData, loadReKeySettings, setLoadReKeySettings } = props
  const form = Form.useFormInstance()
  const [ikeRekeyTimeEnabled, setIkeRekeyTimeEnabled] = useState(false)
  const [espRekeyTimeEnabled, setEspRekeyTimeEnabled] = useState(false)
  const rekeyTimeUnitOptions = [
    { label: $t({ defaultMessage: 'Day(s)' }), value: IpSecRekeyTimeUnitEnum.DAY },
    { label: $t({ defaultMessage: 'Hour(s)' }), value: IpSecRekeyTimeUnitEnum.HOUR },
    { label: $t({ defaultMessage: 'Minute(s)' }), value: IpSecRekeyTimeUnitEnum.MINUTE }
  ]

  useEffect(() => {
    const ikeRekeyTimeEnabledChk = form.getFieldValue('ikeRekeyTimeEnabledCheckbox')
    setIkeRekeyTimeEnabled(ikeRekeyTimeEnabledChk)
    const espRekeyTimeEnabledChk = form.getFieldValue('espRekeyTimeEnabledCheckbox')
    setEspRekeyTimeEnabled(espRekeyTimeEnabledChk)

    if (loadReKeySettings && initIpSecData) {
      if (initIpSecData?.ikeRekeyTime || initIpSecData?.ikeRekeyTime !== 0) {
        setIkeRekeyTimeEnabled(true)
        form.setFieldValue('ikeRekeyTimeEnabledCheckbox', true)
      } else {
        setIkeRekeyTimeEnabled(false)
        form.setFieldValue('ikeRekeyTimeEnabledCheckbox', false)
      }
      if (initIpSecData?.espRekeyTime || initIpSecData?.espRekeyTime !== 0) {
        setEspRekeyTimeEnabled(true)
        form.setFieldValue('espRekeyTimeEnabledCheckbox', true)
      } else {
        setEspRekeyTimeEnabled(false)
        form.setFieldValue('espRekeyTimeEnabledCheckbox', false)
      }
    }
    setLoadReKeySettings(false)
  }, [initIpSecData])

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
                  onChange={async (e: CheckboxChangeEvent) => {
                    setIkeRekeyTimeEnabled(e.target.checked)
                    form.setFieldValue('ikeRekeyTimeEnabledCheckbox', e.target.checked)
                  }}
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
              initialValue={false}
              style={{ marginTop: '-27px' }}
              children={
                <Space>
                  <Form.Item
                    label={' '}
                    data-testid='ikeRekeyTime'
                    name={['ikeRekeyTime']}
                    initialValue={4}
                    children={
                      <InputNumber min={1} max={16384} style={{ width: 80 }}/>
                    } />
                  <Form.Item name={'ikeRekeyTimeUnit'}
                    initialValue={IpSecRekeyTimeUnitEnum.HOUR}
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
                  onChange={async (e: CheckboxChangeEvent) => {
                    setEspRekeyTimeEnabled(e.target.checked)
                    form.setFieldValue('espRekeyTimeEnabledCheckbox', e.target.checked)
                  }}
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
              initialValue={false}
              style={{ marginTop: '-27px' }}
              children={
                <Space>
                  <Form.Item
                    label={' '}
                    data-testid='espRekeyTime'
                    name={['espRekeyTime']}
                    initialValue={1}
                    children={
                      <InputNumber min={1} max={16384} style={{ width: 80 }}/>
                    } />
                  <Form.Item name={'espRekeyTimeUnit'}
                    initialValue={IpSecRekeyTimeUnitEnum.HOUR}
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