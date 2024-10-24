async function populateLanguages() {
    fetch('/api/languages')
        .then(response => response.json())
        .then(languages => {
            const languageSelect = document.getElementById('language');
            if (languageSelect) {
                languageSelect.innerHTML = '<option value="">Select Language</option>';
                languages.forEach(language => {
                    const option = document.createElement('option');
                    option.value = language;
                    option.textContent = language;
                    languageSelect.appendChild(option);
                });
            } else {
                console.error("Language selection box not found");
            }
        })
        .catch(error => console.error('Error getting language list:', error));
}
let btnNumber =1
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    initializeEventListeners();
    populateLanguages();
     // Get the select element
     const selectElement = document.getElementById('selectId');
     // Add the change event listener
     selectElement.addEventListener('change', (event) => {
         console.log(event)
         // Gets the selected value
         btnNumber = event.target.value;
         findAgent()
     });
});

function initializeEventListeners() {
    console.log("Initializing event listeners");
    const findAgentButton = document.getElementById('find-agent-button');
    if (findAgentButton) {
        console.log("Find Agent button found");
        findAgentButton.addEventListener('click', findAgent);
    } else {
        console.error("Find Agent button not found");
    }

    const googleRatingSelect = document.getElementById('google-rating');
    if (googleRatingSelect) {
        console.log("Google Rating select box found");
    } else {
        console.error("Google Rating select box not found");
    }

    ['gender', 'experience', 'consultation-mode', 'cost', 'location', 'practice-area', 'language', 'online-reviews'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            console.log(`${id} element found`);
        } else {
            console.error(`${id} element not found`);
        }
    });
}

function hasSelectedOptions() {
    const formFields = [
        'gender', 'experience', 'language', 'consultation-mode',
        'cost', 'location', 'practice-area', 'google-rating', 'online-reviews'
    ];

    return formFields.some(field => {
        const element = document.getElementById(field);
        return element && element.value !== "";
    });
}

function findAgent() {
    const genderSelect = document.getElementById('gender');
    const warningElement = document.getElementById('warning-message');
    const resultsContainer = document.getElementById('results-container');

    if (!hasSelectedOptions()) {
        genderSelect.style.border = '2px solid red';
        warningElement.style.display = 'none';
        resultsContainer.innerHTML = ''; // Empty the result container
        return; // If no option is selected, return directly
    }

    genderSelect.style.border = ''; // Reset border style
    warningElement.style.display = 'none'; // Hide warning message

    const gender = document.getElementById('gender').value;
    const experience = document.getElementById('experience').value;
    const consultationMode = document.getElementById('consultation-mode').value;
    const cost = document.getElementById('cost').value;
    const location = document.getElementById('location').value;
    const practiceArea = document.getElementById('practice-area').value;
    const googleRating = document.getElementById('google-rating').value;
    const onlineReviews = document.getElementById('online-reviews').value;
    const language = document.getElementById('language').value;
    const params = new URLSearchParams({
        gender: (gender),
        years_of_experience: experience,
        language: language,
        google_rating: googleRating,
        online_review: onlineReviews,
        consultation_charge: cost,
        location: location,
        consultation_mode: consultationMode,
        practice_area: practiceArea,
    });
    console.log("Sending data:", { gender, experience, consultationMode, cost, location, practiceArea, googleRating, onlineReviews, language });

      // Use GET requests and attach query parameters
    fetch(`http://localhost:3000/intermediary/search?${params.toString()}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw err; });
        }
        return response.json();
    })
    .then(data => {
        let container = document.querySelector("#results-container")
       let btnShow = document.querySelector(".btnShow")
       container.innerHTML=''
        if(data.length>0){
         btnShow.style.display='flex'
        }else{
             btnShow.style.display='none'
             const recommendedTitle = document.createElement('h4');
             recommendedTitle.textContent = 'No corresponding agent found';
             container.appendChild(recommendedTitle);
        }
         
       if(btnNumber==1){
       
        data.sort((a, b) => {
           return  parseFloat(a.google_rating)- parseFloat(b.google_rating) 
        });
      }else if(btnNumber==2){
       data.sort((a, b) => {
           return parseFloat(b.google_rating) - parseFloat(a.google_rating) 
        });
        
      }else if(btnNumber==3){
       data.sort((a, b) => {
           return b.online_review - a.online_review 
        });
       }else if(btnNumber==4){
           data.sort((a, b) => {
               return  a.online_review- b.online_review
           });
       }else if(btnNumber==5){
           data.sort((a, b) => {
               return parseFloat(b.consultation_charge) - parseFloat(a.consultation_charge) 
           });
       } else if(btnNumber==6){
           data.sort((a, b) => {
               return  parseFloat(a.consultation_charge)- parseFloat(b.consultation_charge) 
           });
   }
        displayResults({recommended_agents:data});
    })
    .catch(error => {
        console.error('Error:', error);
        resultsContainer.innerHTML = '<p>An error occurred while fetching results. Please try again.</p>';
    });
}

function displayResults(results) {
    const resultsContainer = document.getElementById('results-container');

    if (!results || (!results.recommended_agents && !results.other_agents)) {
        resultsContainer.innerHTML = '<p>No matching agents found.</p>';
        return;
    }

    if (results.recommended_agents && results.recommended_agents.length > 0) {
        const recommendedTitle = document.createElement('h2');
        recommendedTitle.textContent = 'Recommended Agents';
        resultsContainer.appendChild(recommendedTitle);
        resultsContainer.appendChild(document.createElement('hr'));
        displayAgents(results.recommended_agents, resultsContainer, true);
    }

    if (results.other_agents && results.other_agents.length > 0) {
        const otherTitle = document.createElement('h2');
        otherTitle.textContent = 'Other Options';
        resultsContainer.appendChild(otherTitle);
        resultsContainer.appendChild(document.createElement('hr'));
        displayAgents(results.other_agents, resultsContainer, false);
    }
}

function displayAgents(agents, container, isRecommended) {
    console.log(agents)
    const agentsList = document.createElement('ul');
    agentsList.className = 'agents-list';
    agents.forEach(agent => {
        const listItem = document.createElement('li');
        listItem.className = 'agent-item';
        const profileImage = agent.gender.toLowerCase().includes('female') ? 'female profile.webp' : 'male profile.webp';
        const genderIcon = agent.gender.toLowerCase().includes('female') ? 'female-icon.png' : 'male-icon.webp';
        
        let agentInfo = `
        <div class="agent-profile">
            <img src="images/${profileImage}" alt="${agent.gender} Profile" class="profile-image">
            <div class="marn">${agent.marn}</div>
        </div>
        <div class="agent-details">
            <div class="name-and-gender">
                <strong>${agent.full_name}</strong>
                <img src="images/${genderIcon}" alt="${agent.gender}" class="gender-icon">
            </div>
            <p>Gender: ${agent.gender}</p>
            <p>Experience: ${agent.years_of_experience}</p>
            <p>Rating: ${agent.google_rating}</p>
            <p>Location: ${agent.location}</p>
            <p>Consultation Mode: ${agent.consultation_mode}</p>
            <p>Practice Area: ${agent.practice_area}</p>
            <p>Language: ${agent.language}</p>
            <p>Online Review: ${agent.online_review}</p>
            <p>Budget: ${agent.consultation_charge}</p>
        </div>
        <div class="connect-button-container">
            <a href="${agent.website}" target="_blank" rel="noopener noreferrer" class="contact-link">Connect</a>
        </div>
    `;

        listItem.innerHTML = agentInfo;
        agentsList.appendChild(listItem);
    });
    container.appendChild(agentsList);
}

function showOptions() {
    document.getElementById('language-options').style.display = 'block';
}

function filterOptions() {
    const input = document.getElementById('language').value.toLowerCase();
    const options = document.getElementById('language-options').children;
    for (let option of options) {
        if (option.textContent.toLowerCase().includes(input)) {
            option.style.display = 'block';
        } else {
            option.style.display = 'none';
        }
    }
}

function selectOption(language) {
    document.getElementById('language').value = language;
    document.getElementById('language-options').style.display = 'none';
}

document.addEventListener('click', function(e) {
    if (!document.getElementById('language-options').contains(e.target) && e.target.id !== 'language') {
        document.getElementById('language-options').style.display = 'none';
    }
});

async function filterAgents(filters) {
    try {
        const response = await fetch('http://localhost:8080/api/filter_agents', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(filters),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
