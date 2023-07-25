import React from 'react'

import { Checkbox }            from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'

import * as UI                   from '../../../../../../NetworkMoreSettings/styledComponents'
import { LABEL_OF_6GHZ, Option } from '../../RadioBandsOfMlo'

interface CustomCheckboxProps {
    options: Option[]
    isDisabledOptionOf6GHz: boolean
    onOptionChange: (event: CheckboxChangeEvent) => void
}


export const CustomCheckbox = (
  { options,
    isDisabledOptionOf6GHz,
    onOptionChange }: CustomCheckboxProps) => {
  const is6GHz = (searchOption: Option) => searchOption.label === LABEL_OF_6GHZ

  const CheckboxWithTooltip = (
    option: Option,
    onOptionChange: (event: CheckboxChangeEvent) => void
  ) => {
    return (
      <UI.CheckboxTooltip
        title={
          '6GHz only works when this network is using WPA3 or OWE encryption'
        }
        placement='topRight'
        style={{
          height: 10,
          marginLeft: -5,
          marginBottom: -3,
          display: 'flex'
        }}
      >
        <Checkbox
          key={option.index}
          name={option.name}
          defaultChecked={option.checked}
          checked={option.checked}
          disabled={option.disabled}
          onChange={onOptionChange}
        >
          {option.label}
        </Checkbox>
      </UI.CheckboxTooltip>
    )
  }

  return (
    <>
      {options.map((option) => {
        if (is6GHz(option) && isDisabledOptionOf6GHz) {
          return CheckboxWithTooltip(option, onOptionChange)
        }
        else {
          return (
            <Checkbox
              key={option.index}
              name={option.name}
              defaultChecked={option.checked}
              checked={option.checked}
              disabled={option.disabled}
              onChange={onOptionChange}
            >
              {option.label}
            </Checkbox>
          )
        }
      })}
    </>
  )
}