
import {
  AccountIconSmall,
  Button,
  Divider,
  NotificationIcon,
  QuestionIcon,
  SearchIcon
} from './styledComponents'

function HeaderButtons () {
  return (
    <>
      <Button type='primary' shape='circle' icon={<SearchIcon />} />
      <Divider />
      <Button type='primary' icon={<NotificationIcon />} />
      <Button type='primary' icon={<QuestionIcon />} />
      <Button type='primary' icon={<AccountIconSmall />} />
    </>
  )
}

export default HeaderButtons
