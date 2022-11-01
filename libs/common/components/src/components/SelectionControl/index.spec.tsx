import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import { SelectionControl } from '.'

describe('SelectionControl', () => {
  it('renders radio buttons', () => {
    const onChange = jest.fn()
    render(<SelectionControl
      onChange={onChange}
      options={[{
        label: 'l1',
        value: 'v1',
        disabled: true
      }, {
        label: 'l2',
        value: 'v2'
      }]}
    />)
    expect(screen.getByText('l1')).toBeVisible()
    expect(screen.getByText('l2')).toBeVisible()
    screen.getByText('l1').click()
    expect(onChange).not.toHaveBeenCalled()
    screen.getByText('l2').click()
    expect(onChange).toHaveBeenCalled()
    expect(onChange.mock.calls[0][0].target.value).toEqual('v2')
  })
})