import { storiesOf } from '@storybook/react'

import { Basic }               from './Basic'
import { WithDefaultGroup }    from './WithDefaultGroup'
import { WithinOptionalField } from './WithinOptionalField'
import { WithOptGroup }        from './WithOptGroup'
import { WithOptionGroup }     from './WithOptionGroup'

export const defaultProps = {
  style: { minWidth: 200 },
  placeholder: 'Select...'
}

export const defaultOption = [
  { label: 'option 1', value: 1 },
  { label: 'option 2', value: 2 },
  { label: 'option 3', value: 3 }
]

export const defaultGroupOption = [{
  label: 'option 1',
  value: 1
},{
  label: 'option 2',
  value: 2
}, {
  label: 'Group 1',
  options: [
    { label: 'option 3', value: 3 },
    { label: 'option 4', value: 4 },
    { label: 'option 5', value: 5 }
  ]
}]

export const normalGroupOption = [{
  label: 'Group 1',
  options: [
    { label: 'option 1', value: 1 },
    { label: 'option 2', value: 2 }
  ]
},{
  label: 'Group 2',
  options: [
    { label: 'option 3', value: 3 },
    { label: 'option 4', value: 4 },
    { label: 'option 5', value: 5 }
  ]
}]

storiesOf('Select', module)
  .add('Basic', Basic)
  .add('Within Optional Field', WithinOptionalField)
  .add('With Option Group', WithOptionGroup)
  .add('With Option Group (OptGroup)', WithOptGroup)
  .add('With Default Group', WithDefaultGroup)
