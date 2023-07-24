import '@testing-library/jest-dom'

import { Form } from 'antd'

import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen
} from '@acx-ui/test-utils'

import handlers      from './__tests__/fixtures'
import VenueDHCPForm from './VenueDHCPForm'


describe('Venue DHCP Form', () => {

  it('should render DHCP Form instance correctly', async () => {
    mockServer.use(...handlers)
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    const params = { tenantId: 'tenant-id', venueId: '3b11bcaffd6f4f4f9b2805b6fe24bf8b' }
    // eslint-disable-next-line react/jsx-no-undef
    render(<Provider><VenueDHCPForm form={formRef.current} /></Provider>, {
      route: { params }
    })

    expect(await screen.findByText('DHCP service')).toBeVisible()
  })

})
