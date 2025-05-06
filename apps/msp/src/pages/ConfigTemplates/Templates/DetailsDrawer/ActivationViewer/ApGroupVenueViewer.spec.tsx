import { render, screen } from '@acx-ui/test-utils'

import { ApGroupVenueViewer } from './ApGroupVenueViewer'

const mockUseVenueActivationNames = jest.fn()
jest.mock('./VenueActivationViewer', () => ({
  useVenueActivationNames: () => mockUseVenueActivationNames()
}))

describe('ApGroupVenueViewer', () => {
  const mockTemplateId = 'test-template-id'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should show loader when loading', () => {
    mockUseVenueActivationNames.mockReturnValue({
      names: [],
      isLoading: true
    })

    render(<ApGroupVenueViewer templateId={mockTemplateId} />)

    expect(screen.getByRole('img', { name: 'loader' })).toBeInTheDocument()
  })

  it('should correctly render the venue name', () => {
    mockUseVenueActivationNames.mockReturnValue({
      names: ['Venue 1'],
      isLoading: false
    })

    render(<ApGroupVenueViewer templateId={mockTemplateId} />)

    expect(screen.getByText('Venue 1')).toBeInTheDocument()
  })
})