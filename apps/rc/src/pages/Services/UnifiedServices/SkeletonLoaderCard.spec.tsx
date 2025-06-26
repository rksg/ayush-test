import { render, screen } from '@acx-ui/test-utils'
import { SkeletonLoaderCard } from './SkeletonLoaderCard'

describe('SkeletonLoaderCard', () => {
  it('should render 4 skeleton cards', () => {
    render(<SkeletonLoaderCard />)
    const skeletonLoadingElements = screen.getAllByRole('list')
      .filter(el => el.classList.contains('ant-skeleton-paragraph'))


    expect(skeletonLoadingElements.length).toBe(4)
  })
})
