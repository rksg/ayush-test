/* eslint-disable max-len */

import { render, screen } from '@acx-ui/test-utils'

import { Prerequisite } from '.'

jest.mock('./DiagramGallery', () => ({
  DiagramGallery: () => <div data-testid='diagram-gallery' />
}))

describe('PIN form > Prerequisite', () => {
  it('renders description', () => {
    render(<Prerequisite />)
    const description = screen.getByText(/The following list outlines the prerequisites for building a PIN service/)
    expect(description).toBeInTheDocument()
  })

  it('renders prerequisite list', () => {
    render(<Prerequisite />)

    screen.getByRole('heading', { name: 'Property Management' })
    screen.getByRole('heading', { name: 'Edge Cluster' })
    screen.getByText(/ensuring they use the selected DPSK service in the property management identity group/)
  })

  it('renders diagram gallery', () => {
    render(<Prerequisite />)
    const diagramGallery = screen.getByTestId('diagram-gallery')
    expect(diagramGallery).toBeInTheDocument()
  })
})