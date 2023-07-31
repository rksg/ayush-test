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
  screen
} from '@acx-ui/test-utils'

import {
  sigPackData,
  successResponse
} from './__tests__/fixtures'

import ApplicationPolicyMgmt from '.'

describe('Application library Version Management', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    global.URL.createObjectURL = jest.fn()
    mockServer.use(
      rest.get(
        SigPackUrlsInfo.getSigPack.url.replace('?changesIncluded=:changesIncluded', ''),
        (req, res, ctx) => res(ctx.json(sigPackData))
      ),
      rest.get(
        SigPackUrlsInfo.exportAllSigPack.url,
        (req, res, ctx) => {
          return res(ctx.set({
            'content-disposition': 'attachment; filename=SIGPACK_export_20230118100829.csv',
            'content-type': 'text/csv;charset=ISO-8859-1'
          }), ctx.text('passphrase'))
        }
      ),
      rest.get(
        SigPackUrlsInfo.exportSigPack.url.replace('?type=:type', ''),
        (req, res, ctx) => {
          return res(ctx.set({
            'content-disposition': 'attachment; filename=SIGPACK_export_20230118100829.csv',
            'content-type': 'text/csv;charset=ISO-8859-1'
          }), ctx.text('passphrase'))
        }
      ),
      rest.patch(
        SigPackUrlsInfo.updateSigPack.url,
        (req, res, ctx) => {res(ctx.json(successResponse))}
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })

  it('should render correctly', async () => {
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
    // await userEvent.click((await screen.findAllByText('Export All'))[1])
    // await userEvent.click((await screen.findAllByText('Export Current List'))[1])
    // await userEvent.click(await screen.findByRole('button', { name: /Update/ }))
  })

})
