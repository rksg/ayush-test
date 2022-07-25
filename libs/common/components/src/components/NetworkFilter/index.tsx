import React from 'react'

import {
  Cascader as AntCascader,
  CascaderProps as AntCascaderProps,
  Checkbox as AntCheckbox
} from 'antd'
import { DefaultOptionType } from 'antd/es/cascader'
import _                     from 'lodash'
import { SingleValueType }   from 'rc-cascader/lib/Cascader'

import { Button } from '../Button'

import * as UI from './styledComponents'

import type { CheckboxValueType } from 'antd/es/checkbox/Group'


// taken from antd Cascader API: https://ant.design/components/cascader/#Option
interface Option {
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
  onCancel?: React.MouseEventHandler<HTMLElement>
  onApply?: (
    event: React.MouseEvent<Element, MouseEvent>,
    selectedRadio: string[],
    cascaderSelected: DefaultOptionType[] | DefaultOptionType[][]
  ) => void
}

export function NetworkFilter (props: CascaderProps) {
  const [ isOpen, setIsOpen ] = React.useState(false)
  const [ radioSelected, setRadioSelected ] = React.useState([] as string[])
  const [ singleSelect, setSingleSelect ] = React.useState<DefaultOptionType[]>([])
  const [ multiSelect, setMultiSelect ] = React.useState<DefaultOptionType[][]>([])

  const cascaderProps = _.omit(
    props, ['withRadio', 'onApply', 'onCancel']
  ) as AntCascaderProps<Option>

  const { withRadio, onCancel, onApply, onFocus, onChange, multiple } = props

  const onCancelProps = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if (onCancel) {
      onCancel(event)
    }
    setIsOpen(!isOpen)
  }

  const onApplyProps = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    // selection between single or multiple cascader
    if (onApply) {
      if (multiple) {
        onApply(event, radioSelected, multiSelect)
      } else {
        onApply(event, radioSelected, singleSelect)
      }
    }
    setIsOpen(!isOpen)
  }

  const onFocusProps: React.FocusEventHandler<HTMLElement> = (
    event: React.FocusEvent<HTMLElement, Element>
  ) => { 
    if (onFocus) {
      onFocus(event)
    }
    
    setIsOpen(!isOpen)
  }

  const onCheckboxChange = (checkedValues: CheckboxValueType[]) => {
    setRadioSelected(checkedValues as string[])
  }

  const onChangeMultiple = (
    triggeredValue: SingleValueType[],
    selectedValues: DefaultOptionType[][]
  ) => {
    if (onChange && multiple) {
      onChange(triggeredValue, selectedValues)
    }

    setMultiSelect(selectedValues)
  }

  const onChangeSingle = (
    triggeredValue: SingleValueType,
    selectedValues: DefaultOptionType[]
  ) => {
    if (onChange && !multiple) {
      onChange(triggeredValue, selectedValues)
    }

    setSingleSelect(selectedValues)
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
      <UI.ButtonDiv>
        <Button size='small' onClick={onCancelProps}>Cancel</Button>
        <Button size='small' type='secondary' onClick={onApplyProps}>Apply</Button>
      </UI.ButtonDiv>
    </>
  }
  
  const ApplyDropDown = (menus: JSX.Element) => {
    return <>
      {menus}
      <UI.Divider />
      <UI.ButtonDiv>
        <Button size='small' onClick={onCancelProps}>Cancel</Button>
        <Button size='small' type='secondary' onClick={onApplyProps}>Apply</Button>
      </UI.ButtonDiv>
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
      {...cascaderProps}
      multiple
      onChange={onChangeMultiple}
      onFocus={onFocusProps}
      open={isOpen}
      dropdownRender={DropDown}
    />
  } 

  return <AntCascader
    {...cascaderProps}
    multiple={false}
    onChange={onChangeSingle}
    onFocus={onFocusProps}
    open={isOpen}
    dropdownRender={DropDown}
  />
}