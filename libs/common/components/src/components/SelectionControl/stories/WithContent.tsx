import React, { useState } from 'react'

import { SelectionControl } from '..'

const options = [
  { value: 'value1', label: 'tab - 1' },
  { value: 'value2', label: 'tab - 2' },
  { value: 'value3', label: 'tab - 3' },
  { value: 'value4', label: 'tab - 4' },
  { value: 'value5', label: 'tab - 5' }
]

export function WithContent () {
  const [selected, setSelected] = useState(options[0].value)
  return (
    <>
      <SelectionControl
        onChange={(e) => {
          setSelected(e.target.value)
        }}
        options={options}
        defaultValue={options[0].value}
      />
      <p>
        Current tab is{' '}
        {options.find((option) => option.value === selected)?.label}
      </p>
    </>
  )
}
