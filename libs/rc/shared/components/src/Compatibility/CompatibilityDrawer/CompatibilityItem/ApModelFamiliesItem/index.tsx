import { intersection } from 'lodash'

import { ApModelFamily, ApModelFamilyType } from '@acx-ui/rc/utils'

import { StyledApModelFamilyWrapper } from '../../styledComponents'
import { getApModelFamilyTag }        from '../../utils'


export const ApModelFamiliesItem = (props: {
    apModelFamilies: ApModelFamily[]
    models: string[]
  }) => {
  const { apModelFamilies, models } = props
  const familiesData = [] as {
    name: string,
    displayName: string,
    models: string[]
  }[]
  apModelFamilies.forEach((apModelFamily: ApModelFamily) => {
    const { apModels, name, displayName } = apModelFamily
    const findModels = intersection(apModels, models)
    if (findModels.length > 0) {
      familiesData.push({
        name,
        displayName,
        models: findModels
      })
    }
  })

  const hasLongTags = familiesData.some(d => d.displayName.includes('wave'))
  return (<>
    {familiesData.map(({ name, displayName, models }, index) => (
      <StyledApModelFamilyWrapper
        key={`${name}_${index}`}
        tagWidth={hasLongTags? '80px' : '60px'}
      >
        {getApModelFamilyTag(name as ApModelFamilyType, displayName)}
        <div>{models.join(', ').replace('R350:', '')}</div>
      </StyledApModelFamilyWrapper>
    ))}
  </>)
}
