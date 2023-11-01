import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  SigPackUrlsInfo
} from '@acx-ui/rc/utils'
import {
  Provider
} from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import {
  sigPackData,
  successResponse
} from './__tests__/fixtures'

import ApplicationPolicyMgmt from '.'

const mockedExportFn = jest.fn()
const mockedExportAllFn = jest.fn()

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useExportSigPackMutation: () => ([ mockedExportFn ]),
  useExportAllSigPackMutation: () => ([ mockedExportAllFn ])
}))

describe('Application library Version Management', () => {
  const params = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

  beforeEach(async () => {
    mockServer.use(
      rest.get(
        SigPackUrlsInfo.getSigPack.url.replace('?changesIncluded=:changesIncluded', ''),
        (req, res, ctx) => res(ctx.json(sigPackData))
      )
    )
  })

  it('should render correctly', async () => {
    mockedExportFn.mockReturnValue({ unwrap: () => Promise.resolve() })
    mockedExportAllFn.mockReturnValue({ unwrap: () => Promise.resolve() })
    const updateFn = jest.fn()

    mockServer.use(
      rest.patch(
        SigPackUrlsInfo.updateSigPack.url,
        (req, res, ctx) => {
          updateFn()
          return res(ctx.json(successResponse))
        }
      )
    )

    render(
      <Provider>
        <ApplicationPolicyMgmt />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt' }
      })
    expect(await screen.findByText('Update Details')).toBeVisible()
    expect(await screen.findByText('ADDED_APP')).toBeVisible()
    await userEvent.click(await screen.findByText(/Category Update/))
    expect(await screen.findByText('UPDATED_APP')).toBeVisible()
    await userEvent.click(await screen.findByText(/Application Merged/))
    expect(await screen.findByText('MERGED_APP')).toBeVisible()
    await userEvent.click(await screen.findByText(/Application Removed/))
    expect(await screen.findByText('REMOVED_APP')).toBeVisible()
    await userEvent.click(await screen.findByText(/Application Name Changed/))
    expect(await screen.findByText('RENAMED_APP')).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'Export All' }))
    expect(mockedExportAllFn).toHaveBeenCalledTimes(1)

    await userEvent.click(screen.getByRole('button', { name: 'Export Current List' }))
    expect(mockedExportFn).toHaveBeenCalledTimes(1)

    await userEvent.click(screen.getByRole('button', { name: /Update/ }))

    expect(await screen.findByRole('dialog')).toBeVisible()
    await userEvent.type(screen.getByRole('textbox'), 'Update')
    await userEvent.click(screen.queryAllByRole('button', { name: /Update/ })[1])

    await waitFor(() => expect(updateFn).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

})
