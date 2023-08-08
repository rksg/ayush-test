import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { RadiusAttributeGroupUrlsInfo }                  from '@acx-ui/rc/utils'
import { Provider }                                      from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, within } from '@acx-ui/test-utils'

import { radiusAttributeList, vendorList } from '../AdaptivePolicyTable/__test__/fixtures'

import { attributeGroupReturnByQuery }    from './__test__/fixtures'
import { RadiusAttributeGroupFormDrawer } from './RadiusAttributeGroupFormDrawer'

describe('RadiusAttributeGroupFormDrawer', () => {

  it('should render drawer and add successfully', async () => {
    mockServer.use(
      rest.post(
        RadiusAttributeGroupUrlsInfo.getAttributeGroupsWithQuery.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(attributeGroupReturnByQuery))
      ),
      rest.post(
        RadiusAttributeGroupUrlsInfo.getAttributesWithQuery.url.split('?')[0],
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
    const input = await screen.findByRole('textbox', { name: 'Group Name' })
    await userEvent.type(input, 'testGroup')

    let addBtns = screen.getAllByText('Add')
    await userEvent.click(addBtns[0])
    await screen.findByText('Attribute Type')

    const inputs = await screen.findAllByRole('textbox')
    const attributeValue = inputs[2]
    await userEvent.type(attributeValue, '123')

    await screen.findByText('Common Attributes')
    const comboBoxes = await screen.findAllByRole('combobox')
    await userEvent.click(comboBoxes[0])
    await userEvent.click(await screen.findByText('UKERNA'))

    await userEvent.click(comboBoxes[1])
    await userEvent.click(await screen.findByText('Foundry-Privilege-Level (INTEGER)'))

    addBtns = screen.getAllByText('Add')
    await userEvent.click(addBtns[2])

    // eslint-disable-next-line max-len
    const row = await screen.findByRole('row', { name: new RegExp('Foundry-Privilege-Level') })
    fireEvent.click(within(row).getByRole('radio'))
    await userEvent.click(screen.getByText('Edit'))

    await userEvent.click(await screen.findByText('Done'))

    addBtns = screen.getAllByText('Add')
    await userEvent.click(addBtns[1])

    await screen.findByText('Group testGroup was added')
  })
})
