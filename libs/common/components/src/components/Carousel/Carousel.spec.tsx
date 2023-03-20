import { render, screen } from '@testing-library/react'

import { Carousel } from '.'

describe('Carousel component', () => {
  it('should render carousel with title', () => {
    render(<Carousel contentList={[['content','content' ]]}
      classList='carousel-card'
      title='Title'
    />)
    expect(screen.getByText('Title')).toBeVisible()
  })
  it('should render carousel with subtitle', () => {
    render(<Carousel title='title'
      subTitle='Sub Title'
      contentList={[['content','content' ]]}
      classList='carousel-card'/>)
    expect(screen.getByText('Sub Title')).toBeVisible()
  })
  it('should render carousel with content', () => {
    render(<Carousel title='title'
      contentList={[['content','content' ], ['content list','content' ]]}
      classList='carousel-card'/>)
    expect(screen.getAllByText('content list')[0]).toBeInTheDocument()
  })
  it('should render carousel with no data', () => {
    render(<Carousel title='title'
      subTitle='No data to report'
      contentList={[['No Data']]}
      classList='carousel-card no-data'/>)
    expect(screen.getByText('No data to report')).toBeVisible()
  })
})
