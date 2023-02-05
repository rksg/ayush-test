import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { RadiusAttributeGroupUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                     from '@acx-ui/store'
import {  mockServer, render, screen }  from '@acx-ui/test-utils'

import { groupList, vendorList }           from './__tests__/fixtures'
import { RadiusAttributeGroupSettingForm } from './RadiusAttributeGroupSettingForm'

describe('RadiusAttributeGroupSettingForm', () => {
  it('should render form successfully', async () => {
    mockServer.use(
      rest.get(
        RadiusAttributeGroupUrlsInfo.getAttributeGroups.url,
        (req, res, ctx) => res(ctx.json(groupList))
      ),
      rest.get(
        RadiusAttributeGroupUrlsInfo.getAttributeVendors.url,
        (req, res, ctx) => res(ctx.json(vendorList))
      )
    )

    render(
      <Provider>
        <Form>
          <RadiusAttributeGroupSettingForm />
        </Form>
      </Provider>
    )

    await userEvent.type(await screen.findByRole('textbox', { name: 'Policy Name' }), 'group-2')
  })
})
