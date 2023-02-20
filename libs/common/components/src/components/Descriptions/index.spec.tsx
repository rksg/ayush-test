import '@testing-library/jest-dom'

import { render } from '@testing-library/react'

import { Descriptions } from '.'

describe('Descriptions', () => {
  it('should render', () => {
    const { asFragment } = render(
      <Descriptions labelWidthPercent={30}>
        <Descriptions.Item
          label='S/N'
          children='932173000117'
        />
      </Descriptions>
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
