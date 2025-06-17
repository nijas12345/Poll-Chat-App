const socket = io();

let page = 1;
let isLoading = false;
const limit = 10;
const container = document.getElementById("messages");

async function fetchMessages(initial = false) {
  if (isLoading) return;
  isLoading = true;
  try {
    const res = await fetch(`/messages?page=${page}&limit=${limit}`);
    const data = await res.json();
    const email = data.email;
    const messages = data.serviceResponse;
    if (messages.length === 0) return;

    const scrollHeightBefore = container.scrollHeight;

    // Reverse the messages to display them in the correct order
    messages.reverse().forEach((msg) => {
      const userName = msg.senderEmail.split("@")[0];
      if (msg.senderEmail === email) {
        addMessageToDiv(msg, "sent", !initial);
      } else {
        addMessageToDiv(
          { userName, message: msg.message, timestamp: msg.timestamp },
          "received",
          !initial
        );
      }
    });

    // Handle scroll position after messages are fetched
    if (!initial) {
      const scrollHeightAfter = container.scrollHeight;
      container.scrollTop += scrollHeightAfter - scrollHeightBefore;
    }

    page++;
  } catch (error) {
    console.error("Error fetching messages:", error);
  } finally {
    isLoading = false;
  }
}

// Scroll event listener for loading more messages when scrolling up
container.addEventListener("scroll", () => {
  if (container.scrollTop <= 5) {
    fetchMessages();
  }
});

// Initial fetch when the page loads
window.addEventListener("DOMContentLoaded", async () => {
  await fetchMessages(true); // true for initial load
  container.scrollTop = container.scrollHeight; // Scroll to the bottom after the initial load
});

document.querySelectorAll(".vote-btn").forEach((button) => {
  button.addEventListener("click", async () => {
    const pollOptionId = button.getAttribute("data-option-id");
    const pollId = button.getAttribute("data-poll-id");
    const optionIndex = parseInt(button.getAttribute("data-option-index"));
    try {
      const response = await fetch("/check-auth", { method: "GET" });
      if (response.status === 200) {
        const userEmail = await response.json();
        socket.emit("vote", { pollId, pollOptionId, optionIndex, userEmail });
      } else if (response.status === 401) {
        toastr.success("Please Login to Vote");
        document.getElementById("loginModal").style.display = "block";
      } else {
        toastr.warning("Unexpected response.");
      }
    } catch (error) {
      toastr.error("Something went wrong. Please try again.");
    }
  });
});

document
  .getElementById("loginForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent default form submission

    const email = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    const isEmailValid = emailRegex.test(email);
    const isPasswordValid = password.length >= 6;

    // Validate email and password before submitting
    if (!isEmailValid) {
      document.getElementById("errorMessage").style.display = "block";
      document.getElementById("errorMessage").textContent =
        "Email is not valid!";
      return;
    }

    if (!isPasswordValid) {
      document.getElementById("errorMessage").style.display = "block";
      document.getElementById("errorMessage").textContent =
        "Password must be at least 6 characters long!";
      return;
    }

    try {
      const loginResponse = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      if (!loginResponse.ok) {
        const errorData = await loginResponse.json(); // This gets your `res.status(401).json(message)`
        throw new Error(errorData); // now it will go to catch
      }
      toastr.success("Login successful!");
      document.getElementById("loginModal").style.display = "none";
      document.getElementById("logoutBtn").style.display = "inline-block";
      if (socket.connected) {
        socket.disconnect();
      }
      socket.connect();
    } catch (error) {
      console.log("error", error.message);
      toastr.error(error.message);
    }
  });
const logoutButton = document.getElementById("logoutBtn");
if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    try {
      const response = await fetch("/logout");
      if (response.ok) {
        document.getElementById("logoutBtn").style.display = "none";
      }
    } catch (error) {
      console.log(error);
    }
  });
}
document.getElementById("closeLoginModal").addEventListener("click", () => {
  document.getElementById("loginModal").style.display = "none"; // Hide the login modal when clicked
});

socket.on("voteSuccess", (data) => {
  toastr.success("Vote added successfully!");
});

socket.on("voteEmail", (data) => {
  const { userEmail } = data;
  toastr.success(`${userEmail} just voted!`);
});

socket.on("voteUpdate", (data) => {
  const { userDoc, updatedPollData } = data;
  updatedPollData.options.forEach((option, index) => {
    const voteButtonElement = document.querySelector(
      `.vote-btn[data-option-id="${option._id}"][data-option-index="${index}"]`
    );
    if (voteButtonElement !== userDoc.optionIndex) {
      voteButtonElement.textContent = "Vote";
    }
    const voteCountElement = document.querySelector(
      `.vote-count[data-option-id="${option._id}"][data-option-index="${index}"]`
    );
    if (voteCountElement) {
      voteCountElement.textContent = `Votes: ${option.votes}`;
    }
    if (index === userDoc.optionIndex) {
      const voteButtonElement = document.querySelector(
        `.vote-btn[data-option-id="${option._id}"][data-option-index="${index}"]`
      );
      if (voteButtonElement) {
        voteButtonElement.textContent = "Voted";
        voteButtonElement.style.background = "blue"
      }
    }
  });
});

const sendButton = document.getElementById("sendButton");
const messageInput = document.getElementById("messageInput");
const messagesDiv = document.getElementById("messages");
const typingIndicator = document.getElementById("typingStatus");
sendButton.addEventListener("click", () => {
  const message = messageInput.value.trim();
  if (message) {
    socket.emit("sendMessage", message); // emit to backend
    messageInput.value = "";
  }
  return;
});
messageInput.addEventListener("input", () => {
  socket.emit("typing"); // pass actual username
});

socket.on("showTyping", (userName) => {
  typingIndicator.style.display = "block";
  typingIndicator.textContent = `${userName} is typing...`;
  clearTimeout(window.typingTimeout);
  window.typingTimeout = setTimeout(() => {
    typingIndicator.style.display = "none";
  }, 1000); // hide after 1 second of inactivity
});

socket.on("receiveOwnMessage", (msg) => {
  addMessageToDiv(msg, "sent");
  scrollToBottom(); // Scroll to bottom when new message is added
});

socket.on("receiveMessage", (msg) => {
  addMessageToDiv(msg, "received");
  scrollToBottom(); // Scroll to bottom when new message is added
});

let lastShownDate = null;

function addMessageToDiv(content, type, prepend = false) {
  const messagesContainer = document.getElementById("messages");
  const messageDate = new Date(content.timestamp);
  const formattedDate = messageDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Handle date divider
  if (lastShownDate !== formattedDate) {
    const dateDivider = document.createElement("div");
    dateDivider.classList.add("date-divider");
    dateDivider.textContent = formattedDate;
    if (prepend) {
      messagesContainer.insertBefore(dateDivider, messagesContainer.firstChild);
    } else {
      messagesContainer.appendChild(dateDivider);
    }
    lastShownDate = formattedDate;
  }

  const messageElement = document.createElement("div");
  messageElement.classList.add("message", type);

  const time = messageDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (type === "sent") {
    messageElement.innerHTML = `
      <div class="message-content">
        <span>${content.message}</span>
        <span class="timestamp">${time}</span>
      </div>
    `;
  } else {
    messageElement.innerHTML = `
      <strong style="text-decoration: underline;">${content.userName}</strong>
      <div class="message-content">
        <span>${content.message}</span>
        <span class="timestamp">${time}</span>
      </div>
    `;
  }

  if (prepend) {
    messagesContainer.insertBefore(
      messageElement,
      messagesContainer.firstChild
    );
  } else {
    messagesContainer.appendChild(messageElement);
  }
}

// Scroll to bottom function
function scrollToBottom() {
  container.scrollTop = container.scrollHeight;
}

// Handle error when socket emits an error
socket.on("error", (msg) => {
  toastr.error(msg);
  messageInput.value = ""
  document.getElementById("loginModal").style.display = "block";
});
