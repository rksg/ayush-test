import { useState, useEffect } from 'react'

import { Form, Input, Select } from 'antd'
import { intersection, omit }  from 'lodash'

import { Modal, Tooltip } from '@acx-ui/components'
import {
  CliTemplateVariable,
  checkObjectNotExists,
  cliVariableNameRegExp,
  nameCannotStartWithNumberRegExp,
  SwitchCliMessages,
  SwitchCustomizedVariable,
  SwitchStatusEnum,
  SwitchViewModel
} from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'

import * as UI from '../SwitchCliTemplateForm/CliTemplateForm/styledComponents'

import { getVariableSeparator, variableFormData } from './CliVariableUtils'
import {
  GroupedSwitchesByModel,
  getCustomizeFields,
  getVariableFields,
  VariableType
} from './CliVariableUtils'

export function CliVariableModal (props: {
  data?: CliTemplateVariable,
  editMode: boolean,
  modalvisible: boolean,
  variableList: CliTemplateVariable[],
  setModalvisible: (visible: boolean) => void
  setVariableList: (data: CliTemplateVariable[]) => void
  isCustomizedVariableEnabled?: boolean
  venueAppliedModels?: Record<string, string[]>
  selectedModels?: string[]
  selectedVenues?: string[]
  allowedSwitchList?: SwitchViewModel[]
  configuredSwitchList?: SwitchViewModel[]
}) {
  const { $t } = getIntl()
  const { useWatch } = Form
  const [form] = Form.useForm()
  const [selectType, setSelectType] = useState('')
  const [allowedSwitchesGroupedByModel, setAllowedSwitchesGroupedByModel]
    = useState<GroupedSwitchesByModel>({})
  const [configuredSwitchesGroupedByModel, setConfiguredSwitchesGroupedByModel]
    = useState<GroupedSwitchesByModel>({})
  const [hasCustomize, setHasCustomize] = useState(false)

  const {
    data, editMode, modalvisible, setModalvisible, variableList, setVariableList,
    isCustomizedVariableEnabled, venueAppliedModels, selectedModels, selectedVenues,
    allowedSwitchList, configuredSwitchList
  } = props

  const allSwitchList = [
    ...(allowedSwitchList ?? []),
    ...(configuredSwitchList ?? [])
  ]

  const customizedRequiredFields = [
    useWatch<string>('ipAddressStart', form),
    useWatch<string>('ipAddressEnd', form),
    useWatch<string>('subMask', form),
    useWatch<string>('rangeStart', form),
    useWatch<string>('rangeEnd', form),
    useWatch<string>('string', form)
  ]
  const switchVariables = [
    useWatch<string>('configuredSwitchVariables', form),
    useWatch<string>('preprovisionedSwitchVariables', form)
  ]

  useEffect(() => {
    const customize = switchVariables.filter(v => v).flat().length > 0
    setHasCustomize(customize)
  }, [switchVariables])

  useEffect(() => {
    if (venueAppliedModels && allowedSwitchList && isCustomizedVariableEnabled) {
      let appliedConfiguredSwitchList = [] as SwitchViewModel[]
      if (editMode) {
        const appliedSerialNumbers = data?.switchVariables?.map(
          switchVariable => switchVariable?.serialNumbers
        ).flat()
        appliedConfiguredSwitchList = configuredSwitchList?.filter(s => {
          return appliedSerialNumbers?.includes(s?.serialNumber || '')
        }) as SwitchViewModel[]
      }

      const groupSwitchesByModel = (switches: SwitchViewModel[]) => {
        return switches.map(s => {
          const venueModels = venueAppliedModels?.[s.venueId] || []
          return {
            ...s,
            isApplied: venueModels?.includes(s.model || ''),
            isModelOverlap: !selectedVenues?.includes(s.venueId)
              && !!intersection(venueModels, selectedModels)?.length,
            isConfigured: s.deviceStatus !== SwitchStatusEnum.NEVER_CONTACTED_CLOUD
          }
        }).filter(s => selectedModels?.includes(s.model || '')
        ).reduce((result, item) => {
          const model = item?.model as string
          if (!result[model as string]) {
            result[model] = []
          }
          result[model].push(item)
          return result
        }, {} as GroupedSwitchesByModel)
      }

      const allowedSwitches = groupSwitchesByModel(allowedSwitchList)
      const configuredSwitches = groupSwitchesByModel(appliedConfiguredSwitchList)
      setAllowedSwitchesGroupedByModel(allowedSwitches)
      setConfiguredSwitchesGroupedByModel(configuredSwitches)
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
          title={$t(SwitchCliMessages.VARIABLE_NAME_RULE)}
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
            configuredSwitchVariables: [],
            preprovisionedSwitchVariables: []
          })
        }}
      />}
    />

    {selectType === VariableType.ADDRESS && (
      isCustomizedVariableEnabled
        ? <UI.CustomizedSection>
          { getVariableFields(VariableType.ADDRESS, form) }
          { getCustomizeFields({
            allowedSwitchesGroupedByModel,
            configuredSwitchesGroupedByModel,
            type: VariableType.ADDRESS,
            customizedRequiredFields, hasCustomize, form
          })
          }
        </UI.CustomizedSection>
        : getVariableFields(VariableType.ADDRESS, form)
    )}

    {selectType === VariableType.RANGE && (
      isCustomizedVariableEnabled
        ? <UI.CustomizedSection>
          { getVariableFields(VariableType.RANGE, form) }
          { getCustomizeFields({
            allowedSwitchesGroupedByModel,
            configuredSwitchesGroupedByModel,
            type: VariableType.RANGE,
            customizedRequiredFields, hasCustomize, form
          })
          }
        </UI.CustomizedSection>
        : getVariableFields(VariableType.RANGE, form)
    )}

    {selectType === VariableType.STRING && (
      isCustomizedVariableEnabled
        ? <UI.CustomizedSection>
          { getVariableFields(VariableType.STRING, form, isCustomizedVariableEnabled) }
          { getCustomizeFields({
            allowedSwitchesGroupedByModel,
            configuredSwitchesGroupedByModel,
            type: VariableType.STRING,
            customizedRequiredFields, hasCustomize, form
          })
          }
        </UI.CustomizedSection>
        : getVariableFields(VariableType.STRING, form)
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

    const switchStatusMapping = allSwitchList?.reduce((result, s) => ({
      ...result, [s.id]: s.deviceStatus
    }), {})

    const filterSerialNumbersByStatus = (
      serialNumbers: SwitchCustomizedVariable['serialNumbers'], isConfigured: boolean
    ) => {
      const serialsArray = Array.isArray(serialNumbers) ? serialNumbers : [serialNumbers]
      return serialsArray.filter(s => {
        const status = switchStatusMapping?.[s as keyof typeof switchStatusMapping]
        return isConfigured
          ? status !== SwitchStatusEnum.NEVER_CONTACTED_CLOUD
          : status === SwitchStatusEnum.NEVER_CONTACTED_CLOUD
      })
    }

    const mapSwitchVariables = (
      switchVariables: CliTemplateVariable['switchVariables'], isConfigured: boolean
    ) => {
      return switchVariables?.map((variable, index) => {
        const filteredSerialNumbers
          = filterSerialNumbersByStatus(variable.serialNumbers, isConfigured)
        return {
          serialNumbers: Array.isArray(variable.serialNumbers)
            ? filteredSerialNumbers : filteredSerialNumbers[0],
          value: variable.value,
          key: `${index}_${variable.value}`
        }
      }).filter(v => !!v.serialNumbers?.toString())
    }

    let fieldsValue: variableFormData = {
      name: data.name,
      type: data.type.toUpperCase(),
      ...(data?.switchVariables ? {
        switchVariables: data?.switchVariables.map((v, index) => {
          return {
            ...v,
            key: `${index}_${v.value}`
          }
        }),
        configuredSwitchVariables: mapSwitchVariables(data?.switchVariables, true),
        preprovisionedSwitchVariables: mapSwitchVariables(data?.switchVariables, false)
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
        const mergeSwitches = (data: variableFormData) => {
          const mergedMap = new Map()
          const mergeData = (switchArray?: SwitchCustomizedVariable[]) => {
            switchArray?.forEach(({ serialNumbers, value, key }) => {
              const serials = typeof serialNumbers === 'string' ? [serialNumbers] : serialNumbers
              const mapKey = value //`${key}_${value}`
              if (mergedMap.has(mapKey)) {
                mergedMap.get(mapKey).serialNumbers.push(...serials)
              } else {
                mergedMap.set(mapKey, { serialNumbers: serials, value, key })
              }
            })
          }
          mergeData(data.configuredSwitchVariables)
          mergeData(data.preprovisionedSwitchVariables)

          return Array.from(mergedMap.values()).map(({ serialNumbers, value, key }) => ({
            serialNumbers: serialNumbers.length === 1 ? serialNumbers[0] : serialNumbers,
            value,
            key
          }))
        }

        const mergedSwitches = mergeSwitches(variable)
        const mergedVariable = {
          ...omit(variable, ['configuredSwitchVariables', 'preprovisionedSwitchVariables']),
          ...(mergedSwitches?.length ? { switchVariables: mergedSwitches } : {})
        }

        if (editMode) {
          setVariableList(variableList.map(v => (
            v.name === mergedVariable.name ? mergedVariable : v
          )))
        } else {
          setVariableList([ ...variableList, mergedVariable ])
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
