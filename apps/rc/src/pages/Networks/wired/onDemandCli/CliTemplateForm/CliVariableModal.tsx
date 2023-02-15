import { useState, useEffect } from 'react'

import { Form, FormInstance, Input, Select } from 'antd'

import {
  Modal,
  Tooltip
} from '@acx-ui/components'
import {
  CliTemplateVariable,
  checkObjectNotExists,
  cliVariableNameRegExp,
  cliIpAddressRegExp,
  nameCannotStartWithNumberRegExp,
  subnetMaskPrefixRegExp,
  specialCharactersRegExp
} from '@acx-ui/rc/utils'
import { getIntl, validationMessages } from '@acx-ui/utils'

import { VariableType } from './CliStepConfiguration'

import { tooltip } from './'

interface variableFormData {
  name: string
  type: string
  startIp?: string
  endIp?: string
  mask?: string
  startVal?: string
  endVal?: string
  string?:string
}

export function CliVariableModal (props: {
  data?: CliTemplateVariable,
  editMode: boolean,
  modalvisible: boolean,
  variableList: CliTemplateVariable[],
  setModalvisible: (visible: boolean) => void
  setVariableList: (data: CliTemplateVariable[]) => void
}) {
  const { $t } = getIntl()
  const [form] = Form.useForm()
  const [selectType, setSelectType] = useState('')
  const { data, editMode, modalvisible, setModalvisible, variableList, setVariableList } = props

  const formContent = <Form
    form={form}
    layout='vertical'
    validateTrigger='onBlur'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onFieldsChange={(changedFields: any) => {
      const changedField = changedFields?.[0]?.name?.[0]
      if (changedField === 'startIp' || changedField === 'mask') {
        const { startIp, endIp, mask } = form.getFieldsValue()
        startIp && endIp && mask && form.validateFields(['endIp'])
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
          { label: $t({ defaultMessage: 'Address' }), value: VariableType.ADDRESS },
          { label: $t({ defaultMessage: 'Range' }), value: VariableType.RANGE },
          { label: $t({ defaultMessage: 'String' }), value: VariableType.STRING }
        ]}
        onChange={(value) => {
          setSelectType(value)
        }}
      />}
    />

    {selectType === VariableType.ADDRESS && <>
      <Form.Item
        name='startIp'
        label={$t({ defaultMessage: 'Start IP Address' })}
        rules={[
          { required: true },
          { validator: (_, value) => cliIpAddressRegExp(value) }
        ]}
        validateFirst
        children={<Input data-testid='start-ip' />}
      />
      <Form.Item
        name='endIp'
        label={$t({ defaultMessage: 'End IP Address' })}
        rules={[
          { required: true },
          { validator: (_, value) => cliIpAddressRegExp(value) },
          {
            validator: () => {
              const invalid = validateSubnetmaskOverlap(form)
              if (invalid) {
                return Promise.reject($t(validationMessages.ipAddress))
              }
              return Promise.resolve()
            }
          }
        ]}
        validateFirst
        children={<Input data-testid='end-ip' />}
      />
      <Form.Item
        name='mask'
        label={$t({ defaultMessage: 'Network Mask' })}
        rules={[
          { required: true },
          { validator: (_, value) => subnetMaskPrefixRegExp(value) }
        ]}
        validateFirst
        children={<Input data-testid='mask' />}
      />
    </>}

    {selectType === VariableType.RANGE && <>
      <Form.Item
        name='startVal'
        label={<>
          {$t({ defaultMessage: 'Start Value' })}
          <Tooltip.Question
            title={$t(tooltip.rangeStartValue)}
            placement='bottom'
          />
        </>}
        rules={[
          { required: true,
            message: $t({ defaultMessage: 'Please enter Start Value' }) },
          {
            type: 'integer', transform: Number, min: 0, max: 65535,
            message: $t(validationMessages.numberRangeInvalid, { from: 0, to: 65535 })
          },
          {
            validator: (_, value) => {
              const endVal = form.getFieldValue('endVal')
              if (endVal && (Number(endVal) <= Number(value))) {
                return Promise.reject($t(validationMessages.startRangeInvalid))
              }
              endVal && form.setFields([{ name: ['endVal'], errors: [] }])
              return Promise.resolve()
            }
          }
        ]}
        validateFirst
        children={<Input
          data-testid='start-value'
          placeholder={$t({ defaultMessage: 'Between 0-65535' })}
        />}
      />
      <Form.Item
        name='endVal'
        label={<>
          {$t({ defaultMessage: 'End Value' })}
          <Tooltip.Question
            title={$t(tooltip.rangeEndValue)}
            placement='bottom'
          />
        </>}
        rules={[
          { required: true,
            message: $t({ defaultMessage: 'Please enter End Value' }) },
          {
            type: 'integer', transform: Number, min: 0, max: 65535,
            message: $t(validationMessages.numberRangeInvalid, { from: 0, to: 65535 })
          },
          {
            validator: (_, value) => {
              const startVal = form.getFieldValue('startVal')
              if (startVal && (Number(value) <= Number(startVal))) {
                return Promise.reject($t(validationMessages.endRangeInvalid))
              }
              startVal && form.setFields([{ name: ['startVal'], errors: [] }])
              return Promise.resolve()
            }
          }
        ]}
        validateFirst
        children={<Input
          data-testid='end-value'
          placeholder={$t({ defaultMessage: 'Between 0-65535' })}
        />}
      /></>}

    {selectType === VariableType.STRING && <Form.Item
      name='string'
      label={<>{$t({ defaultMessage: 'String' })}
        <Tooltip.Question
          title={$t(tooltip.stringValue)}
          placement='bottom'
        />
      </>}
      rules={[
        { required: true,
          message: $t({ defaultMessage: 'Please enter String' }) },
        { validator: (_, value) => specialCharactersRegExp(value) }
      ]}
      validateFirst
      children={<Input data-testid='string' maxLength={20} />}
    />}
  </Form>

  const transformToRawData = (data: variableFormData) => {
    const separator = getSeparator(data.type)
    const fieldsMap: Record<string, string[]> = {
      [VariableType.ADDRESS]: ['startIp', 'endIp', 'mask'],
      [VariableType.RANGE]: ['startVal', 'endVal'],
      [VariableType.STRING]: ['string']
    }

    const values = Object.entries(data)
      .filter(item => fieldsMap[data.type].includes(item[0]))
      .map(item => item[1])

    return {
      name: data.name,
      type: data.type,
      value: values.join(separator)
    }
  }

  const transformToFormData = (data: CliTemplateVariable) => {
    const separator = getSeparator(data.type)
    const values = data.value.split(separator)
    let fieldsValue: variableFormData = {
      name: data.name,
      type: data.type.toUpperCase()
    }
    switch (data.type) {
      case VariableType.ADDRESS:
        fieldsValue = {
          ...fieldsValue,
          startIp: values[0],
          endIp: values[1],
          mask: values[2]
        }
        break
      case VariableType.RANGE:
        fieldsValue = {
          ...fieldsValue,
          startVal: values[0],
          endVal: values[1]
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
    visible={modalvisible}
    destroyOnClose={true}
    onOk={handleOk}
    onCancel={handleCancel}
  >
    {formContent}
  </Modal>
}

function getSeparator (type: string) {
  const t = type.toUpperCase()
  return t === VariableType.RANGE
    ? ':'
    : (t === VariableType.ADDRESS ? '_' : '*')
}

function getNetworkBitmap (ipArr: string, netmaskArr: string) {
  let network = []
  for (let i = 0; i < ipArr.length; i++) {
    network[i] = parseInt(ipArr[i], 2) & parseInt(netmaskArr[i], 2)
  }
  return network.join('')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ipv4ToBitmap (ipv4: any) {
  const ipv4List = ipv4.split('.')
  let bitmap = ''
  for (let i = 0; i < ipv4List.length; i++) {
    bitmap += ((ipv4List[i] >>> 0).toString(2)).padStart(8, '0')
  }
  return bitmap
}

function validateSubnetmaskOverlap (form: FormInstance) {
  const networkAddress = form.getFieldValue('startIp')
  const networkAddress2 = form.getFieldValue('endIp')
  const subnetmask = form.getFieldValue('mask')
  if (!(networkAddress && networkAddress2 && subnetmask)) {
    return false
  }

  const ipBitmap = ipv4ToBitmap(networkAddress)
  const ipBitmap2 = ipv4ToBitmap(networkAddress2)
  const subnetBitmap = ipv4ToBitmap(subnetmask)

  if (getNetworkBitmap(ipBitmap, subnetBitmap) === getNetworkBitmap(ipBitmap2, subnetBitmap)) {
    return false
  }
  return true
}