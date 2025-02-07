let link = document.createElement('link');
link.rel = 'stylesheet';
link.type = 'text/css';
link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css';
document.head.appendChild(link);

// Global storage for quick marks (with counts for how many times they have been copied)
let quickMarks = [];

// Function to add a new quick mark
function addQuickMark(text) {
    if (text && !quickMarks.some(quickMark => quickMark.text === text)) {
        quickMarks.push({ text: text, copiedCount: 0 });
        // Save updated quick marks to localStorage
        localStorage.setItem("quickMarks", JSON.stringify(quickMarks));
        updateQuickMarkList();  // Update the list after adding a new quick mark
    }
}

// Function to update the list of quick marks in the UI
function updateQuickMarkList() {
    const listContainer = document.getElementById("quick-mark-list-container");
    const quickMarkCopiedNote = document.getElementById("quick-mark-copied-note");

    if (!listContainer) return;

    listContainer.innerHTML = "";  // Clear the current list

    // Sort the quick marks by copiedCount (descending order)
    const sortedQuickMarks = quickMarks.sort((a, b) => b.copiedCount - a.copiedCount);

    // Create a new list item for each quick mark
    sortedQuickMarks.forEach((quickMark, index) => {
        const listItem = document.createElement("li");
        listItem.textContent = quickMark.text;
        listItem.classList.add("quick-mark-item");
        listItem.dataset.index = index;
        listItem.style.cursor = "pointer"; // Change cursor to pointer to indicate clickability

        // Create a "Copied!" message container (initially hidden)
        const copiedMessage = document.createElement("span");
        copiedMessage.textContent = "Copied!";
        copiedMessage.style.color = "blue";
        copiedMessage.style.display = "none"; // Hide initially
        copiedMessage.style.marginTop = "5px";

        // Add a click event listener to copy the quick mark when clicked
        listItem.addEventListener("click", () => {
            copyQuickMarkText(quickMark);
            quickMark.copiedCount += 1;  // Increment copied count
            localStorage.setItem("quickMarks", JSON.stringify(quickMarks));  // Save updated count
            updateQuickMarkList();  // Update the list to reflect new order and count

            // Show the "Copied!" message under the quick mark
            copiedMessage.style.display = "inline-block";  // Show the message

            // Display a small note below the input/button saying "<quickmark> copied!"
            quickMarkCopiedNote.textContent = `"${quickMark.text}" copied!`;
            quickMarkCopiedNote.style.color = "green";
            quickMarkCopiedNote.style.display = "inline-block"; // Show note

            // Hide the "Copied!" message after 2 seconds
            setTimeout(() => {
                copiedMessage.style.display = "none";
            }, 2000);
        });

        // Append the copied message under the list item
        listItem.appendChild(copiedMessage);

        // Create the delete icon (FontAwesome trash icon)
        const deleteLink = document.createElement("a");
        deleteLink.href = "#";
        deleteLink.innerHTML = `<i class="fa fa-trash" aria-hidden="true" style="color: red;"></i>`;  // FontAwesome trash icon
        deleteLink.style.marginLeft = "10px";

        // Add event listener for the delete icon
        deleteLink.addEventListener("click", (e) => {
            e.preventDefault();  // Prevent the default link action
            quickMarks.splice(index, 1);  // Remove the quick mark from the array
            localStorage.setItem("quickMarks", JSON.stringify(quickMarks));  // Update local storage
            updateQuickMarkList();  // Update the list
        });

        // Append the delete icon to the list item
        listItem.appendChild(deleteLink);

        // Append the list item to the container
        listContainer.appendChild(listItem);

        // Add an <hr> element to separate the quick marks, but only after each item (not before the first one)
        const separator = document.createElement("hr");
        listContainer.appendChild(separator);
    });

    // Check if the list container height exceeds 300px, and make it scrollable if it does
    if (listContainer.scrollHeight > 300) {
        listContainer.style.maxHeight = "300px";
        listContainer.style.overflowY = "auto";
    } else {
        listContainer.style.maxHeight = "none";  // Remove the max height if content is smaller
        listContainer.style.overflowY = "visible";
    }
}

// Function to copy the quick mark text to the clipboard
function copyQuickMarkText(quickMark) {
    const textArea = document.createElement("textarea");
    textArea.value = quickMark.text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);

    console.log("Quick mark copied to clipboard!");
}

// Function to inject the UI elements above #submission_details
function injectUI() {
    const submissionDetailsDiv = document.getElementById("submission_details");

    if (!submissionDetailsDiv) return;

    const quickMarkContainer = document.createElement("div");
    quickMarkContainer.id = "quick-mark-container";
    quickMarkContainer.style.marginBottom = "20px";

    const quickMarkListContainer = document.createElement("ul");
    quickMarkListContainer.id = "quick-mark-list-container";
    quickMarkListContainer.style.listStyleType = "none";
    quickMarkListContainer.style.padding = "0";

    const newQuickMarkText = document.createElement("input");
    newQuickMarkText.type = "text";
    newQuickMarkText.placeholder = "Add a new quick mark...";
    newQuickMarkText.id = "quickMarkInput";

    const addQuickMarkButton = document.createElement("button");
    addQuickMarkButton.textContent = "Add";
    addQuickMarkButton.style.cursor = "pointer";
    addQuickMarkButton.id = "quickMarkButton";

    // Style the input and button as a single line
    const inputButtonContainer = document.createElement("div");
    inputButtonContainer.style.display = "flex";
    inputButtonContainer.style.alignItems = "center";
    inputButtonContainer.style.marginBottom = "10px";  // Add space below the button for breathing room

    inputButtonContainer.appendChild(newQuickMarkText);
    inputButtonContainer.appendChild(addQuickMarkButton);

    // Add the note element to display "<quickmark> copied!" message
    const quickMarkCopiedNote = document.createElement("div");
    quickMarkCopiedNote.id = "quick-mark-copied-note";
    quickMarkCopiedNote.style.display = "none";
    quickMarkCopiedNote.style.fontSize = "12px";
    quickMarkCopiedNote.style.marginTop = "5px"; // Margin above the note

    // Event listener for adding a new quick mark
    addQuickMarkButton.addEventListener("click", () => {
        const quickMarkText = newQuickMarkText.value.trim();
        if (quickMarkText) {
            addQuickMark(quickMarkText);
            newQuickMarkText.value = ""; // Clear input field after adding
        }
    });

    // Allow submitting the quick mark with the "Enter" key
    newQuickMarkText.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const quickMarkText = newQuickMarkText.value.trim();
            if (quickMarkText) {
                addQuickMark(quickMarkText);
                newQuickMarkText.value = ""; // Clear input field after adding
            }
        }
    });

    // Assemble the UI
    quickMarkContainer.appendChild(quickMarkListContainer);
    quickMarkContainer.appendChild(inputButtonContainer);
    quickMarkContainer.appendChild(quickMarkCopiedNote); // Append the copied note

    // Insert the UI above the #submission_details div
    submissionDetailsDiv.parentNode.insertBefore(quickMarkContainer, submissionDetailsDiv);
}

// Initial function call to inject UI and load any existing quick marks
function init() {
    injectUI();

    // Load quick marks from localStorage if they exist
    const savedQuickMarks = localStorage.getItem("quickMarks");
    if (savedQuickMarks) {
        quickMarks = JSON.parse(savedQuickMarks);
        updateQuickMarkList();
    }
}

// Call init on page load
init();
