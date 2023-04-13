import MigrationTable from './MigrationTable'
import * as UI        from './styledComponents'

const Administrators = () => {

  return (
    <UI.Wrapper
      direction='vertical'
      justify-content='space-around'
      size={36}
    >
      <MigrationTable />
    </UI.Wrapper>
  )
}

export default Administrators
