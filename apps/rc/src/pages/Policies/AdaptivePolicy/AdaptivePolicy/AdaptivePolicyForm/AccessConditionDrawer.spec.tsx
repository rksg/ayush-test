import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { RulesManagementUrlsInfo }    from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { assignConditions, attributeList } from './__test__/fixtures'
import { AccessConditionDrawer }           from './AccessConditionDrawer'

describe('AccessConditionDrawer', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        RulesManagementUrlsInfo.getPolicyTemplateAttributes.url,
        (req, res, ctx) => res(ctx.json(attributeList))
      )
    )
  })

  it('should submit the drawer successfully', async () => {
    render(
      <Provider>
        <AccessConditionDrawer
          visible={true}
          setVisible={jest.fn()}
          isEdit={false}
          setAccessCondition={jest.fn()}
          templateId={200}/>
      </Provider>,
      {
        route: { params: {
          tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
          policyId: '1b5c434b-1d28-4ac1-9fe6-cdbee9f934e3'
        }, path: '/:tenantId/:policyId' }
      }
    )

    await userEvent.click(await screen.findByRole('combobox', { name: 'Condition Type' }))
    await userEvent.click(await screen.findByText('NAS Identifier'))

    const inputs = await screen.findAllByRole('textbox')
    expect(inputs).toHaveLength(4)
    await userEvent.type(inputs[3], 'testValue')
    await userEvent.click(screen.getByText('Add'))
  })

  it('should cancel the drawer successfully', async () => {
    render(
      <Provider>
        <AccessConditionDrawer
          visible={true}
          setVisible={jest.fn()}
          isEdit={false}
          setAccessCondition={jest.fn()}
          templateId={200}/>
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

  it('should render drawer with the giving data', async () => {
    render(
      <Provider>
        <AccessConditionDrawer
          visible={true}
          setVisible={jest.fn()}
          isEdit={true}
          setAccessCondition={jest.fn()}
          templateId={200}
          editCondition={assignConditions.content[0]}/>
      </Provider>,
      {
        route: { params: {
          tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
          policyId: '1b5c434b-1d28-4ac1-9fe6-cdbee9f934e3'
        }, path: '/:tenantId/:policyId' }
      }
    )

    const saveButton = screen.getByText('Done')
    expect(saveButton).toBeInTheDocument()

    await screen.findByText(assignConditions.content[0].name)

    const inputs = await screen.findAllByRole('textbox')
    expect(inputs[0]).toHaveValue(assignConditions.content[0].id)
    expect(inputs[2]).toHaveValue(assignConditions.content[0].evaluationRule.criteriaType)
    expect(inputs[3]).toHaveValue(assignConditions.content[0].evaluationRule.regexStringCriteria)

    await userEvent.click(saveButton)
  })
})
