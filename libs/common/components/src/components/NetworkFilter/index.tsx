import React from 'react'

import {
  CascaderProps as AntCascaderProps
} from 'antd'
import { DefaultOptionType } from 'antd/es/cascader'
import { SingleValueType }   from 'rc-cascader/lib/Cascader'
import { useIntl }           from 'react-intl'

import { Button } from '../Button'

import * as UI from './styledComponents'

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
    cascaderSelected: SingleValueType | SingleValueType[] | undefined
  ) => void
}


export function NetworkFilter (props: CascaderProps) {
  const { onApply, ...antProps } = props
  const { $t } = useIntl()
  const initialValues = props.defaultValue || []
  const [
    currentValues,
    setCurrentValues
  ] = React.useState<SingleValueType | SingleValueType[]>(initialValues)
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
    return <UI.Cascader
      {...antProps}
      value={currentValues}
      multiple
      onChange={setCurrentValues}
      dropdownRender={withFooter}
      expandTrigger='hover'
      maxTagCount='responsive'
      showSearch
      onDropdownVisibleChange={setOpen}
      open={currentValues !== savedValues || open}
    />
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
        onApply(value)
      }}
      expandTrigger='hover'
      showSearch={antProps.showSearch || true}
      onDropdownVisibleChange={setOpen}
    />
  }
}
