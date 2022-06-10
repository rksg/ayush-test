import '@testing-library/jest-dom'
import { render, screen }          from '@testing-library/react'
import { BrowserRouter as Router } from 'react-router-dom'

import { Provider } from '@acx-ui/store'

import NetworkTabs from './NetworkTabs'

describe('NetworkTabs', () => {
  it('should render correctly', async () => {
    const { asFragment } = render(<Provider><Router><NetworkTabs></NetworkTabs></Router></Provider>)
    
    expect(asFragment()).toMatchSnapshot()
    await screen.findByText('Overview')
    await screen.findByText('APs (0)')
    await screen.findByText('Venues (0)')
    await screen.findByText('Services (0)')
    await screen.findByText('Events')
    await screen.findByText('Incidents')
  })
})