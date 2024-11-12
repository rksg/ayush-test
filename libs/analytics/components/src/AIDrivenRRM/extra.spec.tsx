import { BrowserRouter } from 'react-router-dom'

import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { NoZones, NoRRMLicense } from './extra'

describe('NoZones', () => {
  it('should render correctly with the prop', () => {
    const { asFragment } = render(<NoZones />)
    expect(asFragment()).toMatchSnapshot()
  })
})

describe('NoRRMLicense', () => {
  it('should render correctly with the prop', () => {
    const { asFragment } = render(<BrowserRouter>
      <NoRRMLicense />
    </BrowserRouter>)
    expect(asFragment()).toMatchSnapshot()
    const button = screen.getByRole('button', {
      name: /update my licenses/i
    })
    fireEvent.click(button)
  })
})
