import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo }             from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { mockVenueData } from './__tests__/fixtures'

import EdgeSettingForm from './index'

describe('EdgeSettingForm', () => {
  let params: { tenantId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(mockVenueData))
      )
    )
  })

  it('should create EdgeSettingForm successfully', async () => {
    const { asFragment } = render(
      <Provider>
        <EdgeSettingForm />
      </Provider>, { route: { params } }
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('should create EdgeSettingForm with edit mode successfully', async () => {
    const { asFragment } = render(
      <Provider>
        <EdgeSettingForm isEdit />
      </Provider>, { route: { params } }
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render init data correctly', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeSettingForm />
      </Provider>, { route: { params } }
    )
    const venueDropdown = screen.getByRole('combobox', { name: 'Venue' })
    await user.click(venueDropdown)
    await screen.findByText('Mock Venue 1')
    await screen.findByText('Mock Venue 2')
    await screen.findByText('Mock Venue 3')
    const edgeGroupDropdown = screen.getByRole('combobox', { name: 'SmartEdge Group' })
    await user.click(edgeGroupDropdown)
    await screen.findByText('Mock Group 1')
    await screen.findByText('Mock Group 2')
    await screen.findByText('Mock Group 3')
  })
})