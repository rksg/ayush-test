import React from 'react'

import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'

import { NetworkDetails } from './NetworkDetails'

describe('NetworkDetails', () => {
  it('should render correctly', async () => {
    render(<NetworkDetails></NetworkDetails>)

    const title = screen.getByText('Lab Network')
    await waitFor(() => expect(title).toBeInTheDocument())
  })
})