import { Alarm }                     from '@acx-ui/rc/services'
import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { AlarmList } from '.'

const data = [{
  severity: 'Critical',
  serialNumber: 'FEK3224R08K',
  entityType: 'SWITCH',
  switchMacAddress: 'c0:c5:20:aa:24:7b',
  startTime: 1657686000000,
  entityId: 'FEK3224R08J',
  id: 'FEK3224R08J_switch_status',
  message: 'FEK3224R08K disconnected from the cloud controller for more than 15 minutes.',
  venueName: 'EmptyVenue',
  switchName: 'FEK3224R08K',
  isSwitchExists: true
}, {
  severity: 'Major',
  serialNumber: 'FEK3224R08J',
  entityType: 'SWITCH',
  switchMacAddress: 'c0:c5:20:aa:24:7b',
  startTime: 1657686000000,
  entityId: 'FEK3224R08J',
  id: 'FEK3224R08J_switch_status',
  message: 'FEK3224R08J disconnected from the cloud controller for more than 15 minutes.',
  venueName: 'EmptyVenue',
  switchName: 'FEK3224R08J',
  isSwitchExists: false
}] as Array<Alarm>

describe('Alarm List', () => {
  it('should render list', async () => {
    const onNavigateMock = jest.fn()

    const { asFragment } =render(<AlarmList
      data={data}
      onNavigate={onNavigateMock}
      height={300}
      width={300}
    />)

    fireEvent.click(await screen.findByText('FEK3224R08K'))
    expect(onNavigateMock).toHaveBeenCalled()

    expect(asFragment()).toMatchSnapshot()
  })
})