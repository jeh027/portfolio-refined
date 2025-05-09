import { fetchJSON, renderProjects, numProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const titleElement = document.querySelector('.projects-title')
// console.log(projectsContainer.tagName.toLowerCase() == 'div');

renderProjects(projects, projectsContainer, 'h2');
numProjects(projects, titleElement);

// lab 5 //

let arcGenerator = d3.arc().innerRadius(30).outerRadius(50); // function even tho it doesn't look like one
let selectedIndex = -1;
let query;
let year;
let filteredProjects = projects;

// let arc = arcGenerator({ // arc is a path at the end of the day
//     startAngle: 0,
//     endAngle: 2 * Math.PI,
// });

// let data = [1, 2];
// let colors = ['gold', 'purple'];

// let total = 0;

// for (let d of data) {
//   total += d;
// };

// let angle = 0;
// let arcData = [];

// for (let d of data) {
//   let endAngle = angle + (d / total) * 2 * Math.PI;
//   arcData.push({ startAngle: angle, endAngle });
//   angle = endAngle;
// };

// let arcs = arcData.map((d) => arcGenerator(d));


// Refactor all plotting into one function
function renderPieChart(projectsGiven) {
    let rolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year, // essentially groupby year and find counts
    );
    // console.log(rolledData);

    let data = rolledData.map(([year, count]) => {
        return { value: count, label: year };
    });
    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    let sliceGenerator = d3.pie().value((d) => d.value); // gets only the value of each class
    let arcData = sliceGenerator(data);
    let arcs = arcData.map((d) => arcGenerator(d));
    let legendElement = d3.select('.legend')

    // TODO: clear up paths and legends
    let legend = d3.select('.legend');
    legend.selectAll('li').remove();

    let svg = d3.select('svg');
    svg.selectAll('path').remove();

    // update paths and legends, refer to steps 1.4 and 2.2
    arcs.forEach((arc, i) => { // for indexing
        d3.select('svg')
        .append('path')
        .attr('d', arc) // attr 'd' is the attribute for path
        .attr('fill', colors(i)) // function that takes in index and splits out colors
        .on('click', () => {

            if (selectedIndex === i) { // already selected and now to deselect
                selectedIndex = -1;
            } else {
                selectedIndex = i; // isn't selected, now selected
            };

            // console.log(selectedIndex);
            // svg.selectAll('path')
            //     .attr('class', (_, i) => console.log(i === selectedIndex));
            
            // very cheeky, class selected when clicked
            svg.selectAll('path')
                .attr('class', (_, i) => (i === selectedIndex? 'selected': '')); // won't fill when pie is one slice

            legend.selectAll('li')
                .attr('class', (_, i) => (i === selectedIndex? 'selected': '')); // preferably red if clicked but not working

            if (selectedIndex === -1) {
                year = false; // resets year variable
                filteredProjects = projects;
            } else {
                // TODO: filter projects and project them onto webpage
                // Hint: `.label` might be useful
                year = data[selectedIndex].label;
            }
            
            updateDisplay(year, query);
        });
    });

    data.forEach((d, i) => {
        legendElement
            .append('li')
            .attr('style', `--color:${colors(i)}`)
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
        }
    );
};

// call this function on page load
renderPieChart(projects);

// seach for projects
let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('change', (event) => {
    // update query value
    query = event.target.value;

    if (query == '') { // reset variable (edge case for design sake)
        query = false;
        filteredProjects = projects;
    };

    // TODO: filter the projects
    //   let filteredProjects = projects.filter((project) => {
    //     let values = Object.values(project).join('\n').toLowerCase();
    //     return values.includes(query.toLowerCase()); // empty string satisfies all projects
    //   });

    updateDisplay(year, query);
});


function updateDisplay(year, query) {
    if (year && !query) {
        filteredProjects = filteredProjects.filter((p) => p.year === year); // design decision to omit renderPieChart
    } else if (query && !year) {
        filteredProjects = filteredProjects.filter((p) => {
            let values = Object.values(p).join('\n').toLowerCase();
            return values.includes(query.toLowerCase());
        });
        renderPieChart(filteredProjects);
    } else if (year && query) {
        filteredProjects = filteredProjects.filter((p) => {
            let values = Object.values(p).join('\n').toLowerCase();
            return values.includes(query.toLowerCase()) && p.year === year;
        }); 
        
        /* problem child */
        selectedIndex = 0; /* short circuit issue; key: end pie will be one year */
        renderPieChart(filteredProjects);
    } else {
        filteredProjects = projects;
        renderPieChart(filteredProjects);
    };

    renderProjects(filteredProjects, projectsContainer, 'h2');
};