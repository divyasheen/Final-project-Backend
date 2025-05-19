# Overview

1. Modul 1: HTML & CSS
2. Modul 2: Programming Basics
3. Modul 3: SPA
4. Modul 4: Backend
5. Modul 5: Fullstack Webpage

# Module 1: Lesson 6

# Exercise

1. Create a "<div>" with text
2. Give the box
- Padding: 20px
- Border: 2px, solid, black
- Margin: 30px

# Module 1: Lesson 7

Flexbox (short for Flexible Box Layout) is a CSS layout module that makes it easier to arrange elements within a container dynamically and efficiently - both in rows and columns. It was developed to solve problems with the alignment and distribution of space in containers.

Basic principles:
Flexbox consists of two levels:
1. flex container - the element on which display: flex is set
2. flex items - the direct children of this container

Most important features:
For flex container:
- 'display: flex' Makes an element to an flex container
- 'flex-direction' directions of the axis : row (default), column, row-reverse, column-reverse
- 'justify-content' Distribution along the main axis (z. B. flex-start, center, - space-between, space-around, space-evenly)
- 'align-items' Distribution along the cross axis (z. B. stretch, flex-start, center, baseline)
- 'flex-wrap' line break: nowrap (Standard), wrap, wrap-reverse
- 'gap' Space between items

For flex items:
- 'flex-grow' How much an item can grow if space is available
- 'flex-shrink' How much an item an item can shrink if space isn't available
- 'flex-basis' Size at the beginning(auto, 0, 100px usw. sein)
- 'flex' Kurzform: flex-grow flex-shrink flex-basis (z. B. flex: 1 0 200px)
- 'align-self' Überschreibt align-items nur für dieses Item

When do I use flexbox?
- 
Wann verwende ich Flexbox?
- If you want to align elements in a single row or column
- For buttons in a bar, cards next to each other, navigations, centring
- If you need responsive behaviour without a lot of media queries