import styled from 'styled-components'

export const questionIconStyle = {
  width: '16px', height: '16px',
  marginLeft: '4px',
  verticalAlign: 'text-top'
}

export const PrerequisiteListContiner = styled.div`
  padding: 10px;

  & > ol > li:not(:last-child) {
    margin-bottom: 24px;
  }
`

export const PrerequisiteListItemContiner = styled.ul`
  padding: 14px 15px 14px 30px;

  background-color: #f8f8fa;
  border-radius: 8px;
  list-style-type: disc;

  & > li:not(:last-child) {
    margin-bottom: 8px;
  }
`

export const ControlDot = styled.div<{ $active: boolean }>`
  width: 8px;
  height: 8px;
  background-color: ${props => props.$active ? '#7f7f7f' : '#e3e4e5'};
  border-radius: 8px;
  cursor: pointer;
`