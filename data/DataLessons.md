# Overview

1. Modul 1: HTML
2. Modul 2: CSS
3. Modul 3: JS

< === &lt
> === &gt

In JavaScript, an array is a special kind of object that allows you to store and manage multiple values in a single variable. Instead of creating many separate variables to hold related data, you can group them together inside one array. This makes it easier to organize, access, and manipulate the data. \n An array can hold values of any type, including numbers, strings, booleans, objects, other arrays, or even mixed types. Each value in the array is called an element, and every element has an associated index, which starts at 0. This means the first element is at position 0, the second at position 1, and so on. \n\n <strong>Creating an Array</strong> \n There are a few ways to create an array. The most common way is by using square brackets []. For example: \n <code>let colors = ["red", "green", "blue"];</code> \n This array has three elements. "red" is at index 0, "green" at index 1, and "blue" at index 2. \n\n You can also create an empty array and add elements later: \n <code>let fruits = []; \nfruits[0] = "apple"; \nfruits[1] = "banana"; \nAccessing Array Elements</code> \n To access a specific value in an array, you use its index: \n <code>let firstColor = colors[0]; // "red" </code> \n If you try to access an index that doesn't exist, JavaScript returns undefined.\n\n <strong>Changing Array Elements</strong> \n You can change the value of an element by assigning a new value to its index: \n <code>colors[1] = "yellow"; // colors is now ["red", "yellow", "blue"] \n\n <strong>Array Length </strong> \n Every array has a length property, which tells you how many elements are in the array: \n <code>let count = colors.length; // 3 </code> \n Note that the highest index in the array is always one less than the length.



# PLACEHOLDER HTML

# EX 9 - CSS BASICS
<!DOCTYPE html>
<head>
  <meta>
  <title>CSS Practice</title>
</head>
<body>
  <h1>Welcome to the Exercise</h1>
  <p class="info">This is an informational paragraph.</p>
  <p class="info">This is another informational paragraph.</p>
  <p id="important">This is a very important paragraph!</p>
</body>
</html>


# EX 10 - SELECTORS

<!DOCTYPE html>
<head>
  <meta>
  <title>CSS Practice</title>
  <style>
    /* Write your code here */
  </style>
</head>
<body>
  <h1>Welcome to the Exercise</h1>
  <p class="info">This is an informational paragraph.</p>
  <p class="info">This is another informational paragraph.</p>
  <p id="important">This is a very important paragraph!</p>
</body>
</html>

# EX 11 - COLORS

<!DOCTYPE html>
  <title>Color Practice</title>
  <style>
    /* Write your color styles here */
  </style>
</head>
<body>
  <h1 class="title">Welcome!</h1>
  <p class="keyword">This paragraph uses a color keyword.</p>
  <p class="rgb">This paragraph uses RGB.</p>
  <p class="hex">This paragraph uses a hex color.</p>
</body>
</html>

# EX 12 - Units

<!DOCTYPE html>
<html>
<head>
  <title>CSS Units Practice</title>
  <style>
    /* Write your styles here */
  </style>
</head>
<body>
  <h1 class="absolute-heading">I use absolute units</h1>
  <h2 class="relative-heading">I use relative units</h2>

  <div class="box-absolute">Box with px width</div>
  <div class="box-relative">Box with % width</div>
</body>
</html>

# EX 13 - Box-model

<!DOCTYPE html>
<html>
<head>
  <title>Box Model Practice</title>
  <style>
    /* Write your CSS here */
  </style>
</head>
<body>
  <div class="box">I am a box!</div>
</body>
</html>

# EX 14 - Media Queries

<!DOCTYPE html>
<html>
<head>
  <title>Media Queries Practice</title>
  <style>
    /* Write your CSS here */
  </style>
</head>
<body>
  <div>I am a div!</div>
</body>
</html>

# EX 24 - Loops 2

let inventory = {
  apples: 10,
  bananas: 5,
  oranges: 8
};

let cart = ["bananas", "oranges"];
