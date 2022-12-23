import React from 'react';
import { act, render, screen } from '@testing-library/react';
import App from './App';

const wait = async () =>
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

test('Clicking the increment button increments the counter', async () => {
  render(<App />);

  await wait();

  // find the counter text element using regex, we don't know what the current value will be
  const counterText = screen.getByText(/Counter: \d+/);

  // Extract the current counter value from the text element
  const currentCounterValue = Number(
    counterText.textContent?.match(/\d+/)?.[0]
  );

  await wait();

  // find the increment button and click it
  const incrementButton = screen.getByText('Increment');
  incrementButton.click();

  await wait();

  // find the counter element and check that it has the correct value
  const counterElement = screen.getByText(
    `Counter: ${currentCounterValue + 1}`
  );
  expect(counterElement).toBeInTheDocument();
}, 10000);
