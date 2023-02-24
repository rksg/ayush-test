import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { RadiusAttributeGroupUrlsInfo }                                             from '@acx-ui/rc/utils'
import { Provider }                                                                 from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import { radiusAttributeList, vendorList } from '../AdaptivePolicyTable/__test__/fixtures'

import { groupList }                      from './__test__/fixtures'
import { RadiusAttributeGroupFormDrawer } from './RadiusAttributeGroupFormDrawer'

describe('RadiusAttributeGroupFormDrawer', () => {

  it('should render drawer and add successfully', async () => {
    mockServer.use(
      rest.get(
        RadiusAttributeGroupUrlsInfo.getAttributeGroups.url,
        (req, res, ctx) => res(ctx.json(groupList))
      ),
      rest.post(
        RadiusAttributeGroupUrlsInfo.getAttributeGroupsWithQuery.url,
        (req, res, ctx) => res(ctx.json(groupList))
      ),
      rest.post(
        RadiusAttributeGroupUrlsInfo.getAttributesWithQuery.url,
        (req, res, ctx) => res(ctx.json(radiusAttributeList))
      ),
      rest.get(
        RadiusAttributeGroupUrlsInfo.getAttributeVendors.url,
        (req, res, ctx) => res(ctx.json(vendorList))
      ),
      rest.post(
        RadiusAttributeGroupUrlsInfo.createAttributeGroup.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )

    render(
      <Provider>
        <RadiusAttributeGroupFormDrawer
          visible={true}
          setVisible={jest.fn()}/>
      </Provider>,
      {
        route: { params: {
          tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
        }, path: '/:tenantId' }
      }
    )

    // set group name
    const input = await screen.findByRole('textbox', { name: 'Policy Name' })
    await userEvent.type(input, 'testPolicy')

    // add attribute
    let addButtons = await screen.findAllByText('Add')
    const addAttributeBtn = addButtons[0]
    await userEvent.click(addAttributeBtn)

    const comboBox = await screen.findByRole('combobox', { name: 'Attribute Type' })
    await userEvent.click(comboBox)

    const treeNodes = await screen.findAllByRole('img')
    await userEvent.click(treeNodes[1])

    await waitForElementToBeRemoved(await screen.findByRole('img', { name: 'loading' }))

    await userEvent.click(await screen.findByText(radiusAttributeList.data[0].name))

    // set attribute value
    const inputs = await screen.findAllByRole('textbox')
    await userEvent.type(inputs[2], 'testValue')

    addButtons = await screen.findAllByText('Add')
    await userEvent.click(addButtons[2])

    // eslint-disable-next-line max-len
    const row = await screen.findByRole('row', { name: new RegExp(radiusAttributeList.data[0].name) })
    fireEvent.click(within(row).getByRole('radio'))
    await userEvent.click(await screen.findByText('Edit'))
    await userEvent.click(await screen.findByText('Done'))

    await userEvent.click(addButtons[1])

    await screen.findByText('Group testPolicy was added')
  })
})
