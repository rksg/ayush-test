import { rest } from 'msw'

import { FirmwareUrlsInfo }           from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { render, screen, mockServer } from '@acx-ui/test-utils'
import { UserUrlsInfo }               from '@acx-ui/user'

import {
  allUserSettings,
  cloudMessageBanner,
  cloudVersion,
  scheduleVersion,
  switchVenueVersionList
} from './__tests__/fixtures'

import { CloudMessageBanner } from '.'

describe('cloud Message Banner', () => {
  const route = {
    params: { tenantId: '3061bd56e37445a8993ac834c01e2710' },
    path: '/:tenantId/'
  }
  beforeEach(() => {
    mockServer.use(
      rest.get(
        UserUrlsInfo.getCloudMessageBanner.url,
        (_, res, ctx) => res(ctx.json(cloudMessageBanner))
      ),
      rest.get(
        UserUrlsInfo.getAllUserSettings.url,
        (_, res, ctx) => res(ctx.json(allUserSettings))
      ),
      rest.get(
        UserUrlsInfo.getCloudVersion.url,
        (_, res, ctx) => res(ctx.json(cloudVersion))
      ),
      rest.get(
        UserUrlsInfo.getCloudScheduleVersion.url,
        (_, res, ctx) => res(ctx.json(scheduleVersion))
      ),
      rest.post(
        FirmwareUrlsInfo.getSwitchVenueVersionList.url,
        (_, res, ctx) => res(ctx.json(switchVenueVersionList))
      )
    )
  })
  it('should render message banner', async () => {
    render(<Provider><CloudMessageBanner /></Provider>, { route })
    // const buttons = screen.getAllByRole('img') as HTMLImageElement[]
    // fireEvent.click(buttons[1])
    expect(screen.queryAllByRole('img')).toStrictEqual([])
    expect(screen.queryByTestId('close-button')).toBeNull()
    // eslint-disable-next-line max-len
    await screen.findAllByText('we are aware of ongoing problem with User management, RUCKUS engineering is working on a solution')
  })
  it('should render upgrade schedule message', async () => {
    mockServer.use(
      rest.get(
        UserUrlsInfo.getCloudMessageBanner.url,
        (_, res, ctx) => res(ctx.json(null))
      )
    )
    render(<Provider><CloudMessageBanner /></Provider>, { route })
    await screen.findAllByText('An upgrade schedule for the new firmware version is available.')
  })
})
