import React from 'react'

import {
  Cascader as AntCascader,
  CascaderProps as AntCascaderProps
} from 'antd'
import { DefaultOptionType } from 'antd/es/cascader'
import { SingleValueType }   from 'rc-cascader/lib/Cascader'

import { Button } from '../Button'

import * as UI from './styledComponents'

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
  onCancel?: CallableFunction
  onApply: (
    cascaderSelected: DefaultOptionType[] | DefaultOptionType[][] | undefined
  ) => void
}

export function NetworkFilter (props: CascaderProps) {
  const [ isOpen, setIsOpen ] = React.useState(false)
  const [ multiSelect, setMultiSelect ] = React.useState<DefaultOptionType[][]>([])
  const { onCancel, onApply, multiple, onFocus, options } = props

  const isPopulated = options.length > 0

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
    onApply(multiSelect)
    setIsOpen(!isOpen)
  }

  const onChangeMultiple = (
    triggeredValue: SingleValueType[],
    selectedValues: DefaultOptionType[][]
  ) => {
    setMultiSelect(selectedValues)
  }

  const onChangeSingle = (
    triggeredValue: SingleValueType,
    selectedValues: DefaultOptionType[]
  ) => {
    onApply(selectedValues)
  }

  const ApplyDropDown = (menus: JSX.Element) => {
    return <>
      {menus}
      {RenderFooterButtons()}
    </>
  }

  const RenderFooterButtons = () => {
    return (
      (isPopulated && multiple) && (
        <>
          <UI.Divider />
          <UI.ButtonDiv>
            <Button size='small' onClick={onCancelProps}>Cancel</Button>
            <Button size='small' type='secondary' onClick={onApplyProps}>Apply</Button>
          </UI.ButtonDiv>
        </>
      )
    )
  }

  const DropDown = (menus: JSX.Element) => {
    if (multiple) {
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
      expandTrigger='hover'
      maxTagCount={1}
      showSearch
    />
  }

  return <AntCascader
    {...props}
    multiple={false}
    changeOnSelect={true}
    onChange={onChangeSingle}
    dropdownRender={DropDown}
    expandTrigger='hover'
    showSearch
  />
}