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
                console.error("未找到语言选择框");
            }
        })
        .catch(error => console.error('获取语言列表时出错:', error));
}

document.addEventListener('DOMContentLoaded', function() {
    const findAgentButton = document.getElementById('find-agent-button');
    if (findAgentButton) {
        findAgentButton.addEventListener('click', findAgent);
    } else {
        console.error("Find Agent button not found");
    }

    const googleRatingSelect = document.getElementById('google-rating');
    if (googleRatingSelect) {
        googleRatingSelect.addEventListener('change', filterByRating);
    } else {
        console.error("Google Rating select not found");
    }

    populateLanguages();
});

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

document.addEventListener('DOMContentLoaded', function() {
    const findAgentButton = document.getElementById('find-agent-button');
    const resultsContainer = document.getElementById('results');

    if (!findAgentButton) {
        console.error('Find Agent button not found');
        return;
    }

    findAgentButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        const formData = {};
        const formFields = [
            'gender', 'experience', 'language', 'consultation_charge',
            'location', 'consultation_mode', 'practice_area', 'google_rating', 'online_review'
        ];

        formFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                formData[field] = element.value;
            } else {
                console.warn(`Field ${field} not found`);
                formData[field] = ''; // 设置默认值为空字符串
            }
        });

        console.log('Form data:', formData);

        fetch('/api/filter_agents', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`Network response was not ok: ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            displayResults(data);
        })
        .catch((error) => {
            console.error('Error:', error);
            if (resultsContainer) {
                resultsContainer.innerHTML = `<p>An error occurred while fetching results: ${error.message}. Please try again.</p>`;
            }
        });
    });

    function displayResults(results) {
        const resultsContainer = document.getElementById('results-container');
        resultsContainer.innerHTML = ''; // Clear previous results

        if (results.length === 0) {
            resultsContainer.innerHTML = '<p>No matching agents found.</p>';
            return;
        }

        const exactMatches = results.filter(agent => agent.is_exact_match);
        const recommendedAgents = results.filter(agent => !agent.is_exact_match);

        if (exactMatches.length > 0) {
            const exactMatchTitle = document.createElement('h2');
            exactMatchTitle.textContent = 'Exact Matches';
            resultsContainer.appendChild(exactMatchTitle);
            resultsContainer.appendChild(document.createElement('hr'));
            displayAgents(exactMatches, resultsContainer);
        }

        if (recommendedAgents.length > 0) {
            const recommendedTitle = document.createElement('h2');
            recommendedTitle.textContent = 'Recommended Agents';
            resultsContainer.appendChild(recommendedTitle);
            resultsContainer.appendChild(document.createElement('hr'));
            displayAgents(recommendedAgents, resultsContainer);
        }
    }

    function displayAgents(agents, container) {
        const agentsList = document.createElement('ul');
        agents.forEach(agent => {
            const listItem = document.createElement('li');
            const genderIcon = agent.gender.toLowerCase() === 'male' ? 'images/male-icon.webp' : 'images/female-icon.png';
            const iconStyle = agent.gender.toLowerCase() === 'male' 
                ? 'width: 20px; height: 20px;' 
                : 'width: 20px; height: 25px; object-fit: contain;';
            
            listItem.innerHTML = `
                <strong>${agent.name}</strong>
                <img src="${genderIcon}" alt="${agent.gender}" style="${iconStyle} vertical-align: middle; margin-left: 5px;">
                <br>
                Gender: ${agent.gender}<br>
                MARN: ${agent.marn}<br>
                Contact: <a href="${agent.contact}" target="_blank">${agent.contact}</a>
            `;
            agentsList.appendChild(listItem);

            // 在控制台输出完整信息
            console.log(`
                Full Name: ${agent.name}
                Gender: ${agent.gender}
                MARN: ${agent.marn}
                Contact: ${agent.contact}
                Experience: ${agent.experience}
                Rating: ${agent.rating} stars
                Location: ${agent.location}
                Consultation Mode: ${agent.consultationMode}
                Practice Area: ${agent.practiceArea}
                Language: ${agent.language}
                Online Review: ${agent.onlineReview}
                Budget: ${agent.budget}
            `);
        });
        container.appendChild(agentsList);
    }

    // Language selection functions
    window.showOptions = function() {
        document.getElementById('language-options').style.display = 'block';
    }

    window.filterOptions = function() {
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

    window.selectOption = function(language) {
        document.getElementById('language').value = language;
        document.getElementById('language-options').style.display = 'none';
    }

    document.addEventListener('click', function(e) {
        if (!document.getElementById('language-options').contains(e.target) && e.target.id !== 'language') {
            document.getElementById('language-options').style.display = 'none';
        }
    });

    document.getElementById('searchForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            gender: document.getElementById('gender').value,
            experience: document.getElementById('experience').value,
            language: document.getElementById('language').value,
            location: document.getElementById('location').value,
            // 添加以下字段
            consultation_charge: document.getElementById('consultation_charge')?.value || '',
            consultation_mode: document.getElementById('consultation_mode')?.value || '',
            practice_area: document.getElementById('practice_area')?.value || '',
            google_rating: document.getElementById('google_rating')?.value || '',
            online_review: document.getElementById('online_review')?.value || ''
        };

        console.log('Form data:', formData);

        // 其余代码保持不变...
    });
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

function filterByRating() {
    console.log("按评分筛选");
    findAgent(); // 调用findAgent函数来更新结果
}

function findAgent() {
    const gender = document.getElementById('gender').value;
    const experience = document.getElementById('experience').value;
    const consultationMode = document.getElementById('consultation-mode').value;
    const cost = document.getElementById('cost').value;
    const location = document.getElementById('location').value;
    const practiceArea = document.getElementById('practice-area').value;
    const googleRating = document.getElementById('google-rating').value;
    const onlineReviews = document.getElementById('online-reviews').value;
    const language = document.getElementById('language').value;

    const warningElement = document.getElementById('warning-message');

    // 检查否至少填写了一个选项
    if (!gender && !experience && !consultationMode && !cost && !location && !practiceArea && !googleRating && !onlineReviews && !language) {
        warningElement.textContent = "Please fill in at least one option before searching for an agent.";
        warningElement.style.display = 'block';
        warningElement.style.fontWeight = 'bold';
        warningElement.style.color = 'darkred';
        warningElement.style.marginBottom = '10px';
        warningElement.style.marginLeft = '350px';  // 确保在 JavaScript 中也设置了左边距
        return;
    } else {
        warningElement.style.display = 'none';
    }

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
        displayResults([]); // 显示空结果
        alert(`Error finding agents: ${error.error || 'Unknown error'}`);
    });
}

// 确保在页面加载完成后添加事件监听器
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM 已加载完成");
    initializeEventListeners();
});

function initializeEventListeners() {
    console.log("初始化事件监听器");
    const findAgentButton = document.getElementById('find-agent-button');
    if (findAgentButton) {
        console.log("找到 Find Agent 按钮");
        findAgentButton.addEventListener('click', findAgent);
    } else {
        console.error("未找到 Find Agent 按钮");
    }

    const googleRatingSelect = document.getElementById('google-rating');
    if (googleRatingSelect) {
        console.log("找到 Google Rating 选择框");
        googleRatingSelect.addEventListener('change', filterByRating);
    } else {
        console.error("未找到 Google Rating 选择框");
    }

    // 检查其他重要元素
    ['gender', 'experience', 'consultation-mode', 'cost', 'location', 'practice-area', 'language', 'online-reviews'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            console.log(`找到 ${id} 元素`);
        } else {
            console.error(`未找到 ${id} 元素`);
        }
    });
}

function displayResults(results) {
    const resultsContainer = document.getElementById('results-container');
    resultsContainer.innerHTML = ''; // Clear previous results

    if (results.length === 0) {
        resultsContainer.innerHTML = '<p>No matching agents found.</p>';
        return;
    }

    const exactMatches = results.filter(agent => agent.is_exact_match);
    const recommendedAgents = results.filter(agent => !agent.is_exact_match);

    if (exactMatches.length > 0) {
        const exactMatchTitle = document.createElement('h2');
        exactMatchTitle.textContent = 'Exact Matches';
        resultsContainer.appendChild(exactMatchTitle);
        resultsContainer.appendChild(document.createElement('hr'));
        displayAgents(exactMatches, resultsContainer);
    }

    if (recommendedAgents.length > 0) {
        const recommendedTitle = document.createElement('h2');
        recommendedTitle.textContent = 'Recommended Agents';
        resultsContainer.appendChild(recommendedTitle);
        resultsContainer.appendChild(document.createElement('hr'));
        displayAgents(recommendedAgents, resultsContainer);
    }
}

function displayAgents(agents, container) {
    const agentsList = document.createElement('ul');
    agents.forEach(agent => {
        const listItem = document.createElement('li');
        const genderIcon = agent.gender.toLowerCase() === 'male' ? 'images/male-icon.webp' : 'images/female-icon.png';
        const iconStyle = agent.gender.toLowerCase() === 'male' 
            ? 'width: 20px; height: 20px;' 
            : 'width: 20px; height: 25px; object-fit: contain;';
        
        listItem.innerHTML = `
            <strong>${agent.name}</strong>
            <img src="${genderIcon}" alt="${agent.gender}" style="${iconStyle} vertical-align: middle; margin-left: 5px;">
            <br>
            Gender: ${agent.gender}<br>
            MARN: ${agent.marn}<br>
            Contact: <a href="${agent.contact}" target="_blank">${agent.contact}</a>
        `;
        agentsList.appendChild(listItem);

        // 在控制台输出完整信息
        console.log(`
            Full Name: ${agent.name}
            Gender: ${agent.gender}
            MARN: ${agent.marn}
            Contact: ${agent.contact}
            Experience: ${agent.experience}
            Rating: ${agent.rating} stars
            Location: ${agent.location}
            Consultation Mode: ${agent.consultationMode}
            Practice Area: ${agent.practiceArea}
            Language: ${agent.language}
            Online Review: ${agent.onlineReview}
            Budget: ${agent.budget}
        `);
    });
    container.appendChild(agentsList);
}

function filterByRating() {
    findAgent();
}

function populateLanguages() {
    fetch('/api/languages')
        .then(response => response.json())
        .then(languages => {
            const languageSelect = document.getElementById('language');
            languages.forEach(language => {
                const option = document.createElement('option');
                option.value = language;
                option.textContent = language;
                languageSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching languages:', error));
}