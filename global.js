console.log('IT’S ALIVE!');

function $$(selector, context = document) { // $$ is the function name
  return Array.from(context.querySelectorAll(selector));
}

// lab 3 beta testing for spring 2025 improvements

// const baseElement = document.createElement("base") // Creates a base tag

// if (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost") {
//     baseElement.setAttribute("href", "/") // Development (local)
// } else {
//     baseElement.setAttribute("href", "/portfolio/") // Production (GitHub Pages)
// };

// document.head.appendChild(baseElement); /* Appends to head tag dynamically */

// // Optional: log the base path being used
// const baseSelector = document.querySelector("base");
// console.log("Base URL:", baseSelector?.href);

//

// lab 3 //

// let navLinks = $$("nav a")
// // console.log(navLinks);


// let currentLink = navLinks.find(
//   (a) => a.host === location.host && a.pathname === location.pathname,
// );
// // console.log(currentLink);

// if (currentLink) {
//   // or if (currentLink !== undefined)
//   currentLink.classList.add('current'); // currentLink?.classList.add('current'); also works
// }

let pages = [
  { url: 'index.html', title: 'Home' },
  { url: 'projects/index.html', title: 'Projects' },
  { url: 'contact/index.html', title: 'Contact' },
  { url: 'cv/index.html', title: 'CV' },
  { url: 'meta/index.html', title: 'Meta' },
  { url: 'https://github.com/jeh027', title: 'Profile' },
];

let nav = document.createElement('nav');
document.body.prepend(nav);

const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"                  // Local server ("localhost" or "127.0.0.1")
  : "/portfolio-refined/";         // GitHub Pages repo name ("yourusername.github.io")

for (let p of pages) {
  let url = p.url;
  url = !url.startsWith('http') ? BASE_PATH + url : url; // adjust the base URL for all links (so changing the hyperlink each time)
  // console.log(url);

  let title = p.title;
  
  // Create link and add it to nav
  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;

  // if (a.host === location.host && a.pathname === location.pathname) {
  //   a.classList.add('current');
  // }

  a.classList.toggle(
    'current',
    a.host === location.host && a.pathname === location.pathname,
  );

  if (url.startsWith('http')) {
    a.setAttribute('target', '_blank')
  };

  nav.append(a);
};

document.body.insertAdjacentHTML(
  'afterbegin',
  `
    <div class="color-scheme">
        <label>
            Theme: 
                <select id="set-theme">
                    <option>Default</option>
                    <option>Light</option>
                    <option>Dark</option>
                </select> 
        </label>
    </div>
  `
);

// default at start of page (is_default?)
// event listener
// need to set default mode when first rendered in

function article_background(new_color) {
  // Select the <article> element
  let articleElements = document.querySelectorAll('.projects article');

  if (new_color == 'dark') {
    // Iterate through articles changing backgroundColor
    for (let element of articleElements) {
      element.style.backgroundColor = 'black';
    }
  } else {
    for (let element of articleElements) {
      element.style.backgroundColor = 'white';
    }
  }
};

function is_default(value) {
  let new_color;
  if (value == 'Default') {
    new_color = matchMedia("(prefers-color-scheme: dark)").matches? 'dark': 'light';
  } else {
    new_color = value.toLowerCase();
  }
  article_background(new_color);
  return new_color;
};

let select = document.querySelector('#set-theme');

select.addEventListener('input', function (event) {
  document.documentElement.style.setProperty('color-scheme', is_default(event.target.value)); // bug: dark mode, white background for cards
  localStorage.colorScheme = event.target.value; // .key = value
});

if ("colorScheme" in localStorage) {
  let user_theme = localStorage.colorScheme;
  document.documentElement.style.setProperty('color-scheme', is_default(user_theme)); // this command is repeated twice, can define function that does once
  const select_element = document.getElementById('set-theme'); // remember these document functions (very useful)
  select_element.value = user_theme
};

// end of lab 3 //

// lab 4 //

export async function fetchJSON(url) { // export is used to make a function, variable, or class available for use in other files
  try {
    // Fetch the JSON file from the given URL
    const response = await fetch(url);

    if (!response.ok) { // Boolean that indicates whether the HTTP response status is in the range of 200–299
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    // console.log(response);

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error); // returns none
  }
};

// Reusable JavaScript functions encapsulate logic for an independent piece of UI and can be reused across your app
export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  if (!Array.isArray(projects)) {
    throw new Error('Project parameter is not array type')
  };

  if (!containerElement.tagName.toLowerCase() == 'div') {
    throw new Error('containerElement not div') // ensures valid element before doing anything further
  };

  containerElement.innerHTML = '';

  for (let project of projects) {
    const article = document.createElement('article');

    article.innerHTML = `
      <${headingLevel}>${project.title}</${headingLevel}>
      <img src="${project.image}" alt="${project.title}">
      <p>${project.description}</p>
      <time>c. ${project.year}</time>
    `;

    containerElement.appendChild(article); // locate element, add HTML, then append as child to element
  }
};

export function numProjects(projects, titleElement) {
  const length = projects.length
  titleElement.textContent = `My ${length} Projects!`
};

// workflow:
// 1. async function starts executing (allows program to continue running while waiting for async operations to complete)
// 2. when encounter await, it waits for Promise to resolve, while rest of program keeps running
// 3. once the promise resolves, execution picks up where it left off
export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
};

