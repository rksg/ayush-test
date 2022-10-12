/* eslint-disable max-len */
import { useEffect, useState } from 'react'

import { Form, Input, Switch, Tooltip } from 'antd'
// import { useWatch }                     from 'antd/lib/form/Form'
import { useIntl } from 'react-intl'

import { StepsForm }                            from '@acx-ui/components'
import { QuestionMarkCircleOutlined }           from '@acx-ui/icons'
import { ExternalAntenna, CapabilitiesApModel } from '@acx-ui/rc/utils'

export function ExternalAntennaForm (props:{
  model: string
  selectedApExternalAntenna: ExternalAntenna
  selectedApCapabilities: CapabilitiesApModel | null
  readOnly: boolean
}
) {
  const { $t } = useIntl()
  const ANTENNA_TOOLTIP = $t({ defaultMessage: 'Please input in as specified in your antenna data sheet' })
  const { model, selectedApExternalAntenna, selectedApCapabilities, readOnly } = props
  const form = Form.useFormInstance()
  // const [
  //   enable24G
  // ] = [
  //   useWatch<boolean>(['external', 'apModel', model, 'enable24G'])
  // ]
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
      const currentExtAnt = combinExternalAntennaData(selectedApExternalAntenna, selectedApCapabilities)
      const singleToggle = checkIsSingleToggleAndEnable(currentExtAnt)
      form.setFieldsValue({
        external: {
          apModel: {
            [model]: {
              coupled: singleToggle.enable,
              enable24G: has24G ? currentExtAnt.enable24G : null,
              enable50G: has50G ? currentExtAnt.enable50G : null,
              gain24G: has24G ? currentExtAnt.gain24G : null,
              gain50G: has50G ? currentExtAnt.gain50G : null
            }
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
  }, [selectedApExternalAntenna, selectedApCapabilities])

  const combinExternalAntennaData = (selectExtAnt: ExternalAntenna, capbilitiy: CapabilitiesApModel | null) => {
    return Object.assign({}, selectExtAnt, {
      supportDisable: capbilitiy?.externalAntenna?.supportDisable,
      coupled: capbilitiy?.externalAntenna?.coupled || undefined
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
    setFormSettings({
      ...formSettings,
      currentExtAnt
    })
    // updateExternalAntenna(controlName);

    if (!checked) {
      resetCurrentExternalAntennaGain(channel)
    }
  }

  const resetCurrentExternalAntennaGain = (channel: string) => {
    switch (channel) {
      case '24G' :
        form.setFieldValue('gain24G', selectedApExternalAntenna.gain24G)
        break
      case '50G':
        form.setFieldValue('gain50G', selectedApExternalAntenna.gain50G)
        break
      case 'both':
        if (selectedApExternalAntenna.gain24G !== undefined) {
          form.setFieldValue('gain24G', selectedApExternalAntenna.gain24G)
        }
        if (selectedApExternalAntenna.gain50G !== undefined) {
          form.setFieldValue('gain50G', selectedApExternalAntenna.gain50G)
        }
        break
    }

    updateExternalAntennaDbi(channel)
  }

  const updateExternalAntennaDbi = (channel: string) => {
    const controlName = []
    const currentExtAnt = { ...formSettings.currentExtAnt }
    switch (channel) {
      case '24G':
        controlName.push('gain24G')
        if (form.getFieldValue('gain24G') !== null) { // valid
          currentExtAnt.gain24G = form.getFieldValue('gain24G')
        }
        break
      case '50G':
        controlName.push('gain50G')
        if (form.getFieldValue('gain50G') !== null) {
          currentExtAnt.gain50G = form.getFieldValue('gain50G')
        }
        break
      case 'both':
        if (formSettings.has24G) {
          controlName.push('gain24G')
          currentExtAnt.gain24G = form.getFieldValue('gain24G')
        }
        if (formSettings.has50G) {
          controlName.push('gain50G')
          currentExtAnt.gain50G = form.getFieldValue('gain50G')
        }
    }
    setFormSettings({
      ...formSettings,
      currentExtAnt
    })
    // this.updateExternalAntenna(controlName);
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
        formSettings.currentExtAnt?.enable24G &&
        <div style={{ display: 'grid', gridTemplateColumns: '0px 1fr' }}>
          <StepsForm.LabelOfInput>
            { $t({ defaultMessage: 'dBi' }) }
          </StepsForm.LabelOfInput>
          <Form.Item
            name={['external', 'apModel', model, 'gain24G']}
            label={<>
              { $t({ defaultMessage: '2.4 GHz Antenna gain:' }) }
              <Tooltip
                title={ANTENNA_TOOLTIP}
                placement='bottom'
              >
                <QuestionMarkCircleOutlined />
              </Tooltip>
            </>}
            style={{ marginBottom: '15px' }}
            children={<Input style={{ width: '65px' }} disabled={readOnly}></Input>}
          />
        </div>
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
        formSettings.currentExtAnt?.enable50G &&
        <div style={{ display: 'grid', gridTemplateColumns: '0px 1fr' }}>
          <StepsForm.LabelOfInput>
            { $t({ defaultMessage: 'dBi' }) }
          </StepsForm.LabelOfInput>
          <Form.Item
            name={['external', 'apModel', model, 'gain50G']}
            label={<>
              { $t({ defaultMessage: '5 GHz Antenna gain:' }) }
              <Tooltip
                title={ANTENNA_TOOLTIP}
                placement='bottom'
              >
                <QuestionMarkCircleOutlined />
              </Tooltip>
            </>}
            style={{ marginBottom: '15px' }}
            children={<Input style={{ width: '65px' }} disabled={readOnly}></Input>}
          />
        </div>
      }
    </>
  )
}