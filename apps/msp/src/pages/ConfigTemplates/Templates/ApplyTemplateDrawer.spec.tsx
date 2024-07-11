import { rest } from 'msw'

import { MspUrlsInfo }                from '@acx-ui/msp/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import HspContext                                          from '../../../HspContext'
import { mockedConfigTemplateList, mockedMSPCustomerList } from '../__tests__/fixtures'

import { ApplyTemplateDrawer } from './ApplyTemplateDrawer'

describe('ApplyTemplateDrawer', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        MspUrlsInfo.getMspCustomersList.url,
        (req, res, ctx) => res(ctx.json({ ...mockedMSPCustomerList }))
      )
    )
  })

  it('should render the correct title when it is Hospitality Edition', async () => {
    render(
      <HspContext.Provider value={{ state: { isHsp: true }, dispatch: jest.fn() }}>
        <Provider>
          <ApplyTemplateDrawer
            setVisible={jest.fn()}
            selectedTemplate={mockedConfigTemplateList.data[0]}
          />
        </Provider>
      </HspContext.Provider>
    )

    expect(await screen.findByText('Apply Templates - Brand Properties')).toBeInTheDocument()
  })

  it('should render the correct title when it is not Hospitality Edition', async () => {
    render(
      <HspContext.Provider value={{ state: { isHsp: false }, dispatch: jest.fn() }}>
        <Provider>
          <ApplyTemplateDrawer
            setVisible={jest.fn()}
            selectedTemplate={mockedConfigTemplateList.data[0]}
          />
        </Provider>
      </HspContext.Provider>
    )

    expect(await screen.findByText('Apply Templates - MSP Customers')).toBeInTheDocument()
  })
})
