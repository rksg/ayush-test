import '@testing-library/jest-dom'
import { Form } from 'antd'
import { rest } from 'msw'

import { policyApi }                  from '@acx-ui/rc/services'
import { AaaUrls }                    from '@acx-ui/rc/utils'
import { Provider, store }            from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { VenueRadiusService } from './index'

jest.mock('./VenueRadiusServiceDrawer', () => ({
  VenueRadiusServiceDrawer: () => <div>VenueRadiusServiceDrawer</div>
}))
jest.mock('./VenueRadiusServiceForm', () => ({
  VenueRadiusServiceForm: () => <div>VenueRadiusServiceForm</div>
}))

jest.mock('@acx-ui/rc/components', () => ({
  ConfigTemplateEnforcementContext: require('react').createContext({
    isEnforced: false
  }),
  useEnforcedStatus: () => ({})
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>
    <Form>{children}</Form>
  </Provider>
)

describe('VenueRadiusService', () => {
  beforeEach(() => {
    store.dispatch(policyApi.util.resetApiState())
    mockServer.use(
      rest.post(AaaUrls.queryAAAPolicyList.url,
        (_, res, ctx) => res(ctx.json({ data: [], totalCount: 0 })))
    )
  })
  it('should render the component with authentication and accounting switches', async () => {
    render(
      <TestWrapper>
        <VenueRadiusService />
      </TestWrapper>
    )
    const expectedAuthResult = 'Override Authentication service in active networks'
    const expectedAccountingResult = 'Override Accounting service in active networks'
    expect(await screen.findByText(expectedAuthResult)).toBeInTheDocument()
    expect(await screen.findByText(expectedAccountingResult)).toBeInTheDocument()
  })
})
