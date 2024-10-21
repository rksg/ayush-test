import styled from 'styled-components/macro'

export const CheckboxIndexLabel = styled.div`
  display: inline-block;
  border: 1px solid;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  text-align: center;
  line-height: 20px;
  font-size: 10px;
  font-weight: 600;
  margin: 7px 5px;
`

export const Container = styled.div`
  display: flex;
  flex-direction: column;
`

export const Header = styled.div`
  flex: 0 1 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

export const HeaderWithAddButton = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const Title = styled.span`
  font-size: 24px;
  font-weight: 600;
  font-family: var(--acx-accent-brand-font);
`

export const Description = styled.span`
  font-size: 12px;
  color: var(--acx-neutrals-60);
  margin: 5px 0 30px 0;
`

export const VlanContainer = styled.div`
  display: grid;
  grid-template-columns: 45px 1fr;
`

export const CheckboxContainer = styled.div`
  display: flex;
`

export const VlanDetails = styled.div`
  display: flex;
  flex-direction: column;
`

export const PurposeContainer = styled.div`
  display: flex;
  background-color: var(--acx-neutrals-15);
  padding: 10px 20px;
  flex-grow: 1;
  flex-direction: column;
  border-radius: 8px;
`

export const PurposeHeader = styled.div`
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;

  & > span {
    margin-left: 5px;
  }
`

export const PurposeText = styled.div`
  font-size: 12px;
  margin: 5px 0 0 25px;
`

export const HighlightedBox = styled.div`
  display: flex;
  padding: 15px;
  background-color: var(--acx-accents-orange-10);
  flex-grow: 1;
  flex-direction: column;
  border-radius: 8px;
  margin: 20px 0;
`

export const HighlightedTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;

  & > span {
    margin-left: 5px;
  }
`

export const HighlightedDescription = styled.div`
  font-size: 14px;
  margin: 5px 0 0 25px;
`
