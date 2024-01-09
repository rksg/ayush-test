import { useIsSplitOn }           from '@acx-ui/feature-toggle'
import { usePersonaAsyncHeaders } from '@acx-ui/rc/components'


const expectedHeaders = {
  'Content-Type': 'application/vnd.ruckus.v2+json',
  'Accept': 'application/vnd.ruckus.v2+json'
}

describe('UsePersonaEDAHeaders', () => {
  it('should return correct headers when FF is on', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    const result = usePersonaAsyncHeaders()

    expect(result.customHeaders).toStrictEqual(expectedHeaders)
  })

  it('should return empty headers when FF is off', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    const result = usePersonaAsyncHeaders()

    expect(result.customHeaders).toStrictEqual({})
  })
})
