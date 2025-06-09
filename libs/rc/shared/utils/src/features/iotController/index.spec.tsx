import { IotControllerStatusEnum } from '../../types'

import { getIotControllerStatus } from '.'

describe('seriesMappingIotController', () => {
  it('should correctly', async () => {
    expect(getIotControllerStatus(IotControllerStatusEnum.ONLINE).name).toBe('Operational')
  })
})
