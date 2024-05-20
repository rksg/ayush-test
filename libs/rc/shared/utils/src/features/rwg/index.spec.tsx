import { RWGStatusEnum } from '../../types'

import { getRwgStatus } from '.'

describe('seriesMappingRWG', () => {
  it('should correctly recognize OWE transition network', async () => {
    expect(getRwgStatus(RWGStatusEnum.ONLINE).name).toBe('Operational')
  })
})
