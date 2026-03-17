// AI 错误信息解码器 - 主程序
class ErrorDecoder {
    constructor() {
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.errorInput = document.getElementById('error-input');
        this.languageSelect = document.getElementById('language-select');
        this.decodeBtn = document.getElementById('decode-btn');
        this.loadingSection = document.getElementById('loading-section');
        this.resultsSection = document.getElementById('results-section');
        this.exampleBtns = document.querySelectorAll('.example-btn');
    }

    bindEvents() {
        this.decodeBtn.addEventListener('click', () => this.decodeError());
        this.exampleBtns.forEach(btn => {
            btn.addEventListener('click', () => this.loadExample(btn));
        });
    }

    // 加载示例错误
    loadExample(btn) {
        const error = btn.dataset.error;
        const lang = btn.dataset.lang;
        this.errorInput.value = error;
        this.languageSelect.value = lang;
    }

    // 解码错误
    async decodeError() {
        const errorText = this.errorInput.value.trim();
        if (!errorText) {
            alert('请输入错误信息');
            return;
        }

        // 显示加载动画
        this.loadingSection.style.display = 'block';
        this.resultsSection.style.display = 'none';
        this.decodeBtn.disabled = true;

        // 模拟 AI 分析延迟
        await this.delay(2000);

        // 检测语言和错误类型
        const detectedLanguage = this.detectLanguage(errorText);
        const errorAnalysis = this.analyzeError(errorText, detectedLanguage);

        // 显示结果
        this.displayResults(errorAnalysis);

        // 隐藏加载动画
        this.loadingSection.style.display = 'none';
        this.resultsSection.style.display = 'block';
        this.decodeBtn.disabled = false;
    }

    // 检测编程语言
    detectLanguage(errorText) {
        const selected = this.languageSelect.value;
        if (selected !== 'auto') return selected;

        // 自动检测
        if (errorText.includes('TypeError') || errorText.includes('ReferenceError') || 
            errorText.includes('SyntaxError') || errorText.includes('react-dom')) {
            return 'javascript';
        }
        if (errorText.includes('Traceback') || errorText.includes('KeyError') || 
            errorText.includes('ValueError') || errorText.includes('IndentationError')) {
            return 'python';
        }
        if (errorText.includes('java.lang') || errorText.includes('Exception in thread')) {
            return 'java';
        }
        if (errorText.includes('error: ') || errorText.includes('undefined reference')) {
            return 'cpp';
        }
        if (errorText.includes('goroutine') || errorText.includes('cannot use')) {
            return 'go';
        }
        if (errorText.includes('cannot borrow') || errorText.includes('mismatched types')) {
            return 'rust';
        }
        return 'javascript';
    }

    // 分析错误
    analyzeError(errorText, language) {
        const errorType = this.getErrorType(errorText, language);
        const analysis = {
            language: this.getLanguageName(language),
            errorType: errorType.type,
            severity: errorType.severity,
            errorMessage: errorText,
            causes: this.getCauses(errorText, language, errorType),
            fixes: this.getFixes(errorText, language, errorType),
            resources: this.getResources(language, errorType)
        };
        return analysis;
    }

    // 获取错误类型
    getErrorType(errorText, language) {
        const types = {
            javascript: [
                { pattern: /TypeError/, type: 'TypeError', severity: 'high' },
                { pattern: /ReferenceError/, type: 'ReferenceError', severity: 'high' },
                { pattern: /SyntaxError/, type: 'SyntaxError', severity: 'medium' },
                { pattern: /RangeError/, type: 'RangeError', severity: 'medium' }
            ],
            python: [
                { pattern: /KeyError/, type: 'KeyError', severity: 'high' },
                { pattern: /ValueError/, type: 'ValueError', severity: 'medium' },
                { pattern: /TypeError/, type: 'TypeError', severity: 'high' },
                { pattern: /IndentationError/, type: 'IndentationError', severity: 'low' }
            ],
            java: [
                { pattern: /NullPointerException/, type: 'NullPointerException', severity: 'high' },
                { pattern: /ArrayIndexOutOfBoundsException/, type: 'IndexError', severity: 'medium' },
                { pattern: /ClassCastException/, type: 'ClassCastException', severity: 'high' }
            ],
            cpp: [
                { pattern: /segmentation fault/, type: 'SegmentationFault', severity: 'high' },
                { pattern: /undefined reference/, type: 'LinkerError', severity: 'medium' }
            ],
            go: [
                { pattern: /nil pointer/, type: 'NilPointer', severity: 'high' },
                { pattern: /cannot use/, type: 'TypeError', severity: 'medium' }
            ],
            rust: [
                { pattern: /cannot borrow/, type: 'BorrowError', severity: 'high' },
                { pattern: /mismatched types/, type: 'TypeError', severity: 'medium' }
            ]
        };

        const langTypes = types[language] || types.javascript;
        for (const t of langTypes) {
            if (t.pattern.test(errorText)) {
                return t;
            }
        }
        return { type: 'RuntimeError', severity: 'medium' };
    }

    // 获取可能原因
    getCauses(errorText, language, errorType) {
        const causeMap = {
            'TypeError': [
                '尝试访问 undefined 或 null 值的属性',
                '调用了不存在的方法',
                '变量未初始化就被使用'
            ],
            'ReferenceError': [
                '使用了未声明的变量',
                '变量作用域问题',
                '拼写错误导致变量名不匹配'
            ],
            'KeyError': [
                '字典中不存在指定的键',
                'JSON 数据结构与预期不符',
                'API 返回的数据格式变化'
            ],
            'NullPointerException': [
                '对象未初始化就被使用',
                '方法返回了 null 但未检查',
                '数据库查询结果为空'
            ],
            'default': [
                '代码逻辑错误',
                '数据格式不正确',
                '环境配置问题'
            ]
        };

        return causeMap[errorType.type] || causeMap['default'];
    }

    // 获取修复建议
    getFixes(errorText, language, errorType) {
        const fixMap = {
            'TypeError': {
                description: '添加空值检查，确保变量已初始化',
                code: `// 添加可选链操作符
const value = obj?.property?.nestedProperty;

// 或添加条件检查
if (obj && obj.property) {
    const value = obj.property.nestedProperty;
}`
            },
            'ReferenceError': {
                description: '检查变量声明和作用域',
                code: `// 确保变量已声明
let myVariable = initialValue;

// 检查变量名拼写
console.log(myVariable); // 确认变量名正确`
            },
            'KeyError': {
                description: '添加键存在检查或使用 .get() 方法',
                code: `# 方法1: 使用 in 检查
if 'key' in data:
    value = data['key']

# 方法2: 使用 get() 方法
value = data.get('key', default_value)`
            },
            'NullPointerException': {
                description: '添加空值检查',
                code: `// 检查对象是否为 null
if (user != null && user.getName() != null) {
    String name = user.getName();
}

// 使用 Optional
Optional.ofNullable(user)
    .map(User::getName)
    .orElse("default");`
            },
            'default': {
                description: '检查代码逻辑和数据流',
                code: `// 添加调试日志
console.log('Debug:', variable);

// 使用断点调试
debugger;`
            }
        };

        return fixMap[errorType.type] || fixMap['default'];
    }

    // 获取相关资源
    getResources(language, errorType) {
        const resources = {
            javascript: [
                { title: 'MDN JavaScript 错误参考', url: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Errors' },
                { title: 'JavaScript 错误处理指南', url: 'https://javascript.info/try-catch' }
            ],
            python: [
                { title: 'Python 异常处理', url: 'https://docs.python.org/zh-cn/3/tutorial/errors.html' },
                { title: 'Python 错误类型参考', url: 'https://docs.python.org/zh-cn/3/library/exceptions.html' }
            ],
            java: [
                { title: 'Java 异常处理指南', url: 'https://docs.oracle.com/javase/tutorial/essential/exceptions/' },
                { title: '常见 Java 异常', url: 'https://rollbar.com/blog/top-10-java-exceptions/' }
            ],
            cpp: [
                { title: 'C++ 错误处理', url: 'https://en.cppreference.com/w/cpp/error' },
                { title: 'GDB 调试指南', url: 'https://www.gnu.org/software/gdb/documentation/' }
            ],
            go: [
                { title: 'Go 错误处理', url: 'https://go.dev/blog/error-handling-and-go' },
                { title: 'Go 常见错误', url: 'https://go.dev/doc/effective_go#errors' }
            ],
            rust: [
                { title: 'Rust 错误处理', url: 'https://doc.rust-lang.org/book/ch09-00-error-handling.html' },
                { title: 'Rust 借用检查器', url: 'https://doc.rust-lang.org/book/ch04-02-references-and-borrowing.html' }
            ]
        };

        return resources[language] || resources.javascript;
    }

    // 显示结果
    displayResults(analysis) {
        document.getElementById('detected-lang').textContent = analysis.language;
        
        const errorTypeEl = document.getElementById('error-type');
        errorTypeEl.textContent = analysis.errorType;
        errorTypeEl.className = 'error-type';
        
        document.getElementById('error-message').textContent = analysis.errorMessage;

        // 显示原因
        const causesList = document.getElementById('causes-list');
        causesList.innerHTML = analysis.causes.map(cause => 
            `<li>${cause}</li>`
        ).join('');

        // 显示修复建议
        const fixSuggestions = document.getElementById('fix-suggestions');
        fixSuggestions.innerHTML = `
            <p>${analysis.fixes.description}</p>
            <pre><code>${this.escapeHtml(analysis.fixes.code)}</code></pre>
        `;

        // 显示相关资源
        const relatedDocs = document.getElementById('related-docs');
        relatedDocs.innerHTML = analysis.resources.map(resource => 
            `<a href="${resource.url}" target="_blank" class="resource-link">
                📖 ${resource.title}
            </a>`
        ).join('');
    }

    // 辅助方法
    getLanguageName(code) {
        const names = {
            javascript: 'JavaScript',
            python: 'Python',
            java: 'Java',
            cpp: 'C++',
            go: 'Go',
            rust: 'Rust'
        };
        return names[code] || code;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new ErrorDecoder();
});
