import { screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react'
import userEvent                                      from '@testing-library/user-event'
import { Modal }                                      from 'antd'
import { rest }                                       from 'msw'


import { firmwareApi }        from '@acx-ui/rc/services'
import { FirmwareUrlsInfo }   from '@acx-ui/rc/utils'
import { Provider, store }    from '@acx-ui/store'
import { mockServer, render } from '@acx-ui/test-utils'

import { mockedApModelFirmwares, mockedFirmwareVenuesPerApModel } from '../__tests__/fixtures'

import { UpdateNowPerApModelDialog } from '.'


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

describe('Update Now Dialog Per AP Model', () => {
  beforeEach(() => {
    store.dispatch(firmwareApi.util.resetApiState())
    afterSubmitFn.mockClear()
    afterSubmitFn.mockClear()

    mockServer.use(
      rest.get(
        FirmwareUrlsInfo.getAllApModelFirmwareList.url,
        (_, res, ctx) => res(ctx.json(mockedApModelFirmwares))
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
      rest.patch(
        FirmwareUrlsInfo.patchVenueApModelFirmwares.url,
        (req, res, ctx) => {
          updateFn(req.body)
          return res(ctx.json({}))
        }
      )
    )

    const mockVenuesFirmwares = mockedFirmwareVenuesPerApModel.data

    render(
      <Provider>
        <UpdateNowPerApModelDialog
          onCancel={onCancelFn}
          afterSubmit={afterSubmitFn}
          selectedVenuesFirmwares={mockVenuesFirmwares} />
      </Provider>
    )

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(await screen.findByText('Update Now')).toBeInTheDocument()

    expect(screen.getByText('Update firmware by AP model')).toBeVisible()

    expect(await screen.findByText('See more devices')).toBeVisible()

    const updateFirmwareByApModelToggle = screen.getByRole('switch')
    await userEvent.click(updateFirmwareByApModelToggle)

    // eslint-disable-next-line max-len
    expect(await screen.findByRole('checkbox', { name: /Show APs with available firmware only/ })).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'Update Firmware' }))

    await waitFor(() => expect(afterSubmitFn).toBeCalledTimes(1))
    // close dialog
    expect(onCancelFn).toBeCalledTimes(1)

  })
})
