import '@testing-library/jest-dom'
import { render } from '@testing-library/react'

import { Alert } from './index'

jest.mock('@acx-ui/icons', ()=>({
  InformationSolid: () => <div data-testid='information-solid'/>
}), { virtual: true })

describe('Alert', () => {
  it('should render correctly', () => {
    const { asFragment } = render(
      <>
        <Alert message='Informational Notes' type='info' closable /> 
        <p />
        <Alert message='Error' type='error' showIcon closable />
      </>
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
