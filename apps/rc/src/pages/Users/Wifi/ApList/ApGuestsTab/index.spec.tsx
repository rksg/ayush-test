import '@testing-library/jest-dom'
import { rest } from 'msw'

import { CommonUrlsInfo }                                 from '@acx-ui/rc/utils'
import { Provider }                                       from '@acx-ui/store'
import { mockServer, render, screen, waitFor, fireEvent } from '@acx-ui/test-utils'

import { GuestClient } from '../../__tests__/fixtures'
import { ApGuestsTab } from '.'

const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('AP Guest Tab', () => {
  let params: { tenantId: string }

  beforeEach(() => {
    mockServer.use(
        rest.post(
          CommonUrlsInfo.getGuestsList.url,
          (req, res, ctx) => res(ctx.json(GuestClient))
        )
      )
      params = {
        tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
      }
  })

  it('should render correctly', async () => {
    const { asFragment } = render(<Provider><ApGuestsTab /></Provider>, { route: { params } })
    expect(asFragment()).toMatchSnapshot()
  })

})
