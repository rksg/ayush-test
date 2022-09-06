import { AlarmsHeaderButton } from '../../components/Alarms/HeaderButton'

import {
  Button,
  Divider,
  AccountIconSmall,
  QuestionIcon,
  SearchIcon
} from './styledComponents'

function HeaderButtons () {
  return (
    <>
      <Button type='primary' shape='circle' icon={<SearchIcon />} />
      <Divider />
      <AlarmsHeaderButton />
      <Button type='primary' icon={<QuestionIcon />} />
      <Button type='primary' icon={<AccountIconSmall />} />
    </>
  )
}

export default HeaderButtons
