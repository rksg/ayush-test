import { render } from '@testing-library/react';

import PreferredLanguageFormItem from './index';

describe('PreferredLanguageFormItem', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PreferredLanguageFormItem />);
    expect(baseElement).toBeTruthy();
  });
});
