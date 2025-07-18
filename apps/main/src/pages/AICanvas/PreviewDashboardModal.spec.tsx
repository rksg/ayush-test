import '@testing-library/jest-dom'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'


import { PreviewDashboardModal } from './PreviewDashboardModal'

const canvasData = {
  id: '123',
  name: 'Dashboard Canvas copy 1',
  updatedDate: '2025-04-18T03:35:17.558+00:00',
  content: '',
  widgets: [],
  visible: false
}

describe('PreviewDashboardModal', () => {
  it('should render dashboard correctly', async () => {
    render(
      <Provider>
        <PreviewDashboardModal
          data={[canvasData]}
          visible={true}
          setVisible={()=>{}}
        />
      </Provider>
    )
    expect(await screen.findByText('Dashboard Canvas copy 1')).toBeVisible()
  })
})
