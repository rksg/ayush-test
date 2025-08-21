import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { OltOnt }         from '@acx-ui/olt/utils'
import { Provider }       from '@acx-ui/store'
import { screen, render } from '@acx-ui/test-utils'

import { CageDetails } from './index'

const mockedDispatch = jest.fn()
jest.mock('@acx-ui/olt/components', () => ({
  CageDetailPageHeader: () => <div data-testid='CageDetailPageHeader' />,
  CageDetailsProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='CageDetailsProvider'>{children}</div>
  ),
  EditOntDrawer: ({ visible, onClose }: { visible: boolean, onClose: () => void }) =>
    visible ? <div data-testid='EditOntDrawer' onClick={onClose} /> : null,
  OntClientTab: () => <div data-testid='OntClientTab' />,
  OntDetailsDrawer: ({ visible, onClose }: { visible: boolean, onClose: () => void }) =>
    visible ? <div data-testid='OntDetailsDrawer' onClick={onClose} /> : null,
  OntInfoHeader: () => <div data-testid='OntInfoHeader' />,
  OntInfoWidget: () => <div data-testid='OntInfoWidget' />,
  OntOverviewTab: () => <div data-testid='OntOverviewTab' />,
  OntPortTab: () => <div data-testid='OntPortTab' />,
  OntTabs: () => <div data-testid='OntTabs' />,
  OntTable: ({ data, setSelectedOnt }: {
    data: OltOnt[], setSelectedOnt: jest.Mock }) => (
    <div data-testid='OntTable'>
      {data.map((ont) => (
        <div key={ont.id} onClick={() => setSelectedOnt(ont)}>{ont.name}</div>
      ))}
    </div>
  ),
  useCageDetails: () => ({
    state: {
      selectedOnt: { id: 'ont-id' },
      drawers: {
        ontDetails: true,
        editOnt: true
      }
    },
    dispatch: mockedDispatch
  })
}))

describe('CageDetails', () => {
  const params = { tenantId: 'tenant-id', oltId: 'olt-id' }

  beforeEach(() => {
    mockedDispatch.mockClear()
  })

  it('should render correctly', async () => {
    render(<Provider>
      <CageDetails />
    </Provider>, {
      route: { params }
    })

    expect(screen.getByTestId('CageDetailPageHeader')).toBeInTheDocument()
    expect(screen.getByTestId('OntTable')).toBeInTheDocument()
  })

  it('should render drawers and test onClose functionality', async () => {
    render(<Provider>
      <CageDetails />
    </Provider>, {
      route: { params }
    })

    expect(screen.getByTestId('CageDetailPageHeader')).toBeInTheDocument()
    expect(screen.getByTestId('EditOntDrawer')).toBeInTheDocument()
    expect(screen.getByTestId('OntDetailsDrawer')).toBeInTheDocument()

    await userEvent.click(screen.getByTestId('EditOntDrawer'))
    await userEvent.click(screen.getByTestId('OntDetailsDrawer'))
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'CLOSE_DRAWER',
      payload: 'editOnt'
    })
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'CLOSE_DRAWER',
      payload: 'ontDetails'
    })
  })

  it('should render ONT components when selectedOnt exists', async () => {
    render(<Provider>
      <CageDetails />
    </Provider>, {
      route: { params }
    })

    await userEvent.click(screen.getByText('ont_2'))
    expect(screen.getByTestId('OntInfoHeader')).toBeInTheDocument()
    expect(screen.getByTestId('OntInfoWidget')).toBeInTheDocument()
    expect(screen.getByTestId('OntTabs')).toBeInTheDocument()
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_SELECTED_ONT',
      payload: expect.objectContaining({
        id: 'ont-id-2',
        name: 'ont_2'
      })
    })
  })

})
