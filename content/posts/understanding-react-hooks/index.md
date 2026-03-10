---
title: "Understanding React Hooks"
slug: "understanding-react-hooks"
description: "A comprehensive guide to React Hooks including useState, useEffect, useContext, and custom hooks. Learn how to manage state and side effects in functional components."
tags: ["react", "hooks", "frontend"]
authors:
  - 
    name: "PPhat DEv"
    profile: "https://github.com/pphatdev.png"
    url: "https://pphat.top"
thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee"
published: true
createdAt: "2025-02-28T14:15:00.000Z"
---

# **Understanding React Hooks**

React Hooks revolutionized how we write React components. They allow you to use state and other React features in functional components.

## **useState Hook**

The useState hook lets you add state to functional components:

```javascript
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

## **useEffect Hook**

useEffect handles side effects in functional components:

```javascript
import { useState, useEffect } from 'react';

function DataFetcher() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/data')
      .then(response => response.json())
      .then(data => setData(data));
  }, []); // Empty dependency array means this runs once

  return <div>{data ? JSON.stringify(data) : 'Loading...'}</div>;
}
```
