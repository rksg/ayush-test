import React from 'react'

import { CaretDownOutlined }          from '@ant-design/icons'
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
  // based on antd, the multiple flag determines the type of DefaultOptionType
  onApply: (
    cascaderSelected: DefaultOptionType[] | DefaultOptionType[][] | undefined
  ) => void
}

export function NetworkFilter (props: CascaderProps) {
  const [ multiSelect, setMultiSelect ] = React.useState<DefaultOptionType[][]>([])

  const { onCancel, onApply, ...antProps } = props
  const { multiple, options } = antProps

  const isPopulated = options && options.length > 0

  const onCancelProps = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.preventDefault()
    if (onCancel) {
      onCancel()
    }
  }

  const onApplyProps = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.preventDefault()
    onApply(multiSelect)
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
      {...antProps}
      multiple
      onChange={onChangeMultiple}
      dropdownRender={DropDown}
      expandTrigger='hover'
      maxTagCount={1}
      showSearch
      suffixIcon={<CaretDownOutlined />}
    />
  }

  return <AntCascader
    {...antProps}
    multiple={false}
    changeOnSelect={true}
    onChange={onChangeSingle}
    dropdownRender={DropDown}
    expandTrigger='hover'
    showSearch
    suffixIcon={<CaretDownOutlined />}
  />
}