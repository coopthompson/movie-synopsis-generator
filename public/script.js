// Used with the randomize button to generate a random movie using various starter prompts.
function randomizePrompt() {
    const randomSynopses = [
            "In a dystopian future, a rogue AI controls the fate of humanity.",
            "A washed-up detective takes one last case that changes everything.",
            "A group of teens discover an ancient artifact that grants them incredible powers.",
            "A scientist accidentally creates a portal to an alternate universe.",
            "An exiled prince must reclaim his throne before an intergalactic war erupts."
    ];
    //Select a randomPrompt from the list and provide that the AI API.
    let randPrompt = randomSynopses[Math.floor(Math.random()*randomSynopses.length)]
    return randPrompt
}

//Used for creating a sharable screenshot of the generated text in the div that can be shared.
function captureScreenshot(callback) {
    const element = document.querySelector('.synopsis');
    if (!element || element.innerText.trim() === "") {
        alert("No content to share!");
        return;
    }

    //Ask consent to share a screenshot on the users local machine for sharing.
    const confirmSave = confirm("Do you want to save a screenshot for sharing?");
    if (!confirmSave) return;

    //Uses html2canvas to get only the data needed to share.
    html2canvas(element, { backgroundColor: null }).then(canvas => {
        const imageDataUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = imageDataUrl;
        downloadLink.download = "movie-synopsis.png";
        downloadLink.click();
        callback();
    });
}

//Used to navigate to the specific website depending on the link the user selects
function guideAndOpen(url) {
    alert("Screenshot saved! I will now link you to the site to share!");
    window.open(url, '_blank');
}

//Various onclick functions for each social media provided.
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

document.addEventListener("DOMContentLoaded", getQueryParams());

function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const username = params.get("username");

    localStorage.setItem("userId", username);
    localStorage.setItem("token", token);

    console.log("Received from profile:", username, token);

    updateAuthUI();
}

function updateAuthUI() {
    const username = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    console.log(token, username);

    const loginBtn = document.getElementById("login-btn");
    const userInfo = document.getElementById("user-info");
    const usernameDisplay = document.getElementById("username-display");
    const profileBtn = document.getElementById("view-profile-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const saveButton = document.getElementById("save-synopsis-btn");

    if (token != null  && username != null) {
        // User is logged in
        loginBtn.style.display = "none"; // Hide login button
        userInfo.style.display = "inline"; // Show username + logout
        usernameDisplay.innerText = `Welcome, ${username}!`;
        profileBtn.style.display = "inline-block"; // Show profile button
        logoutBtn.style.display = "inline-block"; // Show logout button
        saveButton.style.display = "inline-block"; // Show save button
    } else {
        // User is not logged in
        loginBtn.style.display = "inline"; // Show login button
        userInfo.style.display = "none"; // Hide username + logout
        profileBtn.style.display = "none"; // Show profile button
        saveButton.style.display = "none"; // Show save button
    }
}

function goToLogin() {
    window.location.href = "http://localhost:5003/login.html";
}

function goToProfile() {
    window.location.href = "http://localhost:5003/profile.html";
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    updateAuthUI(); // Refresh UI
}

async function saveSynopsis() {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    const synopsisText = document.querySelector(".synopsis p").innerText.trim();

    if (!userId || !token) {
        alert("You must be logged in to save a synopsis.");
        return;
    }

    if (!synopsisText || synopsisText === "Error fetching the synopsis. Please try again." || synopsisText === "Failed to generate synopsis.") {
        alert("No valid synopsis to save!");
        return;
    }

    try {
        const response = await fetch("http://localhost:5002/api/synopsisRoutes/save", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ userId, text: synopsisText })
        });

        const data = await response.json();
        if (data.success) {
            alert("Synopsis saved successfully! Click the 'View Saved Synopses button at the top of the page to see.");
        } else {
            alert("Failed to save synopsis.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while saving the synopsis.");
    }
}


// Section used for the ai generation part of the program
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".input-container");
    const promptBox = document.getElementById("prompt-box");
    const synopsisOutput = document.querySelector(".synopsis p");
    const randomButton = document.querySelector(".random-button");
    const posterOutput = document.querySelector("poster-container");

    // Alert/instruction to help new users navigate the site.
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
        // Ensures no duplicate submissions to the API. Warns user about repeated submissions.
        if (synopsisOutput.innerText.trim() === "Generating movie synopsis...") {
            alert("WARNING: This content is AI-generated and requires time to process. Please wait.");
            return;
        }

        // Ensures there is some sort of prompt in the box box when the user hits the submit button.
        if (!isRandom && (!prompt || prompt === "Enter your prompt here...")) {
            synopsisOutput.innerText = "Please enter a valid prompt or click the Random button...";
            return;
        }

        synopsisOutput.innerText = "Generating movie synopsis...";

        // Attempt to generate the synopsis
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

            // Attempt to use the synopsis to generate an image
            try {
                generateImage(data.synopsis);
                
            } catch (error) {
                console.error("Error:", error);
                posterOutput.innerText = "Error displaying poster image";

            }

            try {
                generateAudio(data.synopsis);
                
            } catch (error) {
                console.error("Error:", error);
            }

        } catch (error) {
            console.error("Error:", error);
            synopsisOutput.innerText = "Error fetching the synopsis. Please try again.";
        }
    }
});

// Section used to add events to the various buttons and settings on the page.
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

    // Most of these functions add various classes to elements to change visibility/looks.
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

    // Text sizes are changed directly through DOM manipulation rather than through classes.
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

    // These are the various classes for the display settings and the elements that need to be updated with classes.
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

// Grabs the text in the generated content div to use in other parts of the program.
function getMovieContent() {
    const synopsisDiv = document.querySelector('.synopsis p');
    if (synopsisDiv && synopsisDiv.textContent.trim() !== "") {
        return synopsisDiv.textContent.trim();
    }
    return null;
}

async function generateImage(synopsis = null) {
    if (!synopsis) {
        const generatedContent = getMovieContent();
        if (!generatedContent) {
            alert("Please enter a movie synopsis!");
            return;
        } 
        synopsis = generatedContent;
    }

    // Collect selected styles into an array
    const selectedStyles = Array.from(document.querySelectorAll("#poster-styles input:checked"))
        .map(checkbox => checkbox.value);

    try {
        const response = await fetch("http://localhost:5000/generate-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ synopsis, styles: selectedStyles }),
        });

        const data = await response.json();

        if (data.imageUrl) {
            // Display the image from the server
            const img = document.getElementById("poster");
            img.src = `http://localhost:5000${data.imageUrl}?t=${new Date().getTime()}`;
            img.style.display = "block";
        } else {
            alert("Failed to generate image.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while generating the image.");
    }
}

async function generateAudio(text = null) {
    if (!text) {
        const generatedContent = getMovieContent();
        if (!generatedContent) {
            alert("Please enter a movie synopsis!");
            return;
        } 
        text = generatedContent;
    }

    const voice = document.getElementById("voiceSelect").value;

    try {
        const response = await fetch("http://localhost:9000/generate-audio", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, voice }),
        });

        const data = await response.json();

        if (data.audioUrl) {
            // Play the generated audio
            const audio = document.getElementById("audioPlayer");
            audio.src = `http://localhost:9000${data.audioUrl}?t=${new Date().getTime()}`;
            audio.style.display = "block";
            audio.play();
        } else {
            alert("Failed to generate audio.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while generating the audio.");
    }
}
