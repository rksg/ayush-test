import userEvent from '@testing-library/user-event'

import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import { CageDetails } from './index'

const mockedUsedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
jest.mock('./OntOverviewTab', () => ({
  OntOverviewTab: () => <div data-testid='OntOverviewTab' />
}))
jest.mock('./OntPortTab', () => ({
  OntPortTab: () => <div data-testid='OntPortTab' />
}))
jest.mock('./OntClientTab', () => ({
  OntClientTab: () => <div data-testid='OntClientTab' />
}))
jest.mock('./CageDetailPageHeader', () => ({
  CageDetailPageHeader: () => <div data-testid='CageDetailPageHeader' />
}))

const mockOntTableProps = {
  data: [],
  selectedOnt: null,
  setSelectedOnt: jest.fn()
}

jest.mock('@acx-ui/olt/components', () => {
  const original = jest.requireActual('@acx-ui/olt/components')
  return {
    ...original,
    EditOntDrawer: ({ visible, onClose }: { visible: boolean, onClose: () => void }) =>
      visible ? <div data-testid='EditOntDrawer' onClick={onClose} /> : null,
    OntDetailsDrawer: ({ visible, onClose }: { visible: boolean, onClose: () => void }) =>
      visible ? <div data-testid='OntDetailsDrawer' onClick={onClose} /> : null,
    OntInfoWidget: ({ ontDetails }: { ontDetails: Record<string, unknown> }) =>
      ontDetails ? <div data-testid='OntInfoWidget' /> : null
  }
})

describe('CageDetails', () => {
  const params = { tenantId: 'tenant-id', oltId: 'olt-id' }

  beforeEach(() => {
    Object.assign(mockOntTableProps, {
      data: [],
      selectedOnt: null,
      setSelectedOnt: jest.fn()
    })
  })

  it('should render correctly', async () => {
    render(<Provider>
      <CageDetails />
    </Provider>, {
      route: { params }
    })

    expect(screen.getByTestId('CageDetailPageHeader')).toBeInTheDocument()
    expect(screen.getByText('ont_9')).toBeInTheDocument()
  })

  it('should render EditOntDrawer after clicking edit button', async () => {
    render(<Provider>
      <CageDetails />
    </Provider>, {
      route: { params }
    })

    expect(screen.getByTestId('CageDetailPageHeader')).toBeInTheDocument()

    const editButton = screen.getByText('Edit ONT')
    expect(editButton).toBeInTheDocument()
    await userEvent.click(editButton)
    expect(screen.getByTestId('EditOntDrawer')).toBeInTheDocument()

    await userEvent.click(screen.getByTestId('EditOntDrawer'))
    expect(screen.queryByTestId('EditOntDrawer')).toBeNull()
  })

  it('should render OntDetailsDrawer after clicking ont details button', async () => {
    render(<Provider>
      <CageDetails />
    </Provider>, {
      route: { params }
    })

    expect(screen.getByTestId('CageDetailPageHeader')).toBeInTheDocument()
    await userEvent.click(screen.getByText('ont_7'))

    const ontDetailsButton = screen.getByText('ONT Details')
    expect(ontDetailsButton).toBeInTheDocument()
    await userEvent.click(ontDetailsButton)
    expect(screen.getByTestId('OntDetailsDrawer')).toBeInTheDocument()

    await userEvent.click(screen.getByTestId('OntDetailsDrawer'))
    expect(screen.queryByTestId('OntDetailsDrawer')).toBeNull()
  })

  it('should render PortTab correctly', async () => {
    render(<Provider>
      <CageDetails />
    </Provider>, {
      route: { params }
    })

    expect(screen.getByTestId('CageDetailPageHeader')).toBeInTheDocument()
    await userEvent.click(screen.getByText('ont_7'))

    await userEvent.click(await screen.findByRole('tab', { name: 'Ports' }))
    expect(screen.getByTestId('OntPortTab')).toBeInTheDocument()
  })
})
