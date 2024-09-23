import { useState, useEffect } from 'react'

import { Form, Input, Select } from 'antd'
import { intersection }        from 'lodash'

import { Modal, Tooltip } from '@acx-ui/components'
import {
  CliTemplateVariable,
  checkObjectNotExists,
  cliVariableNameRegExp,
  nameCannotStartWithNumberRegExp,
  SwitchViewModel,
  Venue
} from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'

import { getVariableSeparator } from '../SwitchCliTemplateForm/CliTemplateForm'
import * as UI                  from '../SwitchCliTemplateForm/CliTemplateForm/styledComponents'

import {
  AllowedSwitchObjList,
  getCustomizeFields,
  getVariableTemplate,
  tooltip,
  VariableType
} from './CliVariableUtils'



interface variableFormData {
  name: string
  type: string
  ipAddressStart?: string
  ipAddressEnd?: string
  subMask?: string
  rangeStart?: number
  rangeEnd?: number
  string?:string
}

export function CliVariableModal (props: {
  data?: CliTemplateVariable,
  editMode: boolean,
  modalvisible: boolean,
  variableList: CliTemplateVariable[],
  setModalvisible: (visible: boolean) => void
  setVariableList: (data: CliTemplateVariable[]) => void
  venueList?: Venue[]
  isCustomizedVariableEnabled?: boolean
  venueAppliedModels?: Record<string, string[]>
  selectedModels?: string[]
  allowedSwitchList?: SwitchViewModel[]
}) {
  const { $t } = getIntl()
  const { useWatch } = Form
  const [form] = Form.useForm()
  const [selectType, setSelectType] = useState('')
  const [switchList, setSwitchList] = useState<AllowedSwitchObjList>({})

  const {
    data, editMode, modalvisible, setModalvisible, variableList, setVariableList,
    isCustomizedVariableEnabled, venueAppliedModels, selectedModels, allowedSwitchList
  } = props

  const customizedRequiredFields = [
    useWatch<string>('ipAddressStart', form),
    useWatch<string>('ipAddressEnd', form),
    useWatch<string>('subMask', form),
    useWatch<string>('rangeStart', form),
    useWatch<string>('rangeEnd', form),
    useWatch<string>('string', form)
  ]

  useEffect(() => {
    if (venueAppliedModels && allowedSwitchList && isCustomizedVariableEnabled) {
      const switches = allowedSwitchList.map(s => { //TODO
        return {
          ...s,
          isApplied: venueAppliedModels?.[s.venueId]?.includes(s.model || '')
            || !!intersection(venueAppliedModels?.[s.venueId], selectedModels)?.length || false
        }
      }).filter(s => selectedModels?.includes(s.model || '')
      ).reduce((result, item) => {
        const model = item?.model as string
        if (!result[model as string]) {
          result[model] = []
        }
        result[model].push(item)
        return result
      }, {} as AllowedSwitchObjList)

      setSwitchList(switches)
    }
  }, [venueAppliedModels, allowedSwitchList, isCustomizedVariableEnabled])

  const formContent = <Form
    form={form}
    layout='vertical'
    validateTrigger='onBlur'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onFieldsChange={(changedFields: any) => {
      const changedField = changedFields?.[0]?.name?.[0]
      if (changedField === 'ipAddressStart' || changedField === 'subMask') {
        const { ipAddressStart, ipAddressEnd, subMask } = form.getFieldsValue()
        ipAddressStart && ipAddressEnd && subMask && form.validateFields(['ipAddressEnd'])
      }
    }}
  >
    <Form.Item
      name='name'
      label={<>{$t({ defaultMessage: 'Variable Name' })}
        <Tooltip.Question
          title={$t(tooltip.variableName)}
          placement='bottom'
        />
      </>}
      rules={[
        { required: true, message: $t({ defaultMessage: 'Please enter Variable Name' }) },
        { validator: (_, value) => nameCannotStartWithNumberRegExp(value) },
        { validator: (_, value) => cliVariableNameRegExp(value) },
        { validator: (_, value) => {
          const variables = variableList?.filter(v => v.name !== data?.name).map(v => v.name)
          return checkObjectNotExists(variables, value,
            $t({ defaultMessage: 'Name' }), 'value')
        } }
      ]}
      validateFirst
      children={<Input data-testid='variable-name' maxLength={20} disabled={editMode} />}
    />
    <Form.Item
      name='type'
      label={$t({ defaultMessage: 'Variable Type' })}
      initialValue={selectType}
      rules={[{ required: true }]}

      children={<Select
        data-testid='variable-type'
        value={selectType}
        options={[
          { label: $t({ defaultMessage: 'Select...' }), value: '' },
          { label: $t({ defaultMessage: 'IP Address' }), value: VariableType.ADDRESS },
          { label: $t({ defaultMessage: 'Range' }), value: VariableType.RANGE },
          { label: $t({ defaultMessage: 'String' }), value: VariableType.STRING }
        ]}
        onChange={(value) => {
          const values = form.getFieldsValue()
          setSelectType(value)
          form.setFieldsValue({
            ...values,
            switchVariables: []
          })

        }}
      />}
    />

    {selectType === VariableType.ADDRESS && (
      isCustomizedVariableEnabled
        ? <UI.CustomizedSection>
          { getVariableTemplate(VariableType.ADDRESS, form, $t) }
          { getCustomizeFields(
            switchList, VariableType.ADDRESS, customizedRequiredFields, form, $t)
          }
        </UI.CustomizedSection>
        : getVariableTemplate(VariableType.ADDRESS, form, $t)
    )}

    {selectType === VariableType.RANGE && (
      isCustomizedVariableEnabled
        ? <UI.CustomizedSection>
          { getVariableTemplate(VariableType.RANGE, form, $t) }
          { getCustomizeFields(
            switchList, VariableType.RANGE, customizedRequiredFields, form, $t)
          }
        </UI.CustomizedSection>
        : getVariableTemplate(VariableType.RANGE, form, $t)
    )}

    {selectType === VariableType.STRING && (
      isCustomizedVariableEnabled
        ? <UI.CustomizedSection>
          { getVariableTemplate(VariableType.STRING, form, $t) }
          { getCustomizeFields(
            switchList, VariableType.STRING, customizedRequiredFields, form, $t)
          }
        </UI.CustomizedSection>
        : getVariableTemplate(VariableType.STRING, form, $t)
    )}
  </Form>

  const transformToRawData = (data: variableFormData) => {
    const separator = getVariableSeparator(data.type)
    const fieldsMap: Record<string, string[]> = {
      [VariableType.ADDRESS]: ['ipAddressStart', 'ipAddressEnd', 'subMask'],
      [VariableType.RANGE]: ['rangeStart', 'rangeEnd'],
      [VariableType.STRING]: ['string']
    }

    const values = Object.entries(data)
      .filter(item => fieldsMap[data.type].includes(item[0]))
      .map(item => item[1])

    return {
      ...data,
      name: data.name,
      type: data.type,
      value: values.join(separator)
    }
  }

  const transformToFormData = (data: CliTemplateVariable) => {
    const separator = getVariableSeparator(data.type)
    const values = data.value.split(separator)
    let fieldsValue: variableFormData = {
      name: data.name,
      type: data.type.toUpperCase(),
      ...(data?.switchVariables ? {
        switchVariables: data?.switchVariables
      } : {})
    }
    switch (data.type) {
      case VariableType.ADDRESS:
        fieldsValue = {
          ...fieldsValue,
          ipAddressStart: values[0],
          ipAddressEnd: values[1],
          subMask: values[2]
        }
        break
      case VariableType.RANGE:
        fieldsValue = {
          ...fieldsValue,
          rangeStart: Number(values[0]),
          rangeEnd: Number(values[1])
        }
        break
      default:
        fieldsValue = {
          ...fieldsValue,
          string: values[0]
        }
    }

    return fieldsValue
  }

  const handleCancel = async () => {
    form.resetFields()
    setModalvisible(false)
  }

  const handleOk = async () => {
    try {
      const valid = await form.validateFields()
      if (valid) {
        const variable = transformToRawData(form.getFieldsValue())
        if (editMode) {
          setVariableList(variableList.map(v => (
            v.name === variable.name ? variable : v
          )))
        } else {
          setVariableList([ ...variableList, variable ])
        }

        form.resetFields()
        setModalvisible(false)
        setSelectType('')
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  useEffect(() => {
    form.resetFields()
    setSelectType('')

    if (data && editMode && modalvisible) {
      const fieldsValue = transformToFormData(data)
      form.setFieldsValue(fieldsValue)
      setSelectType(data.type)
    }
  }, [data, editMode, modalvisible])

  return <Modal
    title={editMode
      ? $t({ defaultMessage: 'Edit Variable' })
      : $t({ defaultMessage: 'Add Variable' })
    }
    width={600}
    visible={modalvisible}
    destroyOnClose={true}
    onOk={handleOk}
    onCancel={handleCancel}
  >
    {formContent}
  </Modal>
}
