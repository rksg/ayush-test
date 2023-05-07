import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { RulesManagementUrlsInfo }                from '@acx-ui/rc/utils'
import { Provider }                               from '@acx-ui/store'
import { mockServer, render, renderHook, screen } from '@acx-ui/test-utils'

import { assignConditions, attributeList } from './__test__/fixtures'
import { AccessConditionDrawer }           from './AccessConditionDrawer'

describe('AccessConditionDrawer', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.get(
        RulesManagementUrlsInfo.getPolicyTemplateAttributes.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(attributeList))
      )
    )
  })

  it('should cancel the drawer successfully', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <AccessConditionDrawer
          visible={true}
          setVisible={jest.fn()}
          isEdit={false}
          setAccessConditions={jest.fn()}
          settingForm={formRef.current}
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

  it('should render drawer with the giving data', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <AccessConditionDrawer
          visible={true}
          setVisible={jest.fn()}
          isEdit={true}
          setAccessConditions={jest.fn()}
          editCondition={assignConditions.content[0]}
          settingForm={formRef.current}/>
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

    const condition = assignConditions.content[0]

    const inputs = await screen.findAllByRole('textbox')
    expect(inputs[0]).toHaveValue(condition.id)
    expect(inputs[1]).toHaveValue(condition.templateAttribute.name)
    expect(inputs[2]).toHaveValue('STRING')
    expect(inputs[3]).toHaveValue(condition.evaluationRule.regexStringCriteria)

    await userEvent.click(saveButton)
  })
})
