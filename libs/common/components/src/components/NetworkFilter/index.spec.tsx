import React from 'react'

import '@testing-library/jest-dom'

import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { NetworkFilter, CascaderProps } from './index'

describe('NetworkFilter', () => {
  const CustomCascader: React.FC<CascaderProps> = (props: CascaderProps) => (
    <NetworkFilter {...props} />
  )

  it('renders empty network filter with placeholder', async () => {
    const placeholder = 'test cascader'
    const option = [
      {
        value: 'n1',
        label: 'SSID 1'
      },
      {
        value: 'n2',
        label: 'SSID 2'
      }
    ]
    render(<CustomCascader placeholder={placeholder} options={option} />)

    expect(await screen.findByText(placeholder)).toBeVisible()
    fireEvent.click(await screen.findByRole('combobox', { name: '' }))
  })

})