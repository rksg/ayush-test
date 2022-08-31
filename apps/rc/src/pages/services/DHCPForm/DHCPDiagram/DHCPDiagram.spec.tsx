import '@testing-library/jest-dom'

import { DHCPConfigTypeEnum } from '@acx-ui/rc/utils'
import { render, screen }     from '@acx-ui/test-utils'

import { DHCPDiagram } from './DHCPDiagram'

describe('DHCPDiagram', () => {
  it('should render default diagram successfully', async () => {
    const { asFragment } = render(<DHCPDiagram type={undefined} />)
    const diagram = screen.getByRole('img') as HTMLImageElement
    expect(diagram.src).toContain('dpsk.png')
    expect(asFragment()).toMatchSnapshot()
  })

  describe('DHCPDiagram - MULTIPLE', () => {
    const type = DHCPConfigTypeEnum.MULTIPLE
    it('should render MULTIPLE diagram successfully', async () => {
      const { asFragment } = render(<DHCPDiagram type={type} />)
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('open.png')
      expect(asFragment()).toMatchSnapshot()
    })
  })

  describe('DHCPDiagram - HIERARCHICAL', () => {
    const type = DHCPConfigTypeEnum.HIERARCHICAL
    it('should render HIERARCHICAL diagram successfully', async () => {
      const { asFragment } = render(<DHCPDiagram type={type} />)
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('open-cloudpath-on-prem-deployment.png')
      expect(asFragment()).toMatchSnapshot()
    })
  })

})
