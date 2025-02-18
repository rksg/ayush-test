import '@testing-library/jest-dom'

import { getPortsModule } from './PortsModal.utils'

describe('Test getPortsModule', () => { //TODO
  xit('should render correctly', async () => {
    const slots = [
      { slotNumber: 1, enable: true, option: '' },
      { slotNumber: 3, enable: true, option: '2X40G' },
      { slotNumber: 2, enable: true, option: '2X40G' }
    ]

    expect(getPortsModule(slots, false)).toStrictEqual([[]])
  })
})
