
import {
  Button,
  AccountIconSmall,
  QuestionIcon
} from './styledComponents'

function HeaderButtons () {
  return (
    <>
      <Button type='primary' icon={<QuestionIcon />} />
      <Button type='primary' icon={<AccountIconSmall />} />
    </>
  )
}

export default HeaderButtons
