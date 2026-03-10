---
title: "JavaScript Testing with Jest"
slug: "javascript-testing-with-jest"
description: "Learn how to write effective tests for your JavaScript applications using Jest. Covers unit testing, mocking, snapshot testing, and test-driven development."
tags: ["testing", "jest", "quality"]
authors:
  - 
    name: "PPhat DEv"
    profile: "https://github.com/pphatdev.png"
    url: "https://pphat.top"
thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71"
published: true
createdAt: "2025-05-05T09:15:00.000Z"
---

# **JavaScript Testing with Jest**

Testing is crucial for maintaining code quality and preventing bugs. Jest makes JavaScript testing simple and enjoyable.

## **Writing Your First Test**

Start with a simple unit test:

```javascript
// math.js
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

module.exports = { add, subtract };

// math.test.js
const { add, subtract } = require('./math');

describe('Math functions', () => {
  test('adds 1 + 2 to equal 3', () => {
    expect(add(1, 2)).toBe(3);
  });

  test('subtracts 5 - 3 to equal 2', () => {
    expect(subtract(5, 3)).toBe(2);
  });
});
```

## **Mocking Functions**

Use mocks to isolate units under test:

```javascript
// Mock a module
jest.mock('./api');

// Mock a function
const mockFetch = jest.fn();
global.fetch = mockFetch;

test('should fetch user data', async () => {
  mockFetch.mockResolvedValue({
    json: () => Promise.resolve({ name: 'John' })
  });

  const user = await fetchUser(1);
  expect(user.name).toBe('John');
  expect(mockFetch).toHaveBeenCalledWith('/api/users/1');
});
```
