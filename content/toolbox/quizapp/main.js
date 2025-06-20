let quizData = {};
let currentChapter = '';
let allQuestions = [];
let currentQuestions = [];
let answeredMap = new Map(); // 题目id -> {isCorrect, selectedAnswers}
let wrongSet = new Set(); // 错题id集合
let currentMode = 'all';
// 新增全局统计变量
let totalCount = 0;
let answeredCount = 0;
let correctCount = 0;
const WRONG_KEY = 'quiz_wrong_set';
let suppressChapterConfirm = false; // 控制章节切换时是否弹窗
let currentBankFile = '25春习思题库.json'; // 默认题库文件名

// 初始化
// 页面初始时不自动加载任何题库，仅显示题库管理面板
// 其他面板初始隐藏

document.addEventListener('DOMContentLoaded', function() {
    loadWrongSet();
    setupModeButtons();
    bindClearWrongBtn();
    // 隐藏章节选择、练习模式、统计、错题等面板
    document.getElementById('chapterSelect').style.display = 'none';
    document.getElementById('modeSection').style.display = 'none';
    document.getElementById('statsSection').style.display = 'none';
    document.getElementById('wrongQuestionsSection').style.display = 'none';
    document.getElementById('contentHeader').style.display = 'none';
    document.getElementById('questionsContainer').innerHTML = `<div class="empty-state"><div class="empty-icon">📁</div><div class="empty-title">请先上传或选择题库</div><div class="empty-description">支持上传JSON题库文件或选择下方预置题库</div></div>`;
});

// 设置模式按钮
function setupModeButtons() {
    document.querySelectorAll('.mode-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentMode = this.dataset.mode;
            // 章节选择控件只在按章节练习时显示
            const chapterSelect = document.getElementById('chapterSelect');
            if (currentMode === 'chapter') {
                chapterSelect.style.display = 'block';
            } else {
                chapterSelect.style.display = 'none';
            }
            if (currentMode === 'wrong') {
                // 切换到错题重练时不显示章节选择
                chapterSelect.style.display = 'none';
            }
            if (currentMode === 'chapter' && !currentChapter) {
                // 没有选章节时不加载题目
                updateStats();
                updateWrongList();
                document.getElementById('questionsContainer').innerHTML = `<div class="empty-state"><div class="empty-icon">📝</div><div class="empty-title">请选择章节</div></div>`;
                return;
            }
            if (currentChapter || currentMode === 'wrong') {
                loadQuestions();
            }
        });
    });
    // 默认显示章节选择控件
    document.getElementById('chapterSelect').style.display = 'block';
}

// 预置题库下拉菜单切换逻辑
const presetBankSelect = document.getElementById('presetBankSelect');
presetBankSelect.addEventListener('change', function() {
    const file = this.value;
    if (file) {
        if (answeredCount > 0) {
            if (!confirm('切换题库将重置当前所有答题记录，是否继续？')) {
                // 恢复为切换前的题库选项
                this.value = currentBankFile;
                return;
            }
        }
        fetch('./' + file)
            .then(response => {
                if (!response.ok) throw new Error('题库文件不存在');
                return response.json();
            })
            .then(data => {
                quizData = data;
                loadChapters();
                document.getElementById('chapterSelect').style.display = 'block';
                // 默认切换到按章节练习模式
                const chapterTab = document.querySelector('.mode-tab[data-mode="chapter"]');
                if (chapterTab) chapterTab.click();
                // 自动选择第一个章节并加载题目（禁用章节切换弹窗）
                const chapterSelect = document.getElementById('chapterSelect');
                if (chapterSelect && chapterSelect.options.length > 1) {
                    suppressChapterConfirm = true;
                    chapterSelect.selectedIndex = 1;
                    const event = new Event('change');
                    chapterSelect.dispatchEvent(event);
                }
                // 显示文件名（去掉.json）
                let name = file;
                if (name.endsWith('.json')) name = name.slice(0, -5);
                document.getElementById('importedFileName').textContent = '当前题库：' + name;
                currentBankFile = file; // 记录当前题库文件名
                showSections();
                showToast('题库加载成功！', 'success');
            })
            .catch(() => {
                showToast('未检测到题库文件或文件格式错误，请检查', 'error');
            });
    }
});

// 文件上传处理
document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file && file.type === 'application/json') {
        if (answeredCount > 0) {
            if (!confirm('切换题库将重置当前所有答题记录，是否继续？')) {
                // 恢复为切换前的题库选项
                presetBankSelect.value = currentBankFile;
                return;
            }
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                quizData = JSON.parse(e.target.result);
                loadChapters();
                document.getElementById('chapterSelect').style.display = 'block';
                // 显示导入的题库文件名（去掉.json扩展名）
                let name = file.name;
                if (name.endsWith('.json')) name = name.slice(0, -5);
                document.getElementById('importedFileName').textContent = '当前题库：' + name;
                // 自动切换到按章节练习并选中第一个章节（禁用章节切换弹窗）
                const chapterTab = document.querySelector('.mode-tab[data-mode="chapter"]');
                if (chapterTab) chapterTab.click();
                const chapterSelect = document.getElementById('chapterSelect');
                if (chapterSelect && chapterSelect.options.length > 1) {
                    suppressChapterConfirm = true;
                    chapterSelect.selectedIndex = 1;
                    const event = new Event('change');
                    chapterSelect.dispatchEvent(event);
                }
                currentBankFile = file.name; // 记录当前题库文件名
                showSections();
                showToast('题库加载成功！', 'success');
            } catch (error) {
                showToast('JSON文件格式错误，请检查文件内容', 'error');
            }
        };
        reader.readAsText(file);
    } else {
        showToast('请选择JSON格式的文件', 'error');
    }
});

// 加载章节列表
function loadChapters() {
    const select = document.getElementById('chapterSelect');
    select.innerHTML = '<option value="">选择章节</option>';
    Object.keys(quizData).forEach(chapter => {
        const option = document.createElement('option');
        option.value = chapter;
        option.textContent = chapter;
        select.appendChild(option);
    });
}

// 章节选择处理
// 只在按章节练习模式下有效
const chapterSelect = document.getElementById('chapterSelect');
chapterSelect.addEventListener('change', function(e) {
    if (e.target.value) {
        // 切换章节前确认：当前章节已作答才弹窗，且未被题库切换抑制
        if (answeredCount > 0 && !suppressChapterConfirm) {
            if (!confirm('切换章节将重置当前答题记录，是否继续？')) {
                // 恢复原选择
                chapterSelect.value = currentChapter;
                return;
            }
        }
        suppressChapterConfirm = false; // 恢复默认
        currentChapter = e.target.value;
        answeredMap = new Map();
        // 只保留当前章节的错题
        const chapterQuestions = allQuestions.map(q => q.id);
        const newWrongSet = new Set();
        wrongSet.forEach(id => {
            if (chapterQuestions.includes(id)) {
                newWrongSet.add(id);
            }
        });
        wrongSet = newWrongSet;
        buildAllQuestions();
        resetStats();
        loadQuestions();
        showSections();
        // 显示章节切换成功提示
        showToast(`已切换到章节: ${currentChapter}`, 'success');
    }
});

// 新增：构建allQuestions
function buildAllQuestions() {
    allQuestions = [];
    const chapterData = quizData[currentChapter];
    
    if (chapterData.single_choice) {
        Object.entries(chapterData.single_choice).forEach(([question, data]) => {
            allQuestions.push({
                id: getQuestionId(question, currentChapter, 'single'), // 添加章节和题型
                type: 'single',
                question,
                options: data.options,
                correct: data.correct_answer,
                chapter: currentChapter
            });
        });
    }
    
    if (chapterData.multiple_choice) {
        Object.entries(chapterData.multiple_choice).forEach(([question, data]) => {
            allQuestions.push({
                id: getQuestionId(question, currentChapter, 'multiple'), // 添加章节和题型
                type: 'multiple',
                question,
                options: data.options,
                correct: data.correct_answers,
                chapter: currentChapter
            });
        });
    }
}

// 显示相关区域
function showSections() {
    document.getElementById('statsSection').style.display = 'block';
    document.getElementById('modeSection').style.display = 'block';
    document.getElementById('wrongQuestionsSection').style.display = 'block';
    document.getElementById('contentHeader').style.display = 'flex';
}

// 加载题目
function loadQuestions() {
    if (currentMode === 'wrong') {
        currentQuestions = allQuestions.filter(q => wrongSet.has(q.id));
    } else if (currentMode === 'chapter') {
        currentQuestions = allQuestions.filter(q => q.chapter === currentChapter);
    } else {
        currentQuestions = allQuestions;
    }
    updateStats();
    updateWrongList();
    renderQuestions();
}

// 生成题目ID
function getQuestionId(question, chapter, type) {
    // 使用章节、题型和题目内容共同生成ID
    const uniqueStr = `${chapter}|${type}|${question}`;
    // 使用更可靠的哈希算法
    return hashCode(uniqueStr).toString(36).substring(0, 12);
}

// 简单的字符串哈希函数
function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // 转换为32位整数
    }
    return hash;
}

// 渲染题目
function renderQuestions() {
    const container = document.getElementById('questionsContainer');
    if (currentQuestions.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-icon">📝</div><div class="empty-title">暂无题目</div><div class="empty-description">请选择章节开始练习</div></div>`;
        return;
    }
    container.innerHTML = '';
    currentQuestions.forEach((q, idx) => {
        (function(question, index) {
            const div = document.createElement('div');
            div.className = 'question-block';
            div.innerHTML = `
                <div class="question-header">
                    <div class="question-meta">
                        <span class="question-number">第 ${index + 1} 题</span>
                        <span class="question-type">${question.type === 'single' ? '单选题' : '多选题'}</span>
                    </div>
                    <div class="question-actions">
                        <button class="action-btn search-btn" data-question="${encodeURIComponent(question.question)}">🔍 搜索</button>
                    </div>
                </div>
                <div class="question-content">${question.question}</div>
                <ul class="options-list" id="options-${question.id}">
                    ${question.options.map(option => `
                        <li class="option-item">
                            <label class="option-label">
                                <input type="${question.type === 'single' ? 'radio' : 'checkbox'}" class="option-input" name="question-${question.id}" value="${option}">
                                <span class="option-text">${option}</span>
                            </label>
                        </li>
                    `).join('')}
                </ul>
                <button class="submit-btn" id="submit-${question.id}" disabled>提交答案</button>
                <div class="result-message" id="result-${question.id}"></div>
            `;
            container.appendChild(div);

            // 搜索按钮
            div.querySelector('.search-btn').addEventListener('click', function() {
                searchQuestion(decodeURIComponent(this.getAttribute('data-question')));
            });

            // 选项与提交事件
            const optionLabels = div.querySelectorAll('.option-label');
            const submitBtn = div.querySelector(`#submit-${question.id}`);
            const inputs = div.querySelectorAll(`input[name="question-${question.id}"]`);
            const resultDiv = div.querySelector(`#result-${question.id}`);
            let localAnswered = answeredMap.has(question.id);
            let localSelected = localAnswered ? answeredMap.get(question.id).selectedAnswers : [];
            let localIsCorrect = localAnswered ? answeredMap.get(question.id).isCorrect : false;

            // 选项点击
            optionLabels.forEach(label => {
                const input = label.querySelector('input');
                label.addEventListener('click', function() {
                    if (localAnswered) return;
                    if (!input.disabled) {
                        if (input.type === 'radio') {
                            input.checked = true;
                        } else {
                            input.checked = !input.checked;
                        }
                    }
                    setTimeout(() => {
                        optionLabels.forEach(lab => {
                            const inp = lab.querySelector('input');
                            if (inp.checked) {
                                lab.classList.add('selected');
                            } else {
                                lab.classList.remove('selected');
                            }
                        });
                        const hasSelection = Array.from(inputs).some(inp => inp.checked);
                        submitBtn.disabled = !hasSelection;
                    }, 10);
                });
            });

            // 提交按钮
            submitBtn.addEventListener('click', function() {
                if (localAnswered) return;
                localSelected = Array.from(inputs).filter(input => input.checked).map(input => input.value);
                localIsCorrect = isCorrectAnswer(question, localSelected);
                // 标记选项
                optionLabels.forEach(label => {
                    const input = label.querySelector('input');
                    const optionText = input.value;
                    if (question.type === 'single') {
                        if (optionText === question.correct) {
                            label.classList.add('correct');
                        } else if (input.checked && optionText !== question.correct) {
                            label.classList.add('wrong');
                        }
                    } else {
                        if (question.correct.includes(optionText)) {
                            label.classList.add('correct');
                        } else if (input.checked && !question.correct.includes(optionText)) {
                            label.classList.add('wrong');
                        }
                    }
                    input.disabled = true;
                });
                // 结果显示
                resultDiv.style.display = 'block';
                resultDiv.className = `result-message ${localIsCorrect ? 'correct' : 'wrong'}`;
                if (localIsCorrect) {
                    resultDiv.innerHTML = '✅ 回答正确！';
                    wrongSet.delete(question.id);
                } else {
                    const correctText = question.type === 'single' ? question.correct : question.correct.join('、');
                    resultDiv.innerHTML = `❌ 回答错误！正确答案：${correctText}`;
                    wrongSet.add(question.id);
                }
                submitBtn.disabled = true;
                submitBtn.textContent = '已提交';
                submitBtn.style.background = '#d3d3d1';
                localAnswered = true;
                answeredMap.set(question.id, { isCorrect: localIsCorrect, selectedAnswers: localSelected });
                // 累计统计
                answeredCount++;
                if (localIsCorrect) correctCount++;
                // 只保存当前题的错题集
                saveWrongSetSingle(question.id, !localIsCorrect);
                updateStats();
                updateWrongList();
            });

            // 恢复已答题状态
            if (localAnswered) {
                inputs.forEach(input => {
                    if (localSelected.includes(input.value)) {
                        input.checked = true;
                        input.parentElement.classList.add('selected');
                    }
                    input.disabled = true;
                });
                optionLabels.forEach(label => {
                    const input = label.querySelector('input');
                    const optionText = input.value;
                    if (question.type === 'single') {
                        if (optionText === question.correct) {
                            label.classList.add('correct');
                        } else if (input.checked && optionText !== question.correct) {
                            label.classList.add('wrong');
                        }
                    } else {
                        if (question.correct.includes(optionText)) {
                            label.classList.add('correct');
                        } else if (input.checked && !question.correct.includes(optionText)) {
                            label.classList.add('wrong');
                        }
                    }
                });
                resultDiv.style.display = 'block';
                resultDiv.className = `result-message ${localIsCorrect ? 'correct' : 'wrong'}`;
                if (localIsCorrect) {
                    resultDiv.innerHTML = '✅ 回答正确！';
                } else {
                    const correctText = question.type === 'single' ? question.correct : question.correct.join('、');
                    resultDiv.innerHTML = `❌ 回答错误！正确答案：${correctText}`;
                }
                submitBtn.disabled = true;
                submitBtn.textContent = '已提交';
                submitBtn.style.background = '#d3d3d1';
            } else {
                inputs.forEach(input => {
                    input.disabled = false;
                    input.checked = false;
                    if (input.parentElement) input.parentElement.classList.remove('selected', 'correct', 'wrong');
                });
                submitBtn.disabled = true;
                submitBtn.textContent = '提交答案';
                submitBtn.style.background = '';
                resultDiv.style.display = 'none';
                resultDiv.className = 'result-message';
                resultDiv.innerHTML = '';
            }
        })(q, idx);
    });
    updateContentTitle();
}

// 更新统计信息
function updateStats() {
    // 只在章节切换或题库加载时设置总题数
    totalCount = allQuestions.length;
    // answeredCount/correctCount 只累加，不回退
    // 但如果章节切换或重置，则重新计数
    document.getElementById('totalQuestions').textContent = totalCount;
    document.getElementById('answeredCount').textContent = answeredCount;
    document.getElementById('correctCount').textContent = correctCount;
    const rate = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
    document.getElementById('accuracyRate').textContent = rate + '%';
    const progress = totalCount > 0 ? (answeredCount / totalCount) * 100 : 0;
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('progressText').textContent = `${answeredCount} / ${totalCount}`;
}

// 更新内容标题
function updateContentTitle() {
    const title = currentMode === 'wrong' ? '错题重练' : '全部题目';
    document.getElementById('contentTitle').textContent = `${currentChapter} - ${title}`;
}

// 更新错题列表
function updateWrongList() {
    const container = document.getElementById('wrongQuestionsList');
    container.innerHTML = '';
    // 确保只显示当前章节的错题
    const chapterWrongQuestions = allQuestions.filter(q => wrongSet.has(q.id) && q.chapter === currentChapter);
    if (chapterWrongQuestions.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #787774; font-size: 12px; padding: 20px;">暂无错题</div>';
        return;
    }
    chapterWrongQuestions.forEach((q, index) => {
        const item = document.createElement('div');
        item.className = 'wrong-question-item';
        const shortQuestion = q.question.length > 30 ? q.question.substring(0, 30) + '...' : q.question;
        item.textContent = `${index + 1}. ${shortQuestion}`;
        container.appendChild(item);
    });
}

// 只保存/移除当前题的错题
function saveWrongSetSingle(qid, isWrong) {
    let arr = Array.from(wrongSet);
    if (isWrong) {
        if (!wrongSet.has(qid)) arr.push(qid);
    } else {
        arr = arr.filter(id => id !== qid);
    }
    wrongSet = new Set(arr);
    localStorage.setItem(WRONG_KEY, JSON.stringify(arr));
}

// 加载错题记录
function loadWrongSet() {
    const data = localStorage.getItem(WRONG_KEY);
    if (data) {
        try {
            wrongSet = new Set(JSON.parse(data));
        } catch {
            wrongSet = new Set();
        }
    } else {
        wrongSet = new Set();
    }
    // 确保只保留当前章节的错题
    if (currentChapter) {
        const chapterQuestions = allQuestions.map(q => q.id);
        const newWrongSet = new Set();
        wrongSet.forEach(id => {
            if (chapterQuestions.includes(id)) {
                newWrongSet.add(id);
            }
        });
        wrongSet = newWrongSet;
    }
}

// 清空错题
function clearWrongSet() {
    localStorage.removeItem(WRONG_KEY);
    wrongSet.clear();
}

// 百度搜索功能
function searchQuestion(question) {
    const decodedQuestion = decodeURIComponent(question);
    const searchQuery = decodedQuestion.replace(/【.*?】/g, '').trim();
    const baiduUrl = `https://www.baidu.com/s?wd=${encodeURIComponent(searchQuery)}`;
    window.open(baiduUrl, '_blank');
}

// 显示提示消息
function showToast(message, type = 'info') {
    // 创建toast元素
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2383e2'};
        color: white;
        padding: 12px 24px;
        border-radius: 6px;
        z-index: 1000;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    // 显示动画
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    // 自动消失
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// 导出错题功能
function exportWrongQuestions() {
    const chapterWrongQuestions = allQuestions.filter(q => wrongSet.has(q.id));
    if (chapterWrongQuestions.length === 0) {
        showToast('暂无错题可导出', 'info');
        return;
    }
    const exportData = {
        chapter: currentChapter,
        wrongQuestions: chapterWrongQuestions.map(q => ({
            question: q.question,
            type: q.type,
            options: q.options,
            correct: q.correct
        })),
        exportTime: new Date().toLocaleString()
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `错题记录_${currentChapter}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('错题导出成功', 'success');
}

// 键盘快捷键
document.addEventListener('keydown', function(e) {
    // Ctrl + E 导出错题
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        exportWrongQuestions();
    }
    // Ctrl + R 重置当前章节
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        if (currentChapter && confirm('确定要重置当前章节的答题记录吗？')) {
            currentQuestions.forEach(q => {
                answeredMap.delete(q.id);
                wrongSet.delete(q.id);
            });
            loadQuestions();
            showToast('章节记录已重置', 'success');
        }
    }
});

// 添加导出按钮到侧边栏
document.addEventListener('DOMContentLoaded', function() {
    const wrongQuestionsSection = document.getElementById('wrongQuestionsSection');
    const exportBtn = document.createElement('button');
    exportBtn.className = 'clear-wrong-btn';
    exportBtn.style.background = '#2383e2';
    exportBtn.style.marginBottom = '8px';
    exportBtn.textContent = '导出错题';
    exportBtn.onclick = exportWrongQuestions;
    wrongQuestionsSection.insertBefore(exportBtn, wrongQuestionsSection.lastElementChild);
});

// ========== 辅助函数 ==========
function isCorrectAnswer(q, selected) {
    if (q.type === 'single') {
        return selected.length === 1 && selected[0] === q.correct;
    } else {
        return selected.length === q.correct.length &&
            selected.every(a => q.correct.includes(a)) &&
            q.correct.every(a => selected.includes(a));
    }
}

// ========== 章节切换/重置时重置统计 ==========
function resetStats() {
    answeredCount = 0;
    correctCount = 0;
    updateStats();
}

// 清空错题功能
function clearWrongQuestions() {
    if (confirm('确定要清空所有错题记录吗？')) {
        clearWrongSet();
        updateWrongList();
        showToast('错题记录已清空', 'success');
        // 如果当前是错题模式，重新加载题目
        if (currentMode === 'wrong') {
            loadQuestions();
        }
    }
}

// 绑定清空错题按钮
// 确保只绑定一次
function bindClearWrongBtn() {
    const btn = document.querySelector('.clear-wrong-btn');
    if (btn && !btn._binded) {
        btn.addEventListener('click', clearWrongQuestions);
        btn._binded = true;
    }
} 