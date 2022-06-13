import '@testing-library/jest-dom'
import { render, screen }          from '@testing-library/react'
import { BrowserRouter as Router } from 'react-router-dom'

import { Provider } from '@acx-ui/store'

import { NetworkDetails } from './NetworkDetails'

describe('NetworkDetails', () => {
  it('should render correctly', async () => {
    const { asFragment } = render(
      <Provider><Router><NetworkDetails></NetworkDetails></Router></Provider>
    )

    expect(asFragment()).toMatchSnapshot()
    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(6)
  })
})