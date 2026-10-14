// All tutorial content lives here. Add a course or lesson by adding an object - pages, search,
// sitemap, sidebar and quizzes pick it up automatically.
// Example: { lang, code, output? }  - html/css/js examples open in the live "Try it" editor,
// other languages show a static output block.

const page = (body) => `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<title>Demo</title>\n</head>\n<body>\n${body}\n</body>\n</html>`;

const courses = [
  // ───────────────────────────── HTML ─────────────────────────────
  {
    slug: 'html', title: 'HTML', color: '#e34f26', icon: '</>',
    tagline: 'The language for building web pages.',
    description: 'Learn the structure of every website: elements, attributes, links, images, lists, tables and forms.',
    lessons: [
      {
        slug: 'intro', title: 'HTML Introduction', minutes: 5,
        body: `<p>HTML stands for <strong>HyperText Markup Language</strong>. It is the standard markup language for creating web pages and describes their structure using <em>elements</em>.</p>
<p>A browser reads an HTML file and turns the elements into the page you see. Every HTML document starts with a document type declaration and wraps its content in an <code>&lt;html&gt;</code> element that has a <code>&lt;head&gt;</code> (information about the page) and a <code>&lt;body&gt;</code> (the visible content).</p>
{{example:0}}
<h3>What you just saw</h3>
<ul><li><code>&lt;!DOCTYPE html&gt;</code> tells the browser this is an HTML5 document.</li><li><code>&lt;title&gt;</code> sets the text on the browser tab.</li><li><code>&lt;h1&gt;</code> is the main heading and <code>&lt;p&gt;</code> is a paragraph.</li></ul>
<div class="tip"><strong>Tip:</strong> You don't need to install anything. Press "Try it Yourself" and edit the code live.</div>`,
        examples: [{ lang: 'html', code: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>My First Page</title>\n</head>\n<body>\n  <h1>Hello, PixelVista!</h1>\n  <p>This is my first web page.</p>\n</body>\n</html>` }]
      },
      {
        slug: 'elements', title: 'HTML Elements', minutes: 5,
        body: `<p>An HTML element is a start tag, some content, and an end tag: <code>&lt;tagname&gt;content&lt;/tagname&gt;</code>.</p>
{{example:0}}
<p>Elements can be <strong>nested</strong> - an element can contain other elements. Some elements, such as <code>&lt;br&gt;</code> and <code>&lt;img&gt;</code>, are <em>void</em> elements: they have no content and no end tag.</p>
{{example:1}}
<h3>Block vs inline</h3>
<p>Block elements (<code>div</code>, <code>p</code>, <code>h1</code>) start on a new line and take the full width. Inline elements (<code>span</code>, <code>a</code>, <code>strong</code>) only take as much width as they need.</p>`,
        examples: [
          { lang: 'html', code: page(`<h1>A heading</h1>\n<p>A paragraph of text.</p>`) },
          { lang: 'html', code: page(`<div>\n  <p>This paragraph has <strong>bold</strong> and <em>italic</em> text.</p>\n  <p>Line one<br>Line two</p>\n</div>`) }
        ]
      },
      {
        slug: 'attributes', title: 'HTML Attributes', minutes: 5,
        body: `<p>Attributes give elements extra information. They always go in the start tag and usually come as <code>name="value"</code> pairs.</p>
{{example:0}}
<p>The most common attributes are <code>href</code> (link destination), <code>src</code> (image source), <code>alt</code> (alternative text), <code>class</code> and <code>id</code> (hooks for CSS and JavaScript), <code>style</code> and <code>lang</code>.</p>
<div class="tip"><strong>Accessibility:</strong> Always give images an <code>alt</code> attribute so screen readers can describe them.</div>`,
        examples: [{ lang: 'html', code: page(`<a href="https://example.com" target="_blank">Visit Example</a>\n<p id="intro" class="highlight" style="color: tomato;">Styled with the style attribute.</p>`) }]
      },
      {
        slug: 'links-images', title: 'Links and Images', minutes: 6,
        body: `<p>Links connect the web together. Use <code>&lt;a href="..."&gt;</code>. Use <code>target="_blank"</code> to open in a new tab (add <code>rel="noopener"</code> for safety).</p>
{{example:0}}
<p>Images use the void element <code>&lt;img&gt;</code> with <code>src</code>, <code>alt</code>, and optionally <code>width</code> and <code>height</code> (which prevent layout shifts while the image loads).</p>
{{example:1}}`,
        examples: [
          { lang: 'html', code: page(`<p><a href="https://developer.mozilla.org" target="_blank" rel="noopener">MDN Web Docs</a></p>\n<p><a href="#bottom">Jump to the bottom</a></p>\n<div style="height:400px"></div>\n<p id="bottom">You made it!</p>`) },
          { lang: 'html', code: page(`<img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='120'><rect width='200' height='120' fill='%236c5ce7'/><circle cx='100' cy='60' r='36' fill='%23ffeaa7'/></svg>" alt="A yellow circle on a purple background" width="200" height="120">`) }
        ]
      },
      {
        slug: 'lists-tables', title: 'Lists and Tables', minutes: 7,
        body: `<p>Use <code>&lt;ul&gt;</code> for unordered (bulleted) lists, <code>&lt;ol&gt;</code> for ordered (numbered) lists, and <code>&lt;li&gt;</code> for each item.</p>
{{example:0}}
<p>Tables display data in rows (<code>&lt;tr&gt;</code>) and cells (<code>&lt;td&gt;</code>, or <code>&lt;th&gt;</code> for headers). Use <code>&lt;thead&gt;</code> and <code>&lt;tbody&gt;</code> to group rows.</p>
{{example:1}}`,
        examples: [
          { lang: 'html', code: page(`<h3>Shopping</h3>\n<ul>\n  <li>Apples</li>\n  <li>Bread</li>\n</ul>\n<h3>Steps</h3>\n<ol>\n  <li>Open editor</li>\n  <li>Write code</li>\n  <li>Press Run</li>\n</ol>`) },
          { lang: 'html', code: page(`<table border="1" cellpadding="8">\n  <thead><tr><th>Language</th><th>Used for</th></tr></thead>\n  <tbody>\n    <tr><td>HTML</td><td>Structure</td></tr>\n    <tr><td>CSS</td><td>Style</td></tr>\n    <tr><td>JavaScript</td><td>Behaviour</td></tr>\n  </tbody>\n</table>`) }
        ]
      },
      {
        slug: 'forms', title: 'HTML Forms', minutes: 8,
        body: `<p>Forms collect input from users. A <code>&lt;form&gt;</code> contains controls such as <code>&lt;input&gt;</code>, <code>&lt;select&gt;</code>, <code>&lt;textarea&gt;</code> and <code>&lt;button&gt;</code>. Pair each control with a <code>&lt;label&gt;</code>.</p>
{{example:0}}
<p>HTML5 adds built-in validation: <code>required</code>, <code>minlength</code>, <code>type="email"</code>, <code>pattern</code>. Try submitting the form above with an empty or invalid email.</p>
<div class="tip"><strong>Backend:</strong> The PixelVista <a href="/contact">contact form</a> is a real form that sends its data to our Node.js API.</div>`,
        examples: [{ lang: 'html', code: page(`<form onsubmit="event.preventDefault(); alert('Thanks, ' + this.name.value + '!')">\n  <p><label>Name<br><input name="name" required></label></p>\n  <p><label>Email<br><input type="email" name="email" required></label></p>\n  <p><label>Level<br>\n    <select name="level"><option>Beginner</option><option>Intermediate</option></select></label></p>\n  <button type="submit">Send</button>\n</form>`) }]
      }
    ],
    quiz: [
      { q: 'What does HTML stand for?', options: ['HyperText Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Level'], answer: 0 },
      { q: 'Which element holds the visible page content?', options: ['<head>', '<body>', '<title>', '<meta>'], answer: 1 },
      { q: 'Which attribute provides alternative text for an image?', options: ['title', 'src', 'alt', 'href'], answer: 2 },
      { q: 'Which tag creates a numbered list?', options: ['<ul>', '<li>', '<dl>', '<ol>'], answer: 3 },
      { q: 'Which is a void element (no end tag)?', options: ['<p>', '<img>', '<div>', '<table>'], answer: 1 }
    ]
  },

  // ───────────────────────────── CSS ─────────────────────────────
  {
    slug: 'css', title: 'CSS', color: '#1572b6', icon: '{ }',
    tagline: 'The language for styling web pages.',
    description: 'Make pages beautiful: selectors, the box model, Flexbox, Grid and responsive design.',
    lessons: [
      {
        slug: 'intro', title: 'CSS Introduction', minutes: 5,
        body: `<p>CSS stands for <strong>Cascading Style Sheets</strong>. It describes how HTML elements are displayed: colours, fonts, spacing and layout.</p>
<p>A CSS rule has a <em>selector</em> and a <em>declaration block</em> of <code>property: value;</code> pairs.</p>
{{example:0}}
<p>You can add CSS in three ways: inline (<code>style="..."</code>), internal (<code>&lt;style&gt;</code> in the head), or external (a <code>.css</code> file linked with <code>&lt;link rel="stylesheet"&gt;</code>). External is best for real sites.</p>`,
        examples: [{ lang: 'html', code: page(`<style>\n  h1 { color: #6c5ce7; font-family: sans-serif; }\n  p  { font-size: 20px; color: #444; }\n</style>\n<h1>Styled heading</h1>\n<p>Styled paragraph.</p>`) }]
      },
      {
        slug: 'selectors', title: 'CSS Selectors', minutes: 6,
        body: `<p>Selectors choose which elements a rule applies to.</p>
<ul><li><code>p</code> - element selector</li><li><code>.card</code> - class selector</li><li><code>#hero</code> - id selector</li><li><code>nav a</code> - descendant selector</li><li><code>a:hover</code> - pseudo-class</li></ul>
{{example:0}}
<p>When rules conflict, <strong>specificity</strong> decides: id beats class, class beats element. If equal, the later rule wins.</p>`,
        examples: [{ lang: 'html', code: page(`<style>\n  p { color: gray; }\n  .warn { color: darkorange; font-weight: bold; }\n  #special { background: #ffeaa7; padding: 4px; }\n  a:hover { color: crimson; }\n</style>\n<p>Normal paragraph</p>\n<p class="warn">Warning paragraph</p>\n<p id="special">Special paragraph</p>\n<a href="#">Hover over me</a>`) }]
      },
      {
        slug: 'box-model', title: 'The Box Model', minutes: 6,
        body: `<p>Every element is a box made of <strong>content</strong>, <strong>padding</strong>, <strong>border</strong> and <strong>margin</strong>, from inside out.</p>
{{example:0}}
<div class="tip"><strong>Pro tip:</strong> Add <code>box-sizing: border-box;</code> so that <code>width</code> includes padding and border. Most modern sites set it globally.</div>`,
        examples: [{ lang: 'html', code: page(`<style>\n  * { box-sizing: border-box; }\n  .box {\n    width: 260px;\n    padding: 20px;\n    border: 4px solid #6c5ce7;\n    margin: 30px;\n    background: #f1efff;\n  }\n</style>\n<div class="box">Padding 20px, border 4px, margin 30px.</div>`) }]
      },
      {
        slug: 'flexbox', title: 'CSS Flexbox', minutes: 8,
        body: `<p>Flexbox lays out items in one dimension (a row or a column). Set <code>display: flex</code> on the container.</p>
{{example:0}}
<ul><li><code>justify-content</code> - spacing along the main axis</li><li><code>align-items</code> - alignment on the cross axis</li><li><code>gap</code> - space between items</li><li><code>flex-wrap</code> - allow items to wrap</li></ul>`,
        examples: [{ lang: 'html', code: page(`<style>\n  .row { display: flex; justify-content: space-between; align-items: center; gap: 10px; height: 120px; background: #dfe6e9; padding: 10px; }\n  .row div { background: #6c5ce7; color: white; padding: 16px 24px; border-radius: 8px; font-family: sans-serif; }\n</style>\n<div class="row"><div>One</div><div>Two</div><div>Three</div></div>`) }]
      },
      {
        slug: 'grid', title: 'CSS Grid', minutes: 8,
        body: `<p>Grid lays out items in two dimensions. Define columns with <code>grid-template-columns</code>.</p>
{{example:0}}
<p><code>repeat(auto-fit, minmax(120px, 1fr))</code> creates a responsive grid with no media queries at all.</p>`,
        examples: [{ lang: 'html', code: page(`<style>\n  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; }\n  .grid div { background: #00b894; color: white; padding: 24px; text-align: center; font-family: sans-serif; border-radius: 8px; }\n</style>\n<div class="grid"><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div></div>`) }]
      },
      {
        slug: 'responsive', title: 'Responsive Design', minutes: 7,
        body: `<p>Responsive design makes pages look good on every screen. Start with the viewport meta tag, then use flexible units and <strong>media queries</strong>.</p>
{{example:0}}
<p>Resize the preview or the browser window: the background changes below 500px width. Design <em>mobile-first</em> - write the small-screen styles first and add <code>min-width</code> queries for larger screens.</p>`,
        examples: [{ lang: 'html', code: page(`<meta name="viewport" content="width=device-width, initial-scale=1">\n<style>\n  body { background: lightgreen; font-family: sans-serif; padding: 20px; }\n  @media (max-width: 500px) { body { background: lightpink; } }\n</style>\n<h2>Resize me</h2>\n<p>Green on wide screens, pink on narrow.</p>`) }]
      }
    ],
    quiz: [
      { q: 'What does CSS stand for?', options: ['Creative Style Syntax', 'Cascading Style Sheets', 'Computer Style Sheets', 'Colorful Style Scripts'], answer: 1 },
      { q: 'Which selector targets an element with class="card"?', options: ['#card', 'card', '.card', '*card'], answer: 2 },
      { q: 'Which box-model layer is outermost?', options: ['Padding', 'Border', 'Content', 'Margin'], answer: 3 },
      { q: 'Which property aligns flex items along the main axis?', options: ['justify-content', 'align-items', 'text-align', 'place-self'], answer: 0 },
      { q: 'Which CSS feature applies styles at certain screen widths?', options: ['@import', '@media', '@font-face', '@keyframes'], answer: 1 }
    ]
  },

  // ───────────────────────────── JavaScript ─────────────────────────────
  {
    slug: 'javascript', title: 'JavaScript', color: '#f7b500', icon: 'JS',
    tagline: 'The language that makes web pages interactive.',
    description: 'Variables, functions, the DOM, events and fetching data from an API.',
    lessons: [
      {
        slug: 'intro', title: 'JavaScript Introduction', minutes: 5,
        body: `<p>JavaScript is the programming language of the web. It runs in every browser and (with Node.js) on servers too - PixelVista's own backend is written in it.</p>
<p>Add scripts with the <code>&lt;script&gt;</code> tag. <code>document.getElementById()</code> finds an element and <code>innerHTML</code> changes its content.</p>
{{example:0}}`,
        examples: [{ lang: 'html', code: page(`<p id="demo">Original text</p>\n<button onclick="document.getElementById('demo').innerHTML = 'Hello JavaScript!'">Click me</button>`) }]
      },
      {
        slug: 'variables', title: 'Variables and Types', minutes: 6,
        body: `<p>Declare variables with <code>let</code> (can change) or <code>const</code> (cannot be reassigned). Avoid the old <code>var</code>.</p>
{{example:0}}
<p>The main types are string, number, boolean, null, undefined, object (including arrays) and function. Use <code>typeof</code> to inspect a value.</p>`,
        examples: [{ lang: 'html', code: page(`<pre id="out"></pre>\n<script>\n  const name = "Ada";\n  let age = 36;\n  age = age + 1;\n  const isDev = true;\n  const langs = ["HTML", "CSS", "JS"];\n  document.getElementById("out").textContent =\n    name + " is " + age + "\\n" +\n    "typeof isDev: " + typeof isDev + "\\n" +\n    "langs: " + langs.join(", ");\n</script>`) }]
      },
      {
        slug: 'functions', title: 'Functions', minutes: 7,
        body: `<p>Functions are reusable blocks of code. Arrow functions give a shorter syntax.</p>
{{example:0}}
<p>Functions can be passed around like values. Array methods like <code>map</code>, <code>filter</code> and <code>reduce</code> take functions as arguments.</p>`,
        examples: [{ lang: 'html', code: page(`<pre id="out"></pre>\n<script>\n  function greet(name) { return "Hello, " + name + "!"; }\n  const square = (n) => n * n;\n  const nums = [1, 2, 3, 4, 5];\n  const evens = nums.filter((n) => n % 2 === 0);\n  document.getElementById("out").textContent =\n    greet("World") + "\\n" + square(9) + "\\n" + "evens: " + evens + "\\n" + "squares: " + nums.map(square);\n</script>`) }]
      },
      {
        slug: 'dom', title: 'The DOM', minutes: 7,
        body: `<p>The Document Object Model (DOM) is the browser's live tree of the page. JavaScript can read and change it.</p>
{{example:0}}
<p>Use <code>querySelector</code> to find elements with CSS selectors, <code>createElement</code> to build new ones and <code>appendChild</code> to insert them. Prefer <code>textContent</code> over <code>innerHTML</code> for user-provided text - it prevents XSS attacks.</p>`,
        examples: [{ lang: 'html', code: page(`<ul id="list"><li>First</li></ul>\n<button id="add">Add item</button>\n<script>\n  let n = 1;\n  document.querySelector("#add").addEventListener("click", () => {\n    const li = document.createElement("li");\n    li.textContent = "Item " + (++n);\n    document.querySelector("#list").appendChild(li);\n  });\n</script>`) }]
      },
      {
        slug: 'events', title: 'Events', minutes: 6,
        body: `<p>Events are things that happen in the page: clicks, key presses, form submissions, mouse moves. Respond with <code>addEventListener</code>.</p>
{{example:0}}
<p>Type in the box above. The <code>input</code> event fires on every change. Call <code>event.preventDefault()</code> to stop default behaviour such as form submission.</p>`,
        examples: [{ lang: 'html', code: page(`<input id="box" placeholder="Type something" style="padding:8px">\n<p>You typed: <strong id="echo"></strong></p>\n<script>\n  document.getElementById("box").addEventListener("input", (e) => {\n    document.getElementById("echo").textContent = e.target.value.toUpperCase();\n  });\n</script>`) }]
      },
      {
        slug: 'fetch', title: 'Fetch and APIs', minutes: 9,
        body: `<p><code>fetch()</code> requests data from a server and returns a Promise. Use <code>async/await</code> for readable code.</p>
{{example:0}}
<p>This is exactly how PixelVista's own pages talk to the backend: the search box calls <code>/api/search</code>, the quiz posts to <code>/api/quiz/:course/submit</code>, and the contact form posts to <code>/api/contact</code>.</p>
<div class="tip"><strong>Try:</strong> open <a href="/api/courses" target="_blank">/api/courses</a> to see the JSON our server returns.</div>`,
        examples: [{ lang: 'html', code: page(`<button id="go">Load sample data</button>\n<pre id="out">Press the button...</pre>\n<script>\n  document.getElementById("go").onclick = async () => {\n    const out = document.getElementById("out");\n    out.textContent = "Loading...";\n    try {\n      const res = await fetch("https://jsonplaceholder.typicode.com/todos/1");\n      const data = await res.json();\n      out.textContent = JSON.stringify(data, null, 2);\n    } catch (err) {\n      out.textContent = "Network error: " + err.message;\n    }\n  };\n</script>`) }]
      }
    ],
    quiz: [
      { q: 'Which keyword declares a variable that cannot be reassigned?', options: ['let', 'var', 'const', 'static'], answer: 2 },
      { q: 'What does typeof "hello" return?', options: ['"text"', '"string"', '"char"', '"object"'], answer: 1 },
      { q: 'Which method adds an event handler?', options: ['addEventListener', 'attachFunction', 'onEvent', 'listen'], answer: 0 },
      { q: 'Which is the safest way to insert user text into the page?', options: ['innerHTML', 'document.write', 'textContent', 'eval'], answer: 2 },
      { q: 'fetch() returns a...', options: ['String', 'Promise', 'Array', 'Event'], answer: 1 }
    ]
  },

  // ───────────────────────────── Python ─────────────────────────────
  {
    slug: 'python', title: 'Python', color: '#3776ab', icon: 'Py',
    tagline: 'A friendly language for scripting, data and backends.',
    description: 'Learn Python basics: variables, conditions, loops, functions, lists and dictionaries.',
    lessons: [
      {
        slug: 'intro', title: 'Python Introduction', minutes: 5,
        body: `<p>Python is a popular, readable language used for web backends, automation, data science and AI. It uses <strong>indentation</strong> instead of braces to group code.</p>
{{example:0}}
<p>Save the code as <code>hello.py</code> and run <code>python hello.py</code> in a terminal.</p>`,
        examples: [{ lang: 'python', code: `print("Hello, PixelVista!")\nprint(2 + 3 * 4)`, output: `Hello, PixelVista!\n14` }]
      },
      {
        slug: 'variables', title: 'Variables and Types', minutes: 6,
        body: `<p>Python variables need no declaration - assign a value and you're done. The type is decided by the value.</p>
{{example:0}}
<p>Common types: <code>int</code>, <code>float</code>, <code>str</code>, <code>bool</code>, <code>list</code>, <code>dict</code>. Use f-strings to embed values in text.</p>`,
        examples: [{ lang: 'python', code: `name = "Grace"\nage = 85\nheight = 1.65\nis_admiral = True\n\nprint(f"{name} is {age}")\nprint(type(height))`, output: `Grace is 85\n<class 'float'>` }]
      },
      {
        slug: 'conditions', title: 'Conditions', minutes: 6,
        body: `<p>Use <code>if</code>, <code>elif</code> and <code>else</code> to make decisions. Notice the colon and the indented block.</p>
{{example:0}}`,
        examples: [{ lang: 'python', code: `score = 72\n\nif score >= 90:\n    print("Grade A")\nelif score >= 70:\n    print("Grade B")\nelse:\n    print("Keep practising")`, output: `Grade B` }]
      },
      {
        slug: 'loops', title: 'Loops', minutes: 6,
        body: `<p><code>for</code> loops iterate over a sequence; <code>while</code> loops repeat while a condition is true. <code>range(n)</code> gives numbers 0 to n-1.</p>
{{example:0}}`,
        examples: [{ lang: 'python', code: `for i in range(3):\n    print("Round", i)\n\ncount = 3\nwhile count > 0:\n    print(count)\n    count -= 1\nprint("Liftoff!")`, output: `Round 0\nRound 1\nRound 2\n3\n2\n1\nLiftoff!` }]
      },
      {
        slug: 'functions', title: 'Functions', minutes: 6,
        body: `<p>Define functions with <code>def</code>. Parameters can have default values, and <code>return</code> sends a result back.</p>
{{example:0}}`,
        examples: [{ lang: 'python', code: `def greet(name, greeting="Hello"):\n    return f"{greeting}, {name}!"\n\nprint(greet("Ada"))\nprint(greet("Linus", greeting="Hi"))`, output: `Hello, Ada!\nHi, Linus!` }]
      },
      {
        slug: 'lists-dicts', title: 'Lists and Dictionaries', minutes: 8,
        body: `<p>A <strong>list</strong> is an ordered, changeable collection. A <strong>dictionary</strong> stores key-value pairs.</p>
{{example:0}}
<p>List comprehensions, like <code>[n * n for n in nums]</code>, build new lists in a single readable line.</p>`,
        examples: [{ lang: 'python', code: `langs = ["HTML", "CSS"]\nlangs.append("Python")\nprint(langs, len(langs))\n\nuser = {"name": "Ada", "level": 3}\nuser["level"] += 1\nprint(user)\n\nnums = [1, 2, 3, 4]\nprint([n * n for n in nums])`, output: `['HTML', 'CSS', 'Python'] 3\n{'name': 'Ada', 'level': 4}\n[1, 4, 9, 16]` }]
      }
    ],
    quiz: [
      { q: 'How does Python group blocks of code?', options: ['Curly braces', 'Indentation', 'begin/end', 'Semicolons'], answer: 1 },
      { q: 'Which keyword defines a function?', options: ['function', 'fn', 'def', 'func'], answer: 2 },
      { q: 'What does range(3) produce?', options: ['1, 2, 3', '0, 1, 2', '0, 1, 2, 3', '3'], answer: 1 },
      { q: 'Which structure stores key-value pairs?', options: ['list', 'tuple', 'set', 'dict'], answer: 3 },
      { q: 'What prints "Hi Ada" if name = "Ada"?', options: ['print("Hi {name}")', 'print(f"Hi {name}")', 'print("Hi" name)', 'echo "Hi $name"'], answer: 1 }
    ]
  },

  // ───────────────────────────── SQL ─────────────────────────────
  {
    slug: 'sql', title: 'SQL', color: '#00758f', icon: 'DB',
    tagline: 'The language for working with databases.',
    description: 'Query, filter, join and summarise data with the standard language of relational databases.',
    lessons: [
      {
        slug: 'intro', title: 'SQL Introduction', minutes: 5,
        body: `<p>SQL (Structured Query Language) lets you store, read and change data in relational databases such as PostgreSQL, MySQL and SQLite. Data lives in <strong>tables</strong> made of rows and columns.</p>
<p>Our examples use a <code>students</code> table:</p>
{{example:0}}`,
        examples: [{ lang: 'sql', code: `SELECT * FROM students;`, output: `id | name  | course | score\n---+-------+--------+------\n 1 | Ada   | HTML   |   92\n 2 | Linus | CSS    |   78\n 3 | Grace | Python |   88\n 4 | Alan  | HTML   |   65` }]
      },
      {
        slug: 'select', title: 'SELECT and ORDER BY', minutes: 6,
        body: `<p><code>SELECT</code> picks columns; <code>ORDER BY</code> sorts the result (<code>DESC</code> for descending); <code>LIMIT</code> restricts the number of rows.</p>
{{example:0}}`,
        examples: [{ lang: 'sql', code: `SELECT name, score\nFROM students\nORDER BY score DESC\nLIMIT 2;`, output: `name | score\n-----+------\nAda  |   92\nGrace|   88` }]
      },
      {
        slug: 'where', title: 'WHERE Filters', minutes: 6,
        body: `<p><code>WHERE</code> filters rows. Combine conditions with <code>AND</code>, <code>OR</code> and <code>NOT</code>; use <code>LIKE</code> for patterns and <code>IN</code> for lists.</p>
{{example:0}}
<div class="tip"><strong>Security:</strong> never build SQL by joining strings with user input. Use parameterised queries to prevent SQL injection.</div>`,
        examples: [{ lang: 'sql', code: `SELECT name, course, score\nFROM students\nWHERE course = 'HTML' AND score > 70;`, output: `name | course | score\n-----+--------+------\nAda  | HTML   |   92` }]
      },
      {
        slug: 'join', title: 'JOIN Tables', minutes: 8,
        body: `<p>A <code>JOIN</code> combines rows from two tables using a related column. <code>INNER JOIN</code> returns only matching rows; <code>LEFT JOIN</code> keeps all rows from the left table.</p>
{{example:0}}`,
        examples: [{ lang: 'sql', code: `SELECT s.name, c.title\nFROM students s\nINNER JOIN courses c ON c.name = s.course;`, output: `name  | title\n------+----------------\nAda   | HTML Basics\nLinus | CSS Styling\nGrace | Python Starter\nAlan  | HTML Basics` }]
      },
      {
        slug: 'group-by', title: 'GROUP BY and Aggregates', minutes: 7,
        body: `<p>Aggregate functions - <code>COUNT</code>, <code>SUM</code>, <code>AVG</code>, <code>MIN</code>, <code>MAX</code> - summarise many rows. <code>GROUP BY</code> computes them per group.</p>
{{example:0}}`,
        examples: [{ lang: 'sql', code: `SELECT course, COUNT(*) AS students, AVG(score) AS avg_score\nFROM students\nGROUP BY course;`, output: `course | students | avg_score\n-------+----------+----------\nHTML   |        2 |      78.5\nCSS    |        1 |        78\nPython |        1 |        88` }]
      }
    ],
    quiz: [
      { q: 'Which clause filters rows?', options: ['ORDER BY', 'WHERE', 'GROUP BY', 'LIMIT'], answer: 1 },
      { q: 'How do you sort highest to lowest?', options: ['ORDER BY score ASC', 'SORT score', 'ORDER BY score DESC', 'GROUP BY score'], answer: 2 },
      { q: 'Which function counts rows?', options: ['SUM()', 'COUNT()', 'TOTAL()', 'ROWS()'], answer: 1 },
      { q: 'Which JOIN returns only matching rows from both tables?', options: ['LEFT JOIN', 'FULL JOIN', 'INNER JOIN', 'CROSS JOIN'], answer: 2 },
      { q: 'Best defence against SQL injection?', options: ['Longer passwords', 'Parameterised queries', 'Using uppercase', 'Disabling WHERE'], answer: 1 }
    ]
  }
];

module.exports = { courses };
