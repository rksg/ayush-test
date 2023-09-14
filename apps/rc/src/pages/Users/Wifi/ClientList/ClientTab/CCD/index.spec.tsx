import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, WifiUrlsInfo }        from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { mockApListByApGroup, mockVenueList } from './__tests__/fixtures'

import { ClientConnectionDiagnosis } from '.'


const params = {
  tenantId: '_tenantId_',
  venueId: '_venueId_'
}

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useParams: () => params
}))

describe('CCD', () => {
  const mockedGetVenuesFn = jest.fn()
  const mockGetApGroupFn = jest.fn()

  beforeEach(() => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getApGroupsListByGroup.url,
        (_, res, ctx) => {
          mockGetApGroupFn()
          return res(ctx.json({ ...mockApListByApGroup }))
        }
      ),
      rest.post(
        WifiUrlsInfo.getCcdSupportVenues.url,
        (_, res, ctx) => {
          mockedGetVenuesFn()
          return res(ctx.json([ ...mockVenueList ]))
        }
      )
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <ClientConnectionDiagnosis />
      </Provider>, { route: { params } }
    )

    await waitFor(() => expect(mockedGetVenuesFn).toBeCalled())
    const clientMacInput = await screen.findByRole('textbox', { name: /Client/ })
    expect(clientMacInput).toBeVisible()
    expect(await screen.findByRole('button', { name: 'Select' })).toBeDisabled()

    await userEvent.type(clientMacInput, '111111')
    await screen.findByText(/This field is invalid/)
    await userEvent.type(clientMacInput, '111111')

    // The AP "select" button is enable after the venue is selected
    const venueCombo = await screen.findByRole('combobox', { name: /Venue/ })
    await userEvent.click(venueCombo)
    await userEvent.click(await screen.findByText('CCD'))
    expect(await screen.findByRole('button', { name: 'Select' })).toBeEnabled()

    // click Clear button
    await userEvent.click(await screen.findByRole('button', { name: 'Clear' }))
    expect(await screen.findByRole('button', { name: 'Select' })).toBeDisabled()
  })

  it('should show AP Group selecter Drawer', async () => {
    render(
      <Provider>
        <ClientConnectionDiagnosis />
      </Provider>, { route: { params } }
    )

    await waitFor(() => expect(mockedGetVenuesFn).toBeCalled())
    const venueCombo = await screen.findByRole('combobox', { name: /Venue/ })
    await userEvent.click(venueCombo)
    await userEvent.click(await screen.findByText('CCD'))

    const apSelectedButton = await screen.findByRole('button', { name: 'Select' })
    expect(apSelectedButton).toBeEnabled()

    await userEvent.click(apSelectedButton)
    await waitFor(() => expect(mockGetApGroupFn).toBeCalled())

    expect(await screen.findByText(/Select Available APs/)).toBeVisible()
    expect(await screen.findByTitle('Ungrouped APs (2 APs)')).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))

    await userEvent.click(apSelectedButton)
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(screen.queryByText(/Select Available APs/)).toBeNull()
  })

})