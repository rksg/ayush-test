import styled from 'styled-components/macro'

const Wrapper = styled.div`
  margin: 10px 0;
  .rows-selected {
    color: var(--acx-neutrals-60);
  }
`

function TableButtonBar (props: any) {
  return (
    <Wrapper>
      <div className='rows-selected'>
        {props.rowsSelected !== null && (
          <div>Selected venues: {props.rowsSelected}</div>
        )}
      </div>
    </Wrapper>
  )
}

export default TableButtonBar
