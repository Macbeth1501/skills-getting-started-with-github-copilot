document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Participants section
        let participantsHTML = "";
        if (details.participants.length > 0) {
          participantsHTML = `
            <div class="participants-section">
              <h5>Participants</h5>
              <ul class="participants-list">
                ${details.participants.map(email => `<li class="participant-item" data-email="${email}" tabindex="0">${email}</li>`).join("")}
              </ul>
              <span class="participant-tooltip hidden"></span>
            </div>
          `;
        } else {
          participantsHTML = `
            <div class="participants-section">
              <h5>Participants</h5>
              <p class="no-participants">No participants yet.</p>
            </div>
          `;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHTML}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);

        // Add interactivity for participant emails
        const participantItems = activityCard.querySelectorAll(".participant-item");
        const tooltip = activityCard.querySelector(".participant-tooltip");
        participantItems.forEach(item => {
          item.addEventListener("click", async (e) => {
            const email = item.getAttribute("data-email");
            try {
              await navigator.clipboard.writeText(email);
              tooltip.textContent = `Copied: ${email}`;
              tooltip.classList.remove("hidden");
              tooltip.style.top = `${item.offsetTop + 24}px`;
              tooltip.style.left = `${item.offsetLeft + 10}px`;
              setTimeout(() => {
                tooltip.classList.add("hidden");
              }, 1200);
            } catch {
              tooltip.textContent = "Failed to copy";
              tooltip.classList.remove("hidden");
              setTimeout(() => {
                tooltip.classList.add("hidden");
              }, 1200);
            }
          });
          item.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
              item.click();
            }
          });
        });
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
