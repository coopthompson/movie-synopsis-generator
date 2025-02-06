function getMovieContentElement() {
    return document.querySelector('.synopsis');
}

function randomizePrompt() {
    const randomSynopses = [
            "In a dystopian future, a rogue AI controls the fate of humanity.",
            "A washed-up detective takes one last case that changes everything.",
            "A group of teens discover an ancient artifact that grants them incredible powers.",
            "A scientist accidentally creates a portal to an alternate universe.",
            "An exiled prince must reclaim his throne before an intergalactic war erupts."
    ];

    let randPrompt = randomSynopses[Math.floor(Math.random()*randomSynopses.length)]
    return randPrompt
}

function captureScreenshot(callback) {
    const element = getMovieContentElement();
    if (!element || element.innerText.trim() === "") {
        alert("No content to share!");
        return;
    }

    const confirmSave = confirm("Do you want to save a screenshot for sharing?");
    if (!confirmSave) return;

    html2canvas(element, { backgroundColor: null }).then(canvas => {
        const imageDataUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = imageDataUrl;
        downloadLink.download = "movie-synopsis.png";
        downloadLink.click();
        callback();
    });
}

function guideAndOpen(url) {
    alert("Screenshot saved! I will now link you to the site to share!");
    window.open(url, '_blank');
}

function shareOnFacebook() {
    captureScreenshot(() => {
        guideAndOpen("https://www.facebook.com/");
    });
}

function shareOnTwitter() {
    captureScreenshot(() => {
        guideAndOpen("https://twitter.com/intent/tweet");
    });
}

function shareOnBluesky() {
    captureScreenshot(() => {
        guideAndOpen("https://bsky.app/");
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".input-container");
    const promptBox = document.getElementById("prompt-box");
    const synopsisOutput = document.querySelector(".synopsis p");
    const randomButton = document.querySelector(".random-button");

    alert(
        "This is an AI movie generation app. Write some guidelines in the textarea below then click the" +
        " submit button to generate a new synopsis for your movie. Click the random button to instead generate a" +
        " synopsis without having to input a prompt. You can change the display settings and text" +
        " size in the settings menu accessed in the right corner of the page. Share your creation at the bottom" +
        " of the page using our social links."
    );

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        generateSynopsis(promptBox.value.trim(), false);
    });

    randomButton.addEventListener("click", async (event) => {
        event.preventDefault();
        generateSynopsis(randomizePrompt(), true);
    });

    async function generateSynopsis(prompt, isRandom = false) {
        if (synopsisOutput.innerText.trim() === "Generating movie synopsis...") {
            alert("WARNING: This content is AI-generated and requires time to process. Please wait.");
            return;
        }

        if (!isRandom && (!prompt || prompt === "Enter your prompt here...")) {
            synopsisOutput.innerText = "Please enter a valid prompt or click the Random button...";
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
    }
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
    const paragraphs = document.querySelector("p");
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
            paragraphs.classList.remove("light-mode", "dark-mode", "high-contrast-mode");
            synopsis.classList.remove("light-mode", "dark-mode", "high-contrast-mode");


            body.classList.add(radio.value + "-mode");
            mainContainer.classList.add(radio.value + "-mode");
            textArea.classList.add(radio.value + "-mode");
            paragraphs.classList.add(radio.value + "-mode");
            synopsis.classList.add(radio.value + "-mode");
        });
        });
    });
});

function getMovieContent() {
    const synopsisDiv = document.querySelector('.synopsis p');
    if (synopsisDiv && synopsisDiv.textContent.trim() !== "") {
        return synopsisDiv.textContent.trim();
    }
    return null;
}
