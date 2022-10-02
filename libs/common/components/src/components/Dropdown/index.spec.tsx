import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent          from '@testing-library/user-event'
import { Menu }           from 'antd'

import { regionMenu } from './stories'

import { Dropdown } from '.'

describe('Dropdown', () => {
  it('renders dropdown and handle events', async () => {
    const mockLog = jest.spyOn(console, 'log').mockImplementation(() => {})
    render(
      <Dropdown overlay={regionMenu}>{(selectedKeys) =>
        <span data-testid='trigger'>{selectedKeys}</span>
      }</Dropdown>
    )
    const trigger = screen.getByTestId('trigger')
    expect(trigger).toHaveTextContent('EU')
    await userEvent.click(trigger)
    await userEvent.click(screen.getByRole('menuitem', { name: 'Asia' }))
    expect(trigger).toHaveTextContent('Asia')
    expect(mockLog).toHaveBeenCalledWith(expect.objectContaining({ domEvent: expect.anything() }))
  })

  it('renders null if there are no selected items', () => {
    const menu = <Menu items={[ { key: 'US', label: 'US' } ]} />
    render(
      <Dropdown overlay={menu}>{(selectedKeys) =>
        <span data-testid='trigger'>{selectedKeys}</span>
      }</Dropdown>
    )
    expect(screen.getByTestId('trigger')).toHaveTextContent('')
  })
})
