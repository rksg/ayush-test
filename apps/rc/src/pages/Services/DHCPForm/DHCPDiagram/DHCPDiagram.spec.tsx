import '@testing-library/jest-dom'

import { DHCPConfigTypeEnum } from '@acx-ui/rc/utils'
import { render, screen }     from '@acx-ui/test-utils'

import { DHCPDiagram } from './DHCPDiagram'

describe('DHCPDiagram', () => {
  it('should render default diagram successfully', async () => {
    render(<DHCPDiagram type={undefined} />)
    const diagram = screen.getByRole('img') as HTMLImageElement
    expect(diagram.src).toContain('dpsk.png')
  })

  describe('DHCPDiagram - SIMPLE', () => {
    const type = DHCPConfigTypeEnum.SIMPLE
    it('should render SIMPLE diagram successfully', async () => {
      render(<DHCPDiagram type={type} />)
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('dpsk.png')
    })
  })
  describe('DHCPDiagram - MULTIPLE', () => {
    const type = DHCPConfigTypeEnum.MULTIPLE
    it('should render MULTIPLE diagram successfully', async () => {
      render(<DHCPDiagram type={type} />)
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('open.png')
    })
  })

  describe('DHCPDiagram - HIERARCHICAL', () => {
    const type = DHCPConfigTypeEnum.HIERARCHICAL
    it('should render HIERARCHICAL diagram successfully', async () => {
      render(<DHCPDiagram type={type} />)
      const diagram = screen.getByRole('img') as HTMLImageElement
      expect(diagram.src).toContain('open-cloudpath-on-prem-deployment.png')
    })
  })

})
