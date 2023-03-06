import { rest } from 'msw'

import { Provider }                   from '@acx-ui/store'
import { render, screen, mockServer } from '@acx-ui/test-utils'
import { Urls }                       from '@acx-ui/user'

import { CloudMessageBanner } from '.'

describe('cloud Message Banner', () => {
  const route = {
    params: { tenantId: '3061bd56e37445a8993ac834c01e2710' },
    path: '/:tenantId/'
  }
  beforeEach(() => {
    mockServer.use(
      rest.get(
        Urls.getCloudMessageBanner.url,
        (_, res, ctx) => res(ctx.json(
          {
            createdBy: 'd7fba54cb0e14c6cae48b90baf7e631c',
            createdDate: '2022-12-15T20:18:42.473+0000',
            // eslint-disable-next-line max-len
            description: 'we are aware of ongoing problem with User management, RUCKUS engineering is working on a solution',
            tenantType: 'MSP',
            id: 'MSP'
          }
        ))
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
})
