/* eslint-disable max-len */
import '@testing-library/jest-dom'
import { render }                  from '@testing-library/react'
import { BrowserRouter as Router } from 'react-router-dom'

import { Constants, getUserSettingsFromDict } from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'

import { NetworkVenuesTab } from './index'

describe('NetworkDetails', () => {
  it('should render correctly', async () => {
    const { asFragment } = render(
      <Provider><Router><NetworkVenuesTab></NetworkVenuesTab></Router></Provider>
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
