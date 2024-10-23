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

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    initializeEventListeners();
    populateLanguages();
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
        resultsContainer.innerHTML = ''; // 清空结果容器
        return; // 如果没有选择任何选项，直接返回
    }

    genderSelect.style.border = ''; // 重置边框样式
    warningElement.style.display = 'none'; // 隐藏警告消息

    const gender = document.getElementById('gender').value;
    const experience = document.getElementById('experience').value;
    const consultationMode = document.getElementById('consultation-mode').value;
    const cost = document.getElementById('cost').value;
    const location = document.getElementById('location').value;
    const practiceArea = document.getElementById('practice-area').value;
    const googleRating = document.getElementById('google-rating').value;
    const onlineReviews = document.getElementById('online-reviews').value;
    const language = document.getElementById('language').value;

    console.log("Sending data:", { gender, experience, consultationMode, cost, location, practiceArea, googleRating, onlineReviews, language });

    fetch('http://localhost:8080/api/filter_agents', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gender, experience, consultationMode, cost, location, practiceArea, googleRating, onlineReviews, language }),
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw err; });
        }
        return response.json();
    })
    .then(data => {
        console.log("Received data:", data);
        displayResults(data);
    })
    .catch(error => {
        console.error('Error:', error);
        resultsContainer.innerHTML = '<p>An error occurred while fetching results. Please try again.</p>';
    });
}

function displayResults(results) {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = ''; // Clear previous results

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
                    <strong>${agent.name}</strong>
                    <img src="images/${genderIcon}" alt="${agent.gender}" class="gender-icon">
                </div>
                <p>Gender: ${agent.gender} ${agent.mismatched_fields.includes('gender') ? '<span class="not-matched">(Not Matched)</span>' : ''}</p>
                <p>Experience: ${agent.experience} ${agent.mismatched_fields.includes('experience') ? '<span class="not-matched">(Not Matched)</span>' : ''}</p>
                <p>Rating: ${agent.rating.toFixed(1)} stars ${agent.mismatched_fields.includes('rating') ? '<span class="not-matched">(Not Matched)</span>' : ''}</p>
                <p>Location: ${agent.location} ${agent.mismatched_fields.includes('location') ? '<span class="not-matched">(Not Matched)</span>' : ''}</p>
                <p>Consultation Mode: ${agent.consultationMode} ${agent.mismatched_fields.includes('consultationMode') ? '<span class="not-matched">(Not Matched)</span>' : ''}</p>
                <p>Practice Area: ${agent.practiceArea} ${agent.mismatched_fields.includes('practiceArea') ? '<span class="not-matched">(Not Matched)</span>' : ''}</p>
                <p>Language: ${agent.language} ${agent.mismatched_fields.includes('language') ? '<span class="not-matched">(Not Matched)</span>' : ''}</p>
                <p>Online Review: ${agent.onlineReview} ${agent.mismatched_fields.includes('onlineReview') ? '<span class="not-matched">(Not Matched)</span>' : ''}</p>
                <p>Budget: ${agent.budget} ${agent.mismatched_fields.includes('budget') ? '<span class="not-matched">(Not Matched)</span>' : ''}</p>
            </div>
            <div class="connect-button-container">
                <a href="${agent.contact}" target="_blank" rel="noopener noreferrer" class="contact-link">Connect</a>
            </div>
        `;

        listItem.innerHTML = agentInfo;
        agentsList.appendChild(listItem);

        console.log(`
Agent Type: ${isRecommended ? 'Recommended' : 'Other Option'}
--------------------------------
Full Name: ${agent.name}
Gender: ${agent.gender} ${agent.mismatched_fields.includes('gender') ? '(Not Matched)' : ''}
MARN: ${agent.marn}
Connect: ${agent.contact}
Experience: ${agent.experience} ${agent.mismatched_fields.includes('experience') ? '(Not Matched)' : ''}
Rating: ${agent.rating.toFixed(1)} stars ${agent.mismatched_fields.includes('rating') ? '(Not Matched)' : ''}
Location: ${agent.location} ${agent.mismatched_fields.includes('location') ? '(Not Matched)' : ''}
Consultation Mode: ${agent.consultationMode} ${agent.mismatched_fields.includes('consultationMode') ? '(Not Matched)' : ''}
Practice Area: ${agent.practiceArea} ${agent.mismatched_fields.includes('practiceArea') ? '(Not Matched)' : ''}
Language: ${agent.language} ${agent.mismatched_fields.includes('language') ? '(Not Matched)' : ''}
Online Review: ${agent.onlineReview} ${agent.mismatched_fields.includes('onlineReview') ? '(Not Matched)' : ''}
Budget: ${agent.budget} ${agent.mismatched_fields.includes('budget') ? '(Not Matched)' : ''}
--------------------------------
        `);
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
