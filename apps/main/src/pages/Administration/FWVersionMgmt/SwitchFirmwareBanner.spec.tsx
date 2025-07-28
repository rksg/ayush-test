
import userEvent from '@testing-library/user-event'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { SwitchFirmwareBanner, VersionInfoProps } from './SwitchFirmwareBanner'

const switchFirmwareData = [
  {
    label: 'For ICX Models (8200)',
    firmware: {
      version: '10.0.10c_cd1',
      category: 'LATEST',
      releaseDate: '2024-01-16T06:22:24.398+00:00',
      recommendedVersion: '10.0.10b',
      recommendedCategory: 'RECOMMENDED',
      recommendedDate: '2023-08-25T16:04:35.240+00:00'
    }
  },
  {
    label: 'For ICX Models (7150-7850)',
    firmware: {
      version: '9.0.10d_b262',
      category: 'LATEST',
      releaseDate: '2022-08-25T16:04:35.240+00:00',
      recommendedVersion: '9.0.10h_cd2',
      recommendedCategory: 'RECOMMENDED'
    }
  }
]

describe('Switch Firmware Banner', () => {
  const params: { tenantId: string } = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  it('should render correctly', async () => {
    render(
      <Provider>
        <SwitchFirmwareBanner data={switchFirmwareData as VersionInfoProps[]} />
      </Provider>, {
        route: { params, path: '/:tenantId/administration/fwVersionMgmt/switchFirmware' }
      })

    screen.getByText('10.0.10b')
    screen.getByText('9.0.10h_cd2')

    await userEvent.click(await screen.findByText('Show more'))
    await screen.findByText('10.0.10c_cd1')
    screen.getByText('9.0.10d_b262')
  })
})
