import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { DataType, OperatorType, RadiusAttributeGroupUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                             from '@acx-ui/store'
import { render, screen }                                       from '@acx-ui/test-utils'

import { attributeList, vendorList } from './__tests__/fixtures'
import { RadiusAttributeDrawer }     from './RadiusAttributeDrawer'


describe('RadiusAttributeDrawer', () => {

  beforeEach(async () => {
    rest.post(
      RadiusAttributeGroupUrlsInfo.getAttributesWithQuery.url,
      (req, res, ctx) => res(ctx.json(attributeList))
    )
  })

  it('should render form successfully', async () => {
    render(
      <Provider>
        <RadiusAttributeDrawer
          visible={true}
          setVisible={jest.fn()}
          isEdit={false}
          editAttribute={undefined}
          setAttributeAssignments={jest.fn()}
          vendorList={vendorList.supportedVendors}
        />
      </Provider>,
      {
        route: { params: {
          tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
          policyId: '1b5c434b-1d28-4ac1-9fe6-cdbee9f934e3'
        }, path: '/:tenantId/:policyId' }
      }
    )

    const cancelButton = screen.getByText('Cancel')
    expect(cancelButton).toBeInTheDocument()
    await userEvent.click(cancelButton)
  })

  it('should edit form successfully', async () => {
    const editAttribute = {
      attributeName: 'attributeName1',
      attributeValue: 'test',
      dataType: DataType.BYTE,
      operator: OperatorType.DOES_NOT_EXIST
    }

    render(
      <Provider>
        <RadiusAttributeDrawer
          visible={true}
          setVisible={jest.fn()}
          isEdit={true}
          editAttribute={editAttribute}
          setAttributeAssignments={jest.fn()}
          vendorList={vendorList.supportedVendors}
        />
      </Provider>,
      {
        route: { params: {
          tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
          policyId: '1b5c434b-1d28-4ac1-9fe6-cdbee9f934e3'
        }, path: '/:tenantId/:policyId' }
      }
    )

    const inputs = await screen.findAllByRole('textbox')
    const attributeValue = inputs[1]
    expect(attributeValue).toHaveValue(editAttribute.attributeValue)

    const attributeDataType = inputs[2]
    expect(attributeDataType).toHaveValue(editAttribute.dataType)

    const addButton = screen.getByText('Done')
    expect(addButton).toBeInTheDocument()
    await userEvent.click(addButton)
  })

})
