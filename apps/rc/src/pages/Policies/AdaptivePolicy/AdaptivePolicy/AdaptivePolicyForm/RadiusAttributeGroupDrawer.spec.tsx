import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { RadiusAttributeGroupUrlsInfo }                                             from '@acx-ui/rc/utils'
import { Provider }                                                                 from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import { groupList }                  from './__test__/fixtures'
import { RadiusAttributeGroupDrawer } from './RadiusAttributeGroupDrawer'

describe('RadiusAttributeGroupDrawer', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        RadiusAttributeGroupUrlsInfo.getAttributeGroups.url,
        (req, res, ctx) => res(ctx.json(groupList))
      )
    )
  })

  it('should render drawer successfully', async () => {
    render(
      <Provider>
        <RadiusAttributeGroupDrawer
          visible={true}
          setVisible={jest.fn()}
          setRadiusAttributeGroup={jest.fn()}
          setRadiusAttributeGroupFormDrawerVisible={jest.fn()}/>
      </Provider>,
      {
        route: { params: {
          tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
        }, path: '/:tenantId' }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(screen.getByRole('button', { name: 'Add Group' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Select' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Add Group' }))
  })

  it('should show and save the drawer successfully', async () => {
    render(
      <Provider>
        <RadiusAttributeGroupDrawer
          visible={true}
          setVisible={jest.fn()}
          setRadiusAttributeGroup={jest.fn()}
          setRadiusAttributeGroupFormDrawerVisible={jest.fn()}/>
      </Provider>,
      {
        route: { params: {
          tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
        }, path: '/:tenantId' }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    // eslint-disable-next-line max-len
    const row = await screen.findByRole('row', { name: 'group1 attributeName1 test attributeName2 test' })
    fireEvent.click(within(row).getByRole('radio'))

    await userEvent.click(screen.getByText('Select'))
  })
})
