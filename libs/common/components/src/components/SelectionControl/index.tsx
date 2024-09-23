import React from 'react'

import { Radio, RadioChangeEvent } from 'antd'

import { Tooltip } from '../Tooltip'

import { Wrapper, Container } from './styledComponents'

export interface SelectionControlOptionProps {
  label: React.ReactNode
  value: string
  icon?: React.ReactNode
  disabled?: boolean
  noPadding?: boolean
  tooltip?: string
}

export interface SelectionControlProps {
  defaultValue?: string
  options: SelectionControlOptionProps[]
  onChange?: (e: RadioChangeEvent) => void
  /** @default 'small' */
  size?: 'small' | 'large'
  value?: string
  extra?: React.ReactNode;
  noPadding?: boolean
}

export function SelectionControl (
  props: SelectionControlProps
) {
  return (
    <Wrapper noPadding={props.noPadding}>
      <Radio.Group
        optionType='button'
        defaultValue={props.defaultValue}
        onChange={(e) => {
          props.onChange && props.onChange(e)
        }}
        size={props.size || 'small'}
        value={props.value}
      >
        {props.options.map(({ value, label, icon, disabled, tooltip }) => {
          if(tooltip){
            return (
              <Tooltip
                title={tooltip}
                mouseEnterDelay={1}
              >
                <Radio.Button {...{ value, disabled, key: value }}>
                  {icon}
                  {label}
                </Radio.Button>
              </Tooltip>
            )
          }else{
            return (
              <Radio.Button {...{ value, disabled, key: value }}>
                {icon}
                {label}
              </Radio.Button>
            )
          }
        })}
      </Radio.Group>
      {props.extra ?
        <Container>{props.extra}</Container> : null}
    </Wrapper>
  )
}
