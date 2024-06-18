import { Form } from 'antd'
import { rest } from 'msw'

import { CommonUrlsInfo }             from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { mockVenueData } from '../../EdgeSettingForm/__tests__/fixtures'

import { EdgeClusterCommonForm } from '.'

describe('EdgeClusterCommonForm', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(mockVenueData))
      )
    )
  })

  it('Should render correctly', async () => {
    render(
      <Provider>
        <Form>
          <EdgeClusterCommonForm />
        </Form>
      </Provider>
    )
    // expect(await screen.findByRole('combobox', { name: 'Venue' })).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'Cluster Name' })).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'Description' })).toBeVisible()
  })
})