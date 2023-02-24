import userEvent from '@testing-library/user-event'

import { screen } from '@acx-ui/test-utils'

import { renderForm }       from '../../__tests__/fixtures'
import { ClientType, Band } from '../../types'

import { RadioBand } from './RadioBand'

const { click } = userEvent

describe('RadioBand', () => {
  it('render field for virtual-client', async () => {
    renderForm(<RadioBand />, {
      initialValues: {
        clientType: ClientType.VirtualClient,
        configs: [{ radio: Band.Band2_4 }]
      }
    })

    expect(screen.getAllByRole('radio', {
      name: (_, el) => (el as HTMLInputElement).disabled === false
    })).toHaveLength(2)
  })

  it('render field for virtual-wireless-client', async () => {
    renderForm(<RadioBand />, {
      initialValues: {
        clientType: ClientType.VirtualWirelessClient,
        configs: [{ radio: Band.Band2_4 }]
      }
    })

    expect(screen.getAllByRole('radio', {
      name: (_, el) => (el as HTMLInputElement).disabled === false
    })).toHaveLength(3)
  })

  // eslint-disable-next-line max-len
  it('sets value to 2.4 when switch to virtual-client from virtual-wireless-client + 6 GHz', async () => {
    renderForm(<RadioBand />, {
      initialValues: {
        clientType: ClientType.VirtualWirelessClient,
        configs: [{ radio: Band.Band6 }]
      },
      valuesToUpdate: {
        clientType: ClientType.VirtualClient
      }
    })

    expect(screen.getByRole('radio', { name: '6 GHz' })).toBeChecked()

    await click(screen.getByRole('button', { name: 'Update' }))
    await screen.findByRole('radio', { name: '2.4 GHz', checked: true })
  })
})
