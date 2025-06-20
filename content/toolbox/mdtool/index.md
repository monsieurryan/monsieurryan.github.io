+++
date = '2025-03-10T19:16:00+08:00'
draft = false
title = 'md二级标题排序工具'
showAuthor = false
showTableOfContents = false
showReadingTime = false
showWordCount = false
showDate = false
+++

{{< raw >}}
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown 排序工具</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol";
            background-color: #ffffff;
            color: #37352f;
            line-height: 1.5;
            font-size: 14px;
            margin: 0;
            padding: 0;
            /* height: 100vh; */
            /* overflow: hidden; */
            min-height: 100vh;
        }

        .app-container {
            max-width: 1200px;
            margin: 0 auto;
            /* height: 100vh; */
            display: flex;
            flex-direction: column;
            /* overflow: hidden; */
            min-height: 100vh;
        }

        /* Header - Notion style */
        .header {
            flex-shrink: 0;
            padding: 24px 0 16px;
            border-bottom: 1px solid rgba(55, 53, 47, 0.09);
        }

        .header-content {
            padding: 0 24px;
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .header-icon {
            font-size: 48px;
            flex-shrink: 0;
        }

        .header-text {
            flex: 1;
            min-width: 0;
        }

        .header-title {
            font-size: 28px;
            font-weight: 700;
            color: #37352f;
            margin-bottom: 4px;
            line-height: 1.2;
        }

        .header-subtitle {
            font-size: 14px;
            color: rgba(55, 53, 47, 0.65);
            font-weight: 400;
        }

        /* Main content layout */
        .main-content {
            display: flex;
            gap: 24px;
            flex: 1;
            padding: 16px 24px;
            min-height: 0;
            /* overflow: hidden; */
            flex-wrap: wrap;
        }

        .content-section {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 0;
            overflow: hidden;
        }

        .section-header {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            padding: 4px 0;
            flex-shrink: 0;
        }

        .section-icon {
            font-size: 16px;
            margin-right: 8px;
            opacity: 0.7;
        }

        .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #37352f;
        }

        /* File upload area - Notion style */
        .upload-area {
            border: 2px dashed rgba(55, 53, 47, 0.16);
            border-radius: 8px;
            padding: 24px;
            text-align: center;
            background: rgba(55, 53, 47, 0.02);
            margin-bottom: 12px;
            transition: all 0.15s ease;
            flex-shrink: 0;
        }

        .upload-area:hover {
            background: rgba(55, 53, 47, 0.04);
            border-color: rgba(55, 53, 47, 0.24);
        }

        .upload-area.dragover {
            background: rgba(46, 170, 220, 0.08);
            border-color: rgba(46, 170, 220, 0.4);
        }

        .upload-icon {
            font-size: 24px;
            margin-bottom: 8px;
            opacity: 0.4;
        }

        .upload-text {
            color: rgba(55, 53, 47, 0.65);
            font-size: 14px;
            margin-bottom: 12px;
        }

        .upload-button {
            background: #37352f;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
            transition: background 0.15s ease;
            font-family: inherit;
        }

        .upload-button:hover {
            background: #2f2e2a;
        }

        .file-input {
            display: none;
        }

        /* Text input - Notion style */
        .text-input {
            width: 100%;
            flex: 1;
            border: 1px solid rgba(55, 53, 47, 0.16);
            border-radius: 6px;
            padding: 16px;
            font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
            font-size: 13px;
            line-height: 1.5;
            resize: none;
            background: #ffffff;
            color: #37352f;
            transition: border-color 0.15s ease;
            min-height: 0;
        }

        .text-input:focus {
            outline: none;
            border-color: rgba(46, 170, 220, 0.6);
            box-shadow: 0 0 0 1px rgba(46, 170, 220, 0.6);
        }

        .text-input::placeholder {
            color: rgba(55, 53, 47, 0.4);
        }

        /* Optimized sortable container - Notion style */
        .sortable-container {
            border: 1px solid rgba(55, 53, 47, 0.16);
            border-radius: 6px;
            background: #ffffff;
            flex: 1;
            overflow: hidden;
            min-height: 0;
            display: flex;
            flex-direction: column;
        }

        .sortable-list {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
        }

        .section-item {
            border-bottom: 1px solid rgba(55, 53, 47, 0.09);
            cursor: grab;
            transition: all 0.15s ease;
            position: relative;
            background: #ffffff;
        }

        .section-item:last-child {
            border-bottom: none;
        }

        .section-item:hover {
            background: rgba(55, 53, 47, 0.03);
        }

        .section-item:hover .drag-handle {
            opacity: 1;
            transform: translateX(0);
        }

        .section-item.dragging {
            opacity: 0.6;
            cursor: grabbing;
            transform: rotate(2deg);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            z-index: 1000;
        }

        .section-item.drag-over {
            border-top: 2px solid #37352f;
        }

        .section-item-header {
            padding: 12px 16px;
            display: flex;
            align-items: center;
            background: rgba(55, 53, 47, 0.04);
            border-bottom: 1px solid rgba(55, 53, 47, 0.09);
            position: relative;
        }

        /* Optimized drag handle */
        .drag-handle {
            opacity: 0;
            margin-right: 12px;
            color: rgba(55, 53, 47, 0.4);
            font-size: 16px;
            transition: all 0.2s ease;
            cursor: grab;
            transform: translateX(-4px);
            display: flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 20px;
            border-radius: 4px;
            background: transparent;
        }

        .drag-handle:hover {
            background: rgba(55, 53, 47, 0.1);
            color: rgba(55, 53, 47, 0.7);
        }

        .drag-handle:active {
            cursor: grabbing;
            background: rgba(55, 53, 47, 0.15);
        }

        .section-item-title {
            font-size: 14px;
            font-weight: 600;
            color: #37352f;
            flex: 1;
            user-select: none;
        }

        .section-item-content {
            padding: 12px 16px 12px 48px;
            font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
            font-size: 12px;
            color: rgba(55, 53, 47, 0.65);
            line-height: 1.4;
            max-height: 120px;
            overflow: hidden;
            white-space: pre-wrap;
            position: relative;
        }

        .section-item-content::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 48px;
            right: 16px;
            height: 16px;
            background: linear-gradient(transparent, rgba(255, 255, 255, 0.9));
            pointer-events: none;
        }

        /* Controls - Notion style */
        .controls {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px 24px;
            border-top: 1px solid rgba(55, 53, 47, 0.09);
            background: rgba(55, 53, 47, 0.02);
            flex-wrap: wrap;
            flex-shrink: 0;
        }

        .control-button {
            background: #37352f;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.15s ease;
            font-family: inherit;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .control-button:hover {
            background: #2f2e2a;
            transform: translateY(-1px);
        }

        .control-button.secondary {
            background: white;
            color: #37352f;
            border: 1px solid rgba(55, 53, 47, 0.16);
        }

        .control-button.secondary:hover {
            background: rgba(55, 53, 47, 0.04);
        }

        .checkbox-option {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            border-radius: 6px;
            background: white;
            border: 1px solid rgba(55, 53, 47, 0.16);
            cursor: pointer;
            transition: all 0.15s ease;
            font-size: 14px;
        }

        .checkbox-option:hover {
            background: rgba(55, 53, 47, 0.04);
        }

        .checkbox-input {
            width: 16px;
            height: 16px;
            cursor: pointer;
        }

        .empty-state {
            padding: 48px 24px;
            text-align: center;
            color: rgba(55, 53, 47, 0.4);
            font-style: italic;
        }

        /* Optimized notification - Notion style with green theme */
        .notification {
            position: fixed;
            top: 24px;
            right: 24px;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 1000;
            max-width: 300px;
            animation: slideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
            border: 1px solid;
            backdrop-filter: blur(8px);
        }

        .notification.success {
            background: rgba(22, 163, 74, 0.1);
            border-color: #16a34a;
            color: #15803d;
        }

        .notification.error {
            background: rgba(239, 68, 68, 0.1);
            border-color: #ef4444;
            color: #dc2626;
        }

        .notification.warning {
            background: rgba(245, 158, 11, 0.1);
            border-color: #f59e0b;
            color: #d97706;
        }

        .notification.info {
            background: rgba(59, 130, 246, 0.1);
            border-color: #3b82f6;
            color: #2563eb;
        }

        @keyframes slideIn {
            from {
                transform: translateX(100%) scale(0.9);
                opacity: 0;
            }
            to {
                transform: translateX(0) scale(1);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            from {
                transform: translateX(0) scale(1);
                opacity: 1;
            }
            to {
                transform: translateX(100%) scale(0.9);
                opacity: 0;
            }
        }

        /* Drag indicator */
        .drag-indicator {
            position: absolute;
            left: 0;
            right: 0;
            height: 2px;
            background: #37352f;
            opacity: 0;
            transition: opacity 0.2s ease;
            pointer-events: none;
        }

        .drag-indicator.show {
            opacity: 1;
        }

        /* Responsive design */
        @media (max-width: 768px) {
            html, body, .app-container, .main-content {
                height: auto !important;
                min-height: 100vh;
                overflow-y: auto !important;
            }
            .main-content {
                flex-direction: column;
                gap: 12px;
                padding: 12px 8px;
            }
        }
        @media (max-width: 480px) {
            html, body, .app-container, .main-content {
                height: auto !important;
                min-height: 100vh;
                overflow-y: auto !important;
            }
            .main-content {
                flex-direction: column;
                gap: 8px;
                padding: 8px 4px;
            }
        }

        /* Custom scrollbar styling - more subtle */
        .sortable-list::-webkit-scrollbar {
            width: 6px;
        }

        .sortable-list::-webkit-scrollbar-track {
            background: transparent;
        }

        .sortable-list::-webkit-scrollbar-thumb {
            background: rgba(55, 53, 47, 0.2);
            border-radius: 3px;
        }

        .sortable-list::-webkit-scrollbar-thumb:hover {
            background: rgba(55, 53, 47, 0.3);
        }

        .text-input::-webkit-scrollbar {
            width: 6px;
        }

        .text-input::-webkit-scrollbar-track {
            background: transparent;
        }

        .text-input::-webkit-scrollbar-thumb {
            background: rgba(55, 53, 47, 0.2);
            border-radius: 3px;
        }

        .text-input::-webkit-scrollbar-thumb:hover {
            background: rgba(55, 53, 47, 0.3);
        }
    </style>
</head>
<body>
    <div class="app-container">
        <div class="header">
            <div class="header-content">
                <span class="header-icon">📝</span>
                <div class="header-text">
                    <h1 class="header-title">Markdown 排序工具</h1>
                    <p class="header-subtitle">拖拽调整二级标题顺序，内容会自动跟随移动</p>
                </div>
            </div>
        </div>

        <div class="main-content">
            <div class="content-section">
                <div class="section-header">
                    <span class="section-icon">📄</span>
                    <span class="section-title">输入 Markdown</span>
                </div>
                
                <div id="dropZone" class="upload-area">
                    <div class="upload-icon">📁</div>
                    <div class="upload-text">拖拽 .md 文件到此处，或点击选择文件</div>
                    <button class="upload-button" onclick="document.getElementById('fileInput').click()">
                        选择文件
                    </button>
                    <input type="file" id="fileInput" class="file-input" accept=".md,.markdown,.txt" onchange="handleFileSelect(event)">
                </div>

                <textarea id="markdownInput" class="text-input" placeholder="在此粘贴您的 Markdown 文本...

示例：
## 第一个标题
这是第一个标题下的内容。

## 第二个标题  
这是第二个标题下的内容。
可以有多行。

## 第三个标题
这是第三个标题下的内容。"></textarea>
            </div>

            <div class="content-section">
                <div class="section-header">
                    <span class="section-icon">🔄</span>
                    <span class="section-title">拖拽调整顺序</span>
                </div>
                
                <div id="sortableContainer" class="sortable-container">
                    <div class="sortable-list">
                        <div class="empty-state">
                            请在左侧输入 Markdown 文本，然后点击"解析文本"开始排序
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="controls">
            <button class="control-button" onclick="parseMarkdown()">
                <span>🔍</span>
                解析文本
            </button>
            
            <div class="checkbox-option">
                <input type="checkbox" id="tocCheckbox" class="checkbox-input">
                <label for="tocCheckbox">生成目录</label>
            </div>
            
            <button class="control-button secondary" onclick="copyResult()">
                <span>📋</span>
                复制结果
            </button>
            
            <button class="control-button secondary" onclick="downloadResult()">
                <span>💾</span>
                下载文件
            </button>
        </div>
    </div>

    <script>
        // 文件处理相关函数
        function setupDropZone() {
            const dropZone = document.getElementById('dropZone');
            
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('dragover');
            });
            
            dropZone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                dropZone.classList.remove('dragover');
            });
            
            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('dragover');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    handleFile(files[0]);
                }
            });
        }

        function handleFileSelect(event) {
            const file = event.target.files[0];
            if (file) {
                handleFile(file);
            }
        }

        function handleFile(file) {
            const validTypes = ['.md', '.markdown', '.txt'];
            const fileName = file.name.toLowerCase();
            const isValidType = validTypes.some(type => fileName.endsWith(type));
            
            if (!isValidType) {
                showNotification('请选择 .md、.markdown 或 .txt 文件', 'warning');
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                showNotification('文件大小不能超过 5MB', 'warning');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const content = e.target.result;
                    document.getElementById('markdownInput').value = content;
                    showNotification(`已成功加载文件: ${file.name}`, 'success');
                } catch (error) {
                    console.error('处理文件内容时出错:', error);
                    showNotification('处理文件内容时出错，请重试', 'error');
                }
            };
            
            reader.onerror = function() {
                showNotification('读取文件时出错，请重试', 'error');
            };
            
            reader.readAsText(file, 'UTF-8');
        }

        function showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s cubic-bezier(0.55, 0.085, 0.68, 0.53)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        }

        let sections = [];
        let draggedElement = null;
        let dragIndicator = null;

        function parseMarkdown() {
            const input = document.getElementById('markdownInput').value;
            if (!input.trim()) {
                showNotification('请先输入 Markdown 文本', 'warning');
                return;
            }

            try {
                const lines = input.split('\n');
                sections = [];
                let currentSection = null;
                let beforeH2Content = [];

                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    
                    if (line.startsWith('## ')) {
                        if (currentSection) {
                            sections.push(currentSection);
                        }
                        
                        currentSection = {
                            title: line,
                            content: []
                        };
                    } else if (currentSection) {
                        currentSection.content.push(line);
                    } else {
                        beforeH2Content.push(line);
                    }
                }

                if (currentSection) {
                    sections.push(currentSection);
                }

                window.beforeH2Content = beforeH2Content;
                renderSections();
                
                if (sections.length > 0) {
                    showNotification(`成功解析 ${sections.length} 个二级标题`, 'success');
                } else {
                    showNotification('没有找到二级标题', 'warning');
                }
            } catch (error) {
                console.error('解析 Markdown 时出错:', error);
                showNotification('解析 Markdown 时出错，请检查格式', 'error');
            }
        }

        function renderSections() {
            const container = document.querySelector('.sortable-list');
            
            if (sections.length === 0) {
                container.innerHTML = '<div class="empty-state">没有找到二级标题</div>';
                return;
            }

            container.innerHTML = '';
            
            sections.forEach((section, index) => {
                const div = document.createElement('div');
                div.className = 'section-item';
                div.draggable = true;
                div.dataset.index = index;
                
                const preview = section.content.slice(0, 8).join('\n');
                const truncated = section.content.length > 8 ? '\n...' : '';
                
                div.innerHTML = `
                    <div class="section-item-header">
                        <span class="drag-handle">⋮⋮</span>
                        <span class="section-item-title">${section.title}</span>
                    </div>
                    <div class="section-item-content">${preview}${truncated}</div>
                `;
                
                div.addEventListener('dragstart', handleDragStart);
                div.addEventListener('dragover', handleDragOver);
                div.addEventListener('dragenter', handleDragEnter);
                div.addEventListener('dragleave', handleDragLeave);
                div.addEventListener('drop', handleDrop);
                div.addEventListener('dragend', handleDragEnd);
                
                container.appendChild(div);
            });
        }

        function handleDragStart(e) {
            draggedElement = this;
            this.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', this.outerHTML);
            
            // Create drag indicator
            dragIndicator = document.createElement('div');
            dragIndicator.className = 'drag-indicator';
            
            setTimeout(() => {
                this.style.visibility = 'hidden';
            }, 0);
        }

        function handleDragOver(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        }

        function handleDragEnter(e) {
            e.preventDefault();
            if (this !== draggedElement) {
                this.classList.add('drag-over');
            }
        }

        function handleDragLeave(e) {
            e.preventDefault();
            this.classList.remove('drag-over');
        }

        function handleDrop(e) {
            e.preventDefault();
            this.classList.remove('drag-over');
            
            if (this !== draggedElement) {
                const draggedIndex = parseInt(draggedElement.dataset.index);
                const targetIndex = parseInt(this.dataset.index);
                
                const draggedSection = sections[draggedIndex];
                sections.splice(draggedIndex, 1);
                sections.splice(targetIndex, 0, draggedSection);
                
                renderSections();
            }
        }

        function handleDragEnd(e) {
            this.classList.remove('dragging');
            this.style.visibility = 'visible';
            
            // Remove all drag-over classes
            document.querySelectorAll('.section-item').forEach(item => {
                item.classList.remove('drag-over');
            });
            
            draggedElement = null;
            
            if (dragIndicator && dragIndicator.parentNode) {
                dragIndicator.parentNode.removeChild(dragIndicator);
            }
            dragIndicator = null;
        }

        function generateResult() {
            let result = '';
            
            if (window.beforeH2Content && window.beforeH2Content.length > 0) {
                result += window.beforeH2Content.join('\n') + '\n\n';
            }
            
            const tocCheckbox = document.getElementById('tocCheckbox');
            if (tocCheckbox && tocCheckbox.checked && sections.length > 0) {
                result += '## 目录\n\n';
                sections.forEach((section, index) => {
                    const title = section.title.replace(/^## /, '');
                    const anchor = title.toLowerCase()
                        .replace(/[^\w\u4e00-\u9fff\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')
                        .replace(/^-|-$/g, '');
                    result += `- [${title}](#${anchor})\n`;
                });
                result += '\n';
            }
            
            sections.forEach((section, index) => {
                result += section.title + '\n';
                result += section.content.join('\n');
                if (index < sections.length - 1) {
                    result += '\n\n';
                }
            });
            
            return result;
        }

        function copyResult() {
            if (sections.length === 0) {
                showNotification('请先解析 Markdown 文本', 'warning');
                return;
            }

            const result = generateResult();
            
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(result).then(() => {
                    showNotification('已复制到剪贴板！', 'success');
                }).catch(() => {
                    fallbackCopy(result);
                });
            } else {
                fallbackCopy(result);
            }
        }

        function fallbackCopy(text) {
            try {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                const successful = document.execCommand('copy');
                document.body.removeChild(textarea);
                
                if (successful) {
                    showNotification('已复制到剪贴板！', 'success');
                } else {
                    showNotification('复制失败，请手动复制', 'error');
                }
            } catch (err) {
                showNotification('复制失败，请手动复制', 'error');
            }
        }

        function downloadResult() {
            if (sections.length === 0) {
                showNotification('请先解析 Markdown 文本', 'warning');
                return;
            }

            try {
                const result = generateResult();
                const blob = new Blob([result], { type: 'text/markdown;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = 'reordered-markdown.md';
                a.style.display = 'none';
                
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                setTimeout(() => URL.revokeObjectURL(url), 100);
                showNotification('文件下载成功！', 'success');
            } catch (error) {
                console.error('下载失败:', error);
                showNotification('下载失败，请重试', 'error');
            }
        }

        // 初始化示例数据
        document.getElementById('markdownInput').value = `# 主标题

这是一些前置内容，不会被移动。

## 第三个标题
这是第三个标题下的内容。
可以包含多行文本。
- 列表项1
- 列表项2

## 第一个标题
这是第一个标题下的内容。

### 这是三级标题
三级标题及其内容会跟随二级标题一起移动。

## 第二个标题
这是第二个标题下的内容。

\`\`\`javascript
// 代码块也会跟随移动
console.log('Hello World');
\`\`\`

## 第四个标题
最后一个标题的内容。`;

        // 初始化
        setupDropZone();
    </script>
</body>
</html>
{{< /raw >}}