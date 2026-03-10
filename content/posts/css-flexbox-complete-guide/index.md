---
title: "CSS Flexbox Complete Guide"
slug: "css-flexbox-complete-guide"
description: "Master CSS Flexbox with this comprehensive guide. Learn about flex containers, items, alignment, distribution, and practical examples for modern web layouts."
tags: ["css", "flexbox", "layout"]
authors:
  - 
    name: "PPhat DEv"
    profile: "https://github.com/pphatdev.png"
    url: "https://pphat.top"
thumbnail: "https://images.unsplash.com/photo-1558655146-d09347e92766"
published: true
createdAt: "2025-01-22T11:45:00.000Z"
---

# **CSS Flexbox Complete Guide**

Flexbox is a powerful layout method that makes it easy to design flexible and responsive layout structures.

## **Flex Container Properties**

Start by making an element a flex container:

```css
.container {
  display: flex;
  flex-direction: row; /* row | row-reverse | column | column-reverse */
  justify-content: center; /* flex-start | flex-end | center | space-between | space-around | space-evenly */
  align-items: center; /* stretch | flex-start | flex-end | center | baseline */
  flex-wrap: wrap; /* nowrap | wrap | wrap-reverse */
}
```

## **Flex Item Properties**

Control individual flex items:

```css
.item {
  flex-grow: 1; /* How much the item should grow */
  flex-shrink: 1; /* How much the item should shrink */
  flex-basis: auto; /* Initial size before free space is distributed */
  align-self: auto; /* Override the container's align-items */
  order: 0; /* Change the order without changing HTML */
}
```
