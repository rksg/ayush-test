import { CollapseProps } from 'antd'

import { cleanup, fireEvent, render, screen } from '@acx-ui/test-utils'

import { Collapse } from '.'

describe('Collapse', () => {

  afterEach(() => cleanup())

  const SampleCollapse = (props: CollapseProps) => {
    return <Collapse {...props} defaultActiveKey={['1', '2']}>
      <Collapse.Panel key='1' header='test1'></Collapse.Panel>
      <Collapse.Panel key='2' header='test2'></Collapse.Panel>
    </Collapse>
  }

  it('should render default collapse correctly', async () => {
    render(<SampleCollapse />)
    expect(await screen.findAllByTestId('CollapseInactive')).toHaveLength(2)
  })

  it('should render active collapse correctly', async () => {
    render(<SampleCollapse />)
    const header1 = await screen.findByText('test1')
    fireEvent.click(header1)
    expect(await screen.findAllByTestId('CollapseInactive')).toHaveLength(1)
    expect(await screen.findAllByTestId('CollapseActive')).toHaveLength(1)
  })

  it('should render start icon & bordered collapse correctly', async () => {
    const { asFragment } = render(<SampleCollapse bordered expandIconPosition='start'/>)
    expect(asFragment()).toMatchSnapshot()
  })
})
