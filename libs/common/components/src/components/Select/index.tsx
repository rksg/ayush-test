import React, { useEffect } from 'react'

import {
  Checkbox,
  CascaderProps as AntCascaderProps
} from 'antd'
import { DefaultOptionType }                         from 'antd/es/cascader'
import { SingleValueType }                           from 'rc-cascader/lib/Cascader'
import { useIntl, defineMessage, MessageDescriptor } from 'react-intl'

import { Button } from '../Button'

import * as UI from './styledComponents'

import type { CheckboxValueType } from 'antd/es/checkbox/Group'

export type Band = '6' | '5' | '2.4'

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
    bandsSelected?: CheckboxValueType[]
  ) => void
  entityName: {
    singular: MessageDescriptor
    plural: MessageDescriptor
  },
  showBand?: boolean,
  defaultBand?: Band[]
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
  const { onApply, entityName, showBand, defaultValue, defaultBand, ...antProps } = props
  const { $t } = useIntl()
  const initialValues = defaultValue || []
  const initialBands = defaultBand || []
  const [
    currentValues,
    setCurrentValues
  ] = React.useState<SingleValueType | SingleValueType[]>(initialValues)
  const [savedValues, setSavedValues] = React.useState(initialValues)

  useEffect(() => {
    setCurrentValues(defaultValue || [])
    setSavedValues(defaultValue || [])
  }, [defaultValue])

  const [open, setOpen] = React.useState(false)
  const [selectedBands, setSelectedBands] = React.useState<CheckboxValueType[]>(initialBands)
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('Band Reset done.', { defaultBand })
    setSelectedBands(defaultBand || [])
  }, [defaultBand])

  const onBandChange = (checkedValues: CheckboxValueType[]) => {
    setSelectedBands(checkedValues)
  }

  const onClear = () => {
    props.onClear && props.onClear()
    setCurrentValues(initialValues)
    setSavedValues(initialValues)
    setOpen(false)
  }

  if (props.multiple || showBand) {
    const onCancel = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      event.preventDefault()
      setOpen(false)
      setCurrentValues(savedValues)
    }
    const onApplyProps = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      event.preventDefault()
      setOpen(false)
      setSavedValues(currentValues)
      if(showBand)
        onApply(currentValues, selectedBands)
      else
        onApply(currentValues)
    }
    const onClearMultiple = () => {
      onClear()
      onApply([])
    }

    const withFooter = (menus: JSX.Element) => <>
      {menus}
      {showBand && (
        <div style={{ padding: '10px', width: '350px' }}>
          <span style={{ marginRight: '10px' }}>Radio:</span>
          <Checkbox.Group
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
            defaultValue={initialBands}
            onChange={onBandChange}/>
        </div>)}
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
          return [...acc, option.label]
        return acc
      },
      []
    )
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
