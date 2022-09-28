/* eslint-disable max-len */
import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { networkApi } from '@acx-ui/rc/services'
import {
  WifiUrlsInfo,
  RadioTypeEnum,
  RadioEnum,
  SchedulerTypeEnum
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  act,
  fireEvent,
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { network }   from './index.spec'
import { VlanInput } from './VlanInput'

export const networkVenue_apgroup = {
  venueId: '02e2ddbc88e1428987666d31edbc3d9a',
  dual5gEnabled: true,
  tripleBandEnabled: false,
  networkId: '373377b0cb6e46ea8982b1c80aabe1fa',
  allApGroupsRadio: RadioEnum.Both,
  isAllApGroups: false,
  id: '7a97953dc55f4645b3cdbf1527f3d7cb',
  scheduler: {
    type: SchedulerTypeEnum.ALWAYS_ON
  },
  apGroups: [{
    radio: RadioEnum._2_4_GHz,
    radioTypes: [RadioTypeEnum._2_4_GHz],
    isDefault: true,
    id: '6cb1e831973a4d60924ac59f1bda073c',
    apGroupId: 'b88d85d886f741a08f521244cb8cc5c5',
    apGroupName: 'APs not assigned to any group',
    vlanPoolId: '1c061cf2649344adaf1e79a9d624a451',
    vlanPoolName: 'pool1'
  }]
}

const vlanPoolList = [{
  tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
  name: 'pool1',
  vlanMembers: ['123'],
  id: '1c061cf2649344adaf1e79a9d624a451'
}]


const params = {
  tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
  networkId: '373377b0cb6e46ea8982b1c80aabe1fa'
}

describe('VlanInput', () => {
  beforeAll(async () => {
    mockServer.use(
      rest.post(
        WifiUrlsInfo.getVlanPools.url,
        (req, res, ctx) => res(ctx.json(vlanPoolList))
      )
    )
  })

  beforeEach(() => {
    act(() => {
      store.dispatch(networkApi.util.resetApiState())
    })
  })

  it('should render correctly', async () => {
    const defaultAG = {
      apGroupId: '',
      apGroupName: '',
      isDefault: true,
      radio: RadioEnum.Both,
      radioTypes: [RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz],
      vlanId: 1
    }

    const { asFragment } = render(<Provider><VlanInput
      apgroup={defaultAG}
      network={network}
      onChange={()=>void 0}
    /></Provider>, { route: { params } })


    expect(asFragment()).toMatchSnapshot()

    const editButton = await screen.findByRole('button', { name: 'edit' })
    expect(editButton).toBeVisible()

    fireEvent.click(editButton)

    const cancelButton = await screen.findByRole('button', { name: 'close' })
    const vlanIdInput = await screen.findByRole('spinbutton')

    fireEvent.click(cancelButton)
    expect(vlanIdInput).not.toBeVisible()
  })

  it('change value', async () => {
    const callbackFn = jest.fn()

    render(<Provider><VlanInput
      apgroup={networkVenue_apgroup.apGroups[0]}
      network={network}
      onChange={callbackFn}
    /></Provider>, { route: { params } })

    const editButton = await screen.findByRole('button', { name: 'edit' })
    expect(editButton).toBeVisible()

    fireEvent.click(editButton)

    const okButton = await screen.findByRole('button', { name: 'check' })
    await userEvent.click(screen.getAllByRole('combobox')[0])
    const vlanType = screen.getByText('VLAN')
    fireEvent.click(vlanType)

    const vlanIdInput = await screen.findByRole('spinbutton')
    fireEvent.change(vlanIdInput, { target: { value: '123' } })

    fireEvent.click(okButton)

    expect(screen.getByText('VLAN-123 (Custom)')).toBeVisible()


    const reloadButton = await screen.findByRole('button', { name: 'reload' })
    expect(reloadButton).toBeVisible()
    fireEvent.click(reloadButton)

    expect(screen.getByText('VLAN Pool: pool1 (Custom)')).toBeVisible()

    expect(callbackFn).toHaveBeenCalledTimes(2)
  })
})