import { CountAndNames }             from '@acx-ui/rc/utils'
import { Provider }                  from '@acx-ui/store'
import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { CountAndNamesTooltip } from '.'

const data1: CountAndNames = {
  count: 1,
  names: [ 't1' ]
}

const data5: CountAndNames = {
  count: 5,
  names: ['t1', 't2', 't3', 't4', 't5']
}

describe('CountAndNamesTooltip', () => {
  it('should render correctly without data', async () => {
    render(
      <Provider>
        <CountAndNamesTooltip />
      </Provider>
    )
    const numberDisplay = await screen.findByText('0')
    expect(numberDisplay).toBeVisible()
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <CountAndNamesTooltip data={data1} />
      </Provider>
    )
    const numberDisplay = await screen.findByText('1')
    expect(numberDisplay).toBeVisible()
    fireEvent.mouseOver(numberDisplay)
    const tooltip = await screen.findByText('t1')
    expect(tooltip).toBeInTheDocument()
  })

  it('test show max list', async () => {
    render(
      <Provider>
        <CountAndNamesTooltip data={data5} maxShow={3}/>
      </Provider>
    )

    const numberDisplay = await screen.findByText('5')
    expect(numberDisplay).toBeVisible()

    fireEvent.mouseOver(numberDisplay)
    const tooltip = await screen.findByText('t1')
    expect(tooltip).toBeInTheDocument()
    const tooltipNote = await screen.findByText('And 2 more...')
    expect(tooltipNote).toBeInTheDocument()
  })

  it('test support link', async () => {
    const params = { tenantId: 'test-id' }
    render(
      <Provider>
        <CountAndNamesTooltip data={data5} linkUrl='/test/1'/>
      </Provider>, {
        route: { params }
      }
    )

    const numberDisplay = await screen.findByRole('link', { name: '5' })
    expect(numberDisplay).toBeVisible()
  })

})