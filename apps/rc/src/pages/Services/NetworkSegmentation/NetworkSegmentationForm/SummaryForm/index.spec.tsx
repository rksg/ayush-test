/* eslint-disable max-len */
import { Form } from 'antd'
import { rest } from 'msw'

import { StepsFormNew }     from '@acx-ui/components'
import {
  NetworkSegmentationUrls
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen
} from '@acx-ui/test-utils'

import {
  mockNsgData,
  mockNsgSwitchInfoData,
  webAuthList
} from '../../__tests__/fixtures'

import { SummaryForm } from './'

const createNsgPath = '/:tenantId/services/networkSegmentation/create'

describe('SummaryForm', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }

    mockServer.use(
      rest.post(
        NetworkSegmentationUrls.getWebAuthTemplateList.url,
        (req, res, ctx) => res(ctx.json({ data: webAuthList }))
      )
    )
  })

  it('should render correctly', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    formRef.current.setFieldsValue({
      name: mockNsgData.name,
      venueName: '',
      edgeName: '',
      segments: '',
      devices: '',
      dhcpName: '',
      poolName: '',
      tunnelProfileName: '',
      networkNames: [''],
      distributionSwitchInfos: mockNsgSwitchInfoData.distributionSwitches,
      accessSwitchInfos: mockNsgSwitchInfoData.accessSwitches
    })

    render(
      <Provider>
        <StepsFormNew form={formRef.current}><SummaryForm /></StepsFormNew>
      </Provider>, {
        route: { params, path: createNsgPath }
      })

    await screen.findByText(mockNsgData.name)
  })
})
