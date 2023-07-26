import React from 'react'

import { render, screen } from '@acx-ui/test-utils'

import CustomCheckbox from '.'

const options = [
  // eslint-disable-next-line max-len
  { index: 1, name: 'option1', label: 'Option 1', value: 'value1', checked: true, disabled: false },
  { index: 2, name: 'option2', label: 'Option 2', value: 'value2', checked: true, disabled: false },
  { index: 3, name: 'option3', label: 'Option 3', value: 'value3', checked: false, disabled: true }
]

describe('CustomCheckbox', () => {
  it('should render correctly when isDisabledOptionOf6GHz is true', () => {
    const isDisabledOptionOf6GHz = true
    const onOptionChange = jest.fn()

    render(
      <CustomCheckbox
        options={options}
        isDisabledOptionOf6GHz={isDisabledOptionOf6GHz}
        onOptionChange={onOptionChange}
      />
    )

    const optionElements = screen.getAllByRole('checkbox')
    expect(optionElements.length).toBe(3)
    expect(optionElements[0]).toBeEnabled()
    expect(optionElements[1]).toBeEnabled()
    expect(optionElements[2]).toBeDisabled()
  })

  it('should render correctly when isDisabledOptionOf6GHz is false', () => {
    const isDisabledOptionOf6GHz = false
    const onOptionChange = jest.fn()

    render(
      <CustomCheckbox
        options={options}
        isDisabledOptionOf6GHz={isDisabledOptionOf6GHz}
        onOptionChange={onOptionChange}
      />
    )

    const optionElements = screen.getAllByRole('checkbox')
    expect(optionElements.length).toBe(3)
    expect(optionElements[0]).toBeEnabled()
    expect(optionElements[1]).toBeEnabled()
    expect(optionElements[2]).toBeDisabled()
  })
})
