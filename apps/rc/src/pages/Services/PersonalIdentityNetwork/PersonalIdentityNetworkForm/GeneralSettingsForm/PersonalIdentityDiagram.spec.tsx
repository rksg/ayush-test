import { render, screen } from '@acx-ui/test-utils'

import { PersonalIdentityDiagram } from './PersonalIdentityDiagram'

describe('NSG GeneralSettings Form - PersonalIdentityDiagram', () => {
  it('Shuould show ap only image', async () => {
    render(<PersonalIdentityDiagram hasSwitch={false} />)
    const image = await screen.findByRole('img')
    expect(image.getAttribute('src')).toBe('personal-identity-with-ap-only.png')
  })

  it('Shuould show ap & switch image', async () => {
    render(<PersonalIdentityDiagram hasSwitch />)
    const image = await screen.findByRole('img')
    expect(image.getAttribute('src')).toBe('personal-identity-with-ap-and-switch.png')
  })
})