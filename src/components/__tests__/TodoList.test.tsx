
import { render, screen, waitFor } from '@testing-library/react';
import TodoList from '../TodoList';

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]),
  })
) as jest.Mock;

describe('TodoList', () => {
  it('renders the todo list', async () => {
    render(<TodoList />);
    
    // Wait for the component to finish loading and rendering the initial state
    await screen.findByText('No todos yet — add one above.');

    // Check if the input field and button are rendered
    expect(screen.getByPlaceholderText('Add a todo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });
});
