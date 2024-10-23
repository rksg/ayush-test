import { MdnsProxyFeatureTypeEnum } from '@acx-ui/rc/utils'
import { render, screen }           from '@acx-ui/test-utils'

import { mockedFormData } from './__tests__/fixtures'

import { MdnsProxySummaryForm } from './'

describe('MdnsProxySummaryForm', () => {
  it('should render the summary', async () => {
    render(<MdnsProxySummaryForm
      featureType={MdnsProxyFeatureTypeEnum.WIFI}
      {...mockedFormData}
    />)

    expect(await screen.findByText(mockedFormData.name)).toBeVisible()
    expect(await screen.findByText('AirPlay')).toBeVisible()
    expect(await screen.findByText(mockedFormData.scope![0].venueName!)).toBeVisible()
  })
})
