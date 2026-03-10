---
title: "Building REST APIs with Node.js"
slug: "building-rest-apis-nodejs"
description: "Learn how to build robust REST APIs using Node.js and Express. Covers routing, middleware, error handling, authentication, and best practices for API development."
tags: ["nodejs", "api", "backend"]
authors:
  - 
    name: "PPhat DEv"
    profile: "https://github.com/pphatdev.png"
    url: "https://pphat.top"
thumbnail: "https://images.unsplash.com/photo-1627398242454-45a1465c2479"
published: true
createdAt: "2025-04-10T08:30:00.000Z"
---

# **Building REST APIs with Node.js**

Node.js and Express make it easy to build powerful REST APIs. Let's explore the fundamentals.

## **Setting Up Express**

First, install Express and set up a basic server:

```javascript
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to our API!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## **Creating CRUD Routes**

Implement the four basic operations:

```javascript
// GET all users
app.get('/api/users', (req, res) => {
  // Return all users
});

// GET single user
app.get('/api/users/:id', (req, res) => {
  // Return user by ID
});

// POST new user
app.post('/api/users', (req, res) => {
  // Create new user
});

// PUT update user
app.put('/api/users/:id', (req, res) => {
  // Update user by ID
});

// DELETE user
app.delete('/api/users/:id', (req, res) => {
  // Delete user by ID
});
```
