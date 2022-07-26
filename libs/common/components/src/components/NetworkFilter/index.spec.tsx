import React from 'react'

import '@testing-library/jest-dom'

import { render, screen } from '@acx-ui/test-utils'

import { NetworkFilter, CascaderProps } from './index'

describe('NetworkFilter', () => {
  const CustomCascader: React.FC<CascaderProps> = (props: CascaderProps) => (
    <NetworkFilter {...props} />
  )

  it('renders network filter', async () => {
    const placeholder = 'test cascader'
    render(<CustomCascader placeholder={placeholder} />)

    expect(await screen.findAllByText(placeholder)).toBeTruthy()
  })

})