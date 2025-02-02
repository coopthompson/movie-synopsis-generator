document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".input-container");
    const promptBox = document.getElementById("prompt-box");
    const synopsisOutput = document.querySelector(".synopsis p");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const prompt = promptBox.value.trim();
        if (!prompt || prompt === "Enter your prompt here...") {
            synopsisOutput.innerText = "Please enter a valid movie prompt!";
            return;
        }

        synopsisOutput.innerText = "Generating movie synopsis...";

        try {
            const response = await fetch("/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt }),
            });

            const data = await response.json();
            if (data.synopsis) {
                synopsisOutput.innerText = data.synopsis;
            } else {
                synopsisOutput.innerText = "Failed to generate synopsis.";
            }
        } catch (error) {
            console.error("Error:", error);
            synopsisOutput.innerText = "Error fetching the synopsis. Please try again.";
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const settingsButton = document.querySelector(".settings");
    const settingsMenu = document.getElementById("settings-menu");
    const closeButton = document.getElementById("close-settings");
    const overlay = document.getElementById("overlay");

    const textSizeRadios = document.querySelectorAll("input[name='text-size']");
    const displayModeRadios = document.querySelectorAll("input[name='display-mode']");
    const body = document.body;
    const mainContainer = document.querySelector(".main-container");
    const textArea = document.querySelector("textarea");
    const synopsis = document.querySelector(".synopsis");

    function openSettings() {
        settingsMenu.classList.add("show");
        overlay.style.display = "block";
    }

    function closeSettings() {
        settingsMenu.classList.remove("show");
        overlay.style.display = "none";
    }

    settingsButton.addEventListener("click", openSettings);
    closeButton.addEventListener("click", closeSettings);
    overlay.addEventListener("click", closeSettings);

    textSizeRadios.forEach((radio) => {
        radio.addEventListener("change", () => {
            let fontSize;
            if (radio.value === "small") {
                fontSize = "18px";
            } else if (radio.value === "medium") {
                fontSize = "22px";
            } else if (radio.value === "large") {
                fontSize = "26px";
            }

            document.documentElement.style.fontSize = fontSize;
        });

    displayModeRadios.forEach((radio) => {
        radio.addEventListener("change", () => {
            body.classList.remove("light-mode", "dark-mode", "high-contrast-mode");
            mainContainer.classList.remove("light-mode", "dark-mode", "high-contrast-mode");
            textArea.classList.remove("light-mode", "dark-mode", "high-contrast-mode");
            synopsis.classList.remove("light-mode", "dark-mode", "high-contrast-mode");

            body.classList.add(radio.value + "-mode");
            mainContainer.classList.add(radio.value + "-mode");
            textArea.classList.add(radio.value + "-mode");
            synopsis.classList.add(radio.value + "-mode");
        });
        });
    });
});
