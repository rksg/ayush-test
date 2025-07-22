import { cssStr }    from '@acx-ui/components'
import { StarSolid } from '@acx-ui/icons'

import { StarsContainer } from './styledComponents'

const Stars = ({ numberOfStars }: { numberOfStars: number }) => {
  return (
    <StarsContainer>
      {Array.from({ length: 5 }, (_, index) => (
        <StarSolid
          key={index}
          style={{
            color:
              index < numberOfStars
                ? cssStr('--acx-semantics-yellow-50')
                : cssStr('--acx-neutrals-20'),
            width: '16px',
            height: '16px'
          }}
        />
      ))}
    </StarsContainer>
  )
}

export default Stars