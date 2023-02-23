import { screen } from '@acx-ui/test-utils'

import { renderForm } from '../../__tests__/fixtures'

import { TestType } from './TestType'

jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ children, ...props }: React.PropsWithChildren) => (
    <select {...props}>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      <option value={undefined}></option>
      {children}
    </select>
  )
  Select.Option = 'option'
  return { ...components, Select }
})

describe('TestType', () => {
  it('render field', async () => {
    renderForm(<TestType />)

    expect(screen.getAllByRole('option', {
      name: (_, el) => (el as HTMLInputElement).value !== ''
    })).toHaveLength(2)
  })
})
