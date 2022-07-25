import React from 'react'

import '@testing-library/jest-dom'

import { render, screen } from '@acx-ui/test-utils'

import { NetworkFilter, CascaderProps } from './index'

describe('HierarchyCascader', () => {
  const CustomCascader: React.FC<CascaderProps> = (props) => (<NetworkFilter {...props} />)

  it('renders hierachy cascader', async () => {
    const onMock = jest.fn()
    const placeholder = 'test cascader'
    render(<CustomCascader placeholder={placeholder} onApply={onMock} onCancel={onMock}/>)

    expect(await screen.findAllByPlaceholderText(placeholder)).toBeVisible()
  })

})