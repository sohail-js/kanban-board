
var sections = JSON.parse(localStorage.getItem('sections') || '[]');

const sectionsElement = document.getElementById('sections');
/**
 * @desc Render all sections with tasks in inside.
 */
function renderBoard() {
    console.log("Rendering", sections);

    sectionsElement.innerHTML = sections.map(section => {
        return `
        <div class="section" section-id="${section.id}">
            <div class="title">${section.title}</div>
            <div class="toolbar">
                <button onclick="editSection('${section.id}')">Edit</button>
                <button onclick="deleteSection('${section.id}')">Delete</button>
                <button onclick="addTask('${section.id}')">Add a task</button>
            </div>
            

            <div class="tasks">

                <div class="dropzone" section-id="${section.id}">
                DROP HERE
                </div>

                ${section.tasks.map(task => {
            return `
                    <div class="task" task-id="${task.id}">
                        <div class="title">${task.title}</div>
                        <div class="description">${task.description}</div>

                        <div class="toolbar">
                            <button onclick="editTask('${section.id}', '${task.id}')">Edit</button>
                            <button onclick="deleteTask('${section.id}', '${task.id}')">Delete</button>
                        </div>

                        <div class="handle" task-id="${task.id}" section-id="${section.id}">
                            ...
                        </div>
                    </div>
                    `
        }).join("")}
            </div>
        </div>
        `;

    }).join("");

    // Update localStorage
    localStorage.setItem('sections', JSON.stringify(sections))
}

/**
 * @desc Add a section
 */
function addSection() {
    let section = askInput(['title']);

    section.id = Date.now();
    section.tasks = [];

    sections.push(section);
    renderBoard();
}

/**
 * @desc Delete a section
 */
function deleteSection(id) {
    sections = sections.filter(x => x.id != id);
    renderBoard();
}

/**
 * @desc Edit a section
 */
function editSection(id) {
    let section = sections.find(x => x.id == id);

    section.title = askInput(['title'], section).title;

    renderBoard();
}

/**
 * @desc Add a section
 */
function addTask(id) {
    let section = sections.find(x => x.id == id);
    let task = askInput(['title', 'description']);

    task.id = Date.now();

    section.tasks.push(task);
    renderBoard();
}

/**
 * @desc Delete a task
 */
function deleteTask(sectionId, taskId) {
    let section = sections.find(x => x.id == sectionId);

    section.tasks = section.tasks.filter(task => task.id != taskId);
    renderBoard();
}

/**
 * @desc Edit a task
 */
function editTask(sectionId, taskId) {
    let section = sections.find(x => x.id == sectionId);

    let task = section.tasks.find(task => task.id == taskId);

    let output = askInput(['title', 'description'], task);

    task.title = output.title;
    task.description = output.description;
    renderBoard();
}

/**
 * @desc Generic function to ask user input using prompt
 */
function askInput(input, defaults) {
    let result = {};
    input.forEach(item => {
        result[item] = prompt("Enter " + item, defaults && defaults[item] ? defaults[item] : "");
    })

    return result;
}


renderBoard();


// let op = askInput(['name', 'description', 'age']);

// console.log(op);


/**
 * DRAG & DROP FEATURE
 */

let activeDrag = {};
let activeDragElement;
function mouseDown(event) {
    console.log(event);

    if (event.target.hasAttribute('task-id') && event.target.hasAttribute('section-id')) {
        activeDrag.task = event.target.getAttribute('task-id');
        activeDrag.section = event.target.getAttribute('section-id');

        activeDragElement = event.target.parentElement;
        activeDrag.width = activeDragElement.clientWidth;
        activeDrag.height = activeDragElement.clientHeight;
        activeDragElement.style.position = 'absolute';
        activeDragElement.style.width = activeDrag.width - 20 + 'px';

        // Listen for mouse move and mouse up
        document.addEventListener('mousemove', mouseMove)
        document.addEventListener('mouseup', mouseUp);
        document.addEventListener('mouseover', mouseOver)
    }
}
document.addEventListener('mousedown', mouseDown);

function mouseMove(event) {
    // console.log("Dragging", event.x, event.y);
    activeDragElement.style.top = event.y - activeDrag.height + 10 + "px";
    activeDragElement.style.left = event.x - (activeDrag.width / 2) + "px";
    // console.log(activeDragElement);

}

function mouseUp(event) {
    console.log("Dropped", event);

    activeDragElement.style.position = 'initial';
    activeDragElement.style.top = 'unset';
    activeDragElement.style.left = 'unset';
    document.removeEventListener('mousemove', mouseMove);
    // document.removeEventListener('mousedown', mouseDown);
    document.removeEventListener('mouseup', mouseUp);
    document.removeEventListener('mouseover', mouseOver);

    // while (ele.className.includes())
    if (lastMouseOverElement.hasAttribute('section-id')) {
        console.log("Correct place");

        let section = sections.find(x => x.id == activeDrag.section);
        let task = section.tasks.find(x => x.id == activeDrag.task);

        // Remove from where drag started
        section.tasks = section.tasks.filter(x => x.id != activeDrag.task)

        // Add to where drag ended
        let dropSection = lastMouseOverElement.getAttribute('section-id');
        sections.find(x => x.id == dropSection).tasks.unshift(task)

        // renderBoard();
    }
}
let lastMouseOverElement
function mouseOver(e) {
    if (e.target.hasAttribute('section-id') && e.target.className.includes('dropzone'))
        lastMouseOverElement = e.target;
}

// Remove select listener
document.addEventListener('selectstart', e => { e.preventDefault() })

