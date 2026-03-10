---
title: "TypeScript for JavaScript Developers"
slug: "typescript-for-javascript-developers"
description: "Make the transition from JavaScript to TypeScript smoothly. Learn about type annotations, interfaces, generics, and how TypeScript can improve your code quality."
tags: ["typescript", "javascript", "types"]
authors:
  - 
    name: "PPhat DEv"
    profile: "https://github.com/pphatdev.png"
    url: "https://pphat.top"
thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c"
published: true
createdAt: "2025-05-18T13:20:00.000Z"
---

# **TypeScript for JavaScript Developers**

TypeScript adds static type checking to JavaScript, helping you catch errors early and write more maintainable code.

## **Basic Type Annotations**

Add type annotations to variables and functions:

```typescript
// Variables
let name: string = 'John';
let age: number = 30;
let isActive: boolean = true;

// Functions
function greet(name: string): string {
  return `Hello, ${name}!`;
}

// Arrays
let numbers: number[] = [1, 2, 3, 4, 5];
let names: string[] = ['Alice', 'Bob', 'Charlie'];
```

## **Interfaces**

Define object shapes with interfaces:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  isActive?: boolean; // Optional property
}

function createUser(userData: User): User {
  return {
    id: Date.now(),
    ...userData
  };
}
```
