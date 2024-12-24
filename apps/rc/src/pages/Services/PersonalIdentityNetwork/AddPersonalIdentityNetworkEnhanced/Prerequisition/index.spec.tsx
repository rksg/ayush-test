/* eslint-disable max-len */

import { render, screen } from '@acx-ui/test-utils'

import { Prerequisition } from './'

jest.mock('./DiagramGallery', () => ({
  DiagramGallery: () => <div data-testid='diagram-gallery' />
}))

describe('PIN form > Prerequisition', () => {
  it('renders description', () => {
    render(<Prerequisition />)
    const description = screen.getByText(/The following list outlines the prerequisites for building a PIN service/)
    expect(description).toBeInTheDocument()
  })

  it('renders prerequisite list', () => {
    render(<Prerequisition />)

    screen.getByRole('heading', { name: 'Property Management' })
    screen.getByRole('heading', { name: 'Edge Cluster' })
    screen.getByText(/ensuring they use the selected DPSK service in the property management identity group/)
  })

  it('renders diagram gallery', () => {
    render(<Prerequisition />)
    const diagramGallery = screen.getByTestId('diagram-gallery')
    expect(diagramGallery).toBeInTheDocument()
  })
})