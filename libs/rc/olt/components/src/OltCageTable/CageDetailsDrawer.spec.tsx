import  userEvent from '@testing-library/user-event'
// import { rest }   from 'msw'

import { OltFixtures } from '@acx-ui/olt/utils'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Provider, store }                    from '@acx-ui/store'
import { mockServer, render, screen, within } from '@acx-ui/test-utils'

import { CageDetailsDrawer } from './CageDetailsDrawer'
const { mockOlt, mockOnuList, mockOltCageList } = OltFixtures

describe('CageDetailsDrawer', () => {
  const defaultProps = {
    visible: true,
    setVisible: jest.fn(),
    oltDetails: mockOlt,
    currentCage: mockOltCageList[0]
  }

  beforeEach(() => {
    mockServer.use(
    )
  })

  it('should correctly render ONU', async () => {

    render(<Provider>
      <CageDetailsDrawer {...defaultProps} />
    </Provider>)
    expect(screen.getByText('S1/1')).toBeInTheDocument()
    // await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const row = screen.getByRole('row', { name: /ont_9 3/ })
    expect(row).toBeVisible()
    screen.getByRole('row', { name: /ont_7 1/ })
  })

  it('renders with invalid props (missing currentCage)', () => {
    const props = {
      ...defaultProps,
      currentCage: undefined
    }
    render(<Provider>
      <CageDetailsDrawer {...props} />
    </Provider>)
    expect(screen.queryByText('S1/1')).toBeNull()
  })

  it('calls onClose function when closed', async () => {
    render(<Provider>
      <CageDetailsDrawer {...defaultProps} />
    </Provider>)
    const closeButton = screen.getByRole('button', { name: 'Close' })
    await userEvent.click(closeButton)
    expect(defaultProps.setVisible).toHaveBeenCalledTimes(1)
    expect(defaultProps.setVisible).toHaveBeenCalledWith(false)
  })

  it('show ONU port list when an ONU is clicked', async () => {
    render(<Provider>
      <CageDetailsDrawer {...defaultProps} />
    </Provider>)
    const onuRow = await screen.findByRole('row', { name: /ont_9/ })
    await userEvent.click(within(onuRow).getByRole('button', { name: mockOnuList[0].name }))
    expect(screen.getByRole('heading', { name: 'ont_9' })).toBeInTheDocument()
    expect(screen.getByText('Ports (3)')).toBeInTheDocument()
  })
})