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

## Lesson 3: Forms and Inputs

### Theory
It's hard to believe, but forms can be found on the Internet more often than you might think. Every field in which you can enter something or boxes that you can check are part of forms. You already used one on your own when you registered with Coderealm. 
That's why it's important to know how to use them. 

Forms consist of a basic structure. This is the `<form>` tag - this consists of an opening and closing tag. All information about this form is written between the two tags. The first step is to define a `<label>...</label>`. This is where you specify which heading or label the following field should have. This is displayed on the web page. 
After the label comes the most exciting part of the form - now it becomes interactive with the user. This is the `<input ... />`. Within the tag, you define the type, the id and the name. With the type you tell the browser what kind of input it can calculate with. Words, a mail address or numbers. The id and the name are interesting for the styling and the functionality - this comes in the later modules. 

Most important types:
- text = one line text
- email
- password
- number

Other elements like `<input>`:
- `<textarea>` = multiline text
- `<select>` with `<option>`= Dropdown menu

Of course, a form is only really usefull when you can send everything with a `<button> ... </button>` - we'll learn how to send it later, but for now let's create the button. The button must also be given a type so that it knows what to do later when it is pressed. 

### Basic example
```html
<form>
  <label for="name">Name:</label>
  <input type="text" id="name" name="username" />

  <button type="submit">Send</button>
</form>
```

### Exercise
Create a form with:
- A name field (text)
- An email field
- A password field
- A submit button labeled “Sign in”

## Lesson 4: CSS - Basics

### Theory
Now we know the basics of HTML. Great ... the shell of our house is finished. Now it's time to furnish it ... we're learning CSS!

CSS stands for Cascading Style Sheets and is used to design HTML elements: Colours, spacing, fonts, etc.

How to use:

1. Inline: directly inside the tag (not recommended!):
```html
<p style="color: red;">Text</p>
```

2. Im `<style>`tag im `<head>`:
```html
<style>
  p {
    color: red;
  }
</style>
```

3. In an external `.css` file.

Selectors

Within the CSS, you must first define what you want to style in the HTML. We have to choose the selectors. To do this, you have the option of selecting the element, the class or the ID. 
If you select the element, all elements of this type on the website will be customised according to the specifications. Classes and IDs are specified by us - when writing the HTML. We can give individual elements the same class in order to style them uniformly. IDs are only used for a specific element. You cannot give an element an ID that has already been applied. 

In html we name the elements with class=‘className’ or id=‘idName’ in the respective tag. In CSS, the classes are displayed with a dot `.className {..}` and IDs with a hashtag `#idName {..}`

Once we have defined the selector, we enter the values we need in the {} to style it the way we want. We will learn an overview of possible properties in the coming lessons. 

### Basic example

HTML
```html
<h1>Best heading ever!</h1>

<p class="intro">This is the intro paragraphe!</p>

<p id="outro">This is the outro paragraph!</p>
```

```css
h1 {
    color: blue;
}

.intro {
    font-size: 24px;
}

#outro {
    background-color: green
}
```

### Exercise
- Create an HTML-Page with `<h1>`, `<p>`and `<div id="box">`
- Add CSS with the `<style>`-tag:
    - the text of the h1 should be blue
    - the p font size should be 18px
    - the background of the box with `id="box"` should be grey