import { Incident }       from '@acx-ui/analytics/utils'
import { render, screen } from '@acx-ui/test-utils'

import { extraValues } from './config'

jest.mock('./RogueAPsDrawer', () => ({
  RogueAPsDrawerLink: () => <div data-testid='RogueAPsDrawerLink' />
}))

describe('extraValues', ()=>{
  it('should render corresponding config', async () => {
    const incident = { id: 'id' } as Incident
    Object.keys(extraValues).forEach(key => {
      const Component = extraValues[key](incident)
      render(<Component incident={incident}/>)
      screen.getByTestId(key)
    })
  })
})