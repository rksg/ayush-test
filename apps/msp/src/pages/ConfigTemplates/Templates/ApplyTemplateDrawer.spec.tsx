import { rest } from 'msw'

import { MspUrlsInfo }                from '@acx-ui/msp/utils'
import { ConfigTemplateType }         from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import HspContext                                          from '../../../HspContext'
import { mockedConfigTemplateList, mockedMSPCustomerList } from '../__tests__/fixtures'

import { ApplyTemplateConfirmationDrawer, ApplyTemplateDrawer } from './ApplyTemplateDrawer'

jest.mock('./CustomerFirmwareReminder', () => ({
  ...jest.requireActual('./CustomerFirmwareReminder'),
  CustomerFirmwareReminder: () => <div>CustomerFirmwareReminder</div>
}))

describe('ApplyTemplateDrawer', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        MspUrlsInfo.getMspCustomersList.url,
        (req, res, ctx) => res(ctx.json({ ...mockedMSPCustomerList }))
      )
    )
  })

  it('should render the specific column when it is Hospitality Edition', async () => {
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

    expect(await screen.findByRole('columnheader', { name: 'Account Type' })).toBeInTheDocument()
  })

  it('should render the specific column when the template type can be overriden', async () => {
    render(
      <HspContext.Provider value={{ state: { isHsp: false }, dispatch: jest.fn() }}>
        <Provider>
          <ApplyTemplateDrawer
            setVisible={jest.fn()}
            // eslint-disable-next-line max-len
            selectedTemplate={mockedConfigTemplateList.data.find(d => d.type === ConfigTemplateType.VENUE)!}
          />
        </Provider>
      </HspContext.Provider>
    )

    // eslint-disable-next-line max-len
    expect(await screen.findByRole('columnheader', { name: 'Template Override Value' })).toBeInTheDocument()
  })

  describe('ApplyTemplateConfirmationDrawer', () => {
    it('should render the customer firmware reminder', async () => {
      // eslint-disable-next-line max-len
      const venueTemplate = mockedConfigTemplateList.data.find(d => d.type === ConfigTemplateType.VENUE)!
      render(
        <ApplyTemplateConfirmationDrawer
          targetMspEcs={[]}
          selectedTemplate={venueTemplate}
          overrideValues={undefined}
          onBack={jest.fn()}
          onApply={jest.fn()}
          onCancel={jest.fn()}
        />
      )

      expect(await screen.findByText('CustomerFirmwareReminder')).toBeInTheDocument()
    })
  })
})
