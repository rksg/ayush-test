/* eslint-disable max-len */
import { useEffect, useState } from 'react'

import { Form, InputNumber, Space, Switch } from 'antd'
import { useWatch }                         from 'antd/lib/form/Form'
import { useIntl }                          from 'react-intl'

import { StepsFormLegacy, Tooltip } from '@acx-ui/components'
import { ExternalAntenna }          from '@acx-ui/rc/utils'



export type ApExtAntennaFormProps = {
  model?: string
  apiSelectedApExternalAntenna: ExternalAntenna // init data from API for reset data
  selectedApExternalAntenna: ExternalAntenna
  readOnly?: boolean
  onExternalAntennaChanged: (newExtAntSettings: ExternalAntenna) => void
}

export const ApExtAntennaForm = (props: ApExtAntennaFormProps) => {
  const { $t } = useIntl()
  const ANTENNA_TOOLTIP = $t({
    defaultMessage: 'Please input in as specified in your antenna data sheet'
  })
  const {
    model,
    selectedApExternalAntenna,
    apiSelectedApExternalAntenna,
    readOnly=false,
    onExternalAntennaChanged
  } = props

  const coupledFieldName = model? ['external', 'apModel', model, 'coupled'] : ['externalAntenna', 'coupled']
  const enable24gFieldName = model? ['external', 'apModel', model, 'enable24G'] : ['externalAntenna', 'enable24G']
  const gain24gFieldName = model? ['external', 'apModel', model, 'gain24G'] : ['externalAntenna', 'gain24G']
  const enable50gFieldName = model? ['external', 'apModel', model, 'enable50G'] : ['externalAntenna', 'enable50G']
  const gain50gFieldName = model? ['external', 'apModel', model, 'gain50G'] : ['externalAntenna', 'gain50G']

  const form = Form.useFormInstance()
  const [
    coupled,
    enable24G,
    enable50G
  ] = [
    useWatch<boolean>(coupledFieldName),
    useWatch<boolean>(enable24gFieldName),
    useWatch<boolean>(enable50gFieldName)
  ]
  const [formSettings, setFormSettings] = useState({} as {
    has24G: boolean
    has50G: boolean
    currentExtAnt : ExternalAntenna
    singleToggle: {
      show: boolean
      enable: boolean
    }
  })

  useEffect(() => {
    if (selectedApExternalAntenna) {
      const has24G = (selectedApExternalAntenna.enable24G !== undefined)
      const has50G = (selectedApExternalAntenna.enable50G !== undefined)
      const currentExtAnt = { ...selectedApExternalAntenna }
      const singleToggle = checkIsSingleToggleAndEnable(currentExtAnt)
      const modelData = {
        coupled: singleToggle.enable,
        enable24G: has24G ? currentExtAnt.enable24G : null,
        enable50G: has50G ? currentExtAnt.enable50G : null,
        gain24G: has24G ? currentExtAnt.gain24G : null,
        gain50G: has50G ? currentExtAnt.gain50G : null
      }
      if (model) {
        form.setFieldsValue({
          external: {
            apModel: {
              selected: model,
              [model]: modelData
            }
          }
        })
      } else {
        form.setFieldsValue({
          externalAntenna: modelData
        })
      }
      setFormSettings({
        has24G,
        has50G,
        currentExtAnt,
        singleToggle
      })
    }
  }, [selectedApExternalAntenna])

  const onChangeGain = (field:string, value: number) => {
    const currentExtAnt= {
      ...formSettings.currentExtAnt,
      [field]: value
    }
    updateExternalAntennaData(currentExtAnt)
  }

  const checkIsSingleToggleAndEnable = (extAnt: ExternalAntenna) => {
    let isShowSingleToggle = false
    let isEnableSingleToggle = false

    if (extAnt !== undefined) {
      const { coupled, enable24G, enable50G } = extAnt
      if (coupled !== undefined) {
        // T750SE, one enable toggle for 2.4G and 5G setting
        if (coupled) {
          isShowSingleToggle = true
          isEnableSingleToggle = !!(enable24G && enable50G)
        }
      } else if (enable24G === undefined || enable50G === undefined) {
        // T300E, one enable toggle for 5G setting
        isShowSingleToggle = true
        if (enable24G !== undefined) {
          isEnableSingleToggle = !!extAnt.enable24G
        } else if (enable50G !== undefined) {
          isEnableSingleToggle = !!extAnt.enable50G
        }
      } else {
        // E510, two enable toggle for each 2.4G and 5G setting
        //isShowSingleToggle = false; // the default value is false, so doesn't need set false again.
      }
    }

    return {
      show: isShowSingleToggle,
      enable: isEnableSingleToggle
    }
  }

  const changeEnable = (channel: string, checked: boolean) => {
    const controlName = []
    let currentExtAnt = { ...formSettings.currentExtAnt }
    switch (channel) {
      case '24G' :
        controlName.push('enable24G')
        currentExtAnt.enable24G = checked
        break
      case '50G':
        controlName.push('enable50G')
        currentExtAnt.enable50G = checked
        break
      case 'both':
        if (formSettings.has24G) {
          controlName.push('enable24G')
          currentExtAnt.enable24G = checked
        }
        if (formSettings.has50G) {
          controlName.push('enable50G')
          currentExtAnt.enable50G = checked
        }
        break
      default:
        return
    }

    if (!checked) {
      currentExtAnt = resetCurrentExternalAntennaGain(channel, currentExtAnt)
    }

    updateExternalAntennaData(currentExtAnt)
  }

  const resetCurrentExternalAntennaGain = (channel: string, tempCurrentExtAnt:ExternalAntenna) => {
    const currentExtAnt = { ...tempCurrentExtAnt }
    const { gain24G, gain50G } = apiSelectedApExternalAntenna!

    switch (channel) {
      case '24G' :
        form.setFieldValue(gain24gFieldName, gain24G)
        if (gain24G !== null) { // valid
          currentExtAnt.gain24G = gain24G
        }
        break
      case '50G':
        form.setFieldValue(gain50gFieldName, gain50G)
        if (gain50G !== null) {
          currentExtAnt.gain50G = gain50G
        }
        break
      case 'both':
        if (selectedApExternalAntenna!.gain24G !== undefined) {
          form.setFieldValue(gain24gFieldName, gain24G)
          currentExtAnt.gain24G = gain24G
        }
        if (selectedApExternalAntenna!.gain50G !== undefined) {
          form.setFieldValue(gain50gFieldName, gain50G)
          currentExtAnt.gain50G = gain50G
        }
        break
    }
    return currentExtAnt
  }

  const updateExternalAntennaData = (currentExtAnt: ExternalAntenna) => {
    setFormSettings({
      ...formSettings,
      currentExtAnt
    })

    onExternalAntennaChanged?.(currentExtAnt)
  }

  return (
    <>
      {formSettings.singleToggle?.show &&
        <StepsFormLegacy.FieldLabel width='190px'>
          { $t({ defaultMessage: 'Enable:' }) }
          <Form.Item
            name={coupledFieldName}
            valuePropName='checked'
            initialValue={false}
            children={
              <Switch
                disabled={readOnly || !formSettings.currentExtAnt.supportDisable}
                onChange={(checked) => {
                  changeEnable('both', checked)
                }}
              />
            }
          />
        </StepsFormLegacy.FieldLabel>
      }

      {(formSettings.has24G && !formSettings.singleToggle?.show) &&
        <StepsFormLegacy.FieldLabel width='190px'>
          { $t({ defaultMessage: 'Enable 2.4 GHz:' }) }
          <Form.Item
            name={enable24gFieldName}
            valuePropName='checked'
            initialValue={false}
            children={
              <Switch
                disabled={readOnly || !formSettings.currentExtAnt.supportDisable}
                onChange={(checked) => {
                  changeEnable('24G', checked)
                }}
              />
            }
          />
        </StepsFormLegacy.FieldLabel>
      }
      {
        (formSettings.has24G && (enable24G || coupled)) &&
          <Form.Item label={<>
            { $t({ defaultMessage: '2.4 GHz Antenna gain:' }) }
            <Tooltip.Question title={ANTENNA_TOOLTIP} />
          </>}>
            <Space>
              <Form.Item
                noStyle
                name={gain24gFieldName}
                children={<InputNumber
                  data-testid='gain24G'
                  onChange={value=>{onChangeGain('gain24G', value)}}
                  min={0}
                  max={60}
                  style={{ width: '65px' }}
                  disabled={readOnly}
                />}
              />
              <span>{$t({ defaultMessage: 'dBi' })}</span>
            </Space>
          </Form.Item>
      }

      {(formSettings.has50G && !formSettings.singleToggle?.show) &&
        <StepsFormLegacy.FieldLabel width='190px'>
          { $t({ defaultMessage: 'Enable 5 GHz:' }) }
          <Form.Item
            name={enable50gFieldName}
            valuePropName='checked'
            initialValue={false}
            children={
              <Switch
                disabled={readOnly || !formSettings.currentExtAnt.supportDisable}
                onChange={(checked) => {
                  changeEnable('50G', checked)
                }}
              />
            }
          />
        </StepsFormLegacy.FieldLabel>
      }
      {(formSettings.has50G && (enable50G || coupled)) &&
        <Form.Item label={<>
          { $t({ defaultMessage: '5 GHz Antenna gain:' }) }
          <Tooltip.Question title={ANTENNA_TOOLTIP} />
        </>}>
          <Space>
            <Form.Item
              noStyle
              name={gain50gFieldName}
              children={<InputNumber
                data-testid='gain50G'
                onChange={value=>{onChangeGain('gain50G', value)}}
                min={0}
                max={60}
                style={{ width: '65px' }}
                disabled={readOnly}
              />}
            />
            <span>{$t({ defaultMessage: 'dBi' })}</span>
          </Space>
        </Form.Item>
      }
    </>
  )
}

