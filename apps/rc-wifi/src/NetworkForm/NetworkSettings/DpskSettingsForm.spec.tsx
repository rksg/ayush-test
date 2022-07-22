import '@testing-library/jest-dom'
import { Form } from 'antd'
import { rest } from 'msw'

import { CommonUrlsInfo }                        from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { fireEvent, mockServer, render, screen } from '@acx-ui/test-utils'

import { cloudpathResponse } from '../NetworkForm.spec'

import { DpskSettingsForm } from './DpskSettingsForm'

describe('DpskSettingsForm', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(CommonUrlsInfo.getCloudpathList.url,
        (_, res, ctx) => res(ctx.json(cloudpathResponse)))
    )
  })

  it('should render DPSK form successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    const { asFragment } = render(<Provider><Form><DpskSettingsForm /></Form></Provider>, {
      route: { params }
    })

    expect(asFragment()).toMatchSnapshot()
  })

  it('should render Cloudpath Server form successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }
    render(<Provider><Form><DpskSettingsForm /></Form></Provider>, {
      route: { params }
    })

    fireEvent.click(screen.getByText('Use Cloudpath Server'))
    expect(screen.getByText('Add Server')).toBeVisible()
  })
})
