import { useState, useEffect } from 'react'

import { Divider, Form, FormInstance, Input, Select, Space, Typography } from 'antd'
import { RuleObject }                                                    from 'antd/lib/form'
import { intersection }                                                  from 'lodash'

import {
  Button,
  cssStr,
  Modal,
  Subtitle,
  Tooltip
} from '@acx-ui/components'
import { QuestionMarkCircleOutlined } from '@acx-ui/icons-new'
import {
  CliTemplateVariable,
  checkObjectNotExists,
  cliVariableNameRegExp,
  cliIpAddressRegExp,
  nameCannotStartWithNumberRegExp,
  subnetMaskPrefixRegExp,
  specialCharactersRegExp,
  specialCharactersWithNewLineRegExp,
  SwitchCliMessages,
  SwitchViewModel,
  Venue,
  IpUtilsService
} from '@acx-ui/rc/utils'
import { getIntl, validationMessages } from '@acx-ui/utils'

import * as UI from './styledComponents'

import { tooltip, getVariableSeparator, VariableType } from './'

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

interface PreprovisionedSwitchList extends SwitchViewModel {
  isApplied: boolean
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
  preprovisionedSwitchList?: SwitchViewModel[]
}) {
  const { $t } = getIntl()
  const [form] = Form.useForm()
  const [selectType, setSelectType] = useState('')
  const [switchList, setSwitchList] = useState([] as PreprovisionedSwitchList[])
  // const [initSwitchVariables, setInitSwitchVariables] = useState([] as CliTemplateVariable['switchVariables'])

  const {
    data, editMode, modalvisible, setModalvisible, variableList, setVariableList,
    isCustomizedVariableEnabled, venueAppliedModels, selectedModels, preprovisionedSwitchList
  } = props

  useEffect(() => {
    if (venueAppliedModels && preprovisionedSwitchList && isCustomizedVariableEnabled) {
      const switches = preprovisionedSwitchList.map(s => {
        return {
          ...s,
          isApplied: venueAppliedModels?.[s.venueId]?.includes(s.model || '') ?? false
        }
      }).filter(s => selectedModels?.includes(s.model || ''))

      setSwitchList(switches)
    }
  }, [venueAppliedModels, preprovisionedSwitchList, isCustomizedVariableEnabled])

  // initialValue={initSwitchVariables ?? []}

  const getCustomizeFieldsText = (type: string) => {
    switch (type) {
      case VariableType.ADDRESS:
        return <Subtitle level={5}>{ $t({ defaultMessage: 'IP Address' }) }</Subtitle>
      case VariableType.RANGE:
        return <Subtitle level={5}>{ $t({ defaultMessage: 'Value' }) }</Subtitle>
      default:
        return <Space size={4}>
          <Subtitle level={5}>{ $t({ defaultMessage: 'String' }) }</Subtitle>
          <Tooltip
            title={$t(SwitchCliMessages.ALLOW_CUSTOMIZED_CLI_TOOLTIP)}
            placement='top'
          >
            <QuestionMarkCircleOutlined size='sm' />
          </Tooltip>
        </Space>
    }
  }

  const getCustomizeFields = (type: string) => {
    return <Form.List name='switchVariables'>
      {// eslint-disable-next-line @typescript-eslint/no-unused-vars
        (fields, { add, remove }) => (
          <>
            {!!fields?.length && <Divider />}
            <UI.CustomizedFields>
              {!!fields?.length && <>
                <Subtitle level={5} style={{ display: 'flex' }}>{
                  $t({ defaultMessage: 'Serial Number' })
                }
                <Tooltip
                  title={$t(SwitchCliMessages.PREPROVISIONED_SWITCH_LIST_TOOLTIP)}
                  placement='top'
                >
                  <QuestionMarkCircleOutlined size='sm' style={{ marginLeft: '4px' }} />
                </Tooltip>
                </Subtitle>
                <Space> </Space>
                { getCustomizeFieldsText(type) }
              </>}
              {fields.map(({ key, name, ...restField }) => (
                <>
                  <Form.Item
                    {...restField}
                    name={[name, 'serialNumbers']}
                    validateFirst
                    rules={[{
                      required: true,
                      message: $t({ defaultMessage: 'Please enter Serial Numbers' })
                    }, {
                      validator: (_: RuleObject, value: string) => {
                        const switchVariables = form.getFieldValue('switchVariables') as {
                          serialNumbers: string[],
                          value: string
                        }[]
                        const serialNumbers = switchVariables
                          .filter((switchVariable, i) => i !== key && switchVariable?.serialNumbers)
                          .map(switchVariable => switchVariable?.serialNumbers).flat()
                        const isValid = intersection(value, serialNumbers)?.length === 0

                        if (isValid) {
                          return Promise.resolve()
                        }
                        return Promise.reject()
                      },
                      message: $t({ defaultMessage: 'Serial Numbers should be unique' })
                    }]}
                    children={
                      <UI.Select
                        className={type === VariableType.STRING ? 'string-type' : ''}
                        mode={type !== VariableType.ADDRESS ? 'multiple' : undefined} ////
                        // mode='multiple'
                        // maxCount={ type !== VariableType.ADDRESS ? 1 : undefined}
                        optionLabelProp='label'
                        dropdownClassName='with-subtitle-dropdown'
                        dropdownMatchSelectWidth={false}
                        maxTagCount='responsive'
                        placeholder={$t({ defaultMessage: 'Search Switch' })}
                        // maxTagCount={1}
                        // maxTagCount={2}
                        // maxTagTextLength={2}
                        filterOption={(input, option) =>
                          ((option?.label as string).toLowerCase().includes(input.toLowerCase()))
                        }
                      >{
                          switchList?.map(s => {
                            const hasSwitchName = s.name !== s.serialNumber
                            const name = hasSwitchName ? `${s.serialNumber} (${s.name})` : s.name
                            return <Select.Option
                              disabled={s.isApplied}
                              key={name}
                              value={s.serialNumber}
                              label={name}
                            >
                              <Space className='option-label'>
                                <div className='label'>
                                  <div className='title'>{ name }</div>
                                  <div className='subtitle'>{ s.venueName }</div>
                                </div>
                                { s.isApplied && <div className='suffix'>{
                                  $t({ defaultMessage: 'Applied' }) }</div>
                                }
                              </Space>
                            </Select.Option>
                          })
                        }</UI.Select>
                    }
                  />
                  <Space style={{ textAlign: 'center', marginTop: '6px' }}>:</Space>
                  <Form.Item
                    {...restField}
                    name={[name, 'value']}
                    validateFirst
                    rules={[{
                      required: true,
                      message: $t({ defaultMessage: 'Please enter Value' })
                    },
                    ...( selectType === VariableType.ADDRESS ? [{
                      validator: () => {
                        const requiredFields = ['ipAddressStart', 'ipAddressEnd', 'subMask']
                        const hasAllValues = requiredFields.every(
                          field => form.getFieldValue(field))
                        const { ipAddressStart, ipAddressEnd, subMask }
                          = form.getFieldsValue(requiredFields)

                        if (hasAllValues) {
                          return Promise.resolve()
                        } else if (!ipAddressStart) {
                          return Promise.reject($t(SwitchCliMessages.PLEASE_ENTER_START_IP))
                        } else if (!ipAddressEnd) {
                          return Promise.reject($t(SwitchCliMessages.PLEASE_ENTER_END_IP))
                        } else if (!subMask) {
                          return Promise.reject($t(SwitchCliMessages.PLEASE_ENTER_MASK))
                        }
                        return Promise.reject($t(SwitchCliMessages.PLEASE_ENTER_ADDRESS_VALUES))
                      }
                    }, {
                      validator: (_:RuleObject, value:string) => validateIp(value, form),
                      message: $t({ defaultMessage: 'Please enter valid value' })
                    }, {
                      // eslint-disable-next-line max-len
                      validator: (_:RuleObject, value:string) => validateDuplicateIp(value, key, form),
                      message: $t({ defaultMessage: 'IP already exists' })
                    }] : []),
                    ...( selectType === VariableType.RANGE ? [{
                      validator: (_:RuleObject, value:number) => {
                        // eslint-disable-next-line max-len
                        const isValid = validateInRange(value, form.getFieldValue('rangeStart'), form.getFieldValue('rangeEnd'))
                        return isValid
                          ? Promise.resolve()
                          : Promise.reject($t(validationMessages.ipAddress)) ////
                      },
                      message: $t({ defaultMessage: 'Please enter valid value' })
                    }] : [])
                    ]}
                  >
                    { type === VariableType.STRING ? <Input.TextArea /> : <Input /> }
                  </Form.Item>
                  {/* <Button
                  key='delete'
                  role='deleteBtn'
                  type='link'
                  disabled={fields?.length === 1}
                  icon={<DeleteOutlinedIcon />}
                  style={{ height: '22px' }}
                  onClick={() => remove(name)}
                /> */}
                </>
              ))}
            </UI.CustomizedFields>
            <Button type='link' size='small' onClick={() => add()}>{
              $t({ defaultMessage: 'Add Switch' })
            }</Button>
          </>
        )}
    </Form.List>
  }

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
          // setInitSwitchVariables([])
          // form.resetFields(['switchVariables'])
          form.setFieldsValue({
            ...values,
            switchVariables: []
          })

        }}
      />}
    />

    {selectType === VariableType.ADDRESS && <>
      { isCustomizedVariableEnabled
        ? <>
          <Typography.Text style={{ fontSize: '12px', color: cssStr('--acx-neutrals-60') }}>
            {$t({ defaultMessage: 'IP Address' })}
          </Typography.Text>
          <UI.CustomizedSection>
            <Form.Item
              name='ipAddressStart'
              label={$t({ defaultMessage: 'Start IP Address' })}
              rules={[
                { required: true },
                { validator: (_, value) => cliIpAddressRegExp(value) }
              ]}
              validateFirst
              children={<Input data-testid='start-ip' />}
            />
            <Form.Item
              name='ipAddressEnd'
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
            { getCustomizeFields(VariableType.ADDRESS) }
          </UI.CustomizedSection>
        </>
        : <>
          <Form.Item
            name='ipAddressStart'
            label={$t({ defaultMessage: 'Start IP Address' })}
            rules={[
              { required: true },
              { validator: (_, value) => cliIpAddressRegExp(value) }
            ]}
            validateFirst
            children={<Input data-testid='start-ip' />}
          />
          <Form.Item
            name='ipAddressEnd'
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
        </>
      }
      <Form.Item
        name='subMask'
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
      { isCustomizedVariableEnabled
        ? <>
          <Typography.Text style={{ fontSize: '12px', color: cssStr('--acx-neutrals-60') }}>
            {$t({ defaultMessage: 'Range' })}
          </Typography.Text>
          <UI.CustomizedSection>
            <Form.Item
              name='rangeStart'
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
                    const rangeEnd = form.getFieldValue('rangeEnd')
                    if (rangeEnd && (Number(rangeEnd) <= Number(value))) {
                      return Promise.reject($t(validationMessages.startRangeInvalid))
                    }
                    rangeEnd && form.setFields([{ name: ['rangeEnd'], errors: [] }])
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
              name='rangeEnd'
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
                    const rangeStart = form.getFieldValue('rangeStart')
                    if (rangeStart && (Number(value) <= Number(rangeStart))) {
                      return Promise.reject($t(validationMessages.endRangeInvalid))
                    }
                    rangeStart && form.setFields([{ name: ['rangeStart'], errors: [] }])
                    return Promise.resolve()
                  }
                }
              ]}
              validateFirst
              children={<Input
                data-testid='end-value'
                placeholder={$t({ defaultMessage: 'Between 0-65535' })}
              />}
            />
            { getCustomizeFields(VariableType.RANGE) }
          </UI.CustomizedSection>
        </>
        : <>
          <Form.Item
            name='rangeStart'
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
                  const rangeEnd = form.getFieldValue('rangeEnd')
                  if (rangeEnd && (Number(rangeEnd) <= Number(value))) {
                    return Promise.reject($t(validationMessages.startRangeInvalid))
                  }
                  rangeEnd && form.setFields([{ name: ['rangeEnd'], errors: [] }])
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
            name='rangeEnd'
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
                  const rangeStart = form.getFieldValue('rangeStart')
                  if (rangeStart && (Number(value) <= Number(rangeStart))) {
                    return Promise.reject($t(validationMessages.endRangeInvalid))
                  }
                  rangeStart && form.setFields([{ name: ['rangeStart'], errors: [] }])
                  return Promise.resolve()
                }
              }
            ]}
            validateFirst
            children={<Input
              data-testid='end-value'
              placeholder={$t({ defaultMessage: 'Between 0-65535' })}
            />}
          />
        </>}
    </>}

    {selectType === VariableType.STRING && <>
      { isCustomizedVariableEnabled
        ? <UI.CustomizedSection>
          <Form.Item
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
              { validator: (_, value) => specialCharactersWithNewLineRegExp(value) }
            ]}
            validateFirst
            children={<Input.TextArea data-testid='string' />} //maxLength={20}
            validateTrigger={'onBlur'}
          />
          { getCustomizeFields(VariableType.STRING) }
        </UI.CustomizedSection>
        : <Form.Item
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
          validateTrigger={'onBlur'}
        />
      }
    </>}
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
      // setInitSwitchVariables(data.switchVariables)
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
  const networkAddress = form.getFieldValue('ipAddressStart')
  const networkAddress2 = form.getFieldValue('ipAddressEnd')
  const subnetmask = form.getFieldValue('subMask')
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

function validateInRange (number: number, start: number, end: number) {
  const num = Number(number)
  const rangeStart = Number(start)
  const rangeEnd = Number(end)
  return num >= rangeStart && num <= rangeEnd
}

function validateIp (ip: string, form: FormInstance) {
  // 192.168.138.1
  // 192.168.139.253
  // 255.255.254.0
  // 192.168.139.254
  const ipAddressStart = form.getFieldValue('ipAddressStart')
  const ipAddressEnd = form.getFieldValue('ipAddressEnd')
  const subMask = form.getFieldValue('subMask')

  const longIpAddressStart = IpUtilsService.convertIpToLong(ipAddressStart)
  const longIpAddressEnd = IpUtilsService.convertIpToLong(ipAddressEnd)
  const longIp = IpUtilsService.convertIpToLong(ip)
  const isInSameSubnet = IpUtilsService.isInSameSubnet(ipAddressStart, subMask, ip)
  const isValid = isInSameSubnet && validateInRange(longIp, longIpAddressStart, longIpAddressEnd)

  if (isValid) {
    return Promise.resolve()
  }
  return Promise.reject()
}

function validateDuplicateIp (ip: string, index: number, form: FormInstance) {
  const customizeIpList
    = form.getFieldValue('switchVariables')
      .filter((ip: { value: string }, i: number) => i !== index && ip?.value)
      .map((ip: { value: string }) => ip?.value)
  const isValid = !customizeIpList.includes(ip)

  if (isValid) {
    return Promise.resolve()
  }
  return Promise.reject()
}