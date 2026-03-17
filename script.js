// AI 错误信息解码器
class ErrorDecoder {
    constructor() {
        this.errorInput = document.getElementById('errorInput');
        this.languageSelect = document.getElementById('languageSelect');
        this.decodeBtn = document.getElementById('decodeBtn');
        this.outputSection = document.getElementById('outputSection');
        
        this.errorType = document.getElementById('errorType');
        this.errorDescription = document.getElementById('errorDescription');
        this.fixSuggestions = document.getElementById('fixSuggestions');
        this.relatedDocs = document.getElementById('relatedDocs');
        this.wrongCode = document.getElementById('wrongCode');
        this.fixedCode = document.getElementById('fixedCode');
        
        this.init();
    }
    
    init() {
        this.decodeBtn.addEventListener('click', () => this.decodeError());
        this.errorInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.decodeError();
            }
        });
        
        // 加载预设示例
        this.loadExamples();
    }
    
    loadExamples() {
        const examples = [
            {
                name: 'JavaScript TypeError',
                code: `TypeError: Cannot read property 'length' of undefined
    at getData (app.js:15:21)
    at processData (app.js:23:5)
    at main (app.js:30:1)`
            },
            {
                name: 'Python IndexError',
                code: `Traceback (most recent call last):
  File "app.py", line 42, in <module>
    result = items[index]
IndexError: list index out of range`
            },
            {
                name: 'Java NullPointerException',
                code: `Exception in thread "main" java.lang.NullPointerException
    at com.example.App.processData(App.java:25)
    at com.example.App.main(App.java:15)`
            }
        ];
        
        // 添加示例按钮
        const inputSection = document.querySelector('.input-section');
        const exampleDiv = document.createElement('div');
        exampleDiv.className = 'examples';
        exampleDiv.innerHTML = `
            <p style="margin-top: 1rem; color: var(--text-secondary); font-size: 0.9rem;">示例错误：</p>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem;">
                ${examples.map(ex => `
                    <button class="example-btn" data-example="${encodeURIComponent(ex.code)}">${ex.name}</button>
                `).join('')}
            </div>
        `;
        inputSection.appendChild(exampleDiv);
        
        // 绑定示例按钮事件
        exampleDiv.querySelectorAll('.example-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.errorInput.value = decodeURIComponent(btn.dataset.example);
                this.errorInput.focus();
            });
        });
    }
    
    async decodeError() {
        const errorText = this.errorInput.value.trim();
        
        if (!errorText) {
            alert('请输入错误信息！');
            return;
        }
        
        // 显示加载状态
        this.setLoading(true);
        
        // 模拟AI分析延迟
        await this.delay(1500);
        
        // 分析错误
        const result = this.analyzeError(errorText);
        
        // 显示结果
        this.displayResult(result);
        
        // 隐藏加载状态
        this.setLoading(false);
    }
    
    analyzeError(errorText) {
        const language = this.languageSelect.value;
        const detectedLanguage = language === 'auto' ? this.detectLanguage(errorText) : language;
        
        // 常见错误模式匹配
        const errorPatterns = {
            // JavaScript
            'TypeError.*Cannot read property': {
                type: 'reference',
                typeName: '空引用错误 (TypeError)',
                description: '尝试访问 undefined 或 null 值的属性。这通常发生在对象未正确初始化或异步操作返回意外结果时。',
                suggestions: [
                    '在使用变量前检查其是否存在：if (obj && obj.property)',
                    '使用可选链操作符：obj?.property',
                    '确保异步操作正确完成后再访问数据',
                    '检查数据流，确认变量在何时被赋值'
                ],
                docs: [
                    { title: 'MDN - TypeError', url: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/TypeError' },
                    { title: '可选链操作符', url: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Optional_chaining' }
                ],
                wrongCode: `// 错误：data可能是undefined
const length = data.items.length;`,
                fixedCode: `// 修复：使用可选链
const length = data?.items?.length ?? 0;
// 或者先检查
if (data && data.items) {
    const length = data.items.length;
}`
            },
            // Python
            'IndexError.*out of range': {
                type: 'reference',
                typeName: '索引越界错误 (IndexError)',
                description: '尝试访问列表中不存在的索引位置。Python 列表索引从 0 开始，最大索引为 len(list) - 1。',
                suggestions: [
                    '访问前检查索引是否在有效范围内',
                    '使用 len() 函数获取列表长度',
                    '考虑使用 enumerate() 遍历时同时获取索引',
                    '使用 try-except 捕获异常并提供默认值'
                ],
                docs: [
                    { title: 'Python IndexError', url: 'https://docs.python.org/3/library/exceptions.html#IndexError' },
                    { title: 'Python 列表教程', url: 'https://docs.python.org/3/tutorial/introduction.html#lists' }
                ],
                wrongCode: `# 错误：index可能超出范围
result = items[index]`,
                fixedCode: `# 修复：先检查索引范围
if 0 <= index < len(items):
    result = items[index]
else:
    result = None  # 或默认值

# 或使用 try-except
try:
    result = items[index]
except IndexError:
    result = None`
            },
            // Java
            'NullPointerException': {
                type: 'reference',
                typeName: '空指针异常 (NullPointerException)',
                description: '尝试在 null 对象引用上调用方法或访问字段。这是 Java 中最常见的运行时异常。',
                suggestions: [
                    '在使用对象前进行 null 检查',
                    '使用 Objects.requireNonNull() 进行参数验证',
                    '考虑使用 Optional 类处理可能为空的值',
                    '确保对象在使用前正确初始化'
                ],
                docs: [
                    { title: 'Java NullPointerException', url: 'https://docs.oracle.com/javase/8/docs/api/java/lang/NullPointerException.html' },
                    { title: 'Optional 类使用', url: 'https://docs.oracle.com/javase/8/docs/api/java/util/Optional.html' }
                ],
                wrongCode: `// 错误：str可能为null
int length = str.length();`,
                fixedCode: `// 修复：先检查null
if (str != null) {
    int length = str.length();
}

// 或使用Optional
Optional.ofNullable(str)
    .ifPresent(s -> System.out.println(s.length()));`
            },
            // 通用语法错误
            'SyntaxError': {
                type: 'syntax',
                typeName: '语法错误 (SyntaxError)',
                description: '代码不符合语言语法规则。常见原因包括括号不匹配、缺少分号、关键字拼写错误等。',
                suggestions: [
                    '检查括号、引号是否成对出现',
                    '确认关键字拼写正确',
                    '查看错误行号附近的代码',
                    '使用代码编辑器的语法高亮功能'
                ],
                docs: [
                    { title: '语法错误调试', url: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Errors' }
                ],
                wrongCode: `// 错误：缺少括号
function test( {
    return "hello";
}`,
                fixedCode: `// 修复：添加闭合括号
function test() {
    return "hello";
}`
            },
            // 类型错误
            'TypeError.*is not a function': {
                type: 'type',
                typeName: '类型错误 (TypeError)',
                description: '尝试调用一个不是函数的值作为函数。可能是变量名冲突或导入错误。',
                suggestions: [
                    '检查变量是否确实是一个函数',
                    '确认没有变量名冲突',
                    '检查模块导入是否正确',
                    '使用 typeof 验证类型'
                ],
                docs: [
                    { title: 'TypeError 调试', url: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Errors/Not_a_function' }
                ],
                wrongCode: `// 错误：obj.func不是函数
obj.func();`,
                fixedCode: `// 修复：先验证类型
if (typeof obj.func === 'function') {
    obj.func();
}`
            }
        };
        
        // 匹配错误模式
        for (const [pattern, info] of Object.entries(errorPatterns)) {
            const regex = new RegExp(pattern, 'i');
            if (regex.test(errorText)) {
                return {
                    ...info,
                    language: detectedLanguage,
                    originalError: errorText
                };
            }
        }
        
        // 默认响应
        return {
            type: 'runtime',
            typeName: '运行时错误',
            description: `这是一个${detectedLanguage}运行时错误。请仔细检查错误堆栈跟踪中的文件名和行号，定位问题发生的位置。`,
            suggestions: [
                '查看完整的错误堆栈跟踪',
                '检查错误发生的具体行号',
                '确认所有变量已正确初始化',
                '检查异步操作是否正确处理',
                '添加适当的错误处理逻辑'
            ],
            docs: [
                { title: '调试指南', url: 'https://developer.mozilla.org/zh-CN/docs/Mozilla/Debugging' }
            ],
            wrongCode: `// 请检查错误堆栈中的具体代码
// 错误信息: ${errorText.substring(0, 100)}...`,
            fixedCode: `// 添加错误处理
try {
    // 可能出错的代码
} catch (error) {
    console.error('Error:', error);
    // 处理错误或提供默认值
}`,
            language: detectedLanguage,
            originalError: errorText
        };
    }
    
    detectLanguage(errorText) {
        const patterns = {
            javascript: ['TypeError', 'ReferenceError', 'SyntaxError', 'at ', 'app.js', 'index.js'],
            python: ['Traceback', 'File "', 'line ', 'IndexError', 'ValueError', 'KeyError', '.py'],
            java: ['Exception', 'java.', 'at com.', 'NullPointerException', '.java:'],
            cpp: ['error:', 'undefined reference', 'segmentation fault', '.cpp:'],
            go: ['panic:', 'goroutine', '.go:'],
            rust: ['error[E', '--> ', '.rs:']
        };
        
        let maxScore = 0;
        let detectedLang = 'javascript';
        
        for (const [lang, keywords] of Object.entries(patterns)) {
            let score = 0;
            for (const keyword of keywords) {
                if (errorText.includes(keyword)) {
                    score++;
                }
            }
            if (score > maxScore) {
                maxScore = score;
                detectedLang = lang;
            }
        }
        
        return detectedLang;
    }
    
    displayResult(result) {
        // 显示结果区域
        this.outputSection.classList.remove('hidden');
        
        // 设置错误类型
        this.errorType.textContent = result.typeName;
        this.errorType.className = `error-type ${result.type}`;
        
        // 设置描述
        this.errorDescription.textContent = result.description;
        
        // 设置修复建议
        this.fixSuggestions.innerHTML = result.suggestions.map(s => `<li>${s}</li>`).join('');
        
        // 设置相关文档
        this.relatedDocs.innerHTML = result.docs.map(d => 
            `<a href="${d.url}" target="_blank" rel="noopener noreferrer">${d.title}</a>`
        ).join('');
        
        // 设置代码对比
        this.wrongCode.textContent = result.wrongCode;
        this.fixedCode.textContent = result.fixedCode;
        
        // 滚动到结果区域
        this.outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    setLoading(isLoading) {
        const btnText = this.decodeBtn.querySelector('.btn-text');
        const loading = this.decodeBtn.querySelector('.loading');
        
        if (isLoading) {
            btnText.classList.add('hidden');
            loading.classList.remove('hidden');
            this.decodeBtn.disabled = true;
        } else {
            btnText.classList.remove('hidden');
            loading.classList.add('hidden');
            this.decodeBtn.disabled = false;
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new ErrorDecoder();
});