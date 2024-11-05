import { Form }      from 'antd'
import { cloneDeep } from 'lodash'

import { StepsForm }        from '@acx-ui/components'
import { EdgeMdnsFixtures } from '@acx-ui/rc/utils'
import { Provider }         from '@acx-ui/store'
import {
  render,
  renderHook,
  screen
} from '@acx-ui/test-utils'

import { SummaryForm } from '.'

const { mockEdgeMdnsViewDataList } = EdgeMdnsFixtures

describe('Summary form', () => {
  beforeEach(() => {
  })

  it('should correctly display', async () => {
    const mockedData = mockEdgeMdnsViewDataList[0]

    const { result: stepFormRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldsValue(mockedData)
      return form
    })

    render(<Provider>
      <StepsForm form={stepFormRef.current}>
        <SummaryForm />
      </StepsForm>
    </Provider>)
    await screen.findByText('edge-mdns-proxy-name-1')
    screen.getByRole('row', { name: 'Apple TV 10 200' })
    screen.getByRole('row', { name: 'AirPrint 33 66' })
    screen.getByRole('row', { name: '_testCXCX._tcp. (Other) 5 120' })

    expect(screen.getByText('Venues & RUCKUS Edge Clusters (2)')).not.toBeNull()
    const txt = screen.getByText('Mock Venue 1')
    expect(txt.parentElement?.parentElement).toHaveTextContent('Mock Venue 1(Edge Cluster 1)')
  })

  it('should correctly display multiple activations', async () => {
    const mockedData = cloneDeep(mockEdgeMdnsViewDataList[0])
    mockedData.name = 'test multiple'
    // make it two activations within the same venue
    mockedData.activations[1].venueId = mockedData.activations[0].venueId
    mockedData.activations[1].venueName = mockedData.activations[0].venueName

    const { result: stepFormRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldsValue(mockedData)
      return form
    })

    render(<Provider>
      <StepsForm form={stepFormRef.current}>
        <SummaryForm />
      </StepsForm>
    </Provider>)

    await screen.findByText('test multiple')
    expect(screen.getByText('Venues & RUCKUS Edge Clusters (2)')).not.toBeNull()
    const txt = screen.getByText('Mock Venue 1')
    expect(txt.parentElement?.parentElement).toHaveTextContent('Mock Venue 1(2 Clusters)')
  })
})