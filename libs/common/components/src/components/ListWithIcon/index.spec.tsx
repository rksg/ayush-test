import {
  HomeOutlined
} from '@ant-design/icons'
import { render } from '@testing-library/react'

import { ListWithIcon, ListWithIconProps } from '.'

describe('ListWithIcon',()=>{
  
  const data:ListWithIconProps['data']=Array.from(Array(15).keys()).map((_,index)=>({
    title: `Item ${index+1}`,
    icon: <HomeOutlined/>,
    popoverContent: index % 2 ? <h3>Popover Content {index+1}</h3> : undefined
  }))
  
  it('should render a component for empty data', () => {
    const { asFragment } = render(<ListWithIcon data={[]}/>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render a component for proper data', () => {
    const { asFragment } = render(<ListWithIcon data={data} showPopoverTitle={true} />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render a component for proper data with header and footer', () => {
    const header=<h3>Header</h3>
    const footer=<h3>Footer</h3>
    const { asFragment } = render(<ListWithIcon data={data} header={header} footer={footer}/>)
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render a component with pagination', () => {
    const { asFragment } = render(<ListWithIcon data={data} pageSize={5} isPaginate={true}/>)
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render a component with pagination having default pageSize', () => {
    const { asFragment } = render(<ListWithIcon data={data} isPaginate={true} />)
    expect(asFragment()).toMatchSnapshot()
  })

})