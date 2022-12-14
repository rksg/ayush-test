import '@testing-library/jest-dom'

import { Provider  }                 from '@acx-ui/store'
import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { tenantID, currentEdge, edgePortsSetting } from '../__tests__/fixtures'

import EdgeDetailsDrawer from '.'

const params: { tenantId: string, serialNumber: string, venueId: string } =
    { tenantId: tenantID, serialNumber: currentEdge.serialNumber, venueId: currentEdge.venueId }

describe('Edge Detail Drawer', () => {
  it('should render correctly', async () => {
    render(<Provider>
      <EdgeDetailsDrawer
        visible={true}
        setVisible={() => {}}
        currentEdge={currentEdge}
        edgePortsSetting={edgePortsSetting}
      />
    </Provider>, { route: { params } })

    expect(await screen.findByText('Properties')).toBeVisible()
    fireEvent.click(screen.getByText('Settings'))
    const button = screen.getByRole('button', { name: /close/i })
    fireEvent.click(button)
  })

  it('should have correct link to venue detail page', async () => {
    render(<Provider>
      <EdgeDetailsDrawer
        visible={true}
        setVisible={() => {}}
        currentEdge={currentEdge}
        edgePortsSetting={edgePortsSetting}
      />
    </Provider>, { route: { params } })

    const target = await screen.findByText(currentEdge.venueName)
    expect(target.tagName).toBe('A')
    expect(target.getAttribute('href'))
      .toBe(`/t/${params.tenantId}/venues/${currentEdge.venueId}/venue-details/overview`)
  })
})
