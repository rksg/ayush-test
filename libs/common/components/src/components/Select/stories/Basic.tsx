import { Select } from '..'

import { defaultProps, defaultOption } from './stories'


export function Basic () {
  return <Select
    {...defaultProps}
    options={defaultOption}
  />
}
