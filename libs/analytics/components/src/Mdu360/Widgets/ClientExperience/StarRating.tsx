import Stars                       from './Stars'
import { StarRatingItemContainer } from './styledComponents'

interface StarRatingProps {
  name: string;
  percentage: number;
}

const getNumberOfStars = (percentage: number) => {
  switch (true) {
    case percentage >= 85:
      return 5
    case percentage >= 70:
      return 4
    case percentage >= 55:
      return 3
    case percentage >= 40:
      return 2
    default:
      return 1
  }
}



const StarRating = ({ name, percentage }: StarRatingProps) => {
  const numberOfStars = getNumberOfStars(percentage)

  return (
    <StarRatingItemContainer>
      {name}
      <Stars numberOfStars={numberOfStars} />
      {numberOfStars}
    </StarRatingItemContainer>
  )
}

export default StarRating
