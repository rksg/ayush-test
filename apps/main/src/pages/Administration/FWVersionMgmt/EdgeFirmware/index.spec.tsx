import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  EdgeUrlsInfo
} from '@acx-ui/rc/utils'
import {
  Provider
} from '@acx-ui/store'
import {
  mockServer,
  render,
  screen, within
} from '@acx-ui/test-utils'


import {
  availableVersions, latestReleaseVersions, venueFirmwareList
} from './__tests__/fixtures'

import EdgeFirmware from '.'

type MockSelectProps = React.PropsWithChildren<{
  onChange?: (value: string) => void
  options?: Array<{ label: string, value: unknown }>
}>
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ children, onChange, options, ...props }: MockSelectProps) => (
    <select {...props} onChange={(e) => onChange?.(e.target.value)}>
      {children ? <><option value={undefined}></option>{children}</> : null}
      {options?.map((option, index) => (
        <option key={`option-${index}`} value={option.value as string}>{option.label}</option>
      ))}
    </select>
  )
  Select.Option = 'option'
  return { ...components, Select }
})

describe('Firmware Venues Table', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        EdgeUrlsInfo.getLatestEdgeFirmware.url,
        (req, res, ctx) => res(ctx.json(latestReleaseVersions))
      ),
      rest.get(
        EdgeUrlsInfo.getVenueEdgeFirmwareList.url,
        (req, res, ctx) => res(ctx.json(venueFirmwareList))
      ),
      rest.get(
        EdgeUrlsInfo.getAvailableEdgeFirmwareVersions.url,
        (req, res, ctx) => res(ctx.json(availableVersions))
      ),
      rest.post(
        EdgeUrlsInfo.updateEdgeFirmware.url,
        (req, res, ctx) => res(ctx.status(202))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })

  it('should render table', async () => {
    render(
      <Provider>
        <EdgeFirmware />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt' }
      })

    await screen.findByText('Latest Version: 1.0.0.1710')
    await screen.findByText('Release(Recommended)-02/02/2023')
    const row = await screen.findAllByRole('row', { name: /My-Venue/i })
    expect(row.length).toBe(3)
  })

  it('should update selected row', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeFirmware />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt' }
      })

    const row = await screen.findByRole('row', { name: /My-Venue1/i })
    await user.click(within(row).getByRole('checkbox'))

    const updateButton = await screen.findByRole('button', { name: /Update Now/i })
    await user.click(updateButton)

    const updateDialog = await screen.findByRole('dialog')
    await within(updateDialog)
      .findByText(/1.0.0.1710/i)
    const updateVenueButton = await screen.findByText('Run Update')
    await user.click(updateVenueButton)
  })

  it('should not show update now button', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeFirmware />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt' }
      })

    const row = await screen.findByRole('row', { name: /My-Venue3/i })
    await user.click(within(row).getByRole('checkbox'))

    expect(screen.queryByRole('button', { name: /Update Now/i })).toBeNull()
  })

  it('should cancel update', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeFirmware />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt' }
      })

    const row = await screen.findByRole('row', { name: /My-Venue1/i })
    await user.click(within(row).getByRole('checkbox'))

    const updateButton = await screen.findByRole('button', { name: /Update Now/i })
    await user.click(updateButton)

    await screen.findByText('Active Device')
    const updateDialog = await screen.findByRole('dialog')
    const cancelButton = await within(updateDialog).findByRole('button', { name: 'Cancel' })
    await user.click(cancelButton)
  })
})
