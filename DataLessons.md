# Overview

1. Modul 1: HTML & CSS
2. Modul 2: Programming Basics
3. Modul 3: SPA
4. Modul 4: Backend
5. Modul 5: Fullstack Webpage

# Modul 1: HTML & CSS

## Lesson 1: HTML-Basics

Before we start with the first topic, you should understand what awaits you on your journey into the knowledge of the Coderealm.
Imagine you are building a house. First you build a shell - the walls, the floor. You can live in it, but it's not pretty or functional yet, so you'll probably lay wooden flooring and paint the walls - and what's a house without furniture? But now you still need electricity, heating and maybe even a whole smart home! Last but not least, there's a shed where you can store things.
You might be wondering what this is all about. You wanted to create websites, SAVE THE CODEREALM and not build houses. Yes ... you will, but first understand what you will learn. A website is like this house you need a shell, which is the HTML. Then you can style this shell with CSS. You get the functionality with Javascript and you can compare the shed with the backend.

I hope you now understand a little better what to expect. So let's get straight into the adventure ...

### Theory:

Let's start with the basics of the shell. HTML is an abbreviation for HyperText Markup Language. Each HTML file consists of:

`<!DOCTYPE html>` – Tells the browser that this is an HTML5 document.
`<html> </html>` – The root element of the page. This includes all information that is to be processed by the browser.
`<head> </head>` – Contains meta information (not visible content), e.g. title, character encoding, fonts, little picture for the tab.
`<title> </title>` – Sets the title of the browser tab.
`<body> </title>` – Contains all visible content.

Important!
Every tag has an opening and a closing tag. That means everything which is between those tags belongs to them. Opening tags are <head> or <body>. They only contain the name of the tag. Closing tags always have a ‘/’ - </head> or </body>. Special cases are self-closing tags - but we will come to these later.

### Basic example:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>...</title>
  </head>
  <body>
    ...
  </body>
</html>
```

### Exercise

Create a basic HTML page with:

- an title that say: "Save Coderealm!"
- the page should show "Hello World!"

## Lesson 2: First Tags - text, Lists, Links and Images

### Theory:

The most exciting part is the body. Commands are written in it with different tags that cause things to be displayed on the website.

These tags describe elements within the HTML. You can distinguish between two types of these elements: Block and inline elements.

Here you will find an overview of the most common and important tags:

Block elements always start on a new line, take up the full width of their parent element (elements in which they are located) and can contain other block and inline elements.
Inline elements remain on the same line as the surrounding text, only take up as much space as they need and cannot contain block elements, only text or other inline elements.

Common & important HTML Tags
<br>
`<h1>` to `<h6>` = Headings (from most to least important)
<br>
`<p>` = Paragraph
<br>
`<a href="url">` = Link to another page or website
<br>
`<img src="url" alt="text" />` = Image
<br>
`<ul>`, `<ol>`, `<li>` = Unordered list, ordered list, list item
<br>
`<div>` = Generic container for layout/design
<br>
`<span>` = Inline container for styling text
<br>
`<strong>`, `<em>` = Bold (strong) and italic (em) text
<br>
`<br>` = Line break
<br>
`<input>`, `<form>`, `<label>`, `<button>` = Form elements
<br>
`<table>`, `<tr>`, `<td>`, `<th>` = Table elements

### Basic example:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My First Website</title>
  </head>
  <body>
    <h1>Eat more fruits!</h1>
    <ul>
        <li>Oranges</li>
        <li>Apples</li>
        <li>Bananasy</li>
    </ul>
    <a href="https://example.com">A link</a>
    <img src="https://example-picture.com" />
  </body>
</html>
```

### Exercise

- An `<h1>` with the text "Learning Topics"
- A paragraph using <strong>
- An ordered list with “HTML”, “CSS”, “JavaScript”
- A link to https://developer.mozilla.org
- An image with the URL https://picsum.photos/200/300


