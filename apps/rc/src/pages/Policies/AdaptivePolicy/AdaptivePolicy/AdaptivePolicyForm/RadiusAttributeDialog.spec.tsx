import { waitForElementToBeRemoved } from '@testing-library/react'
import userEvent                     from '@testing-library/user-event'
import { rest }                      from 'msw'

import {
  DataType,
  OperatorType,
  RadiusAttributeGroupUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { radiusAttributeList, vendorList } from '../AdaptivePolicyTable/__test__/fixtures'

import { RadiusAttributeDialog } from './RadiusAttributeDialog'

describe('RadiusAttributeDialog', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        RadiusAttributeGroupUrlsInfo.getAttributeVendors.url,
        (req, res, ctx) => res(ctx.json(vendorList))
      ),
      rest.post(
        RadiusAttributeGroupUrlsInfo.getAttributesWithQuery.url,
        (req, res, ctx) => res(ctx.json(radiusAttributeList))
      )
    )
  })

  it('should submit the drawer successfully', async () => {
    render(
      <Provider>
        <RadiusAttributeDialog
          visible={true}
          onCancel={jest.fn()}
          setAttributeAssignments={jest.fn()}
          getAttributeAssignments={jest.fn()}/>
      </Provider>,
      {
        route: { params: {
          tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
        }, path: '/:tenantId' }
      }
    )

    const inputs = await screen.findAllByRole('textbox')
    await userEvent.type(inputs[1], '123')

    const comboBoxes = await screen.findAllByRole('combobox')
    const attributeType = comboBoxes[0]
    await userEvent.click(attributeType)

    const treeNodes = await screen.findAllByRole('img')
    await userEvent.click(treeNodes[0])

    await waitForElementToBeRemoved(await screen.findByRole('img', { name: 'loading' }))

    await userEvent.click(await screen.findByText('Foundry-Privilege-Level (INTEGER)'))

    await userEvent.click(screen.getByText('Add'))
  })

  it('should show edit the drawer successfully', async () => {
    const editAttribute = {
      attributeName: 'attributeName1',
      attributeValue: 'test',
      dataType: DataType.BYTE,
      operator: OperatorType.DOES_NOT_EXIST
    }

    render(
      <Provider>
        <RadiusAttributeDialog
          visible={true}
          onCancel={jest.fn()}
          isEdit={true}
          setAttributeAssignments={jest.fn()}
          editAttribute={editAttribute}
          getAttributeAssignments={jest.fn()}/>
      </Provider>,
      {
        route: { params: {
          tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
        }, path: '/:tenantId' }
      }
    )
  })
})
