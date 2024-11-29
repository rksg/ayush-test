import { Fragment } from 'react'

import { Collapse, Divider, Form, FormInstance, FormListFieldData, Input, Select, Space } from 'antd'
import { RuleObject }                                                                     from 'antd/lib/form'
import _                                                                                  from 'lodash'
import { intersection, isArray }                                                          from 'lodash'
import { FormattedMessage }                                                               from 'react-intl'

import {
  Button,
  Tooltip
} from '@acx-ui/components'
import {
  ArrowCollapse,
  ArrowExpand,
  DeleteOutlined,
  QuestionMarkCircleOutlined
} from '@acx-ui/icons-new'
import {
  cliIpAddressRegExp,
  CliTemplateVariable,
  subnetMaskPrefixRegExp,
  specialCharactersRegExp,
  specialCharactersWithNewLineRegExp,
  SwitchCliMessages,
  SwitchViewModel,
  SwitchCustomizedVariable,
  transformTitleCase,
  IpUtilsService
} from '@acx-ui/rc/utils'
import { getIntl, validationMessages } from '@acx-ui/utils'

import * as UI from './styledComponents'

import { SwitchSettings } from './'

export const MAX_VARIABLE_COUNT = 200
export const MAX_LENGTH_OF_STRING = 20
export const MAX_LENGTH_OF_CUSTOMIZED_STRING = 10000
export const MAX_LINES = 25
export const MAX_CONTENT_LENGTH = 800

export enum VariableType {
  ADDRESS = 'ADDRESS',
  RANGE = 'RANGE',
  STRING = 'STRING'
}

export interface variableFormData {
  name: string
  type: string
  ipAddressStart?: string
  ipAddressEnd?: string
  subMask?: string
  rangeStart?: number
  rangeEnd?: number
  string?: string
  preprovisionedSwitchVariables?: SwitchCustomizedVariable[]
  configuredSwitchVariables?: SwitchCustomizedVariable[]
}

export interface ExtendedSwitchViewModel extends SwitchViewModel {
  isApplied: boolean
  isModelOverlap?: boolean
  isConfigured?: boolean
}

export interface GroupedSwitchesByModel {
  [model: string]: ExtendedSwitchViewModel[]
}

export const formatVariableValue = (data: variableFormData) => {
  const separator = getVariableSeparator(data.type)

  const fieldKeysByType: Record<VariableType, (keyof variableFormData)[]> = {
    [VariableType.ADDRESS]: ['ipAddressStart', 'ipAddressEnd', 'subMask'],
    [VariableType.RANGE]: ['rangeStart', 'rangeEnd'],
    [VariableType.STRING]: ['string']
  }

  const selectedFields = fieldKeysByType[data.type as keyof typeof fieldKeysByType] || []
  const values = selectedFields.map(key => data[key]).filter(Boolean)

  return values.join(separator)
}

export function formatContentWithLimit (content: string, maxLines: number, maxLength = 1000) {
  const { $t } = getIntl()
  const lines = content.split(/\r\n|\r|\n/)
  const lineCount = lines.length
  const isLongContent = content.length >= maxLength

  if (lineCount <= maxLines || isLongContent) {
    return content.length >= maxLength
      ? $t({
        defaultMessage: '{content}{br}{br}and more ...'
      }, {
        content: content.slice(0, maxLength),
        br: <br />
      })
      : content
  }

  const truncatedContent = lines.slice(0, maxLines).join('\r\n')
  return $t({
    defaultMessage: '{content}{br}{br}and {lines} more lines...'
  }, {
    content: truncatedContent,
    lines: lineCount - maxLines,
    br: <br />
  })
}

export const formatSwitchSerialWithName = (switchData: SwitchViewModel) => {
  const { name, serialNumber } = switchData
  return name && name !== serialNumber
    ? `${name} (${serialNumber})`
    : (name ?? '')
}

export function getVariableSeparator (type: string) {
  const t = type.toUpperCase()
  return t === VariableType.RANGE
    ? ':'
    : (t === VariableType.ADDRESS ? '_' : '*')
}

export function getVariableColor (type: string) {
  const variableType = type.toUpperCase()
  const colorMap: { [key: string]: string } = {
    ADDRESS: 'var(--acx-semantics-green-40)',
    RANGE: 'var(--acx-accents-blue-50)',
    STRING: 'var(--acx-accents-orange-50)'
  }
  return colorMap[variableType]
}

export const getVariableFields = (
  type: string,
  form: FormInstance,
  isCustomizedVariableEnabled?: boolean
) => {
  const { $t } = getIntl()
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
            },
            {
              validator: (_, value) => {
                const ipAddressStart = form.getFieldValue('ipAddressStart')
                const subMask = form.getFieldValue('subMask')
                const isInSameSubnet
                  = IpUtilsService.validateInTheSameSubnet(ipAddressStart, subMask, value)
                const isBroadcastAddress = IpUtilsService.validateBroadcastAddress(value, subMask)

                if (!isInSameSubnet || isBroadcastAddress) {
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
              title={$t(SwitchCliMessages.VARIABLE_RANGE_START_RULE)}
              placement='bottom'
            />
          </>}
          rules={[
            {
              required: true,
              message: $t({ defaultMessage: 'Please enter Start Value' })
            },
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
              title={$t(SwitchCliMessages.VARIABLE_RANGE_END_RULE)}
              placement='bottom'
            />
          </>}
          rules={[
            {
              required: true,
              message: $t({ defaultMessage: 'Please enter End Value' })
            },
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
            title={$t(SwitchCliMessages.VARIABLE_STRING_RULE)}
            placement='bottom'
          />
        </>}
        rules={[
          {
            required: true,
            message: $t({ defaultMessage: 'Please enter String' })
          },
          {
            validator: (_, value) => isCustomizedVariableEnabled
              ? specialCharactersWithNewLineRegExp(value)
              : specialCharactersRegExp(value)
          }
        ]}
        validateFirst
        children={isCustomizedVariableEnabled
          ? <Input.TextArea data-testid='string' maxLength={MAX_LENGTH_OF_CUSTOMIZED_STRING} />
          : <Input data-testid='string' maxLength={MAX_LENGTH_OF_STRING} />
        }
        validateTrigger={'onBlur'}
      />
  }
}

export const getRequiredMark = () => <UI.RequiredMark>*</UI.RequiredMark>

export const getCustomizeFieldsText = (type: string) => {
  const { $t } = getIntl()
  switch (type) {
    case VariableType.ADDRESS:
      return <UI.CustomizedSubtitle level={5}>
        {$t({ defaultMessage: 'IP Address' })}
        {getRequiredMark()}
        <Tooltip
          title={$t(SwitchCliMessages.ALLOW_CUSTOMIZED_ADDRESS_TOOLTIP)}
          placement='top'
        >
          <QuestionMarkCircleOutlined size='sm' />
        </Tooltip>
      </UI.CustomizedSubtitle>
    case VariableType.RANGE:
      return <UI.CustomizedSubtitle level={5}>
        {$t({ defaultMessage: 'Value' })}
        {getRequiredMark()}
        <Tooltip
          title={$t(SwitchCliMessages.ALLOW_CUSTOMIZED_RANGE_TOOLTIP)}
          placement='top'
        >
          <QuestionMarkCircleOutlined size='sm' />
        </Tooltip>
      </UI.CustomizedSubtitle>
    default:
      return <UI.CustomizedSubtitle level={5}>
        {$t({ defaultMessage: 'String' })}
        {getRequiredMark()}
        <Tooltip
          title={$t(SwitchCliMessages.ALLOW_CUSTOMIZED_CLI_TOOLTIP)}
          placement='top'
        >
          <QuestionMarkCircleOutlined size='sm' />
        </Tooltip>
      </UI.CustomizedSubtitle>
  }
}

export const getCustomizeButtonDisabled = (
  type: string,
  fields: FormListFieldData[],
  requiredFields: string[]
) => {
  const allRequiredFieldsFilled
    = (requiredFields: string[]) => requiredFields.every(v => v)

  if (!!fields?.length) return false

  switch (type) {
    case VariableType.ADDRESS:
      return !allRequiredFieldsFilled(requiredFields.slice(0, 3))
    case VariableType.RANGE:
      return !allRequiredFieldsFilled(requiredFields.slice(3, 5))
    case VariableType.STRING:
      return !allRequiredFieldsFilled(requiredFields.slice(5, 6))
    default:
      return true
  }
}

export const getCustomizeFields = (props: {
  allowedSwitchesGroupedByModel: GroupedSwitchesByModel, // only preprovisioned switch
  configuredSwitchesGroupedByModel: GroupedSwitchesByModel,
  type: string,
  customizedRequiredFields: string[],
  hasCustomize: boolean,
  form: FormInstance
}) => {
  const { $t } = getIntl()
  const {
    allowedSwitchesGroupedByModel, configuredSwitchesGroupedByModel,
    type, customizedRequiredFields, hasCustomize, form
  } = props
  const { configuredSwitchVariables } = form.getFieldsValue(['configuredSwitchVariables'])
  const hasConfiguredSwitchVariables = !!configuredSwitchVariables?.length

  const getSelectDisabledTooltip = (name: number) => {
    const configuredSwitches = Object.values(configuredSwitchesGroupedByModel).flat()
    const selectedSerialNumbers
      = form.getFieldValue(['configuredSwitchVariables', name, 'serialNumbers']) ?? []

    const selectedSwitch = configuredSwitches
      .filter(s => selectedSerialNumbers.includes(s.serialNumber))
      .map(s => {
        return `${formatSwitchSerialWithName(s)}`
      })

    return <FormattedMessage
      defaultMessage={'{switches}'}
      values={{
        switches: selectedSwitch.map((item, index) => (
          <span key={item}>
            {item}
            {index < selectedSwitch.length - 1 && <br />}
          </span>
        ))
      }}
    />
  }
  const getOptionDisabledTooltip = (switchStatus: ExtendedSwitchViewModel) => {
    return switchStatus?.isApplied
      ? $t(SwitchCliMessages.NOT_ALLOWED_APPLY_PROFILE)
      : (switchStatus?.isModelOverlap ? $t(SwitchCliMessages.OVERLAPPING_MODELS_TOOLTIP) : '')
  }

  const renderFields = (
    fields: FormListFieldData[],
    remove: (index: number | number[]) => void,
    isEditable: boolean = true
  ) => {
    const switches = isEditable ? allowedSwitchesGroupedByModel : configuredSwitchesGroupedByModel
    return fields.map(({ key, name, ...restField }, index) => (<Fragment key={key}>
      <Tooltip title={!isEditable ? getSelectDisabledTooltip(name) : ''}>
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
              const switchVariables = form.getFieldValue('preprovisionedSwitchVariables') as {
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
              data-testid={`customized-select-${key}`}
              showSearch
              showArrow={false}
              className={type === VariableType.STRING ? 'string-type' : ''}
              mode={type !== VariableType.ADDRESS ? 'multiple' : undefined}
              type={type === VariableType.ADDRESS ? 'radio' : undefined}
              dropdownMatchSelectWidth={false}
              maxTagCount='responsive'
              placeholder={$t({ defaultMessage: 'Search Switch' })}
              optionFilterProp='key'
              disabled={!isEditable}
            >{
                Object.keys(switches).map(model => (
                  <Select.OptGroup
                    key={model}
                    label={model}
                    children={switches[model]?.map(s => {
                      const name = formatSwitchSerialWithName(s)
                      return <Select.Option
                        disabled={s.isApplied || s.isModelOverlap}
                        key={name}
                        value={s.serialNumber}
                        label={name}
                      >
                        <Tooltip
                          title={getOptionDisabledTooltip(s)}
                          placement='top'
                        >
                          <Space className='option-label'>
                            <div className='label'>
                              <div className='title'>{ name }</div>
                              <div className='subtitle'>{ s.venueName }</div>
                            </div>
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
      </Tooltip>
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
          validator: () => validateRequiredAddress(form)
        }, {
          validator: (_:RuleObject, value:string) => validateValidIp(value, form),
          message: $t({ defaultMessage: 'Please enter valid value' })
        }, {
          // eslint-disable-next-line max-len
          validator: (_:RuleObject, value:string) => validateDuplicateIp(value, index, isEditable, form)
        }] : []),
        ...( type === VariableType.RANGE ? [{
          validator: (_:RuleObject, value:number) => {
            // eslint-disable-next-line max-len
            const isValid = validateInRange(value, form.getFieldValue('rangeStart'), form.getFieldValue('rangeEnd'))
            return isValid
              ? Promise.resolve()
              : Promise.reject($t({ defaultMessage: 'Please enter valid value' }))
          }
        }] : [])
        ]}
      >
        { type === VariableType.STRING
          ? <Input.TextArea
            data-testid={!isEditable
              ? `customized-disabled-textarea-${key}` : `customized-textarea-${key}`
            }
            maxLength={MAX_LENGTH_OF_CUSTOMIZED_STRING}
            disabled={!isEditable}
          />
          : <Input
            style={{ minHeight: type === VariableType.RANGE ? '35.5px' : 'auto' }}
            data-testid={!isEditable
              ? `customized-disabled-input-${key}` : `customized-input-${key}`}
            disabled={!isEditable}
          />
        }
      </Form.Item>
      <Tooltip title={!isEditable
        ? $t({ defaultMessage: 'This switch is already provisioned with the custom value.' })
        : ''
      }>
        <Space>
          <Button
            key={`delete${key}`}
            role='deleteBtn'
            type='link'
            icon={<DeleteOutlined size='sm' />}
            style={{
              display: 'flex', height: type === VariableType.STRING ? '50.5px' : ''
            }}
            disabled={!isEditable}
            onClick={() => remove(name)}
          />
        </Space>
      </Tooltip>
    </Fragment>
    ))
  }

  return <>
    {hasCustomize && <Divider />}
    <UI.CustomizedFieldsWrapper data-testid='customized-form'>
      {hasCustomize && <UI.CustomizedFields>
        <UI.CustomizedSubtitle level={5}>
          {$t({ defaultMessage: 'Switch' })}
          {getRequiredMark()}
          <Tooltip
            title={$t(SwitchCliMessages.PREPROVISIONED_SWITCH_LIST_TOOLTIP)}
            placement='top'
          >
            <QuestionMarkCircleOutlined size='sm' />
          </Tooltip>
        </UI.CustomizedSubtitle>
        <Space> </Space>
        {getCustomizeFieldsText(type)}
        <Space> </Space>
      </UI.CustomizedFields>}

      <Collapse
        defaultActiveKey={['configured', 'preprovisioned']}
        expandIcon={({ isActive }) => {
          return isActive ? <ArrowCollapse size='sm' /> : <ArrowExpand size='sm' />
        }}
        expandIconPosition='end'
        ghost
      >
        { hasConfiguredSwitchVariables && <Collapse.Panel
          header={$t({ defaultMessage: 'Online Devices' })}
          key='configured'
          style={{ marginBottom: '4px' }}
        >
          <Form.List name='configuredSwitchVariables'>{
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            (fields, { add, remove }) => (<UI.CustomizedFields>
              { renderFields(fields, remove, false) }
            </UI.CustomizedFields>)
          }</Form.List>
        </Collapse.Panel>}

        <Collapse.Panel
          header={
            hasCustomize ? $t({ defaultMessage: 'Devices to be provisioned' }) : ''
          }
          key='preprovisioned'
          showArrow={hasCustomize}
          collapsible={hasCustomize ? undefined : 'disabled'}
        >
          <Form.List name='preprovisionedSwitchVariables'>{
            (fields, { add, remove }) => (<><UI.CustomizedFields>
              { renderFields(fields, remove) }
            </UI.CustomizedFields>
            <Button type='link'
              size='small'
              disabled={getCustomizeButtonDisabled(type, fields, customizedRequiredFields)}
              onClick={() => add()}
            >{!!fields?.length || hasCustomize
                ? $t({ defaultMessage: 'Add Switch' })
                : $t({ defaultMessage: 'Customize' })
              }
            </Button>
            </>
            )
          }</Form.List>
        </Collapse.Panel>
      </Collapse>
    </UI.CustomizedFieldsWrapper>
  </>
}

export const getCustomizedSwitchVenues = (
  variables?: CliTemplateVariable[],
  allowedSwitchList?: SwitchViewModel[]
) => {
  const customizedSwitches = _.uniq(variables
    ?.flatMap(variable => variable?.switchVariables?.flatMap(s => s.serialNumbers) || [])
  )
  return _.uniq(allowedSwitchList
    ?.filter(s => customizedSwitches.includes(s?.serialNumber || ''))
    .map(s => s.venueId)
  )
}

export function getNetworkBitmap (ipArr: string, netmaskArr: string) {
  let network = []
  for (let i = 0; i < ipArr.length; i++) {
    network[i] = parseInt(ipArr[i], 2) & parseInt(netmaskArr[i], 2)
  }
  return network.join('')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ipv4ToBitmap (ipv4: any) {
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

export function validateInRange (number: number, start: number, end: number) {
  const num = Number(number)
  const rangeStart = Number(start)
  const rangeEnd = Number(end)
  return num >= rangeStart && num <= rangeEnd
}

export function validateRequiredAddress (form: FormInstance) {
  const { $t } = getIntl()
  const requiredFields = ['ipAddressStart', 'ipAddressEnd', 'subMask']
  const { ipAddressStart, ipAddressEnd, subMask }
    = form.getFieldsValue(requiredFields)

  if (!ipAddressStart) {
    return Promise.reject($t(SwitchCliMessages.PLEASE_ENTER_START_IP))
  } else if (!ipAddressEnd) {
    return Promise.reject($t(SwitchCliMessages.PLEASE_ENTER_END_IP))
  } else if (!subMask) {
    return Promise.reject($t(SwitchCliMessages.PLEASE_ENTER_MASK))
  }
  return Promise.resolve()
}

export function validateValidIp (ip: string, form: FormInstance) {
  const { $t } = getIntl()
  const ipAddressStart = form.getFieldValue('ipAddressStart')
  const ipAddressEnd = form.getFieldValue('ipAddressEnd')
  const subMask = form.getFieldValue('subMask')

  const longIpAddressStart = IpUtilsService.convertIpToLong(ipAddressStart)
  const longIpAddressEnd = IpUtilsService.convertIpToLong(ipAddressEnd)
  const longIp = IpUtilsService.convertIpToLong(ip)
  const isInSameSubnet = IpUtilsService.isInSameSubnet(ipAddressStart, subMask, ip)
  const isValid = isInSameSubnet && validateInRange(longIp, longIpAddressStart, longIpAddressEnd)

  return isValid
    ? Promise.resolve()
    : Promise.reject($t({ defaultMessage: 'Please enter valid value' }))
}

export function validateDuplicateIp (
  ip: string, index: number, isPreprovisionedFields: boolean, form: FormInstance
) {
  const { $t } = getIntl()
  const configuredIpList
    = form.getFieldValue('configuredSwitchVariables')
      ?.map((ip: { value: string }) => ip?.value) ?? []
  const preprovisionedIpList
    = form.getFieldValue('preprovisionedSwitchVariables')
      ?.filter((ip: { value: string }, i: number) => (i !== index && ip?.value))
      ?.map((ip: { value: string }) => ip?.value) ?? []

  const customizeIpList = preprovisionedIpList.concat(configuredIpList)
  const isValid = !customizeIpList.includes(ip)

  return !isPreprovisionedFields
    ? Promise.resolve()
    : (isValid
      ? Promise.resolve()
      : Promise.reject($t({ defaultMessage: 'IP already exists' })))
}

// TODO: remove after RBAC enabled
function convertVariableToV11Format (variable: CliTemplateVariable): CliTemplateVariable {
  const separator = getVariableSeparator(variable.type)
  const [value1, value2, value3] = variable?.value?.split(separator) || []

  switch (variable.type) {
    case VariableType.ADDRESS:
      return {
        ...variable,
        ipAddressStart: value1,
        ipAddressEnd: value2,
        subMask: value3
      }
    case VariableType.RANGE:
      return {
        ...variable,
        rangeStart: Number(value1),
        rangeEnd: Number(value2)
      }
    default:
      return {
        ...variable,
        value: value1
      }
  }
}

export function renderVariableTitle (
  variable: CliTemplateVariable
) {
  const variableType = variable?.type || ''
  const variableColor = getVariableColor(variableType)

  return <Space size={4}>
    <Space style={{ fontWeight: 600, lineHeight: '20px' }}>{
      variable.name
    }</Space>
    <UI.VariableTypeLabel style={{
      backgroundColor: variableColor
    }}>{
        transformTitleCase(variableType)
      }</UI.VariableTypeLabel>
  </Space>
}

export function renderVariableValue (
  variable: CliTemplateVariable,
  allSwitchList: SwitchViewModel[],
  setSwitchSettings: (data: SwitchSettings[]) => void,
  setSwitchSettingType: (data: string) => void,
  setSwitchSettingDrawerVisible: (visible: boolean) => void,
  isNewTypeVariableEnabled?: boolean
) {
  const { $t } = getIntl()
  const type = variable?.type?.toUpperCase()
  const switchCount = variable?.switchVariables?.map(s => s.serialNumbers).flat()?.length
  // TODO: remove after RBAC enabled (for CLI template)
  const convertedVariable
    = isNewTypeVariableEnabled ? variable : convertVariableToV11Format(variable)

  const customizedSwitches = !!switchCount && <>
    <UI.VariableTitle>{
      $t({ defaultMessage: 'Switches with custom settings' })
    }</UI.VariableTitle>
    <UI.VariableContent>
      <Button type='link'
        size='small'
        onClick={() => {
          const switchVariables
            = convertedVariable?.switchVariables?.map((switchVariable) => {
              if (Array.isArray(switchVariable.serialNumbers)) {
                return switchVariable.serialNumbers.map(s => ({
                  serialNumber: s, value: switchVariable.value
                }))
              }
              return {
                serialNumber: switchVariable.serialNumbers, value: switchVariable.value
              }
            }).flat()

          const settings = switchVariables?.map(switchVariable => {
            const switchData = _.find(allSwitchList, (s) => {
              return s.serialNumber === switchVariable?.serialNumber
            })
            const name = formatSwitchSerialWithName(switchData as SwitchViewModel)
            return {
              ...switchData,
              ...switchVariable,
              name
            }
          }) as SwitchSettings[]

          setSwitchSettings(settings)
          setSwitchSettingType(type)
          setSwitchSettingDrawerVisible(true)
        }}>
        {$t({ defaultMessage: '{count} Switch(es)' }, { count: switchCount })}
      </Button>
    </UI.VariableContent>
  </>

  switch (type) {
    case VariableType.ADDRESS:
      return <>
        <UI.VariableTitle>{$t({ defaultMessage: 'Start - End IP Address' })}</UI.VariableTitle>
        <UI.VariableContent>{
          $t({ defaultMessage: '{start} - {end}' }, {
            start: convertedVariable?.ipAddressStart, end: convertedVariable?.ipAddressEnd
          })
        }</UI.VariableContent>
        <UI.VariableTitle>{$t({ defaultMessage: 'Network Mask' })}</UI.VariableTitle>
        <UI.VariableContent>{convertedVariable?.subMask}</UI.VariableContent>
        {customizedSwitches}
      </>
    case VariableType.RANGE:
      return <>
        <UI.VariableTitle>{$t({ defaultMessage: 'Start - End Value' })}</UI.VariableTitle>
        <UI.VariableContent>{
          $t({ defaultMessage: '{start} - {end}' }, {
            start: convertedVariable?.rangeStart, end: convertedVariable?.rangeEnd
          })
        }</UI.VariableContent>
        {customizedSwitches}
      </>
    default:
      return <>
        <UI.VariableTitle>{$t({ defaultMessage: 'String' })}</UI.VariableTitle>
        <UI.VariableContent>
          <Tooltip title={
            formatContentWithLimit(convertedVariable?.value, MAX_LINES, MAX_CONTENT_LENGTH)
          }
          dottedUnderline>
            <UI.CliVariableContent>{
              convertedVariable?.value.split(/\r\n|\r|\n/)?.[0]
            }</UI.CliVariableContent>
          </Tooltip>
        </UI.VariableContent>
        {customizedSwitches}
      </>
  }
}
