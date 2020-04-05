var defaultSections = [
    {
        id: 1,
        title: 'New',
        tasks: []
    },
    {
        id: 2,
        title: 'Active',
        tasks: []
    },
    {
        id: 3,
        title: 'Done',
        tasks: []
    },
];

var sections = localStorage.getItem('kanban_sections');

sections = sections ? JSON.parse(sections) : defaultSections;

const sectionsElement = document.getElementById('sections');
/**
 * @desc Render all sections with tasks in inside.
 */
function renderBoard() {
    console.log("Rendering", sections);

    sectionsElement.innerHTML = sections.map(section => {
        return `
        <div class="section" section-id="${section.id}">
            <div class="title">
                <div class="text">${section.title} ${section.tasks.length ? '(' + section.tasks.length + ')' : ''}</div>
                <div class="toolbar">
                    <button title="Add Task" class="add" onclick="addTask('${section.id}')"><i class="fa fa-plus"></i></button>
                    <button title="Edit Section" class="edit" onclick="editSection('${section.id}')"><i class="fa fa-edit"></i></button>
                    <button title="Delete Section" class="delete" onclick="deleteSection('${section.id}')"><i class="fa fa-trash"></i></button>
                </div>
            </div>
           
            

            <div class="tasks">

                <!-- <div class="dropzone" section-id="${section.id}">
                DROP HERE
                </div> -->

                ${!section.tasks.length ? `
                <div class="no-tasks">
                    <i class="fa fa-exclamation-circle"></i>
                    <div>No Tasks</div>
                </div>
                `: ''}

                ${section.tasks.map(task => {
            return `
                    <div class="task" task-id="${task.id}">
                    
                        <div class="title">
                            <div class="text">${task.title}</div>
                            <div class="toolbar">
                                <button title="Edit Task" class="edit" onclick="editTask('${section.id}', '${task.id}')"><i class="fa fa-edit"></i></button>
                                <button title="Delete Task" class="delete" onclick="deleteTask('${section.id}', '${task.id}')"><i class="fa fa-trash"></i></button>
                            </div>
                        </div>

                        <div class="description">${task.description}</div>

                            <i task-id="${task.id}" section-id="${section.id}" class="handle fa fa-grip-horizontal">...</i>
            
                    </div>
                    `
        }).join("")}
            </div>
        </div>
        `;

    }).join("");

    // Update localStorage
    localStorage.setItem('kanban_sections', JSON.stringify(sections))
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

        mouseMove(event)

        // Listen for mouse move and mouse up
        document.addEventListener('mousemove', mouseMove)
        document.addEventListener('mouseup', mouseUp)
    }
}
document.addEventListener('mousedown', mouseDown);

function mouseMove(event) {
    // console.log("Dragging", event.x, event.y);
    activeDragElement.style.top = event.y + window.scrollY - activeDrag.height - 2 + "px";
    activeDragElement.style.left = event.x + window.scrollX - (activeDrag.width / 2) + "px";
    // activeDragElement.style.transform = 'translateY(20px)'
    // console.log(activeDragElement);
    // console.log(event.x, event.y);


}

function mouseUp(event) {
    console.log("Dropped", event);

    activeDragElement.style.position = 'initial';
    activeDragElement.style.top = 'unset';
    activeDragElement.style.left = 'unset';
    document.removeEventListener('mousemove', mouseMove);
    // document.removeEventListener('mousedown', mouseDown);
    document.removeEventListener('mouseup', mouseUp);


    if (event.target.hasAttribute('section-id')) {
        console.log("Correct place");

        let section = sections.find(x => x.id == activeDrag.section);
        let task = section.tasks.find(x => x.id == activeDrag.task);

        // Remove from where drag started
        section.tasks = section.tasks.filter(x => x.id != activeDrag.task)

        // Add to where drag ended
        let dropSection = event.target.getAttribute('section-id');
        sections.find(x => x.id == dropSection).tasks.unshift(task)

        renderBoard();
    }
}

// Remove select listener
document.addEventListener('selectstart', e => { e.preventDefault() })