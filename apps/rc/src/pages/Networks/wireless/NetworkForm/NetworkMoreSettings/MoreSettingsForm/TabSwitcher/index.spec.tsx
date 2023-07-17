import React from 'react'

import { fireEvent } from '@testing-library/react'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import TabSwitcher from '.'

describe('TabSwitcher', () => {
  const defaultValue = 'VLAN'
  const handleSelectedTabValueChange = jest.fn((value: string) => {
    const tabs = screen.getAllByRole('tab')
    tabs.find(tab => tab.id.indexOf(value) !== -1)?.setAttribute('aria-selected', 'true')
  })

  it('renders the component with tabs', () => {
    render(
      <Provider>
        <TabSwitcher
          handleSelectedTabValueChange={jest.fn}
          defaultValue={defaultValue}
        />
      </Provider>
    )

    expect(screen.getByText('VLAN')).toBeInTheDocument()
    expect(screen.getByText('Network Control')).toBeInTheDocument()
    expect(screen.getByText('Radio')).toBeInTheDocument()
    expect(screen.getByText('Networking')).toBeInTheDocument()
    expect(screen.getByText('Radius Options')).toBeInTheDocument()
    expect(screen.getByText('User Connection')).toBeInTheDocument()

    expect(screen.getByText('Advanced')).toBeInTheDocument()
    expect(screen.queryAllByRole('tab')).toHaveLength(7)

    expect(screen.getByText(/VLAN/i)).toBeVisible()
    expect(screen.getByText(/Network Control/i)).toBeVisible()
    expect(screen.getByText(/Radio/i)).toBeVisible()
    expect(screen.getByText(/Networking/i)).toBeVisible()
    expect(screen.getByText(/Radius Options/i)).toBeVisible()
    expect(screen.getByText(/User Connection/i)).toBeVisible()

  })

  it('the default value of tabs is VLAN', () => {
    render(
      <Provider>
        <TabSwitcher
          handleSelectedTabValueChange={handleSelectedTabValueChange}
          defaultValue={defaultValue}
        />
      </Provider>
    )

    const tabs = screen.getAllByRole('tab')
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
    tabs.filter(tab => tab.tabIndex !== 0)
      .forEach(tab => expect(tab).toHaveAttribute('aria-selected', 'false'))
  })

  it('calls handleSelectedTabValueChange when a tab is clicked', () => {
    render(
      <Provider>
        <TabSwitcher
          handleSelectedTabValueChange={handleSelectedTabValueChange}
          defaultValue={defaultValue}
        />
      </Provider>
    )

    // Simulate clicking on the 'Network Control' tab
    fireEvent.click(screen.getByText('Network Control'))

    expect(handleSelectedTabValueChange).toHaveBeenCalledWith('Network Control')
    expect(handleSelectedTabValueChange).toBeCalledTimes(1)
    const tabs = screen.getAllByRole('tab')
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
    tabs.filter(tab => tab.tabIndex !== 0)
      .forEach(tab => expect(tab).toHaveAttribute('aria-selected', 'false'))
  })
})
