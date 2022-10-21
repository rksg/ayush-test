/* eslint-disable max-len */
import { useContext, useEffect, useState } from 'react'

import { Form, InputNumber, Space, Switch, Tooltip } from 'antd'
import { useIntl }                                   from 'react-intl'

import { StepsForm }                  from '@acx-ui/components'
import { QuestionMarkCircleOutlined } from '@acx-ui/icons'
import { ExternalAntenna }            from '@acx-ui/rc/utils'

import { VenueEditContext } from '../..'

const { useWatch } = Form

export function ExternalAntennaForm (props:{
  model: string
  apiSelectedApExternalAntenna: ExternalAntenna
  selectedApExternalAntenna: ExternalAntenna
  readOnly: boolean
}
) {
  const { $t } = useIntl()
  const ANTENNA_TOOLTIP = $t({ defaultMessage: 'Please input in as specified in your antenna data sheet' })
  const { model, selectedApExternalAntenna, apiSelectedApExternalAntenna, readOnly } = props
  const { editContextData,
    setEditContextData,
    editRadioContextData,
    setEditRadioContextData } = useContext(VenueEditContext)
  const form = Form.useFormInstance()
  const [
    coupled,
    enable24G,
    enable50G
  ] = [
    useWatch<boolean>(['external', 'apModel', model, 'coupled']),
    useWatch<boolean>(['external', 'apModel', model, 'enable24G']),
    useWatch<boolean>(['external', 'apModel', model, 'enable50G'])
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
      form.setFieldsValue({
        external: {
          apModel: {
            selected: model,
            [model]: modelData
          }
        }
      })
      setFormSettings({
        has24G,
        has50G,
        currentExtAnt,
        singleToggle
      })
    }
  }, [selectedApExternalAntenna])

  const onChangeGain = (field:string, value: number) => {
    const updateState= {
      ...formSettings.currentExtAnt,
      [field]: value
    }
    setFormSettings({
      ...formSettings,
      currentExtAnt: updateState
    })
    setEditRadioContextData({
      ...editRadioContextData,
      apModels: {
        ...editRadioContextData.apModels,
        [model]: updateState
      }
    })
    setEditContextData({
      ...editContextData,
      unsavedTabKey: 'radio',
      tabTitle: $t({ defaultMessage: 'Radio' }),
      isDirty: true
    })
  }

  const checkIsSingleToggleAndEnable = (extAnt: ExternalAntenna) => {
    let isShowSingleToggle = false
    let isEnableSingleToggle = false

    if (extAnt !== undefined) {
      if (extAnt.coupled !== undefined) {
        // T750SE, one enable toggle for 2.4G and 5G setting
        if (extAnt.coupled) {
          isShowSingleToggle = true
          isEnableSingleToggle = !!(extAnt.enable24G && extAnt.enable50G)
        }
      } else if (extAnt.enable24G === undefined || extAnt.enable50G === undefined) {
        // T300E, one enable toggle for 5G setting
        isShowSingleToggle = true
        if (extAnt.enable24G !== undefined) {
          isEnableSingleToggle = !!extAnt.enable24G
        } else if (extAnt.enable50G !== undefined) {
          isEnableSingleToggle = !!extAnt.enable50G
        }
      } else {
        // E510, two enable toggle for each 2.4G and 5G setting
        //isShowSingleToggle = false; // the default value is false, so doesn't need set fasle again.
      }
    }

    return {
      show: isShowSingleToggle,
      enable: isEnableSingleToggle
    }
  }

  const changeEnable = (channel: string, checked: boolean) => {
    const controlName = []
    const currentExtAnt = { ...formSettings.currentExtAnt }
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
      resetCurrentExternalAntennaGain(channel, currentExtAnt)
    } else {
      setFormSettings({
        ...formSettings,
        currentExtAnt
      })
      setEditRadioContextData({
        ...editRadioContextData,
        apModels: {
          ...editRadioContextData.apModels,
          [model]: currentExtAnt
        }
      })
      setEditContextData({
        ...editContextData,
        unsavedTabKey: 'radio',
        tabTitle: $t({ defaultMessage: 'Radio' }),
        isDirty: true
      })
    }
  }

  const resetCurrentExternalAntennaGain = (channel: string, tempCurrentExtAnt:ExternalAntenna) => {
    const currentExtAnt = { ...tempCurrentExtAnt }
    switch (channel) {
      case '24G' :
        form.setFieldValue(['external', 'apModel', model, 'gain24G'], apiSelectedApExternalAntenna.gain24G)
        if (apiSelectedApExternalAntenna.gain24G !== null) { // valid
          currentExtAnt.gain24G = apiSelectedApExternalAntenna.gain24G
        }
        break
      case '50G':
        form.setFieldValue(['external', 'apModel', model, 'gain50G'], apiSelectedApExternalAntenna.gain50G)
        if (apiSelectedApExternalAntenna.gain50G !== null) {
          currentExtAnt.gain50G = apiSelectedApExternalAntenna.gain50G
        }
        break
      case 'both':
        if (selectedApExternalAntenna.gain24G !== undefined) {
          form.setFieldValue(['external', 'apModel', model, 'gain24G'], apiSelectedApExternalAntenna.gain24G)
          currentExtAnt.gain24G = apiSelectedApExternalAntenna.gain24G
        }
        if (selectedApExternalAntenna.gain50G !== undefined) {
          form.setFieldValue(['external', 'apModel', model, 'gain50G'], apiSelectedApExternalAntenna.gain50G)
          currentExtAnt.gain50G = apiSelectedApExternalAntenna.gain50G
        }
        break
    }
    setFormSettings({
      ...formSettings,
      currentExtAnt
    })
    setEditRadioContextData({
      ...editRadioContextData,
      apModels: {
        ...editRadioContextData.apModels,
        [model]: currentExtAnt
      }
    })
    setEditContextData({
      ...editContextData,
      unsavedTabKey: 'radio',
      tabTitle: $t({ defaultMessage: 'Radio' }),
      isDirty: true
    })
  }

  return (
    <>
      {
        formSettings.singleToggle?.show &&
        <StepsForm.FieldLabel width='190px'>
          { $t({ defaultMessage: 'Enable:' }) }
          <Form.Item
            name={['external', 'apModel', model, 'coupled']}
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
        </StepsForm.FieldLabel>
      }

      {
        (formSettings.has24G && !formSettings.singleToggle?.show) &&
        <StepsForm.FieldLabel width='190px'>
          { $t({ defaultMessage: 'Enable 2.4 GHz:' }) }
          <Form.Item
            name={['external', 'apModel', model, 'enable24G']}
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
        </StepsForm.FieldLabel>
      }
      {
        (formSettings.has24G && (enable24G || coupled)) &&
          <Form.Item label={<>
            { $t({ defaultMessage: '2.4 GHz Antenna gain:' }) }
            <Tooltip title={ANTENNA_TOOLTIP}>
              <QuestionMarkCircleOutlined />
            </Tooltip>
          </>}>
            <Space>
              <Form.Item
                noStyle
                name={['external', 'apModel', model, 'gain24G']}
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

      {
        (formSettings.has50G && !formSettings.singleToggle?.show) &&
        <StepsForm.FieldLabel width='190px'>
          { $t({ defaultMessage: 'Enable 5 GHz:' }) }
          <Form.Item
            name={['external', 'apModel', model, 'enable50G']}
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
        </StepsForm.FieldLabel>
      }
      {
        (formSettings.has50G && (enable50G || coupled)) &&
        <Form.Item label={<>
          { $t({ defaultMessage: '5 GHz Antenna gain:' }) }
          <Tooltip title={ANTENNA_TOOLTIP}>
            <QuestionMarkCircleOutlined />
          </Tooltip>
        </>}>
          <Space>
            <Form.Item
              noStyle
              name={['external', 'apModel', model, 'gain50G']}
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
