import userEvent       from '@testing-library/user-event'
import { Form, Modal } from 'antd'

import {
  Provider
} from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'


import {
  availableVersions,
  availableVersions_hasInUse
} from '../../__test__/fixtures'

import { UpdateNowStep } from '.'



jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  useStepFormContext: () => ({
    form: {
      getFieldValue: jest.fn(),
      setFieldValue: jest.fn(),
      validateFields: jest.fn()
    }
  })
}))

describe('UpdateNowStep', () => {
  const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }
  beforeEach(async () => {
    Modal.destroyAll()
  })

  it('render UpdateNowStep - 1 Venue', async () => {
    render(
      <Provider>
        <Form>
          <UpdateNowStep
            visible={true}
            availableVersions={availableVersions_hasInUse}
            nonIcx8200Count={2}
            icx8200Count={0}
            hasVenue={true}/>
        </Form>
      </Provider>
      , {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })
    expect(await screen.findByText(/Firmware available for ICX 8200 Series/i)).toBeInTheDocument()
    expect(screen.getByText(/10.0.10a_cd3/i)).toBeInTheDocument()
    expect(screen.getByText(/9.0.10h_cd2/i)).toBeInTheDocument()
    expect(screen.getByText(/9.0.10f/i)).toBeInTheDocument()
  })

  it('render UpdateNowStep - 1 Venue - Changed', async () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2023-11-01T00:00:00Z').getTime())
    render(
      <Provider>
        <Form>
          <UpdateNowStep
            visible={true}
            availableVersions={availableVersions_hasInUse}
            nonIcx8200Count={2}
            icx8200Count={0}
            hasVenue={true}
          />
        </Form>
      </Provider>
      , {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })

    expect(await screen.findByText(/Firmware available for ICX 8200 Series/i)).toBeInTheDocument()
    expect(screen.getByText(/9.0.10f/i)).toBeInTheDocument()

    const release10010rc2 = screen.getByRole('radio', {
      name: /10\.0\.10_rc2 \(release - recommended\)/i
    })

    userEvent.click(release10010rc2)
    expect(release10010rc2).toBeEnabled()

    const release09010f = screen.getByRole('radio', {
      name: /9\.0\.10f \(release - recommended\)/i
    })
    userEvent.click(release09010f)
    expect(release09010f).toBeEnabled()

    jest.useRealTimers()
  })

  it('render UpdateNowStep - 1 non8200 Switch', async () => {
    render(
      <Provider>
        <Form>
          <UpdateNowStep
            visible={true}
            availableVersions={availableVersions}
            nonIcx8200Count={1}
            icx8200Count={0}
            hasVenue={false}
          />
        </Form>
      </Provider>
      , {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })
    // eslint-disable-next-line max-len
    expect(await screen.findByText(/firmware available for icx 7150\/7550\/7650\/7850 series \(1 switches\)/i)).toBeInTheDocument()
    // eslint-disable-next-line max-len
    expect(screen.getByText(/9.0.10h_cd2/i)).toBeInTheDocument()
    expect(screen.getByText(/9.0.10f/i)).toBeInTheDocument()
    expect(screen.getByText(/9.0.10e/i)).toBeInTheDocument()
    expect(screen.queryByText(/Firmware available for ICX 8200 Series/i)).toBeNull()
  })


})
