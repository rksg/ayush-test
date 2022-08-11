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

// taken from antd Cascader API: https://ant.design/components/cascader/#Option
export interface Option {
  value: string | number;
  label?: React.ReactNode;
  disabled?: boolean;
  children?: Option[];
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
  const { $t } = useIntl()
  const [multiSelect, setMultiSelect] = React.useState<DefaultOptionType[][]>([])
  const [open, setOpen] = React.useState(false)
  const { onCancel, onApply, ...antProps } = props
  if (antProps.multiple) {
    const onCancelProps = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      event.preventDefault()
      if (onCancel) {
        onCancel()
      }
      setOpen(false)
    }
    const onApplyProps = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      event.preventDefault()
      onApply(multiSelect)
      setOpen(false)
    }
    const onChangeMultiple = (
      triggeredValue: SingleValueType[],
      selectedValues: DefaultOptionType[][]
    ) => {
      setMultiSelect(selectedValues)
    }
    const withFooter = (menus: JSX.Element) => <>
      {menus}
      <UI.Divider />
      <UI.ButtonDiv>
        <Button size='small' onClick={onCancelProps}>
          {$t({ defaultMessage: 'Cancel' })}
        </Button>
        <Button size='small' type='secondary' onClick={onApplyProps}>
          {$t({ defaultMessage: 'Apply' })}
        </Button>
      </UI.ButtonDiv>
    </>
    return <AntCascader
      {...antProps}
      multiple
      onChange={onChangeMultiple}
      dropdownRender={withFooter}
      expandTrigger='hover'
      maxTagCount={1}
      showSearch
      suffixIcon={<CaretDownOutlined />}
      onDropdownVisibleChange={setOpen}
      open={open}
    />
  } else {
    const onChangeSingle = (
      triggeredValue: SingleValueType,
      selectedValues: DefaultOptionType[]
    ) => {
      onApply(selectedValues)
    }
    return <AntCascader
      {...antProps}
      changeOnSelect
      onChange={onChangeSingle}
      expandTrigger='hover'
      showSearch
      suffixIcon={<CaretDownOutlined />}
    />
  }
}