import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  it('renders children correctly', () => {
    render(<Button>Touch Grass</Button>);
    expect(screen.getByRole('button', { name: /touch grass/i })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Start Adventure</Button>);
    fireEvent.click(screen.getByRole('button', { name: /start adventure/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables button when isLoading is true', () => {
    render(<Button isLoading>Generating</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('applies variant styling classes', () => {
    render(<Button variant="accent">Accent Action</Button>);
    const button = screen.getByRole('button', { name: /accent action/i });
    expect(button.className).toContain('bg-earth-accent');
  });
});
