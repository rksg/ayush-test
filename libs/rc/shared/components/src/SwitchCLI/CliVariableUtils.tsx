import { Fragment } from 'react'

import { Divider, Form, FormInstance, FormListFieldData, Input, Select, Space } from 'antd'
import { RuleObject }                                                           from 'antd/lib/form'
import { intersection, isArray }                                                from 'lodash'
import { defineMessage, IntlShape }                                             from 'react-intl'

import {
  Button,
  Tooltip
} from '@acx-ui/components'
import { DeleteOutlined, QuestionMarkCircleOutlined } from '@acx-ui/icons-new'
import {
  cliIpAddressRegExp,
  subnetMaskPrefixRegExp,
  specialCharactersWithNewLineRegExp,
  SwitchCliMessages,
  SwitchViewModel,
  IpUtilsService
} from '@acx-ui/rc/utils'
import { validationMessages } from '@acx-ui/utils'

import * as UI from './styledComponents'

export enum VariableType {
  ADDRESS = 'ADDRESS',
  RANGE = 'RANGE',
  STRING = 'STRING'
}

export interface ExtendedSwitchViewModel extends SwitchViewModel {
  isApplied: boolean
}

export interface AllowedSwitchObjList {
  [model: string]: ExtendedSwitchViewModel[]
}

/* eslint-disable max-len */
export const tooltip = {
  // cliEmpty: defineMessage({ defaultMessage: 'Please input CLI commands' }),
  // cliVariableInvalid: defineMessage({ defaultMessage: 'Please define variable(s) in CLI commands' }),
  // cliAttributeInvalid: defineMessage({ defaultMessage: 'Please define attribute(s) in CLI commands' }),
  // cliCommands: defineMessage({ defaultMessage: 'You can use any combination of the following options: type the commands, copy/paste the configuration from another file, use the examples on the right pane.' }),
  // cliVariablesReachMax: defineMessage({ defaultMessage: 'The variables had reach to the maximum total 200 entries.' }),
  // noticeInfo: defineMessage({ defaultMessage: 'Once the CLI Configuration profile is applied to a <venueSingular></venueSingular>, you will not be able to apply a regular switch configuration profile to the same <venueSingular></venueSingular>' }),
  // noticeDesp: defineMessage({ defaultMessage: 'It is the user\'s responsibility to ensure the validity and ordering of CLI commands are accurate. The recommendation is to get familiarized with {link} to avoid configuration failures' }),
  variableName: defineMessage({ defaultMessage: 'Variable name may include letters and numbers. It must start with a letter.' }),
  rangeStartValue: defineMessage({ defaultMessage: 'You may enter numbers between 0 and 65535. Start value must be lower than end value' }),
  rangeEndValue: defineMessage({ defaultMessage: 'You may enter numbers between 0 and 65535. End value must be higher than start value' }),
  stringValue: defineMessage({ defaultMessage: 'Special characters (other than space, $, -, . and _) are not allowed' })
}
/* eslint-enable max-len */

export const getVariableTemplate = (type: string, form: FormInstance, $t: IntlShape['$t']) => {
  switch (type) {
    case VariableType.ADDRESS:
      return <>
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
      </>
    case VariableType.RANGE:
      return <>
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
      </>
    default:
      return <Form.Item
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
  }
}

const getRequiredMark
= () => <Space style={{ color: 'var(--acx-accents-orange-50)' }}>*</Space>

const getCustomizeFieldsText = (type: string, $t: IntlShape['$t']) => {
  switch (type) {
    case VariableType.ADDRESS:
      return <UI.CustomizedSubtitle level={5}>
        { $t({ defaultMessage: 'IP Address' }) }
        { getRequiredMark() }
        <Tooltip
          title={$t(SwitchCliMessages.ALLOW_CUSTOMIZED_ADDRESS_TOOLTIP)}
          placement='top'
        >
          <QuestionMarkCircleOutlined size='sm' />
        </Tooltip>
      </UI.CustomizedSubtitle>
    case VariableType.RANGE:
      return <UI.CustomizedSubtitle level={5}>
        { $t({ defaultMessage: 'Value' }) }
        { getRequiredMark() }
        <Tooltip
          title={$t(SwitchCliMessages.ALLOW_CUSTOMIZED_RANGE_TOOLTIP)}
          placement='top'
        >
          <QuestionMarkCircleOutlined size='sm'/>
        </Tooltip>
      </UI.CustomizedSubtitle>
    default:
      return <UI.CustomizedSubtitle level={5}>
        { $t({ defaultMessage: 'String' }) }
        { getRequiredMark() }
        <Tooltip
          title={$t(SwitchCliMessages.ALLOW_CUSTOMIZED_CLI_TOOLTIP)}
          placement='top'
        >
          <QuestionMarkCircleOutlined size='sm' />
        </Tooltip>
      </UI.CustomizedSubtitle>
  }
}

const getCustomizeButtonDisabled = (
  type: string,
  fields: FormListFieldData[],
  requiredFields: string[]
) => {
  const allRequiredFieldsFilled
    = (requiredFields: string[]) => requiredFields.every(v => v)

  if (!!fields?.length) return false

  switch (type) {
    case VariableType.ADDRESS:
      return !allRequiredFieldsFilled(requiredFields.slice(0,3))
    case VariableType.RANGE:
      return !allRequiredFieldsFilled(requiredFields.slice(3, 5))
    case VariableType.STRING:
      return !allRequiredFieldsFilled(requiredFields.slice(5, 6))
    default:
      return true
  }
}

export const getCustomizeFields = (
  switchList: AllowedSwitchObjList,
  type: string,
  customizedRequiredFields: string[],
  form: FormInstance,
  $t: IntlShape['$t']
) => {
  return <Form.List name='switchVariables'>
    {
      (fields, { add, remove }) => (
        <>
          {!!fields?.length && <Divider />}
          <UI.CustomizedFields>
            {!!fields?.length && <>
              <UI.CustomizedSubtitle level={5}>
                { $t({ defaultMessage: 'Switch' }) }
                { getRequiredMark() }
                <Tooltip
                  title={$t(SwitchCliMessages.PREPROVISIONED_SWITCH_LIST_TOOLTIP)}
                  placement='top'
                >
                  <QuestionMarkCircleOutlined size='sm'/>
                </Tooltip>
              </UI.CustomizedSubtitle>
              <Space> </Space>
              { getCustomizeFieldsText(type, $t) }
              <Space> </Space>
            </>}
            {fields.map(({ key, name, ...restField }, index) => (<Fragment key={key}>
              <Form.Item
                {...restField}
                name={[name, 'serialNumbers']}
                validateFirst
                rules={[{
                  required: true,
                  message: $t({ defaultMessage: 'Please enter Switch' })
                }, {
                  validator: (_: RuleObject, value: string) => {
                    const currentSerialNumbers = isArray(value) ? value : [value]
                    const switchVariables = form.getFieldValue('switchVariables') as {
                      serialNumbers: string[],
                      value: string
                    }[]
                    const serialNumbers = switchVariables
                      .filter((switchVariable, i) => i !== index && switchVariable?.serialNumbers)
                      .map(switchVariable => switchVariable?.serialNumbers).flat()
                    // eslint-disable-next-line max-len
                    const isValid = intersection(currentSerialNumbers, serialNumbers)?.length === 0

                    if (isValid) {
                      return Promise.resolve()
                    }
                    return Promise.reject()
                  },
                  message: $t({ defaultMessage: 'Serial Numbers should be unique' })
                }]}
                children={
                  <UI.Select
                    showSearch
                    showArrow={false}
                    className={type === VariableType.STRING ? 'string-type' : ''}
                    mode={type !== VariableType.ADDRESS ? 'multiple' : undefined}
                    type={type === VariableType.ADDRESS ? 'radio' : undefined}
                    dropdownMatchSelectWidth={false}
                    maxTagCount='responsive'
                    placeholder={$t({ defaultMessage: 'Search Switch' })}
                    optionFilterProp='key'
                  >{
                      Object.keys(switchList).map(model => (
                        <Select.OptGroup
                          key={model}
                          label={model}
                          children={switchList[model]?.map(s => {
                            const hasSwitchName = s.name !== s.serialNumber
                            const name
                              = hasSwitchName ? `${s.serialNumber} (${s.name})` : (s.name ?? '')

                            return <Select.Option
                              disabled={s.isApplied}
                              key={name}
                              value={s.serialNumber}
                              label={name}
                            >
                              <Tooltip
                                title={s?.isApplied ?
                                  $t(SwitchCliMessages.NOT_ALLOW_APPLY_PROFILE) : ''
                                }
                                placement='top'
                              >
                                <Space className='option-label'>
                                  <div className='label'>
                                    <div className='title'>{ name }</div>
                                    <div className='subtitle'>{ s.venueName }</div>
                                  </div>
                                  {/* { s.isApplied && <div className='suffix'>{
                                    $t({ defaultMessage: 'Applied' }) }</div>
                                  } */}
                                </Space>
                              </Tooltip>
                            </Select.Option>
                          })
                          }
                        />
                      ))
                    }</UI.Select>
                }
              />
              <Space style={{
                textAlign: 'center',
                height: type === VariableType.STRING ? '50.5px' : '32px'
              }}>:</Space>
              <Form.Item
                {...restField}
                name={[name, 'value']}
                validateFirst
                rules={[{
                  required: true,
                  message: $t({ defaultMessage: 'Please enter Value' })
                },
                ...( type === VariableType.ADDRESS ? [{
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
                  validator: (_:RuleObject, value:string) => validateDuplicateIp(value, index, form),
                  message: $t({ defaultMessage: 'IP already exists' })
                }] : []),
                ...( type === VariableType.RANGE ? [{
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
              <Button
                key={`delete${key}`}
                role='deleteBtn'
                type='link'
                icon={<DeleteOutlined size='sm' />}
                style={{
                  display: 'flex', height: type === VariableType.STRING ? '50.5px' : ''
                }}
                onClick={() => remove(name)}
              />
            </Fragment>
            ))}
          </UI.CustomizedFields>
          <Button type='link'
            size='small'
            disabled={getCustomizeButtonDisabled(type, fields, customizedRequiredFields)}
            onClick={() => add()}
          >{ !!fields?.length
              ? $t({ defaultMessage: 'Add Switch' })
              : $t({ defaultMessage: 'Customize' })
            }
          </Button>
        </>
      )}
  </Form.List>
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