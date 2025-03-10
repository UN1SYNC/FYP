import { render } from './test-utils';
import React from 'react';

describe('Test Utils', () => {
  it('should provide a working render function', () => {
    const { container } = render(<div data-testid="test">Test</div>);
    expect(container).toBeTruthy();
  });
}); 