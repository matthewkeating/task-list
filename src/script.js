/***********************************************************
 * Initialize and configure the elements we need 
 ***********************************************************/

/********************************
 * Global variables to make shit easy
 ********************************/
selectedTask = null;
selectedPin = null;

/********************************
 * addTaskInputBox
 ********************************/
const addTaskInputBox = document.getElementById("addTaskInputBox");
addTaskInputBox.spellcheck = false; // turn off spell check
addTaskInputBox.addEventListener("keypress", e => {
  if (e.key === "Enter" && addTaskInputBox.value.trim()) {
    const newTask = { id: Date.now().toString(), title: addTaskInputBox.value, note: "" };
    if (e.shiftKey) {
      tasks.push(newTask); // append to end of list
    } else {
      tasks.unshift(newTask); // add to the start of the list
    }
    saveTasks();
    renderTasks();
    addTaskInputBox.value = "";
    // Set focus to the notes box of newly added task
    document.querySelector(`[data-id="${newTask.id}"]`).querySelector('.task-title').focus();
    document.getElementById("sidebarTextArea").focus();
  }
});

/********************************
 * sidebarTitle
 ********************************/
const sidebarTitle = document.getElementById("sidebarTitle");
sidebarTitle.contentEditable = true;    // TODO: we probably want to make this an input box instead of a div
sidebarTitle.spellcheck = false;        // turn off spell check
// Confgure sidebar title to (a) update the title in the list and (b) save to local storage (with each key press)
sidebarTitle.addEventListener("keyup", () => {
  if (selectedTask) {
    document.querySelector(`[data-id="${selectedTask.id}"]`).getElementsByClassName("task-title")[0].innerHTML = sidebarTitle.innerText;
    selectedTask.title = sidebarTitle.innerText;
    saveTasks();
  }
  if (selectedPin) {
    document.querySelector(`[data-id="${selectedPin.id}"]`).getElementsByClassName("task-title")[0].innerHTML = sidebarTitle.innerText;
    selectedPin.title = sidebarTitle.innerText;
    savePins();
  }
});
// Configure sidebar title to keep the associated task the in list area looking focused
sidebarTitle.onfocus = () => { keepTaskFocused(); };

/********************************
 * sidebarTextArea
 ********************************/
const sidebarTextArea = document.getElementById("sidebarTextArea");
sidebarTextArea.spellcheck = false; // turn off spell check
sidebarTextArea.onfocus = () => { keepTaskFocused(); }; // Configure sidebar text area to keep the associated task the in list area looking focused
sidebarTextArea.oninput = () => {
  if (selectedTask) {
    selectedTask.note = sidebarTextArea.value;
    saveTasks();
    renderTasks();  // it is pretty inefficient to refresh the task list on every key stroke, but it allows me to update the note indicator icon
  }
  if (selectedPin) {
    selectedPin.note = sidebarTextArea.value;
    savePins();
    renderPins();  // it is pretty inefficient to refresh the task list on every key stroke, but it allows me to update the note indicator icon
  }
};

/********************************
 * Other elements
 ********************************/
const taskContainer = document.getElementById("taskContainer");
const pinContainer = document.getElementById("pinContainer");
const sidebar = document.getElementById("sidebar");

/********************************
 * Document element
 ********************************/
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    hideSidebar();
  }
});

// Load saved content from localStorage when the page loads
tasks = JSON.parse(localStorage.getItem("tasks")) || [];
pins = JSON.parse(localStorage.getItem("pins")) || [];

/***********************************************
 * Define methods
 ***********************************************/

const saveTasks = () => {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

const savePins = () => {
  localStorage.setItem("pins", JSON.stringify(pins));
};

// Keep the selected task in the list highlighted
const keepTaskFocused = () => {
  var tmp;
  if (selectedTask) {
    tmp = document.querySelector(`[data-id="${selectedTask.id}"]`); 
  } else if (selectedPin) { 
    tmp = document.querySelector(`[data-id="${selectedPin.id}"]`);
  } else {
    // error state
  }
  tmp.classList.add("task-focused");
}

const removeFocus = () => {
  const focusedTasks = document.getElementsByClassName("task-focused");
  for (let i = 0; i < focusedTasks.length; i++) {
    focusedTasks[i].classList.remove("task-focused");
  }
}

const setFocus = task => {
  const t = document.querySelector(`[data-id="${task.id}"]`);
  t.classList.add("task-focused");
}

const taskSelected = task => {
  // set/reset the global variables
  selectedTask = task;
  selectedPin = null;

  sidebarTitle.innerText = task.title;
  sidebarTextArea.value = task.note || "";
  sidebar.classList.add("active");
};

const pinSelected = pin => {
  // set/reset the global variables
  selectedPin = pin;
  selectedTask = null;

  sidebarTitle.innerText = pin.title;
  sidebarTextArea.value = pin.note || "";
  sidebar.classList.add("active");
};

const pinTask = task => {
  const newPin = { id: task.id, title: task.title, note: task.note }; // create pinned task
  pins.unshift(newPin); // add to the start of the list
  tasks = tasks.filter(t => t.id !== task.id); // remove task
  
  updateTaskOrder();
  updatePinOrder();
  renderPins();
  renderTasks();

  // Set focus to the newly pinned task
  //selectedPin = newPin;
  //document.querySelector(`[data-id="${newPin.id}"]`).querySelector('.task-title').focus();
  //document.getElementById("sidebarTextArea").focus();
};

const unpinPin = pin => {
  const newTask = { id: pin.id, title: pin.title, note: pin.note }; // create pinned task
  tasks.unshift(newTask); // add to the start of the list
  pins = pins.filter(p => p.id !== pin.id); // remove task
  
  updateTaskOrder();
  updatePinOrder();
  renderPins();
  renderTasks();

  // Set focus to the newly added task
  //selectedTask = newTask;
  //document.querySelector(`[data-id="${newTask.id}"]`).querySelector('.task-title').focus();
  //document.getElementById("sidebarTextArea").focus();
};

const hideSidebar = () => {
  sidebar.classList.remove("active");
  addTaskInputBox.focus();
  removeFocus();
};

const updateTitleInSidebar = () => {
  if (selectedTask) {
    task = selectedTask;
    sidebarTitle.innerText = task.title;
    saveTasks();
  }
  if (selectedPin) {
    pin = selectedPin;
    sidebarTitle.innerText = pin.title
    savePins();
  }
}

const updateTaskOrder = () => {
  const updatedOrder = Array.from(taskContainer.children).map(div => div.dataset.id);
  tasks.sort((a, b) => updatedOrder.indexOf(a.id) - updatedOrder.indexOf(b.id));
  saveTasks();
};

const updatePinOrder = () => {
  const updatedOrder = Array.from(pinContainer.children).map(div => div.dataset.id);
  pins.sort((a, b) => updatedOrder.indexOf(a.id) - updatedOrder.indexOf(b.id));
  savePins();
};

const renderTasks = () => {

  if (tasks.length === 0) {
    taskContainer.innerHTML = "Empty"
    taskContainer.classList.add("draggable-container-empty");
    return
  } else {
    taskContainer.innerHTML = "";
    taskContainer.classList.remove("draggable-container-empty");
  }

  tasks.forEach(task => {

    // Create the div that will hold all the elements of a task
    const taskDiv = document.createElement("div");
    taskDiv.classList.add("task");
    taskDiv.draggable = true;
    taskDiv.dataset.id = task.id;

    // Create the delete button
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");
    deleteButton.innerText = "✕";
    deleteButton.onclick = () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks();
      addTaskInputBox.focus();
      hideSidebar();
    }

    // Create the div for the task title 
    const titleDiv = document.createElement("div");
    titleDiv.classList.add("task-title");
    titleDiv.contentEditable = true;
    titleDiv.spellcheck = false;
    titleDiv.innerText = task.title;
    titleDiv.oninput = () => {
      task.title = titleDiv.innerText;
      saveTasks();
    };
    titleDiv.addEventListener("focus", () => { taskSelected(task); removeFocus(); });
    titleDiv.addEventListener("keyup", () => { updateTitleInSidebar(task); });

    // Create the img element that will hold the note indicator
    const noteIndicator = document.createElement("img");
    if (task.note.trim().length !== 0) {
      noteIndicator.src = "./images/notes_icon.svg";
      noteIndicator.classList.add("notes-icon");
    }
    // Ensure that when the note indicator is clicked, the titleDiv (it's previous sibling) gets focus
    noteIndicator.addEventListener("click", () => {
      taskSelected(task);
      // TODO: I'm not sure why the below line doesn't work.
      // const tmp = document.getElementById("sidebarTaskNoteTextArea").focus();
    });

    // Create the img element that will hold the pin images
    const pinImage = document.createElement("img");
    pinImage.src = "./images/pin_empty_icon.svg";
    pinImage.classList.add("pin-icon");
    pinImage.onclick = () => {
      pinTask(task);
    }

    // Add all of the above task elements to the task div
    taskDiv.appendChild(deleteButton);
    taskDiv.appendChild(titleDiv);
    taskDiv.appendChild(noteIndicator);
    taskDiv.appendChild(pinImage);

    taskDiv.onclick = () => { titleDiv.focus() };

    // Add the task div to the task container
    taskContainer.appendChild(taskDiv); 

  });

  if (selectedTask) {
    const tmp = document.querySelector(`[data-id="${selectedTask.id}"]`);
    if (tmp !== null) {
      tmp.classList.add("task-focused");
    }
  }

};

const renderPins = () => {

  if (pins.length === 0) {
    pinContainer.innerHTML = "Empty";
    pinContainer.classList.add("draggable-container-empty");
    return;
  } else {
    pinContainer.innerHTML = "";
    pinContainer.classList.remove("draggable-container-empty");
  }

  pins.forEach(pin => {

    // Create the div that will hold all the elements of a pin
    const pinDiv = document.createElement("div");
    pinDiv.classList.add("task");
    pinDiv.draggable = true;
    pinDiv.dataset.id = pin.id;

    // Create the delete button
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");
    deleteButton.innerText = "✕";
    deleteButton.onclick = () => {
      pins = pins.filter(p => p.id !== pin.id);
      savePins();
      renderPins();
      addTaskInputBox.focus();
      hideSidebar();
    }

    // Create the div for the pin title 
    const titleDiv = document.createElement("div");
    titleDiv.classList.add("task-title");
    titleDiv.contentEditable = true;
    titleDiv.spellcheck = false;
    titleDiv.innerText = pin.title;
    titleDiv.oninput = () => {
      pin.title = titleDiv.innerText;
      savePins();
    };
    titleDiv.addEventListener("focus", () => { pinSelected(pin); removeFocus(); });
    titleDiv.addEventListener("keyup", () => updateTitleInSidebar(pin));

    // Create the img element that will hold the note indicator
    const noteIndicator = document.createElement("img");
    if (pin.note.trim().length !== 0) {
      noteIndicator.src = "./images/notes_icon.svg";
      noteIndicator.classList.add("notes-icon");
    }
    // Ensure that when the note indicator is clicks, the titleDiv (it's previous sibling) gets focus
    noteIndicator.addEventListener("click", () => {
      pinSelected(pin);
      // TODO: I'm not sure why the below line doesn't work.
      // const tmp = document.getElementById("sidebarTextArea").focus();
    });

    // Create the img element that will hold the pin images
    const pinImage = document.createElement("img");
    pinImage.src = "./images/pin_filled_icon.svg";
    pinImage.classList.add("pin-icon");
    pinImage.onclick = () => {
      unpinPin(pin);
    }

    // Add all of the above pin elements to the pin div
    pinDiv.appendChild(deleteButton);
    pinDiv.appendChild(titleDiv);
    pinDiv.appendChild(noteIndicator);
    pinDiv.appendChild(pinImage);

    pinDiv.onclick = () => { titleDiv.focus() };

    // Add the pin div to the pin container
    pinContainer.appendChild(pinDiv);
    
  });

  if (selectedPin) {
    const tmp = document.querySelector(`[data-id="${selectedPin.id}"]`);
    if (tmp !== null) {
      tmp.classList.add("task-focused");
    }
  }

};

/***********************************************
 * Set up drag and drop
 ***********************************************/
document.addEventListener("DOMContentLoaded", () => {
  const draggableContainers = document.querySelectorAll(".draggable-container");

  draggableContainers.forEach(container => {
      container.addEventListener("dragover", e => {
          e.preventDefault();
          const dragging = document.querySelector(".dragging");
          const afterElement = getDragAfterElement(container, e.clientY);
          if (afterElement == null) {
              container.appendChild(dragging);
          } else {
              container.insertBefore(dragging, afterElement);
          }
      });

      container.addEventListener("dragstart", e => {
          e.target.classList.add("dragging");
      });

      container.addEventListener("dragend", e => {

          e.target.classList.remove("dragging");

          // if selected item is a pin and is moving to another position in the pin list
          if (selectedPin && container.id === "pinContainer") {
            updatePinOrder();
            //renderPins();  // the purpose of this is simply to make sure the dragged icon remains highlighted after the drag operation
          }
          // if selected item is a pin and is moving to to the task list
          if (selectedPin && container.id === "taskContainer") {
            const newTask = { id: selectedPin.id, title: selectedPin.title, note: selectedPin.note }; // create pinned task
            tasks.push(newTask);                                                                      // save the task to the local storage
            pins = pins.filter(p => p.id !== selectedPin.id);                                         // remove pinned task from local storage
            updateTaskOrder();
            updatePinOrder();
            renderTasks();  // need to do this to "refresh" the pin icon with the correct fill
            if (pins.length === 0) {
              renderPins();  // this is need to put the "empty" message up.
            }
          }
          // if selected item is a task and is moving to another position in the task list
          if (selectedTask && container.id === "taskContainer") {
            updateTaskOrder();
          }
          // if selected item is a task and is moving to to the pin list
          if (selectedTask && container.id === "pinContainer") { 
            const newPinned = { id: selectedTask.id, title: selectedTask.title, note: selectedTask.note };  // create pinned task
            pins.push(newPinned);                                                                           // save pinned task to the local storage
            tasks = tasks.filter(t => t.id !== selectedTask.id);                                            // remove task from local storage
            updateTaskOrder();
            updatePinOrder();
            renderPins();   // need to do this to "refresh" the pin icon with the correct fill
            if (tasks.length === 0) {
              renderTasks();  // this is need to put the "empty" message up.
            }
          }

      });
      
      // Add drag events to each task
      const t = container.querySelectorAll(".task");
      t.forEach(task => {
          task.addEventListener("dragstart", e => {
              e.target.classList.add("dragging");
          });
          task.addEventListener("dragend", e => {
              e.target.classList.remove("dragging");
          });
      });
  });

  const getDragAfterElement = (container, y) => {
      const draggableElements = [...container.querySelectorAll(".task:not(.dragging)")];
      return draggableElements.reduce((closest, child) => {
          const box = child.getBoundingClientRect();
          const offset = y - box.top - box.height / 2;
          return offset < 0 && offset > closest.offset ? { offset, element: child } : closest;
      }, { offset: Number.NEGATIVE_INFINITY }).element;
  };
});

/***********************************************
 * Misc.
 ***********************************************/

// Click anywhere to force the sidebar to hide.
document.addEventListener('click', function(event) {
  if (event.target.id == "tasksArea" || event.target.id == "other") {
    hideSidebar();
  }
});

/***********************************************
 * Commands to run on page load
 ***********************************************/

 renderTasks();
 renderPins();