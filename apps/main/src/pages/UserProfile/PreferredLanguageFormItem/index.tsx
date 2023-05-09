import styled from 'styled-components';

/* eslint-disable-next-line */
export interface PreferredLanguageFormItemProps {}

const StyledIndex = styled.div`
  color: pink;
`;

export function PreferredLanguageFormItem(props: PreferredLanguageFormItemProps) {
  return (
    <StyledIndex>
      <h1>Welcome to Index!</h1>
    </StyledIndex>
  );
}

export default PreferredLanguageFormItem;
