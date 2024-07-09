import { screen } from '@acx-ui/test-utils'

import { renderForm }   from './fixtures'
import { Introduction } from './introduction'

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  useStepFormContext: () => {
    return {
      initialValues: {
        status: 'new',
        sliceValue: 'NewZone',
        updatedAt: '2024-07-01T00:00:00.000Z'
      }
    }
  }
}))

describe('introduction test', () => {
  it('should match snapshot', async () => {
    const { asFragment } = renderForm(<Introduction />)
    await expect(await screen.findByText('NewZone')).toBeTrue()
    expect(asFragment()).toMatchSnapshot()
  })
})
