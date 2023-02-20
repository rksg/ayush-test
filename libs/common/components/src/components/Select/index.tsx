import React, { useEffect } from 'react'

import {
  CascaderProps as AntCascaderProps
} from 'antd'
import { DefaultOptionType }                         from 'antd/es/cascader'
import { SingleValueType }                           from 'rc-cascader/lib/Cascader'
import { useIntl, defineMessage, MessageDescriptor } from 'react-intl'

import { Button }  from '../Button'
import { Tooltip } from '../Tooltip'


import * as UI from './styledComponents'

import type { CheckboxValueType } from 'antd/es/checkbox/Group'

export type RadioBand = '6' | '5' | '2.4'

// taken from antd Cascader API: https://ant.design/components/cascader/#Option
export interface Option {
  value: string | number | object[]
  label?: React.ReactNode
  displayLabel?: string
  ignoreSelection?: boolean
  disabled?: boolean
  children?: Option[]
  isLeaf?: boolean
}

export type CascaderProps = AntCascaderProps<Option> & {
  // based on antd, the multiple flag determines the type of DefaultOptionType
  onApply: (
    cascaderSelected: SingleValueType | SingleValueType[] | undefined,
    radioBandsSelected?: CheckboxValueType[]
  ) => void
  entityName: {
    singular: MessageDescriptor
    plural: MessageDescriptor
  },
  showRadioBand?: boolean,
  isRadioBandDisabled?: boolean
  radioBandDisabledReason?: string
  defaultRadioBand?: RadioBand[]
}

Select.defaultProps = {
  entityName: {
    singular: defineMessage({ defaultMessage: 'item' }),
    plural: defineMessage({ defaultMessage: 'items' })
  }
}

const selectedItemsDesc = defineMessage({
  defaultMessage: '{count} {count, plural, one {{singular}} other {{plural}}} selected'
})
export function Select (props: CascaderProps) {
  const { onApply,
    entityName,
    showRadioBand,
    defaultValue,
    defaultRadioBand,
    isRadioBandDisabled = false,
    radioBandDisabledReason,
    ...antProps } = props
  const { $t } = useIntl()
  const initialValues = defaultValue || []
  const initialRadioBands = isRadioBandDisabled ? [] : defaultRadioBand || []
  const [
    currentValues,
    setCurrentValues
  ] = React.useState<SingleValueType | SingleValueType[]>(initialValues)
  const [savedValues, setSavedValues] = React.useState(initialValues)

  useEffect(() => {
    setCurrentValues(initialValues)
    setSavedValues(initialValues)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue])

  const [open, setOpen] = React.useState(false)
  const [currentRadioBands, setCurrentRadioBands] = React
    .useState<CheckboxValueType[]>(initialRadioBands)
  const [savedRadioBands, setSavedRadioBands] = React
    .useState<CheckboxValueType[]>(initialRadioBands)
  useEffect(() => {
    setCurrentRadioBands(initialRadioBands)
    setSavedRadioBands(initialRadioBands)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultRadioBand])

  useEffect(()=>{
    if(defaultRadioBand?.length && isRadioBandDisabled){
      onApply(currentValues, [])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[isRadioBandDisabled])

  const onRadioBandChange = (checkedValues: CheckboxValueType[]) => {
    setCurrentRadioBands(checkedValues)
  }

  const onClear = () => {
    props.onClear && props.onClear()
    setCurrentValues(initialValues)
    setSavedValues(initialValues)
    setOpen(false)
  }

  if (props.multiple || showRadioBand) {
    const onCancel = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      event.preventDefault()
      setOpen(false)
      setCurrentValues(savedValues)
      setCurrentRadioBands(savedRadioBands)
    }
    const onApplyProps = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      event.preventDefault()
      setOpen(false)
      setSavedValues(currentValues)
      setSavedRadioBands(currentRadioBands)
      if(showRadioBand)
        onApply(currentValues, currentRadioBands)
      else
        onApply(currentValues)
    }
    const onClearMultiple = () => {
      onClear()
      setSavedRadioBands(initialRadioBands)
      setCurrentValues([])
      setCurrentRadioBands([])
      onApply([],[])
    }

    const withFooter = (menus: JSX.Element) => <>
      {menus}
      {showRadioBand && (
        <UI.RadioBandsWrapper>
          <UI.RadioBandLabel style={{ marginRight: '10px' }}>
            {$t({ defaultMessage: 'Radio' })}:
          </UI.RadioBandLabel>
          <UI.CheckboxGroup
            disabled={isRadioBandDisabled}
            options={[{
              label: '6 GHz',
              value: '6'
            },
            {
              label: '5 GHz',
              value: '5'
            },
            {
              label: '2.4 GHz',
              value: '2.4'
            }
            ]}
            defaultValue={initialRadioBands}
            value={currentRadioBands}
            onChange={onRadioBandChange}/>
          {isRadioBandDisabled && radioBandDisabledReason &&
           (<Tooltip title={radioBandDisabledReason}>
             <UI.InfoIcon/>
           </Tooltip>)}
        </UI.RadioBandsWrapper>)}
      <UI.ButtonDiv>
        <Button size='small' onClick={onCancel}>
          {$t({ defaultMessage: 'Cancel' })}
        </Button>
        <Button size='small' type='secondary' onClick={onApplyProps}>
          {$t({ defaultMessage: 'Apply' })}
        </Button>
      </UI.ButtonDiv>
    </>
    const currentLabels = antProps.options?.reduce(
      (acc: React.ReactNode[], option: Option) => {
        if ((currentValues as string[]).flat().includes(option.value as string))
          return [...acc, option.displayLabel || option.label]
        return acc
      },
      []
    )
    let { placeholder } = antProps
    if(currentRadioBands.length){
      placeholder =$t(selectedItemsDesc, {
        count: currentRadioBands.length,
        singular: $t(defineMessage({ defaultMessage: 'band' })),
        plural: $t(defineMessage({ defaultMessage: 'bands' }))
      })
      currentLabels?.push(placeholder)
    }
    return (
      <UI.Cascader
        {...antProps}
        style={{ maxWidth: 180 }}
        showArrow={true}
        value={currentValues}
        multiple
        onChange={setCurrentValues}
        dropdownRender={withFooter}
        expandTrigger='hover'
        maxTagCount='responsive'
        showSearch
        onDropdownVisibleChange={setOpen}
        open={open}
        getPopupContainer={(triggerNode) => triggerNode.parentNode}
        onClear={antProps.allowClear ? onClearMultiple : undefined}
        removeIcon={open ? undefined : null}
        placeholder={placeholder}
        maxTagPlaceholder={
          <div title={currentLabels?.join(', ')}>
            {$t(selectedItemsDesc,{
              count: currentValues.length,
              singular: $t(entityName.singular),
              plural: $t(entityName.plural)
            })}
          </div>
        }
      />
    )
  } else {
    return <UI.Cascader
      {...antProps}
      changeOnSelect
      onChange={(
        value: SingleValueType | SingleValueType[],
        selectedOptions: DefaultOptionType[] | DefaultOptionType[][]
      ) => {
        const selectedNode = selectedOptions?.slice(-1)[0] as Option
        if (selectedNode?.ignoreSelection) return
        if (!value) {
          setCurrentValues([])
          setSavedValues([])
        }
        onApply(value ?? [])
      }}
      expandTrigger='hover'
      showSearch={antProps.showSearch || true}
      onDropdownVisibleChange={setOpen}
      open={open}
      getPopupContainer={(triggerNode) => triggerNode.parentNode}
      onClear={antProps.allowClear ? onClear : undefined}
    />
  }
}
