/* eslint-disable max-len */
import { act, renderHook, waitFor, within } from '@testing-library/react'
import userEvent                            from '@testing-library/user-event'
import { Form }                             from 'antd'
import { rest }                             from 'msw'

import { StepsFormNew } from '@acx-ui/components'
import { EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }     from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { mockEdgeList } from '../../__tests__/fixtures'

import { ScopeForm } from '.'


const mockedSetFieldValue = jest.fn()
const { click } = userEvent

describe('Scope Form', () => {
  beforeEach(() => {
    mockedSetFieldValue.mockReset()

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => {
          const filteredSN = req.body?.filters?.serialNumber
          if (filteredSN) {
            const usedData = mockEdgeList.data.filter((item) => {
              return filteredSN.includes(item.serialNumber)
            })

            return res(ctx.json({ ...mockEdgeList, data: usedData, totalCount: usedData.length }))
          } else {
            return res(ctx.json(mockEdgeList))
          }
        }
      )
    )
  })

  it('should correctly activate', async () => {
    const { result: stepFormRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      jest.spyOn(form, 'setFieldValue').mockImplementation(mockedSetFieldValue)
      return form
    })

    render(
      <Provider>
        <StepsFormNew
          form={stepFormRef.current}
        >
          <ScopeForm />
        </StepsFormNew>
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    expect(await screen.findByText('Scope')).toBeVisible()
    const rows = await screen.findAllByRole('row', { name: /Smart Edge/i })
    expect(rows.length).toBe(5)

    await click(
      within(await screen.findByRole('row', { name: /Smart Edge 1/i })).getByRole('checkbox'))
    await click(
      within(await screen.findByRole('row', { name: /Smart Edge 3/i })).getByRole('checkbox'))
    await click(await screen.findByRole('button', { name: 'Activate' }))

    expect(mockedSetFieldValue).toBeCalledWith('selectedEdges', [
      { name: 'Smart Edge 1', serialNumber: '0000000001' },
      { name: 'Smart Edge 3', serialNumber: '0000000003' }
    ])
  })

  it('should correctly activate by switcher', async () => {
    const { result: stepFormRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      jest.spyOn(form, 'setFieldValue').mockImplementation(mockedSetFieldValue)
      return form
    })

    render(
      <Provider>
        <StepsFormNew
          form={stepFormRef.current}
        >
          <ScopeForm />
        </StepsFormNew>
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    expect(await screen.findByText('Scope')).toBeVisible()
    const rows = await screen.findAllByRole('row', { name: /Smart Edge/i })
    expect(rows.length).toBe(5)

    await click(
      within(await screen.findByRole('row', { name: /Smart Edge 2/i })).getByRole('switch'))

    expect(mockedSetFieldValue).toBeCalledWith('selectedEdges', [
      { name: 'Smart Edge 2', serialNumber: '0000000002' }
    ])
  })

  it('should correctly deactivate', async () => {
    const { result: stepFormRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldValue('selectedEdges', [
        { name: 'Smart Edge 1', serialNumber: '0000000001' },
        { name: 'Smart Edge 3', serialNumber: '0000000003' }
      ])

      jest.spyOn(form, 'setFieldValue').mockImplementation(mockedSetFieldValue)
      return form
    })

    render(
      <Provider>
        <StepsFormNew
          form={stepFormRef.current}
        >
          <ScopeForm />
        </StepsFormNew>
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    expect(await screen.findByText('Scope')).toBeVisible()
    const rows = await screen.findAllByRole('row', { name: /Smart Edge/i })
    expect(rows.length).toBe(5)

    expect(within(await screen.findByRole('row', { name: /Smart Edge 1/i })).getByRole('switch')).toBeChecked()
    expect(within(await screen.findByRole('row', { name: /Smart Edge 3/i })).getByRole('switch')).toBeChecked()
    await click(
      within(await screen.findByRole('row', { name: /Smart Edge 1/i })).getByRole('checkbox'))
    await click(await screen.findByRole('button', { name: 'Deactivate' }))

    expect(mockedSetFieldValue).toBeCalledWith('selectedEdges', [
      { name: 'Smart Edge 3', serialNumber: '0000000003' }
    ])
  })

  it('should correctly deactivate by switch', async () => {
    const { result: stepFormRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldValue('selectedEdges', [
        { name: 'Smart Edge 1', serialNumber: '0000000001' },
        { name: 'Smart Edge 3', serialNumber: '0000000003' }
      ])

      jest.spyOn(form, 'setFieldValue').mockImplementation(mockedSetFieldValue)
      return form
    })

    render(
      <Provider>
        <StepsFormNew
          form={stepFormRef.current}
        >
          <ScopeForm />
        </StepsFormNew>
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    expect(await screen.findByText('Scope')).toBeVisible()
    const rows = await screen.findAllByRole('row', { name: /Smart Edge/i })
    expect(rows.length).toBe(5)

    const switchBtn = within(await screen.findByRole('row', { name: /Smart Edge 1/i })).getByRole('switch')
    expect(switchBtn).toBeChecked()
    await click(switchBtn)

    expect(mockedSetFieldValue).toBeCalledWith('selectedEdges', [
      { name: 'Smart Edge 3', serialNumber: '0000000003' }
    ])
  })
})