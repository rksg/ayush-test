import { Select } from '..'

import { defaultProps, defaultOption } from './stories'

export function WithinOptionField () {
  return <>
    <p>*need a empty option to reset value</p>
    <Select
      {...defaultProps}
      options={[
        { label: 'Select...', value: '' },
        ...defaultOption
      ]}
    />
  </>
}
