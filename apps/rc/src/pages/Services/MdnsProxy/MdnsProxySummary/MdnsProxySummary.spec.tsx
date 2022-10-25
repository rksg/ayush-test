import { render } from '@acx-ui/test-utils'

import { mockedFormData }   from '../MdnsProxyForm/__tests__/fixtures'
import MdnsProxyFormContext from '../MdnsProxyForm/MdnsProxyFormContext'

import { MdnsProxySummary } from './MdnsProxySummary'

describe('MdnsProxySummary', () => {
  it('should render the summary', () => {
    const { asFragment } = render(
      <MdnsProxyFormContext.Provider
        value={{
          editMode: false,
          currentData: mockedFormData
        }}>
        <MdnsProxySummary />
      </MdnsProxyFormContext.Provider>
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
