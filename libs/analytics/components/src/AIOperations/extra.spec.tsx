import { BrowserRouter } from 'react-router-dom'

import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { OptimalConfiguration, OptimalConfigurationWithData, NoAiOpsLicense, optimalConfigurationText } from './extra'

describe('OptimalConfiguration', () => {
  it('should render correctly with the prop', () => {
    const { asFragment } = render(<OptimalConfiguration text={optimalConfigurationText}/>)
    expect(asFragment()).toMatchSnapshot()
  })
})

describe('OptimalConfigurationWithData', () => {
  it('should render correctly with the prop', () => {
    const { asFragment } = render(<OptimalConfigurationWithData />)
    expect(asFragment()).toMatchSnapshot()
  })
})

describe('NoAiOpsLicense', () => {
  it('should render correctly with the prop', () => {
    const { asFragment } = render(<BrowserRouter>
      <NoAiOpsLicense />
    </BrowserRouter>)
    expect(asFragment()).toMatchSnapshot()
    const button = screen.getByRole('button', {
      name: /update my licenses/i
    })
    fireEvent.click(button)
  })
})
