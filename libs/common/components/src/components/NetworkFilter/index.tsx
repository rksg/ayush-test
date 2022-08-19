import React from 'react'

import { CaretDownOutlined }          from '@ant-design/icons'
import {
  Cascader as AntCascader,
  CascaderProps as AntCascaderProps
} from 'antd'
import { DefaultOptionType } from 'antd/es/cascader'
import { SingleValueType }   from 'rc-cascader/lib/Cascader'
import { useIntl }           from 'react-intl'

import { Button } from '../Button'

import * as UI from './styledComponents'
import { CascaderRef } from 'antd/lib/cascader'

// taken from antd Cascader API: https://ant.design/components/cascader/#Option
export interface Option {
  value: string | number | object[];
  label?: React.ReactNode;
  displayLabel?: string
  disabled?: boolean;
  children?: Option[];
  isLeaf?: boolean;
}

export type CascaderProps = AntCascaderProps<Option> & {
  // based on antd, the multiple flag determines the type of DefaultOptionType
  onApply: (
    cascaderSelected: SingleValueType | SingleValueType[] | undefined
  ) => void
}


export function NetworkFilter (props: CascaderProps) {
  const { onApply, ...antProps } = props
  const { $t } = useIntl()
  const wref = React.createRef<CascaderRef>()
  const initialValues = props.defaultValue || []
  const [currentValues, setCurrentValues] = React.useState<SingleValueType | SingleValueType[]>(initialValues)
  const [savedValues, setSavedValues] = React.useState(initialValues)
  const [open, setOpen] = React.useState(false)
  if (props.multiple) {
    const onCancel = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      event.preventDefault()
      setOpen(false)
      setCurrentValues(savedValues)
    }
    const onApplyProps = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      event.preventDefault()
      setOpen(false)
      setSavedValues(currentValues)
      onApply(currentValues)
    }
  
    const withFooter = (menus: JSX.Element) => <>
      {menus}
      <UI.Divider />
      <UI.ButtonDiv>
        <Button size='small' onClick={onCancel}>
          {$t({ defaultMessage: 'Cancel' })}
        </Button>
        <Button size='small' type='secondary' onClick={onApplyProps}>
          {$t({ defaultMessage: 'Apply' })}
        </Button>
      </UI.ButtonDiv>
    </>
    return <AntCascader
      {...antProps}
      value={currentValues}
      multiple
      onChange={setCurrentValues}
      dropdownRender={withFooter}
      expandTrigger='hover'
      maxTagCount='responsive'
      showSearch
      suffixIcon={<CaretDownOutlined />}
      onDropdownVisibleChange={setOpen}
      open={currentValues !== savedValues || open}
    />
  } else {
    return <AntCascader
      ref = {wref}
      {...antProps}
      changeOnSelect
      onChange={(value: SingleValueType | SingleValueType[] ) => {
        if (value?.length === 2) return
        onApply(value)
      }}
      expandTrigger='hover'
      //showSearch
      onDropdownVisibleChange={setOpen}
      // suffixIcon={<CaretDownOutlined  onClick={() => { 
      //   console.log('open', open)
      //   if (!open) {
      //     wref.current?.focus()
      //   }
      //   else wref.current?.blur()
      //   setOpen(!open)
      // }}
      //   />}
    />
  }
}