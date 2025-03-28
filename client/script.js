var socket = io();
const textArea = document.getElementById("textEditor");
const saveButton = document.getElementById("saveButton");


socket.on("startingCoEditor", (data) => {
    textArea.value = data;
    console.log("Starting data: " + data);
});


socket.on("updatedText", (data) => {
    textArea.value = data;
});


textArea.addEventListener("input", () => {
    socket.emit("textUpdate", textArea.value);
});

saveButton.addEventListener("click", () => {
    socket.emit("saveText", textArea.value);
    alert("Text saved successfully!"); 
});
