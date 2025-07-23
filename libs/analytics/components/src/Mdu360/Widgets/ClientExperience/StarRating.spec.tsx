import { render, screen } from '@acx-ui/test-utils'

import StarRating from './StarRating'

jest.mock('./Stars', () => ({ numberOfStars }: { numberOfStars: number }) => (
  <div>
    {Array.from({ length: 5 }, (_, index) => (
      <div
        key={index}
        data-testid='StarSolid'
        style={{
          color: index < numberOfStars ? 'yellow' : 'gray'
        }}
      />
    ))}
  </div>
))

describe('StarRating', () => {
  it('should return 5 stars for percentage >= 85', () => {
    render(<StarRating name='High Performance' percentage={85} />)

    expect(screen.getByText(/High Performance/)).toBeVisible()
    expect(screen.getByText(/5/)).toBeVisible()
    const filledStars = screen.getAllByTestId('StarSolid').filter(star =>
      star.getAttribute('style')?.includes('yellow')
    )
    expect(filledStars).toHaveLength(5)
  })

  it('should return 4 stars for percentage >= 70 and < 85', () => {
    render(<StarRating name='Good Performance' percentage={75} />)

    expect(screen.getByText(/Good Performance/)).toBeVisible()
    expect(screen.getByText(/4/)).toBeVisible()
    const filledStars = screen.getAllByTestId('StarSolid').filter(star =>
      star.getAttribute('style')?.includes('yellow')
    )
    expect(filledStars).toHaveLength(4)
  })

  it('should return 3 stars for percentage >= 55 and < 70', () => {
    render(<StarRating name='Average Performance' percentage={60} />)

    expect(screen.getByText(/Average Performance/)).toBeVisible()
    expect(screen.getByText(/3/)).toBeVisible()
    const filledStars = screen.getAllByTestId('StarSolid').filter(star =>
      star.getAttribute('style')?.includes('yellow')
    )
    expect(filledStars).toHaveLength(3)
  })

  it('should return 2 stars for percentage >= 40 and < 55', () => {
    render(<StarRating name='Below Average Performance' percentage={45} />)

    expect(screen.getByText(/Below Average Performance/)).toBeVisible()
    expect(screen.getByText(/2/)).toBeVisible()
    const filledStars = screen.getAllByTestId('StarSolid').filter(star =>
      star.getAttribute('style')?.includes('yellow')
    )
    expect(filledStars).toHaveLength(2)
  })

  it('should return 1 star for percentage < 40', () => {
    render(<StarRating name='Poor Performance' percentage={35} />)

    expect(screen.getByText(/Poor Performance/)).toBeVisible()
    expect(screen.getByText(/1/)).toBeVisible()
    const filledStars = screen.getAllByTestId('StarSolid').filter(star =>
      star.getAttribute('style')?.includes('yellow')
    )
    expect(filledStars).toHaveLength(1)
  })
})
