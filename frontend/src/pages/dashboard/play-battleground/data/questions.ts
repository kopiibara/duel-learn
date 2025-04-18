import { Question } from "../types";

export const questionsData: Question[] = [
  // Multiple Choice Questions (10 per mode)
  {
    question: "What does HTML stand for?",
    correctAnswer: "HyperText Markup Language",
    options: [
      "HyperText Markup Language",
      "HighTech Modern Language",
      "HyperTransfer Markup Language",
      "HyperText Modern Links",
    ],
    mode: "Peaceful",
    questionType: "multiple-choice",
  },
  {
    question: "What is the purpose of CSS?",
    correctAnswer: "Styling web pages",
    options: [
      "Styling web pages",
      "Database management",
      "Server-side logic",
      "Network protocols",
    ],
    mode: "Peaceful",
    questionType: "multiple-choice",
  },
  {
    question: "What is the DOM?",
    correctAnswer: "Document Object Model",
    options: [
      "Document Object Model",
      "Data Object Management",
      "Document Order Model",
      "Digital Object Method",
    ],
    mode: "Peaceful",
    questionType: "multiple-choice",
  },
  {
    question: "What is a variable?",
    correctAnswer: "A container for storing data values",
    options: [
      "A container for storing data values",
      "A type of function",
      "A programming language",
      "A web browser",
    ],
    mode: "Peaceful",
    questionType: "multiple-choice",
  },
  {
    question: "What is an array?",
    correctAnswer: "A collection of elements",
    options: [
      "A collection of elements",
      "A single value",
      "A type of loop",
      "A function name",
    ],
    mode: "Peaceful",
    questionType: "multiple-choice",
  },
  {
    question: "What is a function?",
    correctAnswer: "A reusable block of code",
    options: [
      "A reusable block of code",
      "A variable name",
      "A data type",
      "A file extension",
    ],
    mode: "Peaceful",
    questionType: "multiple-choice",
  },
  {
    question: "What is a loop?",
    correctAnswer: "A way to repeat code",
    options: [
      "A way to repeat code",
      "A type of variable",
      "A programming error",
      "A web server",
    ],
    mode: "Peaceful",
    questionType: "multiple-choice",
  },
  {
    question: "What is an object?",
    correctAnswer: "A collection of properties",
    options: [
      "A collection of properties",
      "A type of loop",
      "A function name",
      "A programming language",
    ],
    mode: "Peaceful",
    questionType: "multiple-choice",
  },
  {
    question: "What is a string?",
    correctAnswer: "A sequence of characters",
    options: [
      "A sequence of characters",
      "A number value",
      "A type of function",
      "A boolean value",
    ],
    mode: "Peaceful",
    questionType: "multiple-choice",
  },
  {
    question: "What is a boolean?",
    correctAnswer: "A true or false value",
    options: [
      "A true or false value",
      "A type of loop",
      "A string value",
      "A number value",
    ],
    mode: "Peaceful",
    questionType: "multiple-choice",
  },

  // Time-Pressured Mode Questions (10)
  {
    question: "Which sorting algorithm has the worst time complexity?",
    correctAnswer: "Bubble Sort",
    options: ["Quick Sort", "Merge Sort", "Bubble Sort", "Heap Sort"],
    mode: "Time Pressured",
    questionType: "multiple-choice",
  },
  {
    question: "What is the output of 2 + '2' in JavaScript?",
    correctAnswer: "22",
    options: ["4", "22", "NaN", "Error"],
    mode: "Time Pressured",
    questionType: "multiple-choice",
  },
  {
    question: "What is the result of typeof null in JavaScript?",
    correctAnswer: "object",
    options: ["object", "null", "undefined", "number"],
    mode: "Time Pressured",
    questionType: "multiple-choice",
  },
  {
    question: "Which method removes the last element from an array?",
    correctAnswer: "pop()",
    options: ["pop()", "push()", "shift()", "unshift()"],
    mode: "Time Pressured",
    questionType: "multiple-choice",
  },
  {
    question: "What is the default value of a variable declared with let?",
    correctAnswer: "undefined",
    options: ["undefined", "null", "0", "''"],
    mode: "Time Pressured",
    questionType: "multiple-choice",
  },
  {
    question: "Which operator is used for strict equality?",
    correctAnswer: "===",
    options: ["===", "==", "=", "!="],
    mode: "Time Pressured",
    questionType: "multiple-choice",
  },
  {
    question: "What method converts JSON to a JavaScript object?",
    correctAnswer: "JSON.parse()",
    options: [
      "JSON.parse()",
      "JSON.stringify()",
      "JSON.convert()",
      "JSON.toObject()",
    ],
    mode: "Time Pressured",
    questionType: "multiple-choice",
  },
  {
    question: "What is the result of 3 > 2 > 1?",
    correctAnswer: "false",
    options: ["false", "true", "undefined", "Error"],
    mode: "Time Pressured",
    questionType: "multiple-choice",
  },
  {
    question: "Which method adds elements to the beginning of an array?",
    correctAnswer: "unshift()",
    options: ["unshift()", "shift()", "push()", "pop()"],
    mode: "Time Pressured",
    questionType: "multiple-choice",
  },
  {
    question: "What is the result of typeof NaN?",
    correctAnswer: "number",
    options: ["number", "NaN", "undefined", "object"],
    mode: "Time Pressured",
    questionType: "multiple-choice",
  },

  // Time Pressured Mode - Identification Questions (5)
  {
    question: "What programming paradigm is JavaScript primarily based on?",
    correctAnswer: "Object-Oriented Programming",
    mode: "Time Pressured",
    questionType: "identification",
  },
  {
    question: "What command is used to initialize a new Git repository?",
    correctAnswer: "git init",
    mode: "Time Pressured",
    questionType: "identification",
  },
  {
    question: "What hook is used in React to perform side effects?",
    correctAnswer: "useEffect",
    mode: "Time Pressured",
    questionType: "identification",
  },
  {
    question: "What is the name of Node.js's package manager?",
    correctAnswer: "npm",
    mode: "Time Pressured",
    questionType: "identification",
  },
  {
    question: "What property is used to change the text color in CSS?",
    correctAnswer: "color",
    mode: "Time Pressured",
    questionType: "identification",
  },

  // Time Pressured Mode - True/False Questions (5)
  {
    question: "In JavaScript, NaN is of type 'number'.",
    correctAnswer: "true",
    options: ["true", "false"],
    mode: "Time Pressured",
    questionType: "true-false",
  },
  {
    question: "The === operator in JavaScript compares both value and type.",
    correctAnswer: "true",
    options: ["true", "false"],
    mode: "Time Pressured",
    questionType: "true-false",
  },
  {
    question: "React components must always return multiple elements.",
    correctAnswer: "false",
    options: ["true", "false"],
    mode: "Time Pressured",
    questionType: "true-false",
  },
  {
    question: "localStorage data persists even after the browser is closed.",
    correctAnswer: "true",
    options: ["true", "false"],
    mode: "Time Pressured",
    questionType: "true-false",
  },
  {
    question: "CSS flexbox is only for horizontal alignment.",
    correctAnswer: "false",
    options: ["true", "false"],
    mode: "Time Pressured",
    questionType: "true-false",
  },

  // PVP Mode - Easy Questions (10)
  {
    question: "Which HTML tag is used for creating links?",
    correctAnswer: "<a>",
    options: ["<a>", "<link>", "<href>", "<url>"],
    mode: "pvp",
    difficulty: "easy",
    questionType: "multiple-choice",
  },
  {
    question: "What is the correct way to declare a variable in JavaScript?",
    correctAnswer: "let x = 5",
    options: ["let x = 5", "variable x = 5", "x = 5", "var: x = 5"],
    mode: "pvp",
    difficulty: "easy",
    questionType: "multiple-choice",
  },
  {
    question: "Which CSS property changes text color?",
    correctAnswer: "color",
    options: ["color", "text-color", "font-color", "text-style"],
    mode: "pvp",
    difficulty: "easy",
    questionType: "multiple-choice",
  },
  {
    question: "What does CSS stand for?",
    correctAnswer: "Cascading Style Sheets",
    options: [
      "Cascading Style Sheets",
      "Computer Style Sheets",
      "Creative Style Sheets",
      "Colorful Style Sheets",
    ],
    mode: "pvp",
    difficulty: "easy",
    questionType: "multiple-choice",
  },
  {
    question: "Which tag is used for the largest heading in HTML?",
    correctAnswer: "<h1>",
    options: ["<h1>", "<heading>", "<head>", "<h6>"],
    mode: "pvp",
    difficulty: "easy",
    questionType: "multiple-choice",
  },
  {
    question: "What is the correct HTML tag for inserting a line break?",
    correctAnswer: "<br>",
    options: ["<br>", "<break>", "<lb>", "<newline>"],
    mode: "pvp",
    difficulty: "easy",
    questionType: "multiple-choice",
  },
  {
    question: "Which property is used to change the background color?",
    correctAnswer: "background-color",
    options: ["background-color", "bgcolor", "color-background", "bg-color"],
    mode: "pvp",
    difficulty: "easy",
    questionType: "multiple-choice",
  },
  {
    question: "What is the correct HTML for creating a hyperlink?",
    correctAnswer: '<a href="url">link text</a>',
    options: [
      '<a href="url">link text</a>',
      '<a url="url">link text</a>',
      "<a>url</a>",
      "<link>url</link>",
    ],
    mode: "pvp",
    difficulty: "easy",
    questionType: "multiple-choice",
  },
  {
    question: "Which CSS property is used to change the font of an element?",
    correctAnswer: "font-family",
    options: ["font-family", "font-style", "font-type", "text-family"],
    mode: "pvp",
    difficulty: "easy",
    questionType: "multiple-choice",
  },
  {
    question: "What is the correct way to comment in JavaScript?",
    correctAnswer: "// comment",
    options: ["// comment", "<!-- comment -->", "# comment", "/* comment"],
    mode: "pvp",
    difficulty: "easy",
    questionType: "multiple-choice",
  },

  // PVP Mode - Average Questions (10)
  {
    question: "What is a closure in JavaScript?",
    correctAnswer: "A function that has access to variables in its outer scope",
    options: [
      "A function that has access to variables in its outer scope",
      "A way to close the browser",
      "A method to end a loop",
      "A type of database",
    ],
    mode: "pvp",
    difficulty: "average",
    questionType: "multiple-choice",
  },
  {
    question: "What is the purpose of the useEffect hook in React?",
    correctAnswer: "To handle side effects in functional components",
    options: [
      "To handle side effects in functional components",
      "To create new components",
      "To style components",
      "To route between pages",
    ],
    mode: "pvp",
    difficulty: "average",
    questionType: "multiple-choice",
  },
  {
    question: "What is event bubbling in JavaScript?",
    correctAnswer:
      "When an event triggers on a child element and propagates up through its parents",
    options: [
      "When an event triggers on a child element and propagates up through its parents",
      "When an event creates multiple bubbles",
      "When code runs in a loop",
      "When a function calls itself",
    ],
    mode: "pvp",
    difficulty: "average",
    questionType: "multiple-choice",
  },
  {
    question: "What is the purpose of the 'this' keyword in JavaScript?",
    correctAnswer: "To refer to the current object or context",
    options: [
      "To refer to the current object or context",
      "To create a new variable",
      "To define a function",
      "To import modules",
    ],
    mode: "pvp",
    difficulty: "average",
    questionType: "multiple-choice",
  },
  {
    question: "What is the virtual DOM in React?",
    correctAnswer: "A lightweight copy of the actual DOM",
    options: [
      "A lightweight copy of the actual DOM",
      "A virtual browser",
      "A JavaScript engine",
      "A type of component",
    ],
    mode: "pvp",
    difficulty: "average",
    questionType: "multiple-choice",
  },
  {
    question: "What is the purpose of Redux in React applications?",
    correctAnswer: "To manage global state",
    options: [
      "To manage global state",
      "To create animations",
      "To handle routing",
      "To style components",
    ],
    mode: "pvp",
    difficulty: "average",
    questionType: "multiple-choice",
  },
  {
    question: "What is the difference between let and var?",
    correctAnswer: "let has block scope, var has function scope",
    options: [
      "let has block scope, var has function scope",
      "let is slower than var",
      "var is newer than let",
      "There is no difference",
    ],
    mode: "pvp",
    difficulty: "average",
    questionType: "multiple-choice",
  },
  {
    question: "What is the purpose of async/await in JavaScript?",
    correctAnswer: "To handle asynchronous operations more cleanly",
    options: [
      "To handle asynchronous operations more cleanly",
      "To make code run faster",
      "To create loops",
      "To define classes",
    ],
    mode: "pvp",
    difficulty: "average",
    questionType: "multiple-choice",
  },
  {
    question: "What is the purpose of webpack?",
    correctAnswer: "To bundle JavaScript files for production",
    options: [
      "To bundle JavaScript files for production",
      "To write HTML",
      "To style components",
      "To test code",
    ],
    mode: "pvp",
    difficulty: "average",
    questionType: "multiple-choice",
  },
  {
    question: "What is the purpose of TypeScript?",
    correctAnswer: "To add static typing to JavaScript",
    options: [
      "To add static typing to JavaScript",
      "To replace JavaScript",
      "To create websites",
      "To style components",
    ],
    mode: "pvp",
    difficulty: "average",
    questionType: "multiple-choice",
  },

  // PVP Mode - Hard Questions (10)
  {
    question: "What is the time complexity of quicksort in the worst case?",
    correctAnswer: "O(n²)",
    options: ["O(n log n)", "O(n²)", "O(n)", "O(1)"],
    mode: "pvp",
    difficulty: "hard",
    questionType: "multiple-choice",
  },
  {
    question: "What is a race condition in concurrent programming?",
    correctAnswer:
      "When multiple processes access shared data and the outcome depends on the order of execution",
    options: [
      "When multiple processes access shared data and the outcome depends on the order of execution",
      "When a program runs too fast",
      "When two programs compete for CPU time",
      "When a program crashes unexpectedly",
    ],
    mode: "pvp",
    difficulty: "hard",
    questionType: "multiple-choice",
  },
  {
    question: "What is the difference between TCP and UDP?",
    correctAnswer:
      "TCP is connection-oriented and reliable, UDP is connectionless and unreliable",
    options: [
      "TCP is connection-oriented and reliable, UDP is connectionless and unreliable",
      "TCP is faster than UDP",
      "UDP is more reliable than TCP",
      "There is no difference",
    ],
    mode: "pvp",
    difficulty: "hard",
    questionType: "multiple-choice",
  },
  {
    question: "What is a memory leak in JavaScript?",
    correctAnswer: "When memory that is no longer needed is not released",
    options: [
      "When memory that is no longer needed is not released",
      "When a program uses too much memory",
      "When memory is corrupted",
      "When variables are not declared",
    ],
    mode: "pvp",
    difficulty: "hard",
    questionType: "multiple-choice",
  },
  {
    question: "What is the difference between process and thread?",
    correctAnswer:
      "A process is an independent program, a thread is a unit of execution within a process",
    options: [
      "A process is an independent program, a thread is a unit of execution within a process",
      "They are the same thing",
      "Processes are faster than threads",
      "Threads use more memory than processes",
    ],
    mode: "pvp",
    difficulty: "hard",
    questionType: "multiple-choice",
  },
  {
    question: "What is the purpose of the Observer pattern?",
    correctAnswer: "To define a one-to-many dependency between objects",
    options: [
      "To define a one-to-many dependency between objects",
      "To create single instances",
      "To handle errors",
      "To manage state",
    ],
    mode: "pvp",
    difficulty: "hard",
    questionType: "multiple-choice",
  },
  {
    question: "What is a pure function?",
    correctAnswer:
      "A function that always returns the same output for the same input and has no side effects",
    options: [
      "A function that always returns the same output for the same input and has no side effects",
      "A function that uses pure JavaScript",
      "A function without parameters",
      "A function that returns void",
    ],
    mode: "pvp",
    difficulty: "hard",
    questionType: "multiple-choice",
  },
  {
    question: "What is the difference between OAuth and JWT?",
    correctAnswer: "OAuth is an authorization protocol, JWT is a token format",
    options: [
      "OAuth is an authorization protocol, JWT is a token format",
      "They are the same thing",
      "JWT is more secure than OAuth",
      "OAuth is newer than JWT",
    ],
    mode: "pvp",
    difficulty: "hard",
    questionType: "multiple-choice",
  },
  {
    question: "What is the purpose of the Proxy pattern?",
    correctAnswer:
      "To provide a placeholder for another object to control access to it",
    options: [
      "To provide a placeholder for another object to control access to it",
      "To create multiple instances",
      "To handle routing",
      "To manage state",
    ],
    mode: "pvp",
    difficulty: "hard",
    questionType: "multiple-choice",
  },
  {
    question: "What is the CAP theorem?",
    correctAnswer:
      "A distributed system can't simultaneously provide Consistency, Availability, and Partition tolerance",
    options: [
      "A distributed system can't simultaneously provide Consistency, Availability, and Partition tolerance",
      "A theory about CPU processing",
      "A web security principle",
      "A database design pattern",
    ],
    mode: "pvp",
    difficulty: "hard",
    questionType: "multiple-choice",
  },

  // Identification Questions (5 per mode)
  {
    question:
      "What programming language is known for its slogan 'Write once, run anywhere'?",
    correctAnswer: "Java",
    mode: "Peaceful",
    questionType: "identification",
  },
  {
    question: "What does API stand for?",
    correctAnswer: "Application Programming Interface",
    mode: "Peaceful",
    questionType: "identification",
  },

  // True/False Questions (5 per mode)
  {
    question: "JavaScript is a statically typed language.",
    correctAnswer: "false",
    options: ["true", "false"],
    mode: "Peaceful",
    questionType: "true-false",
  },
  {
    question: "CSS is a programming language.",
    correctAnswer: "false",
    options: ["true", "false"],
    mode: "Peaceful",
    questionType: "true-false",
  },
  {
    question: "HTML is a programming language.",
    correctAnswer: "false",
    options: ["true", "false"],
    mode: "Peaceful",
    questionType: "true-false",
  },
  {
    question: "The DOM is a programming language.",
    correctAnswer: "false",
    options: ["true", "false"],
    mode: "Peaceful",
    questionType: "true-false",
  },
  {
    question: "JavaScript is a client-side scripting language.",
    correctAnswer: "true",
    options: ["true", "false"],
    mode: "Peaceful",
    questionType: "true-false",
  },
];
