import { useState, useEffect } from 'react'

import { Form, FormInstance, Input, Select } from 'antd'
import _                                     from 'lodash'

import {
  Modal,
  Tooltip
} from '@acx-ui/components'
import {
  checkObjectNotExists,
  cliVariableNameRegExp,
  cliIpAddressRegExp,
  nameCannotStartWithNumberRegExp,
  subnetMaskPrefixRegExp,
  specialCharactersRegExp
} from '@acx-ui/rc/utils'
import { getIntl, validationMessages } from '@acx-ui/utils'

import { VariableType, Variable } from './CliStepConfiguration'
import * as UI                    from './styledComponents'

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
  data?: Variable,
  editMode: boolean,
  modalvisible: boolean,
  variableList: Variable[],
  setModalvisible: (visible: boolean) => void
  setVariableList: (data: Variable[]) => void
}) {
  const { $t } = getIntl()
  const { data, editMode, modalvisible, setModalvisible, variableList, setVariableList } = props
  const [form] = Form.useForm()

  const [selectType, setSelectType] = useState('')

  const formContent = <Form
    form={form}
    layout='vertical'
    validateTrigger='onBlur'
    onFieldsChange={(changedFields: any, allFields: any) => {
      const changedField = changedFields?.[0]?.name?.[0]
      if (changedField === 'startIp' || changedField === 'mask') {
        const startIp = form.getFieldValue('startIp')
        const endIp = form.getFieldValue('endIp')
        const mask = form.getFieldValue('mask')
        startIp && endIp && mask && form.validateFields(['endIp'])
      }
    }}
  >
    <Form.Item
      label={$t({ defaultMessage: 'Variable Name' })}
      children={<UI.FormItemLayout>
        <Form.Item
          noStyle
          name='name'
          rules={[
            { required: true },
            { validator: (_, value) => nameCannotStartWithNumberRegExp(value) },
            { validator: (_, value) => cliVariableNameRegExp(value) },
            { validator: (_, value) => {
              const variables = variableList.filter(v => v.name !== data?.name).map(v => v.name)
              return checkObjectNotExists(variables, value,
                $t({ defaultMessage: 'Name' }), 'value')
            } }
          ]}
          validateFirst
          children={<Input maxLength={20} disabled={editMode} />}
        />
        <Tooltip
          title={$t({ defaultMessage: 'Variable name may include letters and numbers. It must start with a letter.' })}
          placement='bottom'
        >
          <UI.QuestionMarkIcon />
        </Tooltip>
      </UI.FormItemLayout>}
    />
    <Form.Item
      label={$t({ defaultMessage: 'Variable Type' })}
      children={<UI.FormItemLayout>
        <Form.Item
          noStyle
          name='type'
          initialValue={selectType}
          rules={[{ required: true }]}
        >
          <Select
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
          />
        </Form.Item>
      </UI.FormItemLayout>}
    />

    {selectType === VariableType.ADDRESS && <><Form.Item
      label={$t({ defaultMessage: 'Start IP Address' })}
      children={<UI.FormItemLayout>
        <Form.Item
          noStyle
          name='startIp'
          rules={[
            { required: true },
            { validator: (_, value) => cliIpAddressRegExp(value) }
          ]}
          validateFirst
          children={<Input />}
        />
      </UI.FormItemLayout>}
    />
    <Form.Item
      label={$t({ defaultMessage: 'End IP Address' })}
      children={<UI.FormItemLayout>
        <Form.Item
          noStyle
          name='endIp'
          rules={[
            { required: true },
            { validator: (_, value) => cliIpAddressRegExp(value) },
            {
              validator: (_, value) => {
                const invalid = validateSubnetmaskOverlap(form)
                if (invalid) {
                  return Promise.reject($t(validationMessages.ipAddress))
                }
                return Promise.resolve()
              }
            }
          ]}
          validateFirst
          children={<Input />}
        />
      </UI.FormItemLayout>}
    />
    <Form.Item
      label={$t({ defaultMessage: 'Network Mask' })}
      children={<UI.FormItemLayout>
        <Form.Item
          noStyle
          name='mask'
          rules={[
            { required: true },
            { validator: (_, value) => subnetMaskPrefixRegExp(value) }
          ]}
          validateFirst
          children={<Input />}
        />
      </UI.FormItemLayout>}
    /></>}

    {selectType === VariableType.RANGE && <><Form.Item
      label={$t({ defaultMessage: 'Start Value' })}
      children={<UI.FormItemLayout>
        <Form.Item
          noStyle
          name='startVal'
          rules={[
            { required: true },
            {
              type: 'integer', transform: Number, min: 0, max: 65535,
              message: $t(validationMessages.numberRangeInvalid, { from: 0, to: 65535 })
            },
            {
              validator: (_, value) => {
                const endVal = form.getFieldValue('endVal')
                if (endVal && (Number(endVal) < Number(value))) {
                  return Promise.reject($t(validationMessages.startRangeInvalid))
                }
                endVal && form.setFields([{ name: ['endVal'], errors: [] }])
                return Promise.resolve()
              }
            }
          ]}
          validateFirst
          children={<Input placeholder={$t({ defaultMessage: 'Between 0-65535' })} />}
        />
        <Tooltip
          title={$t({ defaultMessage: 'You may enter numbers between 0 and 65535. Start value must be lower than end value' })}
          placement='bottom'
        >
          <UI.QuestionMarkIcon />
        </Tooltip>
      </UI.FormItemLayout>}
    />
    <Form.Item
      label={$t({ defaultMessage: 'End Value' })}
      children={<UI.FormItemLayout>
        <Form.Item
          noStyle
          name='endVal'
          rules={[
            { required: true },
            {
              type: 'integer', transform: Number, min: 0, max: 65535,
              message: $t(validationMessages.numberRangeInvalid, { from: 0, to: 65535 })
            },
            {
              validator: (_, value) => {
                const startVal = form.getFieldValue('startVal')
                if (startVal && (Number(value) < Number(startVal))) {
                  return Promise.reject($t(validationMessages.endRangeInvalid))
                }
                startVal && form.setFields([{ name: ['startVal'], errors: [] }])
                return Promise.resolve()
              }
            }
          ]}
          validateFirst
          children={<Input placeholder={$t({ defaultMessage: 'Between 0-65535' })} />}
        />
        <Tooltip
          title={$t({ defaultMessage: 'You may enter numbers between 0 and 65535. End value must be higher than start value' })}
          placement='bottom'
        >
          <UI.QuestionMarkIcon />
        </Tooltip>
      </UI.FormItemLayout>}
    /></>}

    {selectType === VariableType.STRING && <Form.Item
      label={$t({ defaultMessage: 'String' })}
      children={<UI.FormItemLayout>
        <Form.Item
          noStyle
          name='string'
          rules={[
            { required: true },
            { validator: (_, value) => specialCharactersRegExp(value) }
          ]}
          validateFirst
          children={<Input maxLength={20} />}
        />

        <Tooltip
          title={$t({ defaultMessage: 'Special characters (other than space, $, -, . and _) are not allowed' })}
          placement='bottom'
        >
          <UI.QuestionMarkIcon />
        </Tooltip>
      </UI.FormItemLayout>}
    />}
  </Form>

  const transformToRawData = (data: variableFormData) => {
    console.log(data)
    const separator = getSeparator(data.type)
    const fieldsMap = { //////////////
      [VariableType.ADDRESS]: ['startIp', 'endIp', 'mask'],
      [VariableType.RANGE]: ['startVal', 'endVal'],
      [VariableType.STRING]: ['string']
    } as any

    const values = Object.entries(data)
      .filter(item => fieldsMap[data.type].includes(item[0]))
      .map(item => item[1])

    return {
      name: data.name,
      type: data.type,
      value: values.join(separator)
    }
  }

  const transformToFormData = (data: Variable) => {
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

function getNetworkBitmap (ipArr: any, netmaskArr: any) {
  let network = []
  for (let i = 0; i < ipArr.length; i++) {
    network[i] = parseInt(ipArr[i]) & parseInt(netmaskArr[i])
  }
  return network.join('')
}

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

  // const addressRegexp = new RegExp(IP_ADDRESS_PATTERN);
  // const subnetmaskRegexp = new RegExp(SUBNETMASK);

  // if (!addressRegexp.test(networkAddress.value) || !addressRegexp.test(networkAddress2.value)) {
  //   return false
  // }

  // if (!subnetmaskRegexp.test(subnetmask.value)) {
  //   return false;
  // }

  if (!(networkAddress && networkAddress2 && subnetmask /////
    && !form.getFieldError('startIP').length
    && !form.getFieldError('endIP').length
    && !form.getFieldError('mask').length)) {
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