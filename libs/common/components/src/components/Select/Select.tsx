import React, { ReactNode, useEffect, useState } from 'react'

import { SingleValueType }                           from 'rc-cascader/lib/Cascader'
import { useIntl, defineMessage, MessageDescriptor } from 'react-intl'

import { Button }  from '../Button'
import { Tooltip } from '../Tooltip'

import {
  BaseCascader,
  BaseCascaderProps,
  CascaderOption
} from './BaseCascader'
import * as UI from './styledComponents'

import type { CheckboxValueType } from 'antd/es/checkbox/Group'

export type RadioBand = '6' | '5' | '2.4'

export type CascaderProps = BaseCascaderProps & {
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
    ...cascaderProps } = props
  const { $t } = useIntl()
  const initialValues = defaultValue || []
  const initialRadioBands = isRadioBandDisabled ? [] : defaultRadioBand || []
  const [
    currentValues,
    setCurrentValues
  ] = useState<SingleValueType | SingleValueType[]>(initialValues)
  const [savedValues, setSavedValues] = useState(initialValues)

  useEffect(() => {
    setCurrentValues(initialValues)
    setSavedValues(initialValues)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue])

  const [open, setOpenState] = useState(props.open ?? false)
  const setOpen = (val: boolean) => {
    setOpenState(val)
    props.onDropdownVisibleChange && props.onDropdownVisibleChange(val)
  }
  const [currentRadioBands, setCurrentRadioBands] = useState<CheckboxValueType[]>(initialRadioBands)
  const [savedRadioBands, setSavedRadioBands] = useState<CheckboxValueType[]>(initialRadioBands)
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

  const multiple = props.multiple || showRadioBand

  if (multiple) {
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

    const currentLabels = cascaderProps.options?.reduce(
      (acc: ReactNode[], option: CascaderOption) => {
        if ((currentValues as string[]).flat().includes(option.value as string))
          return [...acc, option.displayLabel || option.label]
        return acc
      },
      []
    )

    let { placeholder } = cascaderProps
    if(currentRadioBands.length){
      placeholder =$t(selectedItemsDesc, {
        count: currentRadioBands.length,
        singular: $t(defineMessage({ defaultMessage: 'band' })),
        plural: $t(defineMessage({ defaultMessage: 'bands' }))
      })
      currentLabels?.push(placeholder)
    }

    return <BaseCascader
      {...cascaderProps}
      showArrow
      value={currentValues}
      multiple
      onChange={setCurrentValues}
      dropdownRender={withFooter}
      expandTrigger='click'
      maxTagCount='responsive'
      onDropdownVisibleChange={setOpen}
      open={open}
      getPopupContainer={(triggerNode) => triggerNode.parentNode}
      onClear={cascaderProps.allowClear ? onClearMultiple : undefined}
      removeIcon={open ? undefined : null}
      placeholder={placeholder}
      maxTagPlaceholder={omitted =>
        <div title={currentLabels?.join(', ')}>
          {$t(selectedItemsDesc,{
            count: omitted.length,
            singular: $t(entityName.singular),
            plural: $t(entityName.plural)
          })}
        </div>
      }
    />
  } else {
    return <BaseCascader
      {...cascaderProps}
      onChange={(
        value: SingleValueType | SingleValueType[],
        selectedOptions: CascaderOption[] | CascaderOption[][]
      ) => {
        const selectedNode = selectedOptions?.slice(-1)[0] as CascaderOption
        if (selectedNode?.ignoreSelection) return
        if (!value) {
          setCurrentValues([])
          setSavedValues([])
        }
        onApply(value ?? [])
      }}
      expandTrigger='hover'
      onDropdownVisibleChange={setOpen}
      open={open}
      getPopupContainer={(triggerNode) => triggerNode.parentNode}
      onClear={cascaderProps.allowClear ? onClear : undefined}
    />
  }
}
