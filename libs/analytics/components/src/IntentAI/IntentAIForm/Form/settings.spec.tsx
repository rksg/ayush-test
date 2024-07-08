import { render } from '@acx-ui/test-utils'

import { Settings } from './settings'
import { Priority } from './priority'
import { NamePath } from 'antd/es/form/interface'

describe('settings', () => {
  const name = Priority.fieldName as unknown as NamePath
  it('should match snapshot', () => {
    const { form } = renderFormHook()
    form.setFieldValue(name)
    const { asFragment } = renderForm(<Settings />, {
      initialValues: {
        intentType: 'clientDensity'
      }
    })
    expect(asFragment()).toMatchSnapshot()
  })
})
