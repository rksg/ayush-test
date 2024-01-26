/* eslint-disable max-len */
import { renderHook, waitFor, within } from '@testing-library/react'
import userEvent                       from '@testing-library/user-event'
import { Form }                        from 'antd'
import { rest }                        from 'msw'

import { StepsForm }                                         from '@acx-ui/components'
import { edgeApi, venueApi }                                 from '@acx-ui/rc/services'
import { CommonUrlsInfo, EdgeGeneralFixtures, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                   from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { ScopeForm } from '.'

const { mockEdgeList } = EdgeGeneralFixtures
const mockedSetFieldValue = jest.fn()
const { click } = userEvent

describe('Scope Form', () => {
  beforeEach(() => {
    mockedSetFieldValue.mockReset()
    store.dispatch(edgeApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
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
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json({ data: [] }))
      )
    )
  })

  it.skip('should correctly activate', async () => {
    const { result: stepFormRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      jest.spyOn(form, 'setFieldValue').mockImplementation(mockedSetFieldValue)
      return form
    })

    render(
      <Provider>
        <StepsForm
          form={stepFormRef.current}
        >
          <ScopeForm />
        </StepsForm>
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    expect(await screen.findByText('Scope')).toBeVisible()
    const rows = await screen.findAllByRole('row', { name: /Smart Edge/i })
    expect(rows.length).toBe(5)

    await click(within(rows[0]).getByRole('checkbox')) //Smart Edge 1
    await click(within(rows[2]).getByRole('checkbox')) //Smart Edge 3
    await click(await screen.findByRole('button', { name: 'Activate' }))

    expect(mockedSetFieldValue).toBeCalledWith('selectedEdges', [
      { name: 'Smart Edge 1', serialNumber: '0000000001' },
      { name: 'Smart Edge 3', serialNumber: '0000000003' }
    ])

    await waitFor(() => {
      rows.forEach(row =>
        expect(within(row).getByRole('checkbox')).not.toBeChecked()
      )
    })
  })

  it('should correctly activate by switcher', async () => {
    const { result: stepFormRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      jest.spyOn(form, 'setFieldValue').mockImplementation(mockedSetFieldValue)
      return form
    })

    render(
      <Provider>
        <StepsForm
          form={stepFormRef.current}
        >
          <ScopeForm />
        </StepsForm>
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    expect(await screen.findByText('Scope')).toBeVisible()
    const rows = await screen.findAllByRole('row', { name: /Smart Edge/i })
    expect(rows.length).toBe(5)

    await click(within(rows[1]).getByRole('switch'))

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
        <StepsForm
          form={stepFormRef.current}
        >
          <ScopeForm />
        </StepsForm>
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    expect(await screen.findByText('Scope')).toBeVisible()
    const rows = await screen.findAllByRole('row', { name: /Smart Edge/i })
    expect(rows.length).toBe(5)

    expect(within(rows[0]).getByRole('switch')).toBeChecked()
    expect(within(rows[2]).getByRole('switch')).toBeChecked()
    await click(within(rows[0]).getByRole('checkbox'))
    await click(await screen.findByRole('button', { name: 'Deactivate' }))

    expect(mockedSetFieldValue).toBeCalledWith('selectedEdges', [
      { name: 'Smart Edge 3', serialNumber: '0000000003' }
    ])

    await waitFor(() => {
      rows.forEach(row =>
        expect(within(row).getByRole('checkbox')).not.toBeChecked()
      )
    })
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
        <StepsForm
          form={stepFormRef.current}
        >
          <ScopeForm />
        </StepsForm>
      </Provider>, { route: { params: { tenantId: 't-id' } } })

    expect(await screen.findByText('Scope')).toBeVisible()
    const rows = await screen.findAllByRole('row', { name: /Smart Edge/i })
    expect(rows.length).toBe(5)

    const switchBtn = within(rows[0]).getByRole('switch')
    expect(switchBtn).toBeChecked()
    await click(switchBtn)

    expect(mockedSetFieldValue).toBeCalledWith('selectedEdges', [
      { name: 'Smart Edge 3', serialNumber: '0000000003' }
    ])
  })
})
