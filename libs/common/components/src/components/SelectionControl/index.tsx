import React from 'react'

import { Radio, RadioChangeEvent } from 'antd'

import { Wrapper } from './styledComponents'

export interface SelectionControlOptionProps {
  label: string
  value: string
  icon?: React.ReactNode
  disabled?: boolean
}

export interface SelectionControlProps {
  defaultValue?: string
  options: SelectionControlOptionProps[]
  onChange?: (e: RadioChangeEvent) => void
  /** @default 'small' */
  size?: 'small' | 'middle' | 'large'
}

export function SelectionControl (
  props: SelectionControlProps
) {
  return (
    <Wrapper>
      <Radio.Group
        optionType='button'
        defaultValue={props.defaultValue}
        onChange={(e) => {
          props.onChange && props.onChange(e)
        }}
        size={props.size || 'small'}
      >
        {props.options.map(({ value, label, icon, disabled }) => (
          <Radio.Button {...{ value, disabled, key: value }}>
            {icon}
            {label}
          </Radio.Button>
        ))}
      </Radio.Group>
    </Wrapper>
  )
}
