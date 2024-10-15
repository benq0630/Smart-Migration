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
    console.log("DOM 已加载完成");
    initializeEventListeners();
    populateLanguages();
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

    // 移除对 filterByRating 的引用
    const googleRatingSelect = document.getElementById('google-rating');
    if (googleRatingSelect) {
        console.log("找到 Google Rating 选择框");
        // 移除这一行: googleRatingSelect.addEventListener('change', filterByRating);
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
    const warningElement = document.getElementById('warning-message');
    const resultsContainer = document.getElementById('results-container');

    if (!hasSelectedOptions()) {
        warningElement.textContent = "Please fill in at least one option before searching for an agent.";
        warningElement.style.display = 'block';
        resultsContainer.innerHTML = ''; // 清空结果容器
        return; // 如果没有选择任何选项，直接返回
    }

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
    agents.forEach(agent => {
        const listItem = document.createElement('li');
        const genderIcon = agent.gender.toLowerCase().includes('female') ? 'images/female-icon.png' : 'images/male-icon.webp';
        const iconStyle = agent.gender.toLowerCase().includes('female') 
            ? 'width: 20px; height: 25px; object-fit: contain; vertical-align: middle; margin-left: 5px;'
            : 'width: 20px; height: 20px; vertical-align: middle; margin-left: 5px;';
        
        let agentInfo = `
            <strong>${agent.name}</strong>
            <img src="${genderIcon}" alt="${agent.gender}" style="${iconStyle}">
            <br>
            Gender: ${agent.gender}<br>
            MARN: ${agent.marn}<br>
            Contact: <a href="${agent.contact}" target="_blank">${agent.contact}</a><br>
            Experience: ${agent.experience}<br>
            Rating: ${agent.rating} stars ${agent.mismatched_fields.includes('rating') ? '(Not Matched)' : ''}<br>
            Location: ${agent.location}<br>
            Consultation Mode: ${agent.consultationMode}<br>
            Practice Area: ${agent.practiceArea}<br>
            Language: ${agent.language}<br>
            Online Review: ${agent.onlineReview} ${agent.mismatched_fields.includes('onlineReview') ? '(Not Matched)' : ''}<br>
            Budget: ${agent.budget} ${agent.mismatched_fields.includes('budget') ? '(Not Matched)' : ''}
        `;

        listItem.innerHTML = agentInfo;
        agentsList.appendChild(listItem);

        // 在浏览器控制台输出完整信息
        console.log(`
Agent Type: ${isRecommended ? 'Recommended' : 'Other Option'}
--------------------------------
Full Name: ${agent.name}
Gender: ${agent.gender}
MARN: ${agent.marn}
Contact: ${agent.contact}
Experience: ${agent.experience}
Rating: ${agent.rating} stars ${agent.mismatched_fields.includes('rating') ? '(Not Matched)' : ''}
Location: ${agent.location}
Consultation Mode: ${agent.consultationMode}
Practice Area: ${agent.practiceArea}
Language: ${agent.language}
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