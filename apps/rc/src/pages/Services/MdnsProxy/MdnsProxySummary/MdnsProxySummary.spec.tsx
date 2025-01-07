import { render, screen } from '@acx-ui/test-utils'

import { mockedFormData }   from '../MdnsProxyForm/__tests__/fixtures'
import MdnsProxyFormContext from '../MdnsProxyForm/MdnsProxyFormContext'

import { MdnsProxySummary } from './MdnsProxySummary'


jest.mock('@acx-ui/rc/components', () => ({
  MdnsProxySummaryForm: () => <div>MdnsProxySummaryForm</div>
}))


describe('MdnsProxySummary', () => {
  it('should render the summary', async () => {
    render(
      <MdnsProxyFormContext.Provider
        value={{
          editMode: false,
          currentData: mockedFormData
        }}>
        <MdnsProxySummary />
      </MdnsProxyFormContext.Provider>
    )

    expect(await screen.findByText('MdnsProxySummaryForm')).toBeVisible()
  })
})
