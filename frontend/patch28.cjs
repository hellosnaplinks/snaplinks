const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add imports
content = content.replace(
  "import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';",
  "import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';\nimport { useEffect } from 'react';"
);

// 2. Add ScrollToTop component
const scrollComponent = "const ScrollToTop = () => {\n  const { pathname } = useLocation();\n  useEffect(() => {\n    window.scrollTo(0, 0);\n  }, [pathname]);\n  return null;\n};\n\nfunction App() {";

content = content.replace(
  "function App() {",
  scrollComponent
);

// 3. Inject into Router
content = content.replace(
  /<Router>\n\s*<div/,
  "<Router>\n      <ScrollToTop />\n      <div"
);

fs.writeFileSync('src/App.tsx', content);
console.log("Done");
