import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { RadiusAttributeGroupUrlsInfo }                              from '@acx-ui/rc/utils'
import { Provider }                                                  from '@acx-ui/store'
import { fireEvent, mockServer, render, renderHook, screen, within } from '@acx-ui/test-utils'

import { groupList }                        from './__test__/fixtures'
import { RadiusAttributeGroupSelectDrawer } from './RadiusAttributeGroupSelectDrawer'

describe('RadiusAttributeGroupDrawer', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        RadiusAttributeGroupUrlsInfo.getAttributeGroups.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(groupList))
      )
    )
  })

  it('should render drawer successfully', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <RadiusAttributeGroupSelectDrawer
          visible={true}
          setVisible={jest.fn()}
          settingForm={formRef.current}/>
      </Provider>,
      {
        route: { params: {
          tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
        }, path: '/:tenantId' }
      }
    )
    await screen.findByRole('row', { name: /group1/i })

    expect(screen.getByRole('button', { name: 'Add Group' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Select' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Add Group' }))

    await screen.findByText('Add RADIUS Attribute Group')
  })

  it('should show and save the drawer successfully', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <RadiusAttributeGroupSelectDrawer
          visible={true}
          setVisible={jest.fn()}
          settingForm={formRef.current}/>
      </Provider>,
      {
        route: { params: {
          tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
        }, path: '/:tenantId' }
      }
    )

    // eslint-disable-next-line max-len
    const row = await screen.findByRole('row', { name: 'group1 attributeName1 test attributeName2 test' })
    fireEvent.click(within(row).getByRole('radio'))

    await userEvent.click(screen.getByText('Select'))
  })
})
