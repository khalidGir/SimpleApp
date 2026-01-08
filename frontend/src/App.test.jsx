import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    // Since App defaults to Landing page which likely has "SimpleApp" or similar text
    // Let's check for something generic if we don't know the exact content yet,
    // or just check that render didn't throw.
    expect(document.body).toBeTruthy();
  });
});
