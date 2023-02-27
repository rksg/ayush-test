import { render, screen } from '@acx-ui/test-utils'

import { mockedFormData }   from '../MdnsProxyForm/__tests__/fixtures'
import MdnsProxyFormContext from '../MdnsProxyForm/MdnsProxyFormContext'

import { MdnsProxySummary } from './MdnsProxySummary'

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

    expect(await screen.findByText(mockedFormData.name)).toBeVisible()
    expect(await screen.findByText('AirPlay')).toBeVisible()
    expect(await screen.findByText(mockedFormData.scope![0].venueName!)).toBeVisible()
  })
})
