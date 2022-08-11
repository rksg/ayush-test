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
  // based on antd, the multiple flag determines the type of DefaultOptionType
  onApply: (
    cascaderSelected: DefaultOptionType[] | DefaultOptionType[][] | undefined
  ) => void
}

export function NetworkFilter (props: CascaderProps) {
  const { onApply, ...antProps } = props
  const { $t } = useIntl()
  const initialValues = props.defaultValue || []
  const [currentValues, setCurrentValues] = React.useState<DefaultOptionType[][]>(initialValues)
  const [savedValues, setSavedValues] = React.useState<DefaultOptionType[][]>(initialValues)
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
    const onChangeMultiple = (
      triggeredValue: SingleValueType[],
      selectedValues: DefaultOptionType[][]
    ) => {
      setCurrentValues(selectedValues.map(selected => selected.map(option => option.value)))
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
      onChange={onChangeMultiple}
      dropdownRender={withFooter}
      expandTrigger='hover'
      maxTagCount='responsive'
      showSearch
      suffixIcon={<CaretDownOutlined />}
      onDropdownVisibleChange={setOpen}
      open={currentValues !== savedValues || open}
    />
  } else {
    const onChangeSingle = (
      triggeredValue: SingleValueType,
      selectedValues: DefaultOptionType[]
    ) => {
      onApply(selectedValues && selectedValues.map(option => option.value))
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