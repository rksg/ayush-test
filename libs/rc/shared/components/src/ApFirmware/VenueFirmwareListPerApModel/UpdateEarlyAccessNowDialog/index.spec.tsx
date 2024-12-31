import { screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react'
import userEvent                                      from '@testing-library/user-event'
import { Modal }                                      from 'antd'
import { rest }                                       from 'msw'


import { firmwareApi }                     from '@acx-ui/rc/services'
import { FirmwareLabel, FirmwareUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                 from '@acx-ui/store'
import { mockServer, render }              from '@acx-ui/test-utils'

import {
  mockedEarlyAccessApModelFirmwares
} from '../__tests__/fixtures'

import { UpdateEarlyAccessNowDialog } from '.'


jest.mock('antd', () => {
  const antd = jest.requireActual('antd')
  // @ts-ignore
  // eslint-disable-next-line max-len
  const Select = ({ children, onChange }: React.PropsWithChildren<{ onChange?: (value: string) => void }>) => {
    return (
      <select role='combobox' onChange={e => onChange?.(e.target.value)}>
        {children}
      </select>
    )
  }

  // @ts-ignore
  Select.Option = ({ children, ...otherProps }) => {
    return <option {...otherProps}>{children}</option>
  }

  return { ...antd, Select }
})

const onCancelFn = jest.fn()
const afterSubmitFn = jest.fn()

describe('Update Early Access Dialog Per AP Model', () => {
  beforeEach(() => {
    store.dispatch(firmwareApi.util.resetApiState())
    afterSubmitFn.mockClear()

    mockServer.use(
      rest.get(
        FirmwareUrlsInfo.getAllApModelFirmwareList.url,
        (_, res, ctx) => res(ctx.json(mockedEarlyAccessApModelFirmwares))
      ),
      rest.post(
        FirmwareUrlsInfo.startFirmwareBatchOperation.url,
        (_, res, ctx) => res(ctx.json({ requestId: '12345', response: { batchId: 'BAT12345' } }))
      )
    )
  })

  afterEach(() => {
    Modal.destroyAll()
  })

  it('should render successfully', async () => {
    const updateFn = jest.fn()

    mockServer.use(
      rest.put(
        FirmwareUrlsInfo.patchVenueApModelFirmwares.url,
        (req, res, ctx) => {
          updateFn(req.body)
          return res(ctx.json({}))
        }
      )
    )

    const selectedVenuesFirmwares = [
      {
        id: '1fae4143c3d04d2ebcb4a179baf4a5d8',
        name: 'Venue01',
        currentApFirmwares: [
          {
            firmware: '7.1.1.520.192',
            apModel: 'T670',
            labels: [
              FirmwareLabel.LEGACYALPHA
            ]
          }
        ],
        lastScheduleUpdate: '2024-12-24T02:01:19.917Z',
        isApFirmwareUpToDate: false
      }
    ]

    render(
      <Provider>
        <UpdateEarlyAccessNowDialog
          onCancel={onCancelFn}
          afterSubmit={afterSubmitFn}
          selectedVenuesFirmwares={selectedVenuesFirmwares}
          isAlpha={true}
          isBeta={true}
        />
      </Provider>
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(await screen.findByText(/update with early access now/i)).toBeInTheDocument()

    expect(await screen.findByText(/t670/i)).toBeInTheDocument()

    const selectElement = screen.getByRole('combobox')
    userEvent.selectOptions(selectElement, '7.1.1.520.214 (Early Access) - 12/19/2024')
    expect(selectElement).toHaveValue('7.1.1.520.214 (Early Access) - 12/19/2024')

    await userEvent.click(screen.getByRole('button', { name: 'Update Firmware' }))

    await waitFor(() => expect(afterSubmitFn).toBeCalledTimes(1))
    // close dialog
    expect(onCancelFn).toBeCalledTimes(1)

  })
})
