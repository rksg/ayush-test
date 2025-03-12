/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { PropertyConfigs, PropertyUrlsInfo, ResidentPortalType } from '@acx-ui/rc/utils'
import { Provider }                                              from '@acx-ui/store'
import { mockServer, render, screen, waitFor }                   from '@acx-ui/test-utils'

import { PropertyManagementDrawer } from './PropertyManagementDrawer'

const mockPropertyFormInitialValuesFn = jest.fn()
jest.mock('@acx-ui/rc/components', () => {
  const originComponents = jest.requireActual('@acx-ui/rc/components')
  return {
    getInitialPropertyFormValues: originComponents.getInitialPropertyFormValues,
    toResidentPortalPayload: originComponents.toResidentPortalPayload,
    useRegisterMessageTemplates: originComponents.useRegisterMessageTemplates,
    PropertyManagementForm: (props: {
      venueId: string
      initialValues: PropertyConfigs
    }) => {
      mockPropertyFormInitialValuesFn(props.initialValues)
      return <div data-testid='PropertyManagementForm'>
        <span>{'venueId:' + props.venueId}</span>
        <span>{'initialValues:' + JSON.stringify(props.initialValues)}</span>
      </div>}
  }
})

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useGetVenueQuery: jest.fn(() => ({ data: { name: 'Test Venue', description: 'Test Description', address: 'Test Address' } })),
  useGetPropertyConfigsQuery: jest.fn(() => ({ data: { unitConfig: {}, communicationConfig: {} } }))
}))

describe('PropertyManagementDrawer', () => {

  beforeEach(() => {
    mockPropertyFormInitialValuesFn.mockClear()
  })

  it('should render the drawer with the correct title and close button', () => {
    render(<Provider>
      <PropertyManagementDrawer venueId='123' visible={true} setVisible={jest.fn()} />
    </Provider>)
    expect(screen.getByText('Property Management: Test Venue')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('should call the close function when the close button is clicked', async () => {
    const setVisible = jest.fn()
    render(<Provider>
      <PropertyManagementDrawer venueId='123' visible={true} setVisible={setVisible} />
    </Provider>)
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(setVisible).toHaveBeenCalledWith(false)
  })

  it('should call the handleSubmit function when the activate button is clicked', async () => {
    const updatePropertyConfigs = jest.fn()
    const setVisible = jest.fn()
    mockServer.use(
      rest.put(
        PropertyUrlsInfo.updatePropertyConfigs.url,
        (_req, res, ctx) => {
          updatePropertyConfigs()
          return res(ctx.status(202))
        })
    )

    render(<Provider>
      <PropertyManagementDrawer venueId='123' visible={true} setVisible={setVisible} />
    </Provider>)

    await userEvent.click(screen.getByRole('button', { name: 'Activate' }))
    expect(updatePropertyConfigs).toHaveBeenCalled()
    await waitFor(() => expect(setVisible).toHaveBeenCalledWith(false))
  })

  it('should correctly dislay with PropertyManagementForm', async () => {
    render(<Provider>
      <PropertyManagementDrawer venueId='123' visible={true} setVisible={jest.fn()} />
    </Provider>)
    const propertyForm = screen.getByTestId('PropertyManagementForm')
    expect(propertyForm).toHaveTextContent('venueId:123')
    expect(mockPropertyFormInitialValuesFn).toHaveBeenCalledWith({
      status: 'DISABLED',
      residentPortalType: ResidentPortalType.NO_PORTAL,
      unitConfig: {},
      communicationConfig: {}
    })
  })
})