import { render, screen } from '@acx-ui/test-utils'

import { PersonalIdentityDiagram } from './PersonalIdentityDiagram'

describe('NSG GeneralSettings Form - PersonalIdentityDiagram', () => {
  it('Shuould show ap only image', async () => {
    render(<PersonalIdentityDiagram />)
    const image = await screen.findByRole('img')
    expect(image.getAttribute('src')).toBe('personal-identity-all.png')
  })
})