import { rest } from 'msw'

import { RulesManagementUrlsInfo }                                                           from '@acx-ui/rc/utils'
import { Provider }                                                                          from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import { assignConditions, policyList, templateList } from '../AdaptivePolicyDetail/__test__/fixtures'

import AdaptivePolicyTable from './index'

describe('AdaptivePolicyTable', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(
        RulesManagementUrlsInfo.getPolicies.url,
        (req, res, ctx) => res(ctx.json(policyList))
      ),
      rest.get(
        RulesManagementUrlsInfo.getConditionsInPolicy.url,
        (req, res, ctx) => res(ctx.json(assignConditions))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPolicyTemplateList.url,
        (req, res, ctx) => res(ctx.json(templateList))
      )
    )
  })

  it('should render correctly', async () => {
    render(<Provider><AdaptivePolicyTable /></Provider>, {
      route: { params: {
        tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
      }, path: '/:tenantId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row1 = await screen.findByRole('row', { name: /dpsk1/ })
    expect(row1).toHaveTextContent('1')
  })

  it('should delete selected row', async () => {
    const deleteFn = jest.fn()

    mockServer.use(
      rest.delete(
        RulesManagementUrlsInfo.deletePolicy.url,
        (req, res, ctx) => {
          deleteFn(req.body)
          return res(ctx.json({ requestId: '12345' }))
        })
    )

    render(<Provider><AdaptivePolicyTable /></Provider>, {
      route: { params: {
        tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
        policyId: '79c439e1e5474f68acc9da38fa08a37b',
        templateId: '200'
      }, path: '/:tenantId/:templateId/:policyId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /dpsk1/ })
    fireEvent.click(within(row).getByRole('radio'))

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await screen.findByText('Delete "dpsk1"?')

    fireEvent.change(screen.getByRole('textbox', { name: /type the word "delete" to confirm:/i }),
      { target: { value: 'Delete' } })

    const deleteListButton = screen.getByRole('button', { name: 'Delete policy' })
    await waitFor(() => expect(deleteListButton).toBeEnabled())
    fireEvent.click(deleteListButton)

    await waitFor(() => {
      expect(deleteFn).toHaveBeenCalled()
    })
  })

  it('should delete selected row error', async () => {
    mockServer.use(
      rest.delete(
        RulesManagementUrlsInfo.deletePolicy.url,
        (req, res, ctx) => res(ctx.status(500), ctx.json({}))
      )
    )

    render(<Provider><AdaptivePolicyTable /></Provider>, {
      route: { params: {
        tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
        policyId: '79c439e1e5474f68acc9da38fa08a37b'
      }, path: '/:tenantId/:templateId/:policyId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /dpsk1/ })
    fireEvent.click(within(row).getByRole('radio'))

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await screen.findByText('Delete "dpsk1"?')

    fireEvent.change(screen.getByRole('textbox', { name: /type the word "delete" to confirm:/i }),
      { target: { value: 'Delete' } })

    const deleteListButton = screen.getByRole('button', { name: 'Delete policy' })
    await waitFor(() => expect(deleteListButton).toBeEnabled())
    fireEvent.click(deleteListButton)
  })

  it('should edit selected row', async () => {
    render(<Provider><AdaptivePolicyTable /></Provider>, {
      route: { params: {
        tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
      }, path: '/:tenantId' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const row = await screen.findByRole('row', { name: /dpsk1/ })
    fireEvent.click(within(row).getByRole('radio'))

    const editButton = screen.getByRole('button', { name: /Edit/i })
    fireEvent.click(editButton)
  })
})
