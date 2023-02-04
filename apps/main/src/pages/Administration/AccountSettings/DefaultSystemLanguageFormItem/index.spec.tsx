/* eslint-disable max-len */
import { Provider  }      from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import  { DefaultSystemLanguageFormItem } from './'

describe('Default System Language Selector', () => {
  const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

  it('should render correctly', async () => {
    render(
      <Provider>
        <DefaultSystemLanguageFormItem />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('English')
  })
})