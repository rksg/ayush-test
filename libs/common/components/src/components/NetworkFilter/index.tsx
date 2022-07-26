import React from 'react'

import {
  Cascader as AntCascader,
  CascaderProps as AntCascaderProps,
  Checkbox as AntCheckbox
} from 'antd'
import { DefaultOptionType } from 'antd/es/cascader'
import { SingleValueType }   from 'rc-cascader/lib/Cascader'

import { Button } from '../Button'

import * as UI from './styledComponents'

import type { CheckboxValueType } from 'antd/es/checkbox/Group'

// taken from antd Cascader API: https://ant.design/components/cascader/#Option
export interface Option {
  value: string | number;
  label?: React.ReactNode;
  disabled?: boolean;
  children?: Option[];
  // Determines if this is a leaf node(effective when `loadData` is specified).
  // `false` will force trade TreeNode as a parent node.
  // Show expand icon even if the current node has no children.
  isLeaf?: boolean;
}

export type CascaderProps = AntCascaderProps<Option> & {
  withRadio?: { radioTitle: string, radioOptions: string[] }
  withControlButtons?: boolean
  onCancel?: CallableFunction
  onApply?: (
    selectedRadio: string[] | undefined,
    cascaderSelected: DefaultOptionType[] | DefaultOptionType[][] | undefined
  ) => void
}

export function NetworkFilter (props: CascaderProps) {
  const [ isOpen, setIsOpen ] = React.useState(false)
  const [ radioSelected, setRadioSelected ] = React.useState([] as string[])
  const [ singleSelect, setSingleSelect ] = React.useState<DefaultOptionType[]>([])
  const [ multiSelect, setMultiSelect ] = React.useState<DefaultOptionType[][]>([])

  const { 
    withRadio, onCancel, onApply, onChange, multiple, onFocus, withControlButtons
  } = props

  const onFocusProps = (event: React.FocusEvent<HTMLElement, Element>) => {
    if (onFocus) {
      onFocus(event)
    }

    setIsOpen(!isOpen)
  }

  const onCancelProps = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.preventDefault()
    if (onCancel) {
      onCancel()
    }
    setIsOpen(!isOpen)
  }

  const onApplyProps = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.preventDefault()
    if (onApply) {
      if (multiple) {
        onApply(radioSelected, multiSelect)
      } else {
        onApply(radioSelected, singleSelect)
      }
    }
    setIsOpen(!isOpen)
  }

  const onCheckboxChange = (checkedValues: CheckboxValueType[]) => {
    const stringValues = checkedValues as string[]
    setRadioSelected(stringValues)
    if (onApply) {
      const selectedOptions = (multiple) ? multiSelect : singleSelect
      onApply(stringValues, selectedOptions)
    }
  }

  const onChangeMultiple = (
    triggeredValue: SingleValueType[],
    selectedValues: DefaultOptionType[][]
  ) => {
    if (onChange && multiple) {
      onChange(triggeredValue, selectedValues)
    }

    setMultiSelect(selectedValues)

    if (onApply) {
      onApply(radioSelected, selectedValues)
    }
  }

  const onChangeSingle = (
    triggeredValue: SingleValueType,
    selectedValues: DefaultOptionType[]
  ) => {
    if (onChange && !multiple) {
      onChange(triggeredValue, selectedValues)
    }

    setSingleSelect(selectedValues)
    
    if (onApply) {
      onApply(radioSelected, selectedValues)
    }
  }

  const RadioDropDown = (menus: JSX.Element) => {
    return <>
      {menus}
      <UI.Divider />
      <UI.RadioDiv>
        <UI.Span>{withRadio?.radioTitle}:</UI.Span>
        <AntCheckbox.Group 
          options={withRadio?.radioOptions}
          onChange={onCheckboxChange}
        />
      </UI.RadioDiv>
      <UI.Divider />
      {
        withControlButtons && (
          <UI.ButtonDiv>
            <Button size='small' onClick={onCancelProps}>Cancel</Button>
            <Button size='small' type='secondary' onClick={onApplyProps}>Apply</Button>
          </UI.ButtonDiv>
        )
      }
    </>
  }
  
  const ApplyDropDown = (menus: JSX.Element) => {
    return <>
      {menus}
      <UI.Divider />
      {
        withControlButtons && (
          <UI.ButtonDiv>
            <Button size='small' onClick={onCancelProps}>Cancel</Button>
            <Button size='small' type='secondary' onClick={onApplyProps}>Apply</Button>
          </UI.ButtonDiv>
        )
      }
    </>
  }

  const DropDown = (menus: JSX.Element) => {
    if (withRadio) {
      return RadioDropDown(menus)
    } else if (multiple) {
      return ApplyDropDown(menus)
    } else {
      return menus
    }
  }

  if (multiple) {
    return <AntCascader
      {...props}
      multiple
      onFocus={onFocusProps}
      open={isOpen}
      onChange={onChangeMultiple}
      dropdownRender={DropDown}
    />
  }

  return <AntCascader
    {...props}
    multiple={false}
    changeOnSelect={true}
    onChange={onChangeSingle}
    dropdownRender={DropDown}
  />
}