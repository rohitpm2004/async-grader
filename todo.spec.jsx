import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

// Helper to dynamically import the Todo component so it fails gracefully if missing
async function getTodoComponent() {
  try {
    const module = await import('./components/todo.jsx');
    return module.default;
  } catch (err) {
    try {
      const module = await import('./Components/todo.jsx');
      return module.default;
    } catch {
      throw new Error("Could not find src/components/todo.jsx");
    }
  }
}

describe('React Todo Grader', () => {
  // Test 1: Project Setup & Architecture
  test('Project Setup & Architecture: renders Todo component', async () => {
    const Todo = await getTodoComponent();
    expect(Todo).toBeDefined();
    const { container } = render(<Todo />);
    expect(container).toBeDefined();
  });

  // Test 2: State Management
  test('State Management: renders initial task list and tracks newTask input state', async () => {
    const Todo = await getTodoComponent();
    render(<Todo />);
    
    // Check if initial task is rendered (e.g., text containing "Complete assignment" or similar default task)
    const listItems = screen.queryAllByRole('listitem') || [];
    const textElements = screen.queryAllByText(/assignment|task|todo/i);
    
    expect(listItems.length + textElements.length).toBeGreaterThan(0);
    
    // Check if input field exists
    const input = screen.getByRole('textbox') || screen.getByPlaceholderText(/task/i);
    expect(input).toBeDefined();
  });

  // Test 3: Input Handling
  test('Input Handling: types in input, clicks add button, appends task, and clears input', async () => {
    const Todo = await getTodoComponent();
    render(<Todo />);
    
    const input = screen.getByRole('textbox') || screen.getByPlaceholderText(/task/i);
    const addButton = screen.getByRole('button', { name: /Add/i }) || screen.getByText(/Add/i);
    
    // Type into input
    fireEvent.change(input, { target: { value: 'Buy Groceries' } });
    expect(input.value).toBe('Buy Groceries');
    
    // Record list size before adding
    const listBefore = screen.queryAllByText(/Buy Groceries/i).length;
    
    // Click Add button
    fireEvent.click(addButton);
    
    // Verify it was added and input cleared
    expect(screen.queryAllByText(/Buy Groceries/i).length).toBeGreaterThan(listBefore);
    expect(input.value).toBe('');
  });

  test('Input Handling: does not append empty inputs', async () => {
    const Todo = await getTodoComponent();
    render(<Todo />);
    
    const input = screen.getByRole('textbox') || screen.getByPlaceholderText(/task/i);
    const addButton = screen.getByRole('button', { name: /Add/i }) || screen.getByText(/Add/i);
    
    // Try adding empty string
    fireEvent.change(input, { target: { value: '   ' } });
    const countBefore = screen.queryAllByRole('listitem').length;
    
    fireEvent.click(addButton);
    
    const countAfter = screen.queryAllByRole('listitem').length;
    expect(countAfter).toBe(countBefore);
  });

  // Test 4: Task Completion & Deletion
  test('Task Completion & Deletion: toggles checkbox completed state', async () => {
    const Todo = await getTodoComponent();
    render(<Todo />);
    
    const checkboxes = screen.queryAllByRole('checkbox');
    if (checkboxes.length === 0) {
      throw new Error("No checkboxes found in Todo task list");
    }
    
    const checkbox = checkboxes[0];
    const initialChecked = checkbox.checked;
    
    // Toggle checkbox
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(!initialChecked);
  });

  test('Task Completion & Deletion: deletes a task on click', async () => {
    const Todo = await getTodoComponent();
    render(<Todo />);
    
    const deleteButtons = screen.queryAllByRole('button', { name: /delete/i }) || screen.queryAllByText(/delete/i);
    if (deleteButtons.length === 0) {
      throw new Error("No delete buttons found in Todo list");
    }
    
    // Add a unique task first to make deletion clear
    const input = screen.getByRole('textbox') || screen.getByPlaceholderText(/task/i);
    const addButton = screen.getByRole('button', { name: /Add/i }) || screen.getByText(/Add/i);
    fireEvent.change(input, { target: { value: 'Task to Delete' } });
    fireEvent.click(addButton);
    
    const taskEl = screen.getByText(/Task to Delete/i);
    expect(taskEl).toBeInTheDocument();
    
    // Find the delete button for our new task (usually the last delete button)
    const currentDeleteButtons = screen.queryAllByRole('button', { name: /delete/i }) || screen.queryAllByText(/delete/i);
    const lastDeleteBtn = currentDeleteButtons[currentDeleteButtons.length - 1];
    
    // Click delete
    fireEvent.click(lastDeleteBtn);
    expect(screen.queryByText(/Task to Delete/i)).not.toBeInTheDocument();
  });

  // Test 5: UI Structure & CSS Styling
  test('UI Structure & CSS Styling: applies check class to completed task text', async () => {
    const Todo = await getTodoComponent();
    const { container } = render(<Todo />);
    
    const checkboxes = screen.queryAllByRole('checkbox');
    if (checkboxes.length === 0) {
      throw new Error("No checkboxes found in Todo list");
    }
    
    // Ensure task is completed (checked)
    const checkbox = checkboxes[0];
    if (!checkbox.checked) {
      fireEvent.click(checkbox);
    }
    
    // Check if the check class is applied in the DOM
    const checkElement = container.querySelector('.check');
    expect(checkElement).toBeDefined();
    expect(checkElement).not.toBeNull();
  });
});
