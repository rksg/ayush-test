import { getIntl } from '@acx-ui/utils'

import { Subtitle } from '../Subtitle'

import { PageStyle } from './styledComponents'

export const PageNotFound = () => {
  const { $t } = getIntl()

  return <PageStyle>
    <Subtitle level={2}>{$t({ defaultMessage: 'Oops. Something is going wrong...' })}</Subtitle>
    <div className='text'>
      {$t({ defaultMessage: 'It is probably our fault, but let’s try again or go to left menu' })}
    </div>
  </PageStyle>
}